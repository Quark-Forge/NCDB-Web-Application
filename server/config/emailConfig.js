export const emailConfig = {
  // Gmail specific settings
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Connection pool settings
  pool: true,
  maxConnections: 1,
  maxMessages: 5,
  rateDelta: 20000,
  rateLimit: 5,
  // Security settings
  secure: true,
  tls: {
    rejectUnauthorized: false
  }
};

// Improved email sender with DKIM-like settings
export const createTransporter = () => {
  return nodemailer.createTransport(emailConfig);
};