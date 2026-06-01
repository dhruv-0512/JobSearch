import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login, clearError } from '../features/auth/authSlice';
import { PiEnvelopeSimple, PiLockKey, PiWarningCircle } from 'react-icons/pi';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate('/dashboard');
    return () => dispatch(clearError());
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(formData));
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card slide-up">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your JobSearch account</p>
        </div>

        {error && <div className="alert alert-error"><PiWarningCircle /> {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              <PiEnvelopeSimple style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
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
              <PiLockKey style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
              Password
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }} disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          Don't have an account? <Link to="/signup">Create one</Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
