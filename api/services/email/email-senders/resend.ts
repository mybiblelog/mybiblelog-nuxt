import { Resend } from 'resend';
import { SendMail } from '../email-types';
import config from '../../../config';

const resend = new Resend(config.resendApiKey);

const sendEmail: SendMail = async ({ from, to, replyTo, subject, headers = {}, attachments = [], ...rest }) => {
  const { data, error } = await resend.emails.send({
    from,
    to,
    replyTo,
    subject,
    headers,
    attachments,
    ...rest,
  });

  if (error) {
    throw error;
  }

  return data;
};

export default sendEmail;
