import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendUserCredentials = async (email, tempPassword) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your NCDB Account Login Info',
    text: `Welcome to NCDB!

Your login credentials:
Email: ${email}
Temporary Password: ${tempPassword}

Please log in and change your password immediately.
Login Link: https://ncdb.lk/login`,
  };

  await transporter.sendMail(mailOptions);
};
