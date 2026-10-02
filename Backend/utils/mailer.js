const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Brevo's HTTP API is used when BREVO_API_KEY is set (hosts like Render free block SMTP ports)
async function sendViaBrevo(to, subject, text) {
  const res = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': process.env.BREVO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: { name: 'CIT OutpassX', email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      textContent: text
    })
  });
  if (!res.ok) throw new Error(`Brevo send failed: ${res.status} ${await res.text()}`);
}

async function sendOtpMail(to, otp) {
  const subject = 'CIT OutpassX OTP';
  const text = `Your OTP is ${otp}. It is valid for 5 minutes.`;

  if (process.env.BREVO_API_KEY) return sendViaBrevo(to, subject, text);

  await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, text });
}

module.exports = sendOtpMail;
