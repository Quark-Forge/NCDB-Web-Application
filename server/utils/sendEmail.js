// utils/sendEmail.js
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.authentications['apiKey'].apiKey = process.env.BREVO_API_KEY;

export const sendUserCredentials = async (to, subject, html) => {
  try {
    const textVersion = html.replace(/<[^>]*>/g, '').trim();

    const sendSmtpEmail = {
      sender: {
        name: 'NCDB Mart',
        email: process.env.EMAIL_USER,
      },
      to: [{ email: to }],
      subject: `NCDB Mart - ${subject}`,
      htmlContent: html,
      textContent: textVersion,
    };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent to: ${to}`);
    return result;
  } catch (error) {
    console.error('Failed to send email:', error.response?.text || error.message);
    throw error;
  }
};
