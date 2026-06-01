const mongoose = require('mongoose');

const interviewSlotSchema = new mongoose.Schema({
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
}, { _id: false });

const interviewSchema = new mongoose.Schema({
  proposedSlots: {
    type: [interviewSlotSchema],
    default: [],
  },
  confirmedSlot: {
    type: interviewSlotSchema,
    default: null,
  },
  status: {
    type: String,
    enum: ['proposed', 'confirmed', 'cancelled'],
    default: 'proposed',
  },
  proposedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  confirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  proposedAt: {
    type: Date,
  },
  confirmedAt: {
    type: Date,
  },
}, { _id: false });

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true,
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  note: {
    type: String,
    default: '',
  },
  changedAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  candidate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  coverLetter: {
    type: String,
    maxlength: 2000,
    default: '',
  },
  resume: {
    url: {
      type: String,
      default: '',
    },
    originalName: {
      type: String,
      default: '',
    },
    contentType: {
      type: String,
      default: '',
    },
    size: {
      type: Number,
      default: 0,
    },
  },
  matchedSkills: {
    type: [String],
    default: [],
  },
  matchScore: {
    type: Number,
    default: null,
  },
  atsScore: {
    type: Number,
    default: null,
  },
  atsProvider: {
    type: String,
    default: '',
  },
  // Full AI evaluation from the hiring-agent service
  agentEvaluation: {
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'skipped'],
      default: 'pending',
    },
    completedAt: { type: Date, default: null },
    // Raw parsed resume sections
    resumeData: { type: mongoose.Schema.Types.Mixed, default: null },
    // GitHub profile + top projects
    githubData: { type: mongoose.Schema.Types.Mixed, default: null },
    // Category scores + evidence
    scores: { type: mongoose.Schema.Types.Mixed, default: null },
    bonusPoints: { type: mongoose.Schema.Types.Mixed, default: null },
    deductions: { type: mongoose.Schema.Types.Mixed, default: null },
    overallScore: { type: Number, default: null },
    maxScore: { type: Number, default: null },
    keyStrengths: { type: [String], default: [] },
    areasForImprovement: { type: [String], default: [] },
    errorMessage: { type: String, default: null },
  },
  status: {
    type: String,
    enum: [
      'applied',
      'shortlisted',
      'interview',
      'offer',
      'rejected',
      'pending',
      'reviewed',
      'accepted',
    ],
    default: 'applied',
  },
  statusHistory: {
    type: [statusHistorySchema],
    default: [],
  },
  interview: {
    type: interviewSchema,
    default: null,
  },
}, { timestamps: true });

// Prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
