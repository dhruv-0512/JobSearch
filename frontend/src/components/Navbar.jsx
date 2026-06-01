import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';
import { PiBriefcase, PiFileText, PiSignIn, PiSignOut, PiSquaresFour, PiUserPlus } from 'react-icons/pi';

function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const isActive = (path) => location.pathname === path ? 'nav-link active' : 'nav-link';

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon"><PiBriefcase /></span>
          JobSearch
        </Link>

        <div className="navbar-links">
          {(!user || user.role !== 'employer') && (
            <Link to="/jobs" className={isActive('/jobs')}>
              <PiBriefcase /> Jobs
            </Link>
          )}

          {user && (
            <>
              <Link to="/dashboard" className={isActive('/dashboard')}>
                <PiSquaresFour /> Dashboard
              </Link>
              {user.role !== 'employer' && (
                <Link to="/applications" className={isActive('/applications')}>
                  <PiFileText /> Applications
                </Link>
              )}
            </>
          )}

          {user ? (
            <div className="nav-user">
              <div className="nav-user-info">
                <span className="nav-user-name">{user.name}</span>
                <span className="nav-user-role">{user.role}</span>
              </div>
              <div className="nav-avatar">{user.name.charAt(0).toUpperCase()}</div>
              <button onClick={handleLogout} className="nav-link" title="Logout">
                <PiSignOut />
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className={isActive('/login')}>
                <PiSignIn /> Login
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                <PiUserPlus /> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
