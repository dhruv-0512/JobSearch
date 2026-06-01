import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PiArrowRight,
  PiChartLineUp,
  PiGlobeHemisphereWest,
  PiHandshake,
  PiLightning,
  PiShieldCheck,
  PiSparkle,
  PiUsersThree,
} from 'react-icons/pi';

function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-tag">
            <PiSparkle /> India's Fastest Growing Job Portal
          </span>
          <h1 className="hero-title">
            Find Your Dream <span className="highlight">Career</span><br />
            Build Your Future
          </h1>
          <p className="hero-subtitle">
            Connect with top companies and discover opportunities that match your skills.
            Whether you're hiring or job hunting, JobSearch makes it seamless.
          </p>
          <div className="hero-actions">
            <Link to="/jobs" className="btn btn-primary btn-lg">
              Browse Jobs <PiArrowRight />
            </Link>
            {!user && (
              <Link to="/signup" className="btn btn-secondary btn-lg">
                Create Account
              </Link>
            )}
            {user?.role === 'employer' && (
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                Post a Job
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container" style={{ paddingBottom: '40px' }}>
        <div className="proof-strip slide-up">
          <span><PiShieldCheck /> Verified employers</span>
          <span><PiGlobeHemisphereWest /> Remote and on-site roles</span>
          <span><PiHandshake /> Candidate-first applications</span>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px', letterSpacing: 0 }}>
            Why Choose <span style={{ color: 'var(--accent)' }}>JobSearch</span>?
          </h2>
          <div className="features-grid">
            <div className="feature-card slide-up">
              <div className="feature-icon">
                <PiLightning />
              </div>
              <h3>Lightning Fast</h3>
              <p>Apply to jobs in seconds with smart one-click applications and instant notifications.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">
                <PiShieldCheck />
              </div>
              <h3>Verified Companies</h3>
              <p>All employers are verified to ensure you connect with legitimate opportunities.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">
                <PiGlobeHemisphereWest />
              </div>
              <h3>Remote & Global</h3>
              <p>Access remote opportunities from companies worldwide. Work from anywhere.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">
                <PiUsersThree />
              </div>
              <h3>Smart Matching</h3>
              <p>Our AI matches your skills with the perfect job opportunities automatically.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">
                <PiChartLineUp />
              </div>
              <h3>Track Progress</h3>
              <p>Real-time application tracking so you always know where you stand.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon">
                <PiSparkle />
              </div>
              <h3>Premium Support</h3>
              <p>Dedicated support team to help you at every step of your career journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="cta-panel" style={{ padding: '56px 40px', maxWidth: '760px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            Join thousands of professionals who've found their perfect career through JobSearch.
          </p>
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free <PiArrowRight /></Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </>
            ) : (
              <Link to="/jobs" className="btn btn-primary btn-lg">Explore Jobs <PiArrowRight /></Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
