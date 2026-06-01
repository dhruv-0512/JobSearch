console.log("Calling:", `${HIRING_AGENT_URL}/evaluate/full`);
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const HIRING_AGENT_URL = process.env.HIRING_AGENT_URL || 'http://localhost:8008';
// Timeout in ms — evaluation can take 60-120s due to GitHub fetching + multiple LLM calls
const EVAL_TIMEOUT_MS = parseInt(process.env.HIRING_AGENT_TIMEOUT_MS || '180000', 10);

/**
 * Send a resume PDF to the hiring-agent FastAPI service for full evaluation.
 *
 * @param {string} pdfPath - Absolute path to the uploaded PDF on disk
 * @param {string|null} githubToken - Optional GitHub PAT for higher API rate limits
 * @returns {Promise<Object|null>} Evaluation result or null on failure
 */
const evaluateResume = async (pdfPath, githubToken = null) => {
  if (!pdfPath || !fs.existsSync(pdfPath)) {
    console.warn('[hiringAgent] PDF path does not exist:', pdfPath);
    return null;
  }

  try {
  console.log("Calling:", `${HIRING_AGENT_URL}/evaluate/full`);

  const response = await axios.post(`${HIRING_AGENT_URL}/evaluate/full`, form, {
    headers: {
      ...form.getHeaders(),
    },
    timeout: EVAL_TIMEOUT_MS,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  console.log("Agent response:", response.data);

  if (response.data?.status === 'ok') {
    return response.data;
  }

  console.warn('[hiringAgent] Unexpected response structure:', response.data);
  return null;

} catch (error) {
  console.error("HIRING_AGENT_URL:", HIRING_AGENT_URL);
  console.error("Status:", error?.response?.status);
  console.error("Response:", error?.response?.data);
  console.error("Message:", error.message);
  return null;
}
/**
 * Health-check the hiring-agent service.
 * @returns {Promise<boolean>}
 */
const isAgentAvailable = async () => {
  try {
    const response = await axios.get(`${HIRING_AGENT_URL}/health`, { timeout: 5000 });
    return response.data?.status === 'ok';
  } catch {
    return false;
  }
};

module.exports = { evaluateResume, isAgentAvailable };
