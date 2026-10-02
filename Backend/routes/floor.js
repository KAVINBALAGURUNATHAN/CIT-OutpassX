const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET requests for this floor incharge
router.get('/requests', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: 'Email required' });

  try {
    const [incharges] = await pool.query(`SELECT hostel, floor FROM floor_incharges WHERE email = ?`, [email]);
    if (!incharges.length) return res.json([]);

    const [requests] = await pool.query(
      `SELECT o.*, s.name AS student_name, s.register_no, s.hostel, s.floor
       FROM outpasses o
       JOIN students s ON o.student_id = s.id
       WHERE o.hod_approval = 1 AND s.hostel = ? AND s.floor = ?
       ORDER BY o.created_at DESC`,
      [incharges[0].hostel, incharges[0].floor]
    );

    res.json(requests);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Bulk approve multiple requests
router.put('/requests/bulk', async (req, res) => {
  const { ids } = req.body; // array of outpass IDs
  if (!ids || !ids.length) return res.status(400).json({ message: 'IDs required' });

  try {
    await pool.query(
      `UPDATE outpasses SET floor_incharge_approval = 1, status = 'APPROVED' WHERE id IN (?) AND hod_approval = 1`,
      [ids]
    );

    res.json({ success: true, message: 'Bulk approval done' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Approve/Reject single request
router.put('/requests/:id', async (req, res) => {
  const { id } = req.params;
  const { approve } = req.body;

  try {
    const [rows] = await pool.query(`SELECT hod_approval FROM outpasses WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Request not found' });
    if (!rows[0].hod_approval) return res.status(400).json({ success: false, message: 'Cannot approve before HOD approval' });

    await pool.query(
      `UPDATE outpasses SET floor_incharge_approval = ?, status = ? WHERE id = ?`,
      [approve ? 1 : 0, approve ? 'APPROVED' : 'REJECTED', id]
    );

    const [updated] = await pool.query(`SELECT * FROM outpasses WHERE id = ?`, [id]);
    res.json({ success: true, request: updated[0], message: approve ? 'Approved' : 'Rejected' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

