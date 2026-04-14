import nodemailer from 'nodemailer';
import logger from '../../loaders/logger';
import env from '../../config';

const transporter =
  nodemailer.createTransport({
    host: env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(env.EMAIL_PORT) || 587,
    secure: Number(env.EMAIL_PORT) === 465, // true for 465, false for other ports
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS,
    },
  });

// interface SendEmailOptions {
//   to: string;
//   subject: string;
//   text?: string;
//   html: string;
//   senderName?: string;
//   senderEmail?: string;
// }

export const sendEmail = async (options) => {
  const { to, subject, text, html, senderName, senderEmail } = options;
  const from = senderName && senderEmail ? `"${senderName}" <${senderEmail}>` : env.EMAIL_USER;

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    logger.error('Error sending email:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    throw error;
  }
};


export * from './emails/verification';
