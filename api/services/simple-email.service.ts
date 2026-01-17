import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import config from "../config";
import { EmailService, SendEmailParams, useEmailService } from "./email.service";
import useMongooseModels from "../mongoose/useMongooseModels";
import { LocaleCode } from "@mybiblelog/shared";
import renderEmailVerification from "./email-templates/email-verification";
import renderPasswordResetLink from "./email-templates/password-reset-link";
import renderEmailUpdate from "./email-templates/email-update";

const domain = config.emailSendingDomain;
const accessKeyId = config.aws.accessKeyId;
const secretAccessKey = config.aws.secretAccessKey;
const sesRegion = config.aws.sesRegion;

const sesClient = new SESv2Client({
  region: sesRegion,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

const transport = nodemailer.createTransport({
  SES: { sesClient, SendEmailCommand },
});

const init = async () => {
  const { Email } = await useMongooseModels();

  const sendEmail = async ({ from, to, subject, attachments = [], ...rest }: SendEmailParams) => {
    from = from || `My Bible Log <noreply@${domain}>`;

    try {
      // only send email in production
      if (config.nodeEnv === 'production') {
        await transport.sendMail({ from, to, subject, ...rest, attachments });
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

let simpleEmailService: EmailService;

const useSimpleEmailService: useEmailService = async () => {
  if (!simpleEmailService) {
    simpleEmailService = await init();
  }
  return simpleEmailService;
};

export default useSimpleEmailService;
