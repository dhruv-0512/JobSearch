import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJob } from '../features/jobs/jobSlice';
import { applyForJob, clearApplySuccess, clearAppError } from '../features/applications/applicationSlice';
import { HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineOfficeBuilding, HiOutlineBriefcase, HiOutlineClipboardList, HiOutlineX } from 'react-icons/hi';

function JobDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentJob, isLoading } = useSelector((state) => state.jobs);
  const { user } = useSelector((state) => state.auth);
  const { isLoading: applyLoading, applySuccess, error: applyError } = useSelector((state) => state.applications);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);

  useEffect(() => {
    dispatch(fetchJob(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (applySuccess) {
      setShowApplyModal(false);
      setCoverLetter('');
      setResumeFile(null);
    }
    return () => {
      dispatch(clearApplySuccess());
      dispatch(clearAppError());
    };
  }, [applySuccess, dispatch]);

  const handleApply = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('coverLetter', coverLetter);
    if (resumeFile) {
      formData.append('resume', resumeFile);
    }
    dispatch(applyForJob({ jobId: id, applicationData: formData }));
  };

  if (isLoading || !currentJob) {
    return <div className="page"><div className="loader"><div className="spinner"></div></div></div>;
  }

  const job = currentJob;

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="job-detail slide-up">
          {/* Back */}
          <button onClick={() => navigate('/jobs')} className="btn btn-secondary btn-sm" style={{ marginBottom: '24px' }}>
            ← Back to Jobs
          </button>

          {/* Header */}
          <div className="job-detail-header">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h1 className="job-detail-title">{job.title}</h1>
                <p className="job-detail-company">{job.company}</p>
              </div>
              {user?.role === 'candidate' && (
                <button
                  onClick={() => setShowApplyModal(true)}
                  className="btn btn-primary btn-lg"
                >
                  Apply Now →
                </button>
              )}
            </div>

            <div className="job-card-meta" style={{ marginTop: '16px' }}>
              <span className="badge badge-accent">{job.type}</span>
              <span className="job-card-meta-item">
                <HiOutlineLocationMarker /> {job.location}
              </span>
              <span className="job-card-meta-item">
                ₹ {job.salary}
              </span>
              <span className="job-card-meta-item">
                <HiOutlineClock /> Posted {new Date(job.createdAt).toLocaleDateString()}
              </span>
              {job.employer && (
                <span className="job-card-meta-item">
                  <HiOutlineOfficeBuilding /> by {job.employer.name}
                </span>
              )}
            </div>
          </div>

          {applySuccess && (
            <div className="alert alert-success">✅ Application submitted successfully!</div>
          )}
          {applyError && (
            <div className="alert alert-error">⚠ {applyError}</div>
          )}

          {/* Description */}
          <div className="job-detail-section">
            <h2><HiOutlineBriefcase /> Job Description</h2>
            <p style={{ whiteSpace: 'pre-line' }}>{job.description}</p>
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="job-detail-section">
              <h2><HiOutlineClipboardList /> Requirements</h2>
              <ul>
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="job-detail-section">
              <h2>🛠 Skills</h2>
              <div className="job-card-skills" style={{ marginTop: '8px' }}>
                {job.skills.map((skill, i) => (
                  <span key={i} className="badge badge-accent">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Not logged in */}
          {!user && (
            <div className="card" style={{ textAlign: 'center', padding: '32px', marginTop: '16px' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
                Sign in as a candidate to apply for this job
              </p>
              <button onClick={() => navigate('/login')} className="btn btn-primary">
                Sign In to Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for {job.title}</h2>
              <button className="modal-close" onClick={() => setShowApplyModal(false)}>
                <HiOutlineX />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.9rem' }}>
              at {job.company} · {job.location}
            </p>

            {applyError && <div className="alert alert-error">⚠ {applyError}</div>}

            <form onSubmit={handleApply}>
              <div className="form-group">
                <label className="form-label">Cover Letter(Optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Tell the employer why you're a great fit..."
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Resume (PDF)</label>
                <input
                  type="file"
                  className="form-input"
                  accept="application/pdf"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                />
                <div className="form-hint">PDF only. Max size set by the server.</div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={applyLoading}>
                  {applyLoading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowApplyModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default JobDetail;
