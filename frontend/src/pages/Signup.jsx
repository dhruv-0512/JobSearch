import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { signup, clearError } from '../features/auth/authSlice';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed } from 'react-icons/hi';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'candidate',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(signup(formData));
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join JobSearch and start your journey</p>
        </div>

        {error && <div className="alert alert-error">⚠ {error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Role Selector */}
          <div className="form-group">
            <label className="form-label">I want to...</label>
            <div className="role-selector">
              <div
                className={`role-option ${formData.role === 'candidate' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'candidate' })}
              >
                <div className="role-option-icon">🎯</div>
                <div className="role-option-title">Find a Job</div>
                <div className="role-option-desc">Browse & apply for jobs</div>
              </div>
              <div
                className={`role-option ${formData.role === 'employer' ? 'selected' : ''}`}
                onClick={() => setFormData({ ...formData, role: 'employer' })}
              >
                <div className="role-option-icon">🏢</div>
                <div className="role-option-title">Hire Talent</div>
                <div className="role-option-desc">Post jobs & find candidates</div>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              <HiOutlineUser style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Full Name
            </label>
            <input
              type="text"
              className="form-input"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <HiOutlineMail style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <HiOutlineLockClosed style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;
