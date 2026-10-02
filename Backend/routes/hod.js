const express = require('express');
const router = express.Router();
const pool = require('../db');

// List advisors (for the dashboard filter)
router.get('/advisors', async (req, res) => {
  try {
    const [advisors] = await pool.query(`SELECT id, name FROM advisors ORDER BY name`);
    res.json(advisors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET requests for HOD approval (only advisor-approved requests)
router.get('/requests', async (req, res) => {
  const { advisorId } = req.query;

  try {
    let query = `
      SELECT o.*, s.name AS student_name 
      FROM outpasses o
      JOIN students s ON o.student_id = s.id
      WHERE o.advisor_approval = 1
    `;
    const params = [];

    if (advisorId) {
      query += ` AND o.advisor_id = ?`;
      params.push(advisorId);
    }

    query += ` ORDER BY o.created_at DESC`;

    const [requests] = await pool.query(query, params);
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
      `UPDATE outpasses 
       SET hod_approval = 1, status = 'PENDING_FLOOR' 
       WHERE id IN (?)`,
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
    await pool.query(
      `UPDATE outpasses 
       SET hod_approval = ?, status = ? 
       WHERE id = ?`,
      [approve ? 1 : 0, approve ? 'PENDING_FLOOR' : 'REJECTED_BY_HOD', id]
    );

    const [updated] = await pool.query(`SELECT * FROM outpasses WHERE id = ?`, [id]);
    res.json({ success: true, request: updated[0], message: approve ? 'Approved' : 'Rejected' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;

