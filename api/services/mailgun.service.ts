import formData from 'form-data';
import Mailgun from 'mailgun.js';
import config from '../config';
import renderEmailVerification from "./email-templates/email-verification";
import renderPasswordResetLink from "./email-templates/password-reset-link";
import renderEmailUpdate from "./email-templates/email-update";

const apiKey = config.mailgun.apiKey;
const domain = config.emailSendingDomain;
const baseUrl = config.siteUrl;

import useMongooseModels from '../mongoose/useMongooseModels';
import { LocaleCode } from '@mybiblelog/shared';
import { EmailService, SendEmailParams, useEmailService } from './email.service.d';

const mailgun = new Mailgun(formData);
const client = mailgun.client({
  username: 'api',
  key: apiKey,
});

const getLocaleBaseUrl = (locale: LocaleCode) => {
  const localePathSegment = locale === 'en' ? '' : '/' + locale;
  return baseUrl + localePathSegment;
};

const init = async () => {
  const { Email } = await useMongooseModels();

  const sendEmail = async ({ from, to, subject, attachments = [], ...rest }: SendEmailParams) => {
    from = from || `My Bible Log <noreply@${domain}>`;

    try {
      // only send email in production
      if (config.nodeEnv === 'production') {
        const attachmentData = attachments.map(attachment => ({
          filename: attachment.filename,
          data: attachment.content,
        }));
        await client.messages.create(domain, { from, to, subject, ...rest, inline: attachmentData });
      }

      // record email, but do not block with `await`
      Email.create({ from, to, subject, ...rest, success: true });
    }
    catch (err) {
      // record error, but do not block with `await`
      Email.create({ from, to, subject, ...rest, success: false });
    }
  };

  const sendUserEmailVerification = async (email, emailVerificationCode, locale: LocaleCode = 'en') => {
    const { subject, html } = renderEmailVerification({ locale, emailVerificationCode });

    await sendEmail({
      from: `noreply@${domain}`,
      to: email,
      subject,
      html,
    });
  };

  const sendUserPasswordResetLink = async (email, passwordResetLink, locale: LocaleCode = 'en') => {
    const { subject, html } = renderPasswordResetLink({ locale, passwordResetLink });

    await sendEmail({
      from: `noreply@${domain}`,
      to: email,
      subject,
      html,
    });
  };

  const sendEmailUpdateLink = async (currentEmail, newEmail, newEmailVerificationCode, locale: LocaleCode = 'en') => {
    const { subject, html } = renderEmailUpdate({ locale, currentEmail, newEmail, newEmailVerificationCode });

    await sendEmail({
      from: `noreply@${domain}`,
      to: newEmail,
      subject,
      html,
      attachments: [],
    });
  };

  return {
    sendEmail,
    sendUserEmailVerification,
    sendUserPasswordResetLink,
    sendEmailUpdateLink,
  };
};

let mailgunService: EmailService;

const useMailgunService: useEmailService = async () => {
  if (!mailgunService) {
    mailgunService = await init();
  }
  return mailgunService;
};

export default useMailgunService;
