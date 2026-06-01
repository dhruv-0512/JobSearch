const fs = require('fs');
const { extractTextFromPdf } = require('../utils/resumeMatcher');
const { getAtsScore } = require('../services/atsService');

// @desc    Score resume with ATS
// @route   POST /api/ats/score
exports.scoreResume = async (req, res) => {
  try {
    if (!process.env.ATS_API_URL) {
      return res.status(400).json({ message: 'ATS API not configured' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Resume PDF is required' });
    }

    const resumeText = await extractTextFromPdf(req.file.path);
    const atsResult = await getAtsScore({ resumeText, job: null });

    if (!atsResult) {
      return res.status(502).json({ message: 'ATS scoring failed' });
    }

    return res.json({
      score: atsResult.score,
      provider: atsResult.provider,
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
