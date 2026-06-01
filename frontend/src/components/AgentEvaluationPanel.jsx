import { useState } from 'react';

/* ──────────────────────────────────────────────────────────
   AgentEvaluationPanel
   Shows the full hiring-agent AI evaluation for a resume.
   Props:
     evaluation  – app.agentEvaluation object from the API
     candidateName – string, for the header
────────────────────────────────────────────────────────── */

function ScoreBar({ label, score, max, evidence, color }) {
  const pct = max > 0 ? Math.round((Math.min(score, max) / max) * 100) : 0;
  return (
    <div className="agent-score-row">
      <div className="agent-score-header">
        <span className="agent-score-label">{label}</span>
        <span className="agent-score-value" style={{ color }}>
          {Math.min(score, max).toFixed(0)}<span style={{ opacity: 0.5 }}>/{max}</span>
        </span>
      </div>
      <div className="agent-score-bar-track">
        <div
          className="agent-score-bar-fill"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      {evidence && (
        <p className="agent-score-evidence">{evidence}</p>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  const isOpenSource = project.project_type === 'open_source';
  const details = project.github_details || {};
  return (
    <div className="agent-project-card">
      <div className="agent-project-header">
        <span className={`badge ${isOpenSource ? 'badge-accent' : 'badge-info'}`}>
          {isOpenSource ? '🌐 Open Source' : '🛠 Self Project'}
        </span>
        <div className="agent-project-stats">
          {details.stars > 0 && <span>⭐ {details.stars}</span>}
          {details.forks > 0 && <span>🍴 {details.forks}</span>}
          {project.contributor_count > 1 && <span>👥 {project.contributor_count}</span>}
        </div>
      </div>
      <h4 className="agent-project-name">{project.name || 'Unnamed Project'}</h4>
      {project.description && (
        <p className="agent-project-desc">{project.description}</p>
      )}
      {project.technologies?.length > 0 && (
        <div className="agent-project-tags">
          {project.technologies.filter(Boolean).map((tech) => (
            <span key={tech} className="agent-tag">{tech}</span>
          ))}
        </div>
      )}
      {details.topics?.length > 0 && (
        <div className="agent-project-tags" style={{ marginTop: '4px' }}>
          {details.topics.slice(0, 5).map((t) => (
            <span key={t} className="agent-tag agent-tag-dim">{t}</span>
          ))}
        </div>
      )}
      <div className="agent-project-links">
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noreferrer" className="agent-link">
            GitHub ↗
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noreferrer" className="agent-link agent-link-live">
            Live ↗
          </a>
        )}
      </div>
      {project.author_commit_count > 0 && (
        <div className="agent-commit-info">
          {project.author_commit_count} author commits · {project.total_commit_count} total
        </div>
      )}
    </div>
  );
}

function GitHubProfileCard({ profile }) {
  if (!profile?.username) return null;
  return (
    <div className="agent-github-profile">
      {profile.avatar_url && (
        <img src={profile.avatar_url} alt={profile.username} className="agent-github-avatar" />
      )}
      <div className="agent-github-info">
        <div className="agent-github-name">{profile.name || profile.username}</div>
        <a
          href={`https://github.com/${profile.username}`}
          target="_blank"
          rel="noreferrer"
          className="agent-link"
        >
          @{profile.username} ↗
        </a>
        {profile.bio && <p className="agent-github-bio">{profile.bio}</p>}
        <div className="agent-github-stats">
          {profile.public_repos != null && <span>📁 {profile.public_repos} repos</span>}
          {profile.followers != null && <span>👥 {profile.followers} followers</span>}
          {profile.location && <span>📍 {profile.location}</span>}
          {profile.company && <span>🏢 {profile.company}</span>}
        </div>
      </div>
    </div>
  );
}

export default function AgentEvaluationPanel({ evaluation, candidateName }) {
  const [activeTab, setActiveTab] = useState('scores');

  if (!evaluation) return null;

  const {
    status,
    scores,
    bonusPoints,
    deductions,
    overallScore,
    maxScore,
    keyStrengths = [],
    areasForImprovement = [],
    githubData,
    resumeData,
    errorMessage,
  } = evaluation;

  if (status === 'pending') {
    return (
      <div className="agent-panel agent-panel-pending">
        <div className="agent-pending-icon">🤖</div>
        <h3>AI Analysis in Progress</h3>
        <p>The hiring agent is analysing the resume — checking GitHub projects, evaluating skills and work experience. This usually takes 1–2 minutes.</p>
        <div className="agent-pending-dots">
          <span /><span /><span />
        </div>
      </div>
    );
  }

  if (status === 'failed' || status === 'skipped') {
    return (
      <div className="agent-panel agent-panel-error">
        <div className="agent-pending-icon">⚠️</div>
        <h3>{status === 'skipped' ? 'Analysis Not Available' : 'Analysis Failed'}</h3>
        <p>{errorMessage || (status === 'skipped' ? 'No PDF was provided with this application.' : 'The hiring agent could not process this resume.')}</p>
      </div>
    );
  }

  const SCORE_CONFIG = [
    { key: 'open_source',      label: '🌐 Open Source',           color: '#6ee7b7', max: 35 },
    { key: 'self_projects',    label: '🚀 Self Projects',          color: '#93c5fd', max: 30 },
    { key: 'production',       label: '🏢 Production Experience',  color: '#fbbf24', max: 25 },
    { key: 'technical_skills', label: '💻 Technical Skills',       color: '#c084fc', max: 10 },
  ];

  const overallPct = maxScore > 0 ? Math.round((overallScore / maxScore) * 100) : 0;

  const githubProfile = githubData?.profile;
  const githubProjects = githubData?.projects || [];

  return (
    <div className="agent-panel">
      {/* Header */}
      <div className="agent-panel-header">
        <div>
          <h2 className="agent-panel-title">🤖 AI Resume Evaluation</h2>
          {candidateName && <p className="agent-panel-subtitle">for {candidateName}</p>}
        </div>
        <div className="agent-overall-score">
          <svg viewBox="0 0 64 64" className="agent-score-ring">
            <circle cx="32" cy="32" r="28" className="agent-ring-bg" />
            <circle
              cx="32" cy="32" r="28"
              className="agent-ring-fill"
              strokeDasharray={`${(overallPct / 100) * 175.9} 175.9`}
            />
          </svg>
          <div className="agent-score-center">
            <div className="agent-score-num">{overallScore?.toFixed(0) ?? '—'}</div>
            <div className="agent-score-denom">/{maxScore}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="agent-tabs">
        {[
          { id: 'scores',    label: '📊 Scores' },
          { id: 'github',    label: '🐙 GitHub' },
          { id: 'strengths', label: '✅ Insights' },
          ...(resumeData ? [{ id: 'resume', label: '📄 Resume' }] : []),
        ].map((tab) => (
          <button
            key={tab.id}
            className={`agent-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="agent-tab-content">

        {/* SCORES TAB */}
        {activeTab === 'scores' && scores && (
          <div className="agent-scores">
            {SCORE_CONFIG.map(({ key, label, color, max }) => {
              const cat = scores[key];
              if (!cat) return null;
              return (
                <ScoreBar
                  key={key}
                  label={label}
                  score={cat.score}
                  max={cat.max ?? max}
                  evidence={cat.evidence}
                  color={color}
                />
              );
            })}

            {bonusPoints && (
              <div className="agent-bonus-section">
                <div className="agent-bonus-header">
                  <span>⭐ Bonus Points</span>
                  <span className="agent-bonus-value">+{bonusPoints.total?.toFixed(1)}</span>
                </div>
                {bonusPoints.breakdown && (
                  <p className="agent-score-evidence">{bonusPoints.breakdown}</p>
                )}
              </div>
            )}

            {deductions && deductions.total > 0 && (
              <div className="agent-bonus-section agent-deduction-section">
                <div className="agent-bonus-header">
                  <span>⚠️ Deductions</span>
                  <span className="agent-bonus-value" style={{ color: '#f87171' }}>−{deductions.total?.toFixed(1)}</span>
                </div>
                {deductions.reasons && (
                  <p className="agent-score-evidence">{deductions.reasons}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* GITHUB TAB */}
        {activeTab === 'github' && (
          <div className="agent-github">
            {githubProfile ? (
              <GitHubProfileCard profile={githubProfile} />
            ) : (
              <div className="agent-empty">No GitHub profile found in resume.</div>
            )}

            {githubProjects.length > 0 && (
              <>
                <h3 className="agent-section-title">Top Projects <span>({githubProjects.length})</span></h3>
                <div className="agent-projects-grid">
                  {githubProjects.map((project, i) => (
                    <ProjectCard key={project.name || i} project={project} />
                  ))}
                </div>
              </>
            )}

            {!githubProfile && githubProjects.length === 0 && (
              <div className="agent-empty">
                No GitHub data available. The candidate may not have included a GitHub link in their resume.
              </div>
            )}
          </div>
        )}

        {/* STRENGTHS & IMPROVEMENTS TAB */}
        {activeTab === 'strengths' && (
          <div className="agent-insights">
            {keyStrengths.length > 0 && (
              <div className="agent-insight-section">
                <h3 className="agent-insight-title">✅ Key Strengths</h3>
                <ul className="agent-insight-list">
                  {keyStrengths.map((s, i) => (
                    <li key={i} className="agent-strength-item">{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {areasForImprovement.length > 0 && (
              <div className="agent-insight-section">
                <h3 className="agent-insight-title">🔧 Areas for Improvement</h3>
                <ul className="agent-insight-list">
                  {areasForImprovement.map((a, i) => (
                    <li key={i} className="agent-improvement-item">{a}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* RESUME DATA TAB */}
        {activeTab === 'resume' && resumeData && (
          <div className="agent-resume-data">
            {resumeData.basics && (
              <div className="agent-resume-section">
                <h3 className="agent-section-title">👤 Basics</h3>
                <div className="agent-resume-basics">
                  <strong>{resumeData.basics.name}</strong>
                  {resumeData.basics.email && <span>📧 {resumeData.basics.email}</span>}
                  {resumeData.basics.url && <a href={resumeData.basics.url} target="_blank" rel="noreferrer" className="agent-link">{resumeData.basics.url} ↗</a>}
                  {resumeData.basics.summary && <p className="agent-resume-summary">{resumeData.basics.summary}</p>}
                </div>
              </div>
            )}

            {resumeData.work?.length > 0 && (
              <div className="agent-resume-section">
                <h3 className="agent-section-title">💼 Work Experience</h3>
                {resumeData.work.map((w, i) => (
                  <div key={i} className="agent-resume-entry">
                    <div className="agent-resume-entry-header">
                      <strong>{w.position}</strong> at <span>{w.name}</span>
                      <span className="agent-date-range">{w.startDate} – {w.endDate || 'Present'}</span>
                    </div>
                    {w.summary && <p className="agent-resume-summary">{w.summary}</p>}
                    {w.highlights?.length > 0 && (
                      <ul className="agent-resume-highlights">
                        {w.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {resumeData.skills?.length > 0 && (
              <div className="agent-resume-section">
                <h3 className="agent-section-title">🛠 Skills</h3>
                <div className="agent-project-tags">
                  {resumeData.skills.flatMap(s => s.keywords || [s.name]).filter(Boolean).map((skill, i) => (
                    <span key={i} className="agent-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}

            {resumeData.education?.length > 0 && (
              <div className="agent-resume-section">
                <h3 className="agent-section-title">🎓 Education</h3>
                {resumeData.education.map((e, i) => (
                  <div key={i} className="agent-resume-entry">
                    <strong>{e.studyType} in {e.area}</strong> — {e.institution}
                    <span className="agent-date-range">{e.startDate} – {e.endDate || 'Present'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
