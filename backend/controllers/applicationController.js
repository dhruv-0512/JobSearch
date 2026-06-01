const path = require('path');
const Application = require('../models/Application');
const Job = require('../models/Job');
const { extractTextFromPdf, matchJobSkills } = require('../utils/resumeMatcher');
const { evaluateResume } = require('../services/hiringAgentService');

const allowedStatuses = [
  'applied',
  'shortlisted',
  'interview',
  'offer',
  'rejected',
  'pending',
  'reviewed',
  'accepted',
];

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    if (!job.isActive) {
      return res.status(400).json({ message: 'This job is no longer accepting applications' });
    }

    // Check if already applied
    const existingApp = await Application.findOne({
      job: req.params.id,
      candidate: req.user._id,
    });
    if (existingApp) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

    let resumeMeta = {
      url: '',
      originalName: '',
      contentType: '',
      size: 0,
    };
    let resumeText = '';
    let matchResult = { matchedSkills: [], matchScore: null };
    let resumePdfPath = null;

    if (req.file) {
      resumePdfPath = req.file.path;
      resumeMeta = {
        url: `/uploads/resumes/${req.file.filename}`,
        originalName: req.file.originalname,
        contentType: req.file.mimetype,
        size: req.file.size,
      };

      try {
        resumeText = await extractTextFromPdf(req.file.path);
        matchResult = matchJobSkills(job.skills || [], resumeText);
      } catch (parseError) {
        console.error('Resume parse error:', parseError.message);
      }
    } else if (req.body.resumeUrl) {
      resumeMeta = {
        url: req.body.resumeUrl,
        originalName: path.basename(req.body.resumeUrl),
        contentType: 'application/pdf',
        size: 0,
      };
    }

    const application = await Application.create({
      job: req.params.id,
      candidate: req.user._id,
      coverLetter: req.body.coverLetter || '',
      resume: resumeMeta,
      matchedSkills: matchResult.matchedSkills,
      matchScore: matchResult.matchScore,
      status: 'applied',
      agentEvaluation: { status: resumePdfPath ? 'pending' : 'skipped' },
      statusHistory: [
        {
          status: 'applied',
          changedBy: req.user._id,
          note: 'Application submitted',
        },
      ],
    });

    await application.populate([
      { path: 'job', select: 'title company location type' },
      { path: 'candidate', select: 'name email' },
    ]);

    // Respond immediately — don't wait for AI evaluation
    res.status(201).json(application);

    // Fire-and-forget: run hiring-agent evaluation in the background
    if (resumePdfPath) {
      const githubToken = process.env.GITHUB_TOKEN || null;
      evaluateResume(resumePdfPath, githubToken)
        .then(async (result) => {
          if (!result) {
            await Application.findByIdAndUpdate(application._id, {
              'agentEvaluation.status': 'failed',
              'agentEvaluation.errorMessage': 'Hiring agent returned no result',
            });
            return;
          }

          const eval_ = result.evaluation || {};
          const scores = eval_.scores || null;
          const bonusPoints = eval_.bonus_points || null;
          const deductions = eval_.deductions || null;

          await Application.findByIdAndUpdate(application._id, {
            'agentEvaluation.status': 'completed',
            'agentEvaluation.completedAt': new Date(),
            'agentEvaluation.resumeData': result.resume_data || null,
            'agentEvaluation.githubData': result.github_data || null,
            'agentEvaluation.scores': scores,
            'agentEvaluation.bonusPoints': bonusPoints,
            'agentEvaluation.deductions': deductions,
            'agentEvaluation.overallScore': result.overall_score ?? null,
            'agentEvaluation.maxScore': result.max_score ?? null,
            'agentEvaluation.keyStrengths': eval_.key_strengths || [],
            'agentEvaluation.areasForImprovement': eval_.areas_for_improvement || [],
          });
          console.log(`[hiringAgent] ✅ Evaluation saved for application ${application._id}`);
        })
        .catch(async (err) => {
          console.error('[hiringAgent] Background evaluation error:', err.message);
          await Application.findByIdAndUpdate(application._id, {
            'agentEvaluation.status': 'failed',
            'agentEvaluation.errorMessage': err.message,
          }).catch(() => {});
        });
    }
  } catch (error) {
    console.error('Apply error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    res.status(500).json({ message: 'Server error while applying' });
  }
};

