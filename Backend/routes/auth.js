const express = require('express');
const router = express.Router();
const pool = require('../db');
const sendOtpMail = require('../utils/mailer');

/**
 * POST /auth/send-otp
 */
router.post('/send-otp', async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ success: false, message: 'Email and role required' });

  try {
    const tableMap = {
      student: 'students',
      parent: 'parents',
      advisor: 'advisors',
      hod: 'hods',
      floor: 'floor_incharges'
    };
    const table = tableMap[role.toLowerCase()];
    if (!table) return res.status(400).json({ success: false, message: 'Invalid role' });

    const [users] = await pool.query(`SELECT id FROM ${table} WHERE email=?`, [email]);
    if (!users.length) return res.status(404).json({ success: false, message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000);

    await pool.query(
      `INSERT INTO otp_sessions (email, role, otp) VALUES (?, ?, ?)`,
      [email, role.toUpperCase(), otp]
    );

    await sendOtpMail(email, otp);
    res.json({ success: true, message: 'OTP sent to email' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * POST /auth/verify-otp
 */
router.post('/verify-otp', async (req, res) => {
  const { email, role, otp } = req.body;
  if (!email || !role || !otp) return res.status(400).json({ success: false, message: 'Email, role, OTP required' });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM otp_sessions WHERE email=? AND role=? ORDER BY created_at DESC LIMIT 1`,
      [email, role.toUpperCase()]
    );
    if (!rows.length) return res.status(400).json({ success: false, message: 'OTP not found' });

    const latestOtp = rows[0].otp;
    const createdAt = new Date(rows[0].created_at);
    if ((Date.now() - createdAt) / 60000 > 5)
      return res.status(400).json({ success: false, message: 'OTP expired' });

    if (parseInt(otp) !== latestOtp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    // Delete OTP after successful verification
    await pool.query(`DELETE FROM otp_sessions WHERE email=? AND role=?`, [email, role.toUpperCase()]);

    res.json({ success: true, message: 'OTP verified', email, role: role.toLowerCase() });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
