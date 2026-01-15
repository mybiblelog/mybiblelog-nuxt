import fs from 'node:fs';

export type SendEmailParams = {
  from: string;
  to: string;
  subject: string;
  attachments?: {
    filename: string;
    content: string | fs.ReadStream;
    cid: string;
  }[];
} & ({
  html: string;
} | {
  text: string;
});

export type EmailService = {
  sendEmail: (params: SendEmailParams) => Promise<void>;
  sendUserEmailVerification: (email: string, emailVerificationCode: string, locale: LocaleCode) => Promise<void>;
  sendUserPasswordResetLink: (email: string, passwordResetLink: string, locale: LocaleCode) => Promise<void>;
  sendEmailUpdateLink: (currentEmail: string, newEmail: string, newEmailVerificationCode: string, locale: LocaleCode) => Promise<void>;
};

export type useEmailService = () => Promise<EmailService>;
