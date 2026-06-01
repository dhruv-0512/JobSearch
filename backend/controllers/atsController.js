const fs = require('fs');
const { evaluateResume } = require('../services/hiringAgentService');

// @desc    Score resume with ATS
// @route   POST /api/ats/score
exports.scoreResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const githubToken = process.env.GITHUB_TOKEN || null;
    const result = await evaluateResume(req.file.path, githubToken);

    if (!result) {
      return res.status(502).json({ message: 'Scoring failed. Ensure the PDF contains readable text.' });
    }

    return res.json({
      score: result.overall_score,
      provider: 'Hiring Agent',
      evaluation: result.evaluation,
      resumeData: result.resume_data,
      githubData: result.github_data,
      maxScore: result.max_score,
    });
  } catch (error) {
    console.error('ATS score error:', error);
    return res.status(500).json({ message: 'Server error while scoring resume' });
  } finally {
    if (req.file?.path) {
      fs.promises.unlink(req.file.path).catch(() => {});
    }
  }
};
