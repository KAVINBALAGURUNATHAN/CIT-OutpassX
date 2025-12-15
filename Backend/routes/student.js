const express = require('express');
const router = express.Router();
const pool = require('../db');
const sendOtpMail = require('../utils/mailer');

/**
 * Send OTP for student login
 */
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const [students] = await pool.query(`SELECT id FROM students WHERE email = ?`, [email]);
    if (!students.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const otp = Math.floor(100000 + Math.random() * 900000);
    await pool.query(`INSERT INTO otp_sessions (email, role, otp) VALUES (?, 'STUDENT', ?)`, [email, otp]);
    await sendOtpMail(email, otp);

    res.json({ success: true, message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error sending OTP:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Verify OTP for login
 */
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ success: false, message: 'Email and OTP required' });

  try {
    const [rows] = await pool.query(
      `SELECT * FROM otp_sessions WHERE email = ? AND role = 'STUDENT' ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (!rows.length) return res.status(400).json({ success: false, message: 'OTP not found' });

    const latestOtp = rows[0].otp;
    const createdAt = new Date(rows[0].created_at);

    if ((new Date() - createdAt) / 60000 > 5) 
      return res.status(400).json({ success: false, message: 'OTP expired' });

    if (parseInt(otp) !== latestOtp)
      return res.status(400).json({ success: false, message: 'Invalid OTP' });

    await pool.query(`DELETE FROM otp_sessions WHERE id = ?`, [rows[0].id]);

    res.json({ success: true, message: 'OTP verified. Student logged in.' });

  } catch (err) {
    console.error('Error verifying OTP:', err.message);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * Submit a new outpass request
 */
router.post('/request-outpass', async (req, res) => {
  const { email, date_from, date_to, reason } = req.body;

  if (!email || !date_from || !date_to || !reason)
    return res.status(400).json({ success: false, message: 'All fields are required' });

  try {
    // Get student and their parent_id
    const [students] = await pool.query(`SELECT id, parent_id FROM students WHERE email = ?`, [email]);
    if (!students.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const student = students[0];
    if (!student.parent_id) return res.status(400).json({ success: false, message: 'Parent not assigned to this student' });

    const otp = Math.floor(100000 + Math.random() * 900000);

    // Insert outpass
    await pool.query(
      `INSERT INTO outpasses (student_id, parent_id, date_from, date_to, reason, status, otp) 
       VALUES (?, ?, ?, ?, ?, 'PENDING_PARENT', ?)`,
      [student.id, student.parent_id, date_from, date_to, reason, otp]
    );

    // Get parent email to send OTP
    const [parents] = await pool.query(`SELECT email FROM parents WHERE id = ?`, [student.parent_id]);
    if (parents.length) {
      await sendOtpMail(parents[0].email, otp);
    }

    res.json({ success: true, message: 'Outpass request submitted and OTP sent to parent' });

  } catch (err) {
    console.error('Error submitting outpass:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * Get all outpasses for a student
 */
router.get('/outpasses', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    const [students] = await pool.query(`SELECT id FROM students WHERE email = ?`, [email]);
    if (!students.length) return res.status(404).json({ success: false, message: 'Student not found' });

    const [outpasses] = await pool.query(
      `SELECT * FROM outpasses WHERE student_id = ? ORDER BY created_at DESC`,
      [students[0].id]
    );

    res.json({ success: true, data: outpasses });

  } catch (err) {
    console.error('Error fetching outpasses:', err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
