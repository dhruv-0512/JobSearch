const express = require('express');
const { scoreResume } = require('../controllers/atsController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

const router = express.Router();

router.post('/score', protect, authorize('candidate'), uploadResume, scoreResume);

module.exports = router;
