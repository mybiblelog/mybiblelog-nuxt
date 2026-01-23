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

export type SendMail = (params: SendEmailParams) => Promise<boolean>;
