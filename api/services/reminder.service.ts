import fs from 'node:fs';
import path from 'node:path';
import config from '../config';
import { Bible } from '@mybiblelog/shared';
import useMongooseModels from '../mongoose/useMongooseModels';
import renderDailyReminderEmail from './email/email-templates/daily-reminder';
import { EmailService } from './email/email-service';

const baseUrl = config.siteUrl;

const DAY_MS = 24 * 60 * 60 * 1000;
const TIME_BEFORE_DISABLING_DAILY_REMINDER_EMAIL_MS = 3 * DAY_MS;

const getLocaleBaseUrl = (locale) => {
  const localePathSegment = locale === 'en' ? '' : '/' + locale;
  return baseUrl + localePathSegment;
};

const buildDailyReminderTrackedLink = ({ publicToken, to }: { publicToken: string; to: string }) => {
  const trackUrl = new URL(`/api/reminders/daily-reminder/track/${publicToken}`, baseUrl);
  trackUrl.searchParams.set('to', to);
  return trackUrl.toString();
};

const init = async ({ emailService }: { emailService: EmailService }) => {
  const { DailyReminder, User, LogEntry } = await useMongooseModels();

  const getRecentLogEntries = async (user) => {
    const { locale } = user.settings;

    const recentLogEntries = await LogEntry.aggregate([
      // log entries must belong to current user
      { $match: { owner: user._id } },
      // sort by most recent date first
      { $sort: { date: -1 } },
      // limit to 10, max
      { $limit: 10 },
    ]);

    // Add human-readable 'displayDate' and 'passage'
    const dateFormatOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'short', day: 'numeric' };
    const dateTimeFormat = new Intl.DateTimeFormat(locale, dateFormatOptions);
    recentLogEntries.forEach((logEntry) => {
      const logEntryDate = new Date(logEntry.date);
      logEntry.displayDate = dateTimeFormat.format(logEntryDate);
      logEntry.passage = Bible.displayVerseRange(logEntry.startVerseId, logEntry.endVerseId, locale);
    });

    return recentLogEntries;
  };

  const buildEmail = (user, reminder, recentLogEntries) => {
    const { locale } = user.settings;

    // Get server timezone offset in milliseconds
    // This allows a localhost server running in a non-UTC timezone to act as if it is
    const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

    // Create a date that acts as if the server is in UTC
    // This will make no difference if the server is actually running in UTC
    // This date will be used to format a date string (Feb 29, March 4, April 1, etc.)
    // The important part is the day that will appear when the date is formatted
    //
    // If a 20:00 America/New_York reminder is triggered,
    // this UTC time will be 01:00 the next day, which is exactly the UTC time
    // when the reminder would have triggered if the server were running in UTC
    const utcNow = new Date().valueOf() + serverTimezoneOffset;

    // Get the time of day the reminder triggers in milliseconds
    const reminderTimeMs = ((reminder.hour * 60) + reminder.minute) * 60 * 1000;

    // Get the UTC offset of the reminder/user timezone in milliseconds
    const reminderOffsetMs = reminder.timezoneOffset * 60 * 1000;

    // Calculate the number of milliseconds in a day
    const dayMs = 24 * 60 * 60 * 1000;

    // This is the date that will be used to format the email
    // By default, it is the current UTC date
    const emailDate = new Date(utcNow);

    // If the local trigger time (like 8PM / 20:00) plus the
    // timezoneOffset (like 300 for GMT-5) is greater than 24 hours,
    // the current UTC date needs to be rolled back to yesterday
    // to match the local date (as UTC has passed to tomorrow)
    if (reminderTimeMs + reminderOffsetMs > dayMs) {
      emailDate.setTime(utcNow.valueOf() - dayMs);
    }
    // If the local trigger time (like 7AM / 07:00) plus the
    // timezoneOffset (like -540 for GMT+9) is less than zero,
    // the current UTC date needs to be rolled forward to tomorrow
    // to match the local date (as UTC hasn't caught up with local date yet)
    if (reminderTimeMs + reminderOffsetMs < 0) {
      emailDate.setTime(utcNow.valueOf() + dayMs);
    }

    const rawSiteLink = `${getLocaleBaseUrl(locale)}/start`;
    const rawSettingsLink = `${getLocaleBaseUrl(locale)}/settings/reminder`;
    const siteLink = buildDailyReminderTrackedLink({ publicToken: reminder.publicToken, to: rawSiteLink });
    const settingsLink = buildDailyReminderTrackedLink({ publicToken: reminder.publicToken, to: rawSettingsLink });
    const unsubscribeLink = `${getLocaleBaseUrl(locale)}/daily-reminder-unsubscribe?code=${reminder.publicToken}`;

    // Build an unsubscribe email address that includes the reminder public token
    // This can be send to a Cloudflare email worker to unsubscribe the user
    let unsubscribeEmail = '';
    if (config.emailUnsubscribeAddress) {
      const [address, domain] = config.emailUnsubscribeAddress.split('@');
      unsubscribeEmail = `${address}+${reminder.publicToken}@${domain}`;
    }

    // Load brand logo asset
    const brandLogoAssetPath = path.resolve(__dirname, 'email', 'assets', 'brand.png');

    const { subject, html } = renderDailyReminderEmail({
      siteLink,
      settingsLink,
      unsubscribeLink,
      recentLogEntries,
      emailDate,
      locale,
    });

    let listUnsubscribeHeader = '';
    if (unsubscribeEmail) {
      listUnsubscribeHeader = `<mailto:${unsubscribeEmail}>, <${unsubscribeLink}>`;
    }
    else {
      listUnsubscribeHeader = `<${unsubscribeLink}>`;
    }

    return {
      from: `My Bible Log <team@${config.emailSendingDomain}>`,
      to: user.email,
      headers: {
        // RFC 2369 compliant List-Unsubscribe header
        'List-Unsubscribe': listUnsubscribeHeader,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      subject,
      html,
      attachments: [{
        filename: 'brand.png',
        content: fs.readFileSync(brandLogoAssetPath),
        contentId: 'logo@mybiblelog',
      }],
    };
  };

  const sendReminder = async (reminder) => {
    const engagementCutoffMs = Date.now() - TIME_BEFORE_DISABLING_DAILY_REMINDER_EMAIL_MS;

    if (!reminder.lastEmailEngagementAt) {
      // Backward-compatibility for reminders that existed before engagement tracking
      reminder.lastEmailEngagementAt = new Date();
    }
    else if (reminder.lastEmailEngagementAt.getTime() < engagementCutoffMs) {
      reminder.active = false;
      await reminder.save();
      return;
    }

    const user = await User.findOne({ _id: reminder.owner });
    const recentLogEntries = await getRecentLogEntries(user);
    const email = buildEmail(user, reminder, recentLogEntries);

    // Update nextOccurrence before sending email to avoid duplicate emails
    // (trigger pre-save hook to re-calculate nextOccurrence)
    await reminder.save();

    // Send email after database is updated
    await emailService.send(email);
  };

  const triggerReminders = async () => {
    // Get server timezone offset in milliseconds
    const serverTimezoneOffset = new Date().getTimezoneOffset() * 60 * 1000;

    // Get the current time in UTC
    const utcNow = new Date().valueOf() + serverTimezoneOffset;

    // Find all active reminders whose nextOccurrence has been reached
    const remindersToTrigger = await DailyReminder.find({
      nextOccurrence: {
        $lte: utcNow,
      },
      active: true,
    });

    for (const reminder of remindersToTrigger) {
      await sendReminder(reminder);
    }
  };

  // Check for reminders to send every minute
  setInterval(triggerReminders, 60 * 1000);
  console.log('Reminder Service Started');

  return {}; // No public API
};

export default init;
