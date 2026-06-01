const axios = require('axios');

const clampScore = (value) => Math.max(0, Math.min(100, Math.round(value)));

const extractJsonScore = (text) => {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    if (typeof parsed?.score === 'number') {
      return clampScore(parsed.score);
    }
  } catch (error) {
    return null;
  }

  return null;
};

const extractNumericScore = (text) => {
  if (!text) return null;
  const match = text.match(/-?\d+(?:\.\d+)?/);
  if (!match) return null;
  const value = Number(match[0]);
  if (!Number.isFinite(value)) return null;
  return clampScore(value);
};

const buildPrompt = ({ resumeText, job }) => {
  const jobTitle = job?.title || 'Not provided';
  const jobDescription = job?.description || 'Not provided';
  const jobSkills = Array.isArray(job?.skills) ? job.skills.join(', ') : 'Not provided';

  return [
    'Resume:',
    resumeText,
    '',
    `Job Title: ${jobTitle}`,
    `Job Description: ${jobDescription}`,
    `Job Skills: ${jobSkills}`,
  ].join('\n');
};

const getAtsScore = async ({ resumeText, job }) => {
  const apiUrl = process.env.ATS_API_URL;
  if (!apiUrl || !resumeText) {
    return null;
  }

  const apiKey = process.env.ATS_API_KEY;
  const model = process.env.ATS_MODEL || 'deepseek-chat';
  const maxChars = parseInt(process.env.ATS_RESUME_MAX_CHARS || '8000', 10);
  const trimmedResume = resumeText.length > maxChars
    ? resumeText.slice(0, maxChars)
    : resumeText;

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: 'You are an ATS scoring engine. Return only JSON: {"score": number} between 0 and 100.',
      },
      {
        role: 'user',
        content: buildPrompt({ resumeText: trimmedResume, job }),
      },
    ],
    temperature: 0.2,
    max_tokens: 200,
  };

  try {
    const response = await axios.post(apiUrl, payload, {
      headers: {
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        'Content-Type': 'application/json',
      },
    });

    const data = response.data;
    if (typeof data === 'number') {
      return { score: clampScore(data), provider: 'deepseek' };
    }

    const directScore = typeof data?.score === 'number' ? data.score : null;
    if (Number.isFinite(directScore)) {
      return { score: clampScore(directScore), provider: data?.provider || 'deepseek' };
    }

    const content = data?.choices?.[0]?.message?.content || data?.choices?.[0]?.text || '';
    const jsonScore = extractJsonScore(content);
    if (jsonScore !== null) {
      return { score: jsonScore, provider: 'deepseek' };
    }

    const numericScore = extractNumericScore(content);
    if (numericScore !== null) {
      return { score: numericScore, provider: 'deepseek' };
    }

    return null;
  } catch (error) {
    const details = error?.response?.data || error.message;
    console.error('ATS score error:', details);
    return null;
  }
};

module.exports = { getAtsScore };