// @desc    Get applications
// @route   GET /api/applications
// Candidates see their own applications; Employers see applications for their jobs
exports.getApplications = async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'candidate') {
      // Candidate: see own applications
      applications = await Application.find({ candidate: req.user._id })
        .populate({
          path: 'job',
          select: 'title company location type salary',
          populate: { path: 'employer', select: 'name' },
        })
        .sort({ createdAt: -1 });
    } else {
      // Employer: see applications for their jobs
      const employerJobs = await Job.find({ employer: req.user._id }).select('_id');
      const jobIds = employerJobs.map(j => j._id);

      applications = await Application.find({ job: { $in: jobIds } })
        .populate('job', 'title company location type salary')
        .populate('candidate', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Server error while fetching applications' });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id
exports.updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    // Only the employer who owns the job can update
    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: 'Invalid application status' });
    }

    application.status = req.body.status;
    application.statusHistory.push({
      status: req.body.status,
      changedBy: req.user._id,
      note: req.body.note || '',
    });
    await application.save();

    await application.populate([
      { path: 'job', select: 'title company location type salary' },
      { path: 'candidate', select: 'name email' },
    ]);

    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Propose interview slots
// @route   POST /api/applications/:id/interview-slots
exports.proposeInterviewSlots = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this application' });
    }

    const slots = Array.isArray(req.body.slots) ? req.body.slots : [];
    const normalizedSlots = slots.map((slot) => ({
      start: new Date(slot.start),
      end: new Date(slot.end),
    })).filter((slot) => !Number.isNaN(slot.start?.getTime()) && !Number.isNaN(slot.end?.getTime()) && slot.end > slot.start);

    if (normalizedSlots.length === 0) {
      return res.status(400).json({ message: 'Provide at least one valid time slot' });
    }

    application.interview = {
      proposedSlots: normalizedSlots,
      status: 'proposed',
      proposedBy: req.user._id,
      proposedAt: new Date(),
    };
    application.status = 'interview';
    application.statusHistory.push({
      status: 'interview',
      changedBy: req.user._id,
      note: req.body.note || 'Interview slots proposed',
    });

    await application.save();

    await application.populate([
      { path: 'job', select: 'title company location type salary' },
      { path: 'candidate', select: 'name email' },
    ]);

    res.json(application);
  } catch (error) {
    console.error('Propose interview error:', error);
    res.status(500).json({ message: 'Server error while proposing interview' });
  }
};

// @desc    Confirm interview slot
// @route   POST /api/applications/:id/interview-confirm
exports.confirmInterviewSlot = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (application.candidate.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to confirm this interview' });
    }

    if (!application.interview || application.interview.proposedSlots.length === 0) {
      return res.status(400).json({ message: 'No interview slots to confirm' });
    }

    const slotIndex = Number(req.body.slotIndex);
    const selectedSlot = application.interview.proposedSlots[slotIndex];
    if (!selectedSlot) {
      return res.status(400).json({ message: 'Invalid interview slot selection' });
    }

    application.interview.confirmedSlot = selectedSlot;
    application.interview.status = 'confirmed';
    application.interview.confirmedBy = req.user._id;
    application.interview.confirmedAt = new Date();

    if (application.status !== 'interview') {
      application.status = 'interview';
    }
    application.statusHistory.push({
      status: 'interview',
      changedBy: req.user._id,
      note: 'Interview confirmed',
    });

    await application.save();

    await application.populate([
      { path: 'job', select: 'title company location type salary' },
      { path: 'candidate', select: 'name email' },
    ]);

    res.json(application);
  } catch (error) {
    console.error('Confirm interview error:', error);
    res.status(500).json({ message: 'Server error while confirming interview' });
  }
};
