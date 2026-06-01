import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchApplications, confirmInterviewSlot } from '../features/applications/applicationSlice';

function Applications() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { applications, isLoading } = useSelector((state) => state.applications);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);

  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  const normalizeStatus = (status) => {
    const map = {
      pending: 'applied',
      reviewed: 'shortlisted',
      accepted: 'offer',
    };
    return map[status] || status;
  };

  const statusBadge = (status) => {
    const map = {
      applied: 'badge-info',
      shortlisted: 'badge-warning',
      interview: 'badge-accent',
      offer: 'badge-success',
      rejected: 'badge-danger',
      pending: 'badge-neutral',
      reviewed: 'badge-info',
      accepted: 'badge-success',
    };
    return map[status] || 'badge-neutral';
  };

  const pipelineStages = ['applied', 'shortlisted', 'interview', 'offer'];
  const pipelineLabel = {
    applied: 'Applied',
    shortlisted: 'Shortlisted',
    interview: 'Interview',
    offer: 'Offer',
  };

  const openConfirmModal = (application) => {
    setSelectedApplication(application);
    setSelectedSlotIndex(0);
    setShowConfirmModal(true);
  };

  const handleConfirmSlot = async () => {
    if (!selectedApplication) return;
    await dispatch(confirmInterviewSlot({
      id: selectedApplication._id,
      slotIndex: selectedSlotIndex,
    }));
    setShowConfirmModal(false);
    setSelectedApplication(null);
  };

  return (
    <>
      <div className="page fade-in">
        <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>My Applications</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              {user?.role === 'candidate'
                ? 'Track the status of your job applications'
                : 'View applications for your job postings'}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--warning)' }}>
              {applications.filter((a) => normalizeStatus(a.status) === 'applied').length}
            </div>
            <div className="stat-label">Applied</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--info)' }}>
              {applications.filter((a) => normalizeStatus(a.status) === 'shortlisted').length}
            </div>
            <div className="stat-label">Shortlisted</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: 'var(--success)' }}>
              {applications.filter((a) => normalizeStatus(a.status) === 'offer').length}
            </div>
            <div className="stat-label">Offers</div>
          </div>
        </div>

        {/* Applications List */}
        {isLoading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📄</div>
            <h3>No applications yet</h3>
            <p>
              {user?.role === 'candidate'
                ? 'Start applying to jobs and track your progress here'
                : 'Applications from candidates will appear here'}
            </p>
            {user?.role === 'candidate' && (
              <button
                onClick={() => navigate('/jobs')}
                className="btn btn-primary"
                style={{ marginTop: '16px' }}
              >
                Browse Jobs →
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  {user?.role === 'employer' && <th>Candidate</th>}
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Cover Letter</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td
                      style={{ fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}
                      onClick={() => app.job?._id && navigate(`/jobs/${app.job._id}`)}
                    >
                      {app.job?.title || 'Job Removed'}
                    </td>
                    <td>{app.job?.company || '—'}</td>
                    <td>{app.job?.location || '—'}</td>
                    {user?.role === 'employer' && (
                      <td>{app.candidate?.name || 'N/A'}</td>
                    )}
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${statusBadge(app.status)}`}>
                        {normalizeStatus(app.status)}
                      </span>
                      <div className="status-pipeline">
                        {pipelineStages.map((stage) => {
                          const normalized = normalizeStatus(app.status);
                          const isActive = pipelineStages.indexOf(stage) <= pipelineStages.indexOf(normalized);
                          const isCurrent = stage === normalized;
                          return (
                            <div
                              key={stage}
                              className={`pipeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}
                            >
                              <span className="pipeline-dot"></span>
                              <span className="pipeline-label">{pipelineLabel[stage]}</span>
                            </div>
                          );
                        })}
                      </div>
                      {user?.role === 'candidate' && app.interview?.status === 'proposed' && app.interview?.proposedSlots?.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          style={{ marginTop: '8px' }}
                          onClick={() => openConfirmModal(app)}
                        >
                          Confirm interview
                        </button>
                      )}
                      {user?.role === 'candidate' && app.interview?.status === 'confirmed' && (
                        <div className="status-hint">Interview confirmed</div>
                      )}
                    </td>
                    <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {app.coverLetter || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {showConfirmModal && selectedApplication && (
        <div className="modal-overlay" onClick={() => setShowConfirmModal(false)}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Interview Slot</h2>
              <button className="modal-close" onClick={() => setShowConfirmModal(false)}>
                X
              </button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              Choose a slot proposed by the recruiter for {selectedApplication.job?.title || 'this role'}.
            </p>
            <div className="slot-list">
              {selectedApplication.interview?.proposedSlots?.map((slot, index) => (
                <label key={index} className="slot-option">
                  <input
                    type="radio"
                    name="slot"
                    checked={selectedSlotIndex === index}
                    onChange={() => setSelectedSlotIndex(index)}
                  />
                  <span>
                    {new Date(slot.start).toLocaleString()} - {new Date(slot.end).toLocaleTimeString()}
                  </span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button className="btn btn-primary" onClick={handleConfirmSlot}>
                Confirm Slot
              </button>
              <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Applications;
