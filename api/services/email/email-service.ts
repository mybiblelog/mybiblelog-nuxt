import useMongooseModels from "../../mongoose/useMongooseModels";
import { LocaleCode } from "@mybiblelog/shared";
import renderEmailVerification from "./email-templates/email-verification";
import renderPasswordResetLink from "./email-templates/password-reset-link";
import renderEmailUpdate from "./email-templates/email-update";

import { QueueEmailParams, SendEmailParams } from "./email-types";
import sendEmail from "./email-senders/resend";
import { createQueue } from "./email-queue";
import config from "../../config";

const defaultFromEmailAddress = `My Bible Log <team@${config.emailSendingDomain}>`;
const defaultReplyToEmailAddress = `My Bible Log <team@${config.emailSendingDomain}>`;

export type EmailService = {
  send: (params: QueueEmailParams) => void;
  sendUserEmailVerification: (email: string, emailVerificationCode: string, locale: LocaleCode) => Promise<void>;
  sendUserPasswordResetLink: (email: string, passwordResetLink: string, locale: LocaleCode) => Promise<void>;
  sendEmailUpdateLink: (currentEmail: string, newEmail: string, newEmailVerificationCode: string, locale: LocaleCode) => Promise<void>;
};

const init = async () => {
  const { Email } = await useMongooseModels();

  const sendFn = async (params: SendEmailParams): Promise<void> => {
    let status: 'pending' | 'sent' | 'failed' | 'log_only' = 'pending';

    // only send email in production
    if (config.nodeEnv === "production") {
      try {
        await sendEmail(params);
        status = 'sent';
        console.log('Email sent successfully');
      }
      catch (error) {
        status = 'failed';
        console.error('Email failed:', error);
      }
    } else {
      status = 'log_only';
      console.log('Email logged successfully');
    }

    // record email, but do not block with `await`
    const { attachments, ...forRecord } = params;
    Email.create({ ...forRecord, status });
  };

  const { enqueue } = createQueue<SendEmailParams>(sendFn);

  const queueEmail = (params: QueueEmailParams): void => {
    const from = params.from || defaultFromEmailAddress;
    const replyTo = params.replyTo || defaultReplyToEmailAddress;
    const normalized: SendEmailParams = { ...params, from, replyTo };
    enqueue(normalized);
  };

  const sendUserEmailVerification = async (email, emailVerificationCode, locale: LocaleCode = 'en') => {
    const { subject, html } = renderEmailVerification({ locale, emailVerificationCode });

    await queueEmail({
      from: defaultFromEmailAddress,
      to: email,
      subject,
      html,
    });
  };

  const sendUserPasswordResetLink = async (email, passwordResetLink, locale: LocaleCode = 'en') => {
    const { subject, html } = renderPasswordResetLink({ locale, passwordResetLink });

    await queueEmail({
      from: defaultFromEmailAddress,
      to: email,
      subject,
      html,
    });
  };

  const sendEmailUpdateLink = async (currentEmail, newEmail, newEmailVerificationCode, locale: LocaleCode = 'en') => {
    const { subject, html } = renderEmailUpdate({ locale, currentEmail, newEmail, newEmailVerificationCode });

    await queueEmail({
      from: defaultFromEmailAddress,
      to: newEmail,
      subject,
      html,
      attachments: [],
    });
  };

  return {
    send: queueEmail,
    sendUserEmailVerification,
    sendUserPasswordResetLink,
    sendEmailUpdateLink,
  };
};

let emailService: EmailService;

const useEmailService: () => Promise<EmailService> = async () => {
  if (!emailService) {
    emailService = await init();
  }
  return emailService;
};

export default useEmailService;
