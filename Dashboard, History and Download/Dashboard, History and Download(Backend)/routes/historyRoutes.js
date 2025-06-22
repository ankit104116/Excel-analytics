const express = require('express');
const router = express.Router();
const Analysis = require('../models/Analysis');
const auth = require('../middleware/authMiddleware');

router.get('/history', auth, async (req, res) => {
  try {
    const data = await Analysis.find({ userId: req.user.id });
    res.json(data);
  } catch (err) {
    res.status(500).send("Server Error");
  }
});

module.exports = router;