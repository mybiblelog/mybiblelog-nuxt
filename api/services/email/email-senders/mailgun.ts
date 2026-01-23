// import formData from 'form-data';
// import Mailgun from 'mailgun.js';
// import config from '../../../config';

// const apiKey = config.mailgun.apiKey;
// const domain = config.emailSendingDomain;

// import { SendMail } from '../sender';

// const mailgun = new Mailgun(formData);
// const client = mailgun.client({
//   username: 'api',
//   key: apiKey,
// });

// const sendEmail: SendMail = async ({ from, to, subject, attachments = [], ...rest }) => {
//   try {
//     const attachmentData = attachments.map(attachment => ({
//       filename: attachment.filename,
//       data: attachment.content,
//     }));
//     await client.messages.create(domain, { from, to, subject, ...rest, inline: attachmentData });
//     return true;
//   }
//   catch (err) {
//     return false;
//   }
// };

// export default sendEmail;
