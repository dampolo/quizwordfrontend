import "./footer.scss";

import { Link } from "react-router-dom";

function Footer() {
    const currentDate = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Left Side */}
        <div className="footer__brand">
          <h2 className="footer__logo">QuizWord</h2>

          <p className="footer__copyright">
            © { currentDate } QuizWord. Empowering progress through language.
          </p>
        </div>

        {/* Center Links */}
        <div className="footer__links">
          <Link to="/imprint" className="footer__link" target="blank">
            Impressum
          </Link>

          <Link href="/privacy-policy" className="footer__link" target="blank">
            Datenschutzerklärung
          </Link>

          <Link to="/help-desk" className="footer__link">
            FAQ
          </Link>

          <Link href="#" className="footer__link">
            Contact Us
          </Link>
        </div>

        {/* Right Icons */}
        <div className="footer__socials">
          <a href="#" className="footer__social">
            <img width="24" height="24" src="/assets/share.svg" alt="Share"/>
          </a>

          <a href="#" className="footer__social">
            <img width="24" height="24" src="/assets/mail.svg" alt="E-Mail" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
