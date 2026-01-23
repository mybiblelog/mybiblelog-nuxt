import { Resend } from 'resend';
import { SendMail } from '../sender';
import config from '../../../config';

const resend = new Resend(config.resendApiKey);

const sendEmail: SendMail = async ({ from, to, subject, attachments = [], ...rest }) => {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    ...rest,
  });

  if (error) {
    throw error;
  }

  return true;
};

export default sendEmail;
