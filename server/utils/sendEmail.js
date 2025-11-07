// utils/sendEmail.js
import nodemailer from 'nodemailer';

export const sendUserCredentials = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      pool: true,
      maxConnections: 1,
      rateDelta: 20000,
      rateLimit: 5
    });

    // Verify transporter configuration
    await transporter.verify();
    console.log('Email server is ready to take our messages');

    const textVersion = html.replace(/<[^>]*>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const mailOptions = {
      from: `"NCDB Mart" <${process.env.EMAIL_USER}>`,
      to,
      subject: `NCDB Mart - ${subject}`,
      html,
      text: textVersion,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high',
        'X-Mailer': 'NCDB Mart Mailer 1.0',
        'List-Unsubscribe': `<mailto:${process.env.EMAIL_USER}?subject=Unsubscribe>`,
      },
      priority: 'high'
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully to:', to);
    console.log('Message ID:', result.messageId);

    return result;
  } catch (error) {
    console.error('Error sending email to:', to);
    console.error('Error details:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};