const express = require('express');
const {
  getApplications,
  updateApplicationStatus,
  proposeInterviewSlots,
  confirmInterviewSlot,
} = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getApplications);
router.put('/:id', protect, authorize('employer'), updateApplicationStatus);
router.post('/:id/interview-slots', protect, authorize('employer'), proposeInterviewSlots);
router.post('/:id/interview-confirm', protect, authorize('candidate'), confirmInterviewSlot);

module.exports = router;
