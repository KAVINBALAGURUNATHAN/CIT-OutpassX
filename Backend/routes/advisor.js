const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get requests assigned to advisor
router.get('/requests', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const [advisor] = await pool.query(`SELECT id FROM advisors WHERE email = ?`, [email]);
    if (!advisor.length) return res.json([]);
    const advisorId = advisor[0].id;

    const [requests] = await pool.query(
      `SELECT o.*, s.name AS student_name FROM outpasses o JOIN students s ON o.student_id = s.id WHERE o.advisor_id = ? AND o.parent_approval = 1 ORDER BY o.created_at DESC`,
      [advisorId]
    );

    res.json(requests);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve/Reject
router.put('/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { approve } = req.body;

  try {
    await pool.query(
      `UPDATE outpasses SET advisor_approval = ?, status = ? WHERE id = ?`,
      [approve ? 1 : 0, approve ? 'PENDING_HOD' : 'REJECTED_BY_ADVISOR', id]
    );

    res.json({ success: true, message: approve ? 'Approved' : 'Rejected' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
