const fs = require('fs');
const Job = require('../models/Job');
const { validationResult } = require('express-validator');
const { extractTextFromPdf, matchJobSkills } = require('../utils/resumeMatcher');

// @desc    Get all jobs
// @route   GET /api/jobs
exports.getJobs = async (req, res) => {
  try {
    const { search, type, location, page = 1, limit = 12 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (type && type !== 'All') {
      query.type = type;
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const total = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .populate('employer', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      jobs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error while fetching jobs' });
  }
};

// @desc    Get single job
// @route   GET /api/jobs/:id
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('employer', 'name email');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a job
// @route   POST /api/jobs
exports.createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const jobData = {
      ...req.body,
      employer: req.user._id,
    };

    // Parse requirements and skills if they come as strings
    if (typeof jobData.requirements === 'string') {
      jobData.requirements = jobData.requirements.split(',').map(r => r.trim()).filter(Boolean);
    }
    if (typeof jobData.skills === 'string') {
      jobData.skills = jobData.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const job = await Job.create(jobData);
    await job.populate('employer', 'name email');

    res.status(201).json(job);
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error while creating job' });
  }
};

// @desc    Update a job
// @route   PUT /api/jobs/:id
exports.updateJob = async (req, res) => {
  try {
    let job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this job' });
    }

    // Parse requirements and skills if they come as strings
    const updateData = { ...req.body };
    if (typeof updateData.requirements === 'string') {
      updateData.requirements = updateData.requirements.split(',').map(r => r.trim()).filter(Boolean);
    }
    if (typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    job = await Job.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('employer', 'name email');

    res.json(job);
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ message: 'Server error while updating job' });
  }
};

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check ownership
    if (job.employer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this job' });
    }

    await Job.findByIdAndDelete(req.params.id);

    res.json({ message: 'Job removed successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ message: 'Server error while deleting job' });
  }
};

// @desc    Match jobs from resume
// @route   POST /api/jobs/match
exports.matchJobsFromResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const limitRaw = parseInt(req.query.limit, 10);
    const minScoreRaw = parseInt(req.query.minScore, 10);
    const limit = Number.isFinite(limitRaw) ? Math.min(limitRaw, 50) : 10;
    const minScore = Number.isFinite(minScoreRaw) ? minScoreRaw : 1;

    const resumeText = await extractTextFromPdf(req.file.path);
    const jobs = await Job.find({ isActive: true }).populate('employer', 'name email');

    const matches = jobs
      .map((job) => {
        const { matchedSkills, matchScore } = matchJobSkills(job.skills || [], resumeText);
        return {
          job,
          matchScore: matchScore ?? 0,
          matchedSkills,
        };
      })
      .filter((match) => match.matchScore >= minScore)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);

    res.json({ matches, total: matches.length });
  } catch (error) {
    console.error('Match jobs error:', error);
    res.status(500).json({ message: 'Server error while matching jobs' });
  } finally {
    if (req.file?.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
};
