function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-links">
          <a href="#">About</a>
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
        <p>© {new Date().getFullYear()} JobSearch India. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
