const fs = require('fs');
const pdfParse = require('pdf-parse');

const normalizeText = (text) => text.toLowerCase().replace(/\s+/g, ' ').trim();

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const extractTextFromPdf = async (filePath) => {
  const buffer = await fs.promises.readFile(filePath);
  const parsed = await pdfParse(buffer);
  return parsed.text || '';
};

const matchJobSkills = (jobSkills, resumeText) => {
  const normalizedResume = normalizeText(resumeText || '');
  if (!normalizedResume || !Array.isArray(jobSkills) || jobSkills.length === 0) {
    return { matchedSkills: [], matchScore: null };
  }

  const matchedSkills = jobSkills.filter((skill) => {
    const normalizedSkill = normalizeText(skill || '');
    if (!normalizedSkill) return false;

    const wordCharsOnly = /^[a-z0-9 ]+$/.test(normalizedSkill);
    const pattern = wordCharsOnly
      ? new RegExp(`\\b${escapeRegExp(normalizedSkill)}\\b`, 'i')
      : new RegExp(escapeRegExp(normalizedSkill), 'i');

    return pattern.test(normalizedResume);
  });

  const uniqueMatches = Array.from(new Set(matchedSkills.map((skill) => skill.trim()).filter(Boolean)));
  const matchScore = Math.round((uniqueMatches.length / jobSkills.length) * 100);

  return {
    matchedSkills: uniqueMatches,
    matchScore: Number.isFinite(matchScore) ? matchScore : null,
  };
};

module.exports = { extractTextFromPdf, matchJobSkills };
