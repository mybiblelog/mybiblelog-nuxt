type Attachment = {
  content: string | Buffer<ArrayBufferLike>;
  filename: string;
  contentId: string;
};

export type QueueEmailParams = {
  from?: string;
  replyTo?: string;
  to: string;
  subject: string;
  headers?: Record<string, string>;
  attachments?: Attachment[];
} & ({
  html: string;
} | {
  text: string;
});

export type SendEmailParams = {
  from: string;
  replyTo: string;
  to: string;
  subject: string;
  headers?: Record<string, string>;
  attachments?: Attachment[];
} & ({
  html: string;
} | {
  text: string;
});

export type SendMail = (params: SendEmailParams) => void;
