// import nodemailer from "nodemailer";
// import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
// import config from "../../../config";
// import { SendMail } from "../email-types";

// const accessKeyId = config.aws.accessKeyId;
// const secretAccessKey = config.aws.secretAccessKey;
// const sesRegion = config.aws.sesRegion;

// const sesClient = new SESv2Client({
//   region: sesRegion,
//   credentials: {
//     accessKeyId,
//     secretAccessKey,
//   },
// });

// const transport = nodemailer.createTransport({
//   SES: { sesClient, SendEmailCommand },
// });

// const sendEmail: SendMail = async ({ from, to, subject, attachments = [], ...rest }) => {
//   try {
//     await transport.sendMail({ from, to, subject, ...rest, attachments });
//     return true;
//   }
//   catch (err) {
//     return false;
//   }
// };

// export default sendEmail;
