import { useTranslation } from "react-i18next";
import "./footer.scss";

import { Link } from "react-router-dom";

function Footer() {
  const currentDate = new Date().getFullYear();
  const { t } = useTranslation();

  async function handleShare() {
    const shareData = {
      title: "Quiz Word",
      text: "Schau dir Quiz Word an!",
      url: "https://quiz-word.com",
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link wurde kopiert!");
      }
    } catch (error) {
      console.error("Sharing failed:", error);
    }
  }

  return (
    <footer className="footer">
      <div className="footer__container">
        {/* Left Side */}
        <div className="footer__brand">
          <h2 className="footer__logo">QuizWord</h2>

          <p className="footer__copyright">
            © {currentDate} Quiz Word. {t("FOOTER.DESCRIPTION")}
          </p>
        </div>

        {/* Center Links */}
        <nav className="footer__links">
          <Link to="/imprint" className="footer__link" target="blank">
            {t("FOOTER.IMPRINT")}
          </Link>

          <Link to="/privacy-policy" className="footer__link" target="blank">
            {t("FOOTER.PRIVACY_POLICY")}
          </Link>

          <Link to="/help-desk" className="footer__link">
            {t("FOOTER.FAQ")}
          </Link>

          <Link href="#" className="footer__link">
            {t("FOOTER.CONTACT")}
          </Link>
        </nav>

        {/* Right Icons */}
        <div className="footer__socials">
          <button
            type="button"
            onClick={handleShare}
            className="footer__social"
          >
            <img width={24} height={24} src="/assets/share.svg" alt="Share" />
          </button>

          <a href="mailto:support@quiz-word.com" className="footer__social">
            <img width={24} height={24} src="/assets/mail.svg" alt="E-Mail" />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
