import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineOfficeBuilding } from 'react-icons/hi';

function JobCard({ job, matchScore, matchedSkills }) {
  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return `${Math.floor(days / 30)}mo ago`;
  };

  return (
    <Link to={`/jobs/${job._id}`} className="card job-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">{job.title}</h3>
          <p className="card-subtitle">{job.company}</p>
        </div>
        <span className="badge badge-accent">{job.type}</span>
      </div>

      <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {job.description}
      </p>

      <div className="job-card-meta">
        <span className="job-card-meta-item">
          <HiOutlineLocationMarker /> {job.location}
        </span>
        <span className="job-card-meta-item">
          <HiOutlineOfficeBuilding /> {job.company}
        </span>
        <span className="job-card-meta-item">
          <HiOutlineClock /> {timeAgo(job.createdAt)}
        </span>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="job-card-skills">
          {job.skills.slice(0, 4).map((skill, i) => (
            <span key={i} className="badge badge-neutral">{skill}</span>
          ))}
          {job.skills.length > 4 && (
            <span className="badge badge-neutral">+{job.skills.length - 4}</span>
          )}
        </div>
      )}

      {typeof matchScore === 'number' && (
        <div className="match-row">
          <span className="badge badge-success">Match {matchScore}%</span>
          {matchedSkills?.length > 0 && (
            <span className="match-skills">
              {matchedSkills.slice(0, 4).join(', ')}
            </span>
          )}
        </div>
      )}

      <div className="job-card-footer">
        <span className="job-card-salary">
          ₹ {job.salary}
        </span>
        <span className="btn btn-outline btn-sm">View Details →</span>
      </div>
    </Link>
  );
}

export default JobCard;
