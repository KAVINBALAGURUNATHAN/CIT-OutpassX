const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all outpass requests for parent
router.get('/requests', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ success: false, message: 'Email required' });

  try {
    // Get parent ID
    const [parents] = await pool.query(`SELECT id FROM parents WHERE email = ?`, [email]);
    if (!parents.length) return res.status(404).json({ success: false, message: 'Parent not found' });

    const parentId = parents[0].id;

    // Get all outpass requests for this parent
    const [requests] = await pool.query(
      `SELECT o.*, s.name AS student_name, s.register_no
       FROM outpasses o
       JOIN students s ON s.id = o.student_id
       WHERE s.parent_id = ?
       ORDER BY o.created_at DESC`,
      [parentId]
    );

    res.json({ success: true, requests });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/Reject outpass (parent)
router.put('/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { approve, otp } = req.body;

  if (approve === undefined || !otp) {
    return res.status(400).json({ success: false, message: 'Approval and OTP required' });
  }

  try {
    // Get the outpass and associated parent email
    const [outpasses] = await pool.query(
      `SELECT o.*, p.email AS parent_email
       FROM outpasses o
       JOIN students s ON s.id = o.student_id
       JOIN parents p ON p.id = s.parent_id
       WHERE o.id = ?`,
      [id]
    );

    if (!outpasses.length) return res.status(404).json({ success: false, message: 'Outpass not found' });

    // Verify the OTP that was emailed to the parent when the request was submitted
    if (outpasses[0].status !== 'PENDING_PARENT')
      return res.status(400).json({ success: false, message: 'Request already processed' });
    if (parseInt(otp) !== outpasses[0].otp) return res.status(400).json({ success: false, message: 'Invalid OTP' });

    // Update approval and status
    const newStatus = approve ? 'PENDING_ADVISOR' : 'REJECTED';

    await pool.query(
      `UPDATE outpasses SET parent_approval = ?, status = ? WHERE id = ?`,
      [approve ? 1 : 0, newStatus, id]
    );

    // Return updated outpass
    const [updated] = await pool.query(`SELECT * FROM outpasses WHERE id = ?`, [id]);
    res.json({ success: true, outpass: updated[0], message: approve ? 'Approved' : 'Rejected' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
