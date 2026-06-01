import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineSparkles, HiOutlineShieldCheck, HiOutlineLightningBolt, HiOutlineGlobe, HiOutlineUsers, HiOutlineChartBar } from 'react-icons/hi';

function Home() {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="hero-tag">
            <HiOutlineSparkles /> India's Fastest Growing Job Portal
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
              Browse Jobs →
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
        <div className="stats-grid">
          <div className="stat-card slide-up">
            <div className="stat-number">10K+</div>
            <div className="stat-label">Active Jobs</div>
          </div>
          <div className="stat-card slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="stat-number">50K+</div>
            <div className="stat-label">Candidates</div>
          </div>
          <div className="stat-card slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="stat-number">5K+</div>
            <div className="stat-label">Companies</div>
          </div>
          <div className="stat-card slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="stat-number">95%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 style={{ fontSize: '2rem', fontWeight: 800, textAlign: 'center', marginBottom: '40px', letterSpacing: '-0.03em' }}>
            Why Choose <span style={{ color: 'var(--accent)' }}>JobSearch</span>?
          </h2>
          <div className="features-grid">
            <div className="feature-card slide-up">
              <div className="feature-icon">
                <HiOutlineLightningBolt />
              </div>
              <h3>Lightning Fast</h3>
              <p>Apply to jobs in seconds with smart one-click applications and instant notifications.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="feature-icon">
                <HiOutlineShieldCheck />
              </div>
              <h3>Verified Companies</h3>
              <p>All employers are verified to ensure you connect with legitimate opportunities.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="feature-icon">
                <HiOutlineGlobe />
              </div>
              <h3>Remote & Global</h3>
              <p>Access remote opportunities from companies worldwide. Work from anywhere.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.3s' }}>
              <div className="feature-icon">
                <HiOutlineUsers />
              </div>
              <h3>Smart Matching</h3>
              <p>Our AI matches your skills with the perfect job opportunities automatically.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="feature-icon">
                <HiOutlineChartBar />
              </div>
              <h3>Track Progress</h3>
              <p>Real-time application tracking so you always know where you stand.</p>
            </div>
            <div className="feature-card slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="feature-icon">
                <HiOutlineSparkles />
              </div>
              <h3>Premium Support</h3>
              <p>Dedicated support team to help you at every step of your career journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container" style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div className="card" style={{ padding: '60px 40px', maxWidth: '700px', margin: '0 auto', borderColor: 'var(--border-accent)' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px' }}>
            Ready to Get Started?
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            Join thousands of professionals who've found their perfect career through JobSearch.
          </p>
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg">Get Started Free →</Link>
                <Link to="/login" className="btn btn-secondary btn-lg">Sign In</Link>
              </>
            ) : (
              <Link to="/jobs" className="btn btn-primary btn-lg">Explore Jobs →</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
