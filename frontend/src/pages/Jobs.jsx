import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs, matchJobsFromResume, clearMatchResults, scoreAtsFromResume, clearAtsScore } from '../features/jobs/jobSlice';
import JobCard from '../components/JobCard';
import { HiOutlineSearch } from 'react-icons/hi';

function Jobs() {
  const dispatch = useDispatch();
  const {
    jobs,
    total,
    pages,
    page,
    isLoading,
    matchResults,
    isMatching,
    matchError,
    isScoring,
    atsScore,
    atsError,
  } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);

  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [resumeFile, setResumeFile] = useState(null);
  const [atsResumeFile, setAtsResumeFile] = useState(null);
  const [localMatchError, setLocalMatchError] = useState('');
  const [localAtsError, setLocalAtsError] = useState('');
  const [matchRequested, setMatchRequested] = useState(false);

  useEffect(() => {
    const params = { page: currentPage };
    if (search) params.search = search;
    if (type !== 'All') params.type = type;
    dispatch(fetchJobs(params));
  }, [dispatch, currentPage, type]);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = { page: 1 };
    if (search) params.search = search;
    if (type !== 'All') params.type = type;
    dispatch(fetchJobs(params));
  };

  const handleMatch = (e) => {
    e.preventDefault();
    setLocalMatchError('');
    if (!resumeFile) {
      setLocalMatchError('Upload a PDF resume to find matches.');
      return;
    }
    setMatchRequested(true);
    dispatch(matchJobsFromResume(resumeFile));
  };

  const handleClearMatches = () => {
    dispatch(clearMatchResults());
    setMatchRequested(false);
    setResumeFile(null);
    setLocalMatchError('');
  };

  const handleAtsScore = (e) => {
    e.preventDefault();
    setLocalAtsError('');
    if (!atsResumeFile) {
      setLocalAtsError('Upload a PDF resume to get your ATS score.');
      return;
    }
    dispatch(scoreAtsFromResume(atsResumeFile));
  };

  const handleClearAts = () => {
    dispatch(clearAtsScore());
    setAtsResumeFile(null);
    setLocalAtsError('');
  };

  return (
    <div className="page fade-in">
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
            Explore Opportunities
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
            {total} jobs available
          </p>
        </div>

        {/* Resume Match */}
        <div className="match-card">
          <div className="match-header">
            <div>
              <h2>Resume Match</h2>
              <p>Upload your resume and see the best job fits based on skills.</p>
            </div>
          </div>

          {user?.role === 'candidate' ? (
            <form onSubmit={handleMatch} className="match-form">
              <input
                type="file"
                className="form-input"
                accept="application/pdf"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
              <button type="submit" className="btn btn-primary" disabled={isMatching}>
                {isMatching ? 'Matching...' : 'Find Matches'}
              </button>
              {matchResults.length > 0 && (
                <button type="button" className="btn btn-secondary" onClick={handleClearMatches}>
                  Clear
                </button>
              )}
            </form>
          ) : user ? (
            <div className="match-hint">Sign in as a candidate to use resume matching.</div>
          ) : (
            <div className="match-hint">Log in to upload a resume and get matches.</div>
          )}

          {(localMatchError || matchError) && (
            <div className="alert alert-error" style={{ marginTop: '12px' }}>
              {localMatchError || matchError}
            </div>
          )}
        </div>

        {/* ATS Score */}
        <div className="match-card">
          <div className="match-header">
            <div>
              <h2>ATS Score</h2>
              <p>Upload your resume and get an ATS score from the AI.</p>
            </div>
          </div>

          {user?.role === 'candidate' ? (
            <form onSubmit={handleAtsScore} className="match-form">
              <input
                type="file"
                className="form-input"
                accept="application/pdf"
                onChange={(e) => setAtsResumeFile(e.target.files?.[0] || null)}
              />
              <button type="submit" className="btn btn-primary" disabled={isScoring}>
                {isScoring ? 'Scoring...' : 'Get ATS Score'}
              </button>
              {atsScore !== null && (
                <button type="button" className="btn btn-secondary" onClick={handleClearAts}>
                  Clear
                </button>
              )}
            </form>
          ) : user ? (
            <div className="match-hint">Sign in as a candidate to use ATS scoring.</div>
          ) : (
            <div className="match-hint">Log in to upload a resume and get an ATS score.</div>
          )}

          {(localAtsError || atsError) && (
            <div className="alert alert-error" style={{ marginTop: '12px' }}>
              {localAtsError || atsError}
            </div>
          )}

          {atsScore !== null && !isScoring && !atsError && (
            <div className="ats-score">Your ATS score: {atsScore}</div>
          )}
        </div>

        {matchRequested && !isMatching && matchResults.length === 0 && !matchError && (
          <div className="empty-state" style={{ marginBottom: '32px' }}>
            <div className="empty-state-icon">-</div>
            <h3>No matches found</h3>
            <p>Try a different resume or apply to broader roles.</p>
          </div>
        )}

        {matchResults.length > 0 && (
          <div className="match-results">
            <div className="section-header">
              <h2>Best Matches</h2>
              <p>{matchResults.length} roles matched your resume</p>
            </div>
            <div className="jobs-grid" style={{ marginBottom: '32px' }}>
              {matchResults.map((match) => (
                <JobCard
                  key={match.job._id}
                  job={match.job}
                  matchScore={match.matchScore}
                  matchedSkills={match.matchedSkills}
                />
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            className="form-input"
            placeholder="Search jobs, companies, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            value={type}
            onChange={(e) => { setType(e.target.value); setCurrentPage(1); }}
          >
            <option>All</option>
            <option>Full-time</option>
            <option>Part-time</option>
            <option>Contract</option>
            <option>Internship</option>
            <option>Remote</option>
          </select>
          <button type="submit" className="btn btn-primary">
            <HiOutlineSearch /> Search
          </button>
        </form>

        {/* Results */}
        {isLoading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No jobs found</h3>
            <p>Try adjusting your search criteria</p>
          </div>
        ) : (
          <>
            <div className="jobs-grid">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`pagination-btn ${p === page ? 'active' : ''}`}
                    onClick={() => setCurrentPage(p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Jobs;
