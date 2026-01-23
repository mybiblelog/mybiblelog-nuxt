
import useMongooseModels from "../../mongoose/useMongooseModels";
import { LocaleCode } from "@mybiblelog/shared";
import renderEmailVerification from "./email-templates/email-verification";
import renderPasswordResetLink from "./email-templates/password-reset-link";
import renderEmailUpdate from "./email-templates/email-update";

import { SendEmailParams } from "./sender";
import sendEmail from './email-senders/resend';
import config from "../../config";

const domain = config.emailSendingDomain;

export type EmailService = {
  send: (params: SendEmailParams) => Promise<boolean>;
  sendUserEmailVerification: (email: string, emailVerificationCode: string, locale: LocaleCode) => Promise<void>;
  sendUserPasswordResetLink: (email: string, passwordResetLink: string, locale: LocaleCode) => Promise<void>;
  sendEmailUpdateLink: (currentEmail: string, newEmail: string, newEmailVerificationCode: string, locale: LocaleCode) => Promise<void>;
};

const init = async () => {
  const { Email } = await useMongooseModels();

  const send = async ({ from, to, subject, attachments = [], ...rest }: SendEmailParams) => {
    from = from || `My Bible Log <noreply@${domain}>`;
    let success = false;

    // only send email in production
    if (config.nodeEnv === 'production') {
      success = await sendEmail({ from, to, subject, attachments, ...rest });
    }

    // record email, but do not block with `await`
    Email.create({ from, to, subject, ...rest, success });

    return success;
  };

  const sendUserEmailVerification = async (email, emailVerificationCode, locale: LocaleCode = 'en') => {
    const { subject, html } = renderEmailVerification({ locale, emailVerificationCode });

    await send({
      from: `noreply@${domain}`,
      to: email,
      subject,
      html,
    });
  };

  const sendUserPasswordResetLink = async (email, passwordResetLink, locale: LocaleCode = 'en') => {
    const { subject, html } = renderPasswordResetLink({ locale, passwordResetLink });

    await send({
      from: `noreply@${domain}`,
      to: email,
      subject,
      html,
    });
  };

  const sendEmailUpdateLink = async (currentEmail, newEmail, newEmailVerificationCode, locale: LocaleCode = 'en') => {
    const { subject, html } = renderEmailUpdate({ locale, currentEmail, newEmail, newEmailVerificationCode });

    await send({
      from: `noreply@${domain}`,
      to: newEmail,
      subject,
      html,
      attachments: [],
    });
  };

  return {
    send,
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
