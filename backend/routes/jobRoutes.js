const express = require('express');
const { body } = require('express-validator');
const {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  matchJobsFromResume,
} = require('../controllers/jobController');
const { applyForJob } = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');
const { uploadResume } = require('../middleware/upload');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJob);

// Employer-only routes
router.post(
  '/',
  protect,
  authorize('employer'),
  [
    body('title').trim().notEmpty().withMessage('Job title is required'),
    body('company').trim().notEmpty().withMessage('Company name is required'),
    body('location').trim().notEmpty().withMessage('Location is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
  ],
  createJob
);

router.put('/:id', protect, authorize('employer'), updateJob);
router.delete('/:id', protect, authorize('employer'), deleteJob);

// Candidate-only route
router.post('/match', protect, authorize('candidate'), uploadResume, matchJobsFromResume);
router.post('/:id/apply', protect, authorize('candidate'), uploadResume, applyForJob);

module.exports = router;
