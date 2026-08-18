import { useTranslation } from "react-i18next";
import PreLoader from "../components/PreLoader/PreLoader";
import { useAuth } from "../context/useAuth";
import "./website.scss";
import { Link, Navigate } from "react-router-dom";

function Website() {
  const { loading, isAuthenticated } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="show-container ">
        <PreLoader />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/my-quiz" replace />;
  }

  return (
    <main>
      <section className="hero">
        <div className="hero__container">
          {/* Left Content */}
          <div className="hero__content">
            <div className="hero__badge">✦ Progress Focused Learning</div>

            <h1 className="hero__title">
              {t("WEBSITE.HERO.TITLE")} <span>Quiz Word</span>
            </h1>

            <p className="hero__description">{t("WEBSITE.HERO.SUBTITLE")}</p>

            <div className="hero__buttons">
              <Link
                to="/create-account"
                className="hero__button hero__button--primary"
              >
                {t("WEBSITE.HERO.REGISTER")}
                <span>→</span>
              </Link>

              <Link
                to="/login"
                className="hero__button hero__button--secondary"
              >
                {t("WEBSITE.HERO.LOGIN")}
              </Link>
            </div>
          </div>

          {/* Right Image */}
          <div className="hero__image-wrapper">
            <div className="hero__image-card">
              {/* Floating Card */}
              <div className="hero__floating-card">
                <div className="hero__floating-top">
                  <div className="hero__avatars">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>

                  <p>15k+ Learners online</p>
                </div>

                <div className="hero__progress">
                  <div className="hero__progress-bar"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO USE IT */}
      <section className="steps" id="how-it-works">
        <div className="steps__container">
          {/* Heading */}
          <div className="steps__heading">
            <h2 className="steps__title">{t("WEBSITE.HOW_IT_WORKS.TITLE")}</h2>

            <p className="steps__subtitle">
              {t("WEBSITE.HOW_IT_WORKS.DESCRIPTION")}
            </p>
          </div>

          {/* Cards */}
          <div className="steps__card">
            {/* Card 1 */}
            <div className="steps__single-card">
              <div className="steps__icon steps__icon--purple">
                <img width="24" height="24" src="./assets/world.svg" alt="" />
              </div>

              <h3 className="steps__card-title">
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.CHOOSE_ANYWHERE.TITLE")}
              </h3>

              <p className="steps__card-text">
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.CHOOSE_ANYWHERE.DESCRIPTION")}
              </p>
            </div>

            {/* Card 2 */}
            <div className="steps__single-card">
              <div className="steps__icon steps__icon--green">
                <img src="./assets/progress.svg" alt="" />
              </div>

              <h3 className="steps__card-title">
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.SMART_QUIZZES.TITLE")}
              </h3>

              <p className="steps__card-text">
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.SMART_QUIZZES.DESCRIPTION")}
              </p>
            </div>

            {/* Card 3 */}
            <div className="steps__single-card">
              <div className="steps__icon steps__icon--orange">
                <img src="./assets/progress.svg" alt="" />
              </div>

              <h3 className="steps__card-title">
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.TRACK_PROGRESS.TITLE")}
              </h3>

              <p className="steps__card-text">
                {t("WEBSITE.HOW_IT_WORKS.FEATURES.TRACK_PROGRESS.DESCRIPTION")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW DOES IT WORK */}

      <section className="workflow">
        <div className="workflow__container">
          {/* Left Side */}
          <div className="workflow__video">
            <img
              src="/images/tutorial.png"
              alt="Tutorial"
              className="workflow__image"
            />

            {/* Play Button */}
            <button className="workflow__play">▶</button>

            {/* Bottom Info */}
            <div className="workflow__video-footer">
              <span>Watch Tutorial</span>
              <span>2:45</span>
            </div>
          </div>

          {/* Right Side */}
          <div className="workflow__content">
            <h2 className="workflow__title">
              {t("WEBSITE.HOW_TO_USE_IT.TITLE")}
            </h2>

            {/* Step 1 */}
            <div className="workflow__step">
              <div className="workflow__number">1</div>

              <div className="workflow__text">
                <h3>{t("WEBSITE.HOW_TO_USE_IT.PICK_YOUR_WORDS.TITLE")}</h3>

                <p>{t("WEBSITE.HOW_TO_USE_IT.PICK_YOUR_WORDS.DESCRIPTION")}</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="workflow__step">
              <div className="workflow__number">2</div>

              <div className="workflow__text">
                <h3>{t("WEBSITE.HOW_TO_USE_IT.CREATE_YOUR_QUIZ.TITLE")}</h3>

                <p>{t("WEBSITE.HOW_TO_USE_IT.CREATE_YOUR_QUIZ.DESCRIPTION")}</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="workflow__step">
              <div className="workflow__number">3</div>

              <div className="workflow__text">
                <h3>{t("WEBSITE.HOW_TO_USE_IT.UNLOCK_YOUR_QUIZ.TITLE")}</h3>

                <p>{t("WEBSITE.HOW_TO_USE_IT.UNLOCK_YOUR_QUIZ.DESCRIPTION")}</p>

              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="journey">
        <div className="journey__container">
          {/* Background Icon */}
          <div className="journey__shape">🎓</div>

          {/* Content */}
          <h2 className="journey__title">{t("WEBSITE.CTA.TITLE")}</h2>

          <p className="journey__text">
            {t("WEBSITE.CTA.DESCRIPTION")}
          </p>

          <Link to="/create-account" className="journey__button">
            {t("WEBSITE.CTA.BUTTON")}
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Website;
