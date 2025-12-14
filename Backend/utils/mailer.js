const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

async function sendOtpMail(to, otp) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'CIT OutpassX OTP',
    text: `Your OTP is ${otp}. It is valid for 5 minutes.`
  });
}

module.exports = sendOtpMail;

