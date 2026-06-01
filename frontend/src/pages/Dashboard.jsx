import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchJobs, createJob, updateJob, deleteJob, clearJobError } from '../features/jobs/jobSlice';
import { fetchApplications, updateApplicationStatus, proposeInterviewSlots } from '../features/applications/applicationSlice';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineEye } from 'react-icons/hi';

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { jobs, isLoading: jobsLoading } = useSelector((state) => state.jobs);
  const { applications } = useSelector((state) => state.applications);

  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleApplication, setScheduleApplication] = useState(null);
  const [scheduleNote, setScheduleNote] = useState('');
  const [slotInputs, setSlotInputs] = useState([{ start: '', end: '' }]);
  const [formData, setFormData] = useState({
    title: '', company: '', location: '', type: 'Full-time',
    salary: '', description: '', requirements: '', skills: '',
  });

  useEffect(() => {
    if (user?.role === 'employer') {
      dispatch(fetchJobs({}));
      dispatch(fetchApplications());
    }
  }, [dispatch, user]);

  const myJobs = jobs.filter((j) => j.employer?._id === user?._id || j.employer === user?._id);

  const resetForm = () => {
    setFormData({ title: '', company: '', location: '', type: 'Full-time', salary: '', description: '', requirements: '', skills: '' });
    setEditingJob(null);
    setShowJobForm(false);
    dispatch(clearJobError());
  };

  const openEditForm = (job) => {
    setFormData({
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      salary: job.salary || '',
      description: job.description,
      requirements: (job.requirements || []).join(', '),
      skills: (job.skills || []).join(', '),
    });
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingJob) {
      await dispatch(updateJob({ id: editingJob._id, jobData: formData }));
    } else {
      await dispatch(createJob(formData));
    }
    resetForm();
    dispatch(fetchJobs({}));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      await dispatch(deleteJob(id));
      dispatch(fetchJobs({}));
    }
  };

  const handleStatusChange = (appId, status) => {
    dispatch(updateApplicationStatus({ id: appId, status }));
  };

  const normalizeStatus = (status) => {
    const map = {
      pending: 'applied',
      reviewed: 'shortlisted',
      accepted: 'offer',
    };
    return map[status] || status;
  };

  const resolveResumeUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `http://localhost:5000${url}`;
  };

  const openScheduleModal = (application) => {
    setScheduleApplication(application);
    setSlotInputs([{ start: '', end: '' }]);
    setScheduleNote('');
    setShowScheduleModal(true);
  };

  const updateSlotInput = (index, field, value) => {
    setSlotInputs((prev) => prev.map((slot, i) => (
      i === index ? { ...slot, [field]: value } : slot
    )));
  };

  const addSlotInput = () => {
    setSlotInputs((prev) => [...prev, { start: '', end: '' }]);
  };

  const handleProposeSlots = async () => {
    if (!scheduleApplication) return;
    const slots = slotInputs.filter((slot) => slot.start && slot.end);
    if (slots.length === 0) return;
    await dispatch(proposeInterviewSlots({
      id: scheduleApplication._id,
      slots,
      note: scheduleNote,
    }));
    setShowScheduleModal(false);
    setScheduleApplication(null);
  };

  // Candidate dashboard
  if (user?.role === 'candidate') {
    navigate('/applications');
    return null;
  }

  return (
    <div className="page fade-in">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>Employer Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
              Manage your job postings and applications
            </p>
          </div>
          <button onClick={() => { resetForm(); setShowJobForm(true); }} className="btn btn-primary">
            <HiOutlinePlus /> Post New Job
          </button>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{myJobs.length}</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{applications.length}</div>
            <div className="stat-label">Total Applications</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{applications.filter(a => normalizeStatus(a.status) === 'applied').length}</div>
            <div className="stat-label">Applied</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{applications.filter(a => normalizeStatus(a.status) === 'interview').length}</div>
            <div className="stat-label">Interview Stage</div>
          </div>
        </div>

        {/* My Jobs */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Your Job Postings</h2>
        {jobsLoading ? (
          <div className="loader"><div className="spinner"></div></div>
        ) : myJobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No jobs posted yet</h3>
            <p>Click "Post New Job" to create your first listing</p>
          </div>
        ) : (
          <div className="table-wrapper" style={{ marginBottom: '40px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Posted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myJobs.map((job) => (
                  <tr key={job._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{job.title}</td>
                    <td>{job.company}</td>
                    <td><span className="badge badge-accent">{job.type}</span></td>
                    <td>{job.location}</td>
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => navigate(`/jobs/${job._id}`)} className="btn btn-icon btn-secondary" title="View">
                          <HiOutlineEye />
                        </button>
                        <button onClick={() => openEditForm(job)} className="btn btn-icon btn-secondary" title="Edit">
                          <HiOutlinePencil />
                        </button>
                        <button onClick={() => handleDelete(job._id)} className="btn btn-icon btn-danger" title="Delete">
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Applications Received */}
        <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '16px' }}>Applications Received</h2>
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📬</div>
            <h3>No applications yet</h3>
            <p>Applications will appear here when candidates apply</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Email</th>
                  <th>Job</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Match</th>
                  <th>ATS</th>
                  <th>Resume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{app.candidate?.name || 'N/A'}</td>
                    <td>{app.candidate?.email || 'N/A'}</td>
                    <td>{app.job?.title || 'N/A'}</td>
                    <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        normalizeStatus(app.status) === 'offer' ? 'badge-success' :
                        normalizeStatus(app.status) === 'rejected' ? 'badge-danger' :
                        normalizeStatus(app.status) === 'shortlisted' ? 'badge-warning' :
                        normalizeStatus(app.status) === 'interview' ? 'badge-accent' :
                        normalizeStatus(app.status) === 'applied' ? 'badge-info' :
                        'badge-neutral'
                      }`}>
                        {normalizeStatus(app.status)}
                      </span>
                    </td>
                    <td>
                      {app.matchScore !== null && app.matchScore !== undefined ? `${app.matchScore}%` : '—'}
                      {app.matchedSkills?.length > 0 && (
                        <div className="status-hint">
                          {app.matchedSkills.slice(0, 3).join(', ')}
                        </div>
                      )}
                    </td>
                    <td>
                      {app.atsScore !== null && app.atsScore !== undefined ? app.atsScore : '—'}
                    </td>
                    <td>
                      {(() => {
                        const resumeUrl = typeof app.resume === 'string' ? app.resume : app.resume?.url;
                        if (!resumeUrl) return '—';
                        return (
                          <a className="link" href={resolveResumeUrl(resumeUrl)} target="_blank" rel="noreferrer">
                            View
                          </a>
                        );
                      })()}
                    </td>
                    <td>
                      <div className="action-stack">
                        <select
                          className="status-select"
                          value={normalizeStatus(app.status)}
                          onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        >
                          <option value="applied">Applied</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interview">Interview</option>
                          <option value="offer">Offer</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        {(normalizeStatus(app.status) === 'shortlisted' || normalizeStatus(app.status) === 'interview') && (
                          <button
                            type="button"
                            className="btn btn-secondary btn-sm"
                            onClick={() => openScheduleModal(app)}
                          >
                            Propose slots
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showScheduleModal && scheduleApplication && (
        <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h2>Propose Interview Slots</h2>
              <button className="modal-close" onClick={() => setShowScheduleModal(false)}><HiOutlineX /></button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              {scheduleApplication.candidate?.name || 'Candidate'} · {scheduleApplication.job?.title || 'Role'}
            </p>

            {slotInputs.map((slot, index) => (
              <div key={index} className="slot-row">
                <input
                  type="datetime-local"
                  className="form-input"
                  value={slot.start}
                  onChange={(e) => updateSlotInput(index, 'start', e.target.value)}
                />
                <input
                  type="datetime-local"
                  className="form-input"
                  value={slot.end}
                  onChange={(e) => updateSlotInput(index, 'end', e.target.value)}
                />
              </div>
            ))}

            <button type="button" className="btn btn-outline btn-sm" onClick={addSlotInput} style={{ marginBottom: '16px' }}>
              + Add another slot
            </button>

            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea
                className="form-textarea"
                rows={3}
                value={scheduleNote}
                onChange={(e) => setScheduleNote(e.target.value)}
                placeholder="Add any instructions or context for the candidate"
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleProposeSlots}>
                Send slots
              </button>
              <button className="btn btn-secondary" onClick={() => setShowScheduleModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Form Modal */}
      {showJobForm && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal slide-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>{editingJob ? 'Edit Job' : 'Create New Job'}</h2>
              <button className="modal-close" onClick={resetForm}><HiOutlineX /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Senior React Developer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Company *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Arnifi Technologies"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Location *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dubai, UAE"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Job Type</label>
                  <select
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option>Full-time</option>
                    <option>Part-time</option>
                    <option>Contract</option>
                    <option>Internship</option>
                    <option>Remote</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Salary</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. $80,000 - $120,000/year"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea
                  className="form-textarea"
                  placeholder="Describe the role, responsibilities, and what you're looking for..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Requirements (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. 3+ years React, TypeScript, REST APIs"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Skills (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. React, Node.js, MongoDB, AWS"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  {editingJob ? 'Update Job' : 'Post Job'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
