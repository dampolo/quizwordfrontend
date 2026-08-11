import { useAuth } from "../context/useAuth";
import "./website.scss";
import { Link, Navigate } from "react-router-dom";

function Website() {
  const { loading, isAuthenticated } = useAuth();

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
              Welcome on <span>Quiz Word</span>
            </h1>

            <p className="hero__description">
              on this webpage you can learn languages as you want and where you
              want. Master any language with cognitive clarity and
              scientifically backed methods.
            </p>

            <div className="hero__buttons">
              <Link
                to="/create-account"
                className="hero__button hero__button--primary"
              >
                Register
                <span>→</span>
              </Link>

              <Link
                to="/login"
                className="hero__button hero__button--secondary"
              >
                Login
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
            <h2 className="steps__title">How to use it</h2>

            <p className="steps__subtitle">
              Discover the intuitive steps to mastering a new language at your
              own pace with our progress-first philosophy.
            </p>
          </div>

          {/* Cards */}
          <div className="steps__card">
            {/* Card 1 */}
            <div className="steps__single-card">
              <div className="steps__icon steps__icon--purple">
                <img width="24" height="24" src="./assets/world.svg" alt="" />
              </div>

              <h3 className="steps__card-title">Choose Anywhere</h3>

              <p className="steps__card-text">
                Select from over 40 languages. Whether at home or on the go,
                your progress stays synchronized across all devices.
              </p>
            </div>

            {/* Card 2 */}
            <div className="steps__single-card">
              <div className="steps__icon steps__icon--green">
                <img src="./assets/progress.svg" alt="" />
              </div>

              <h3 className="steps__card-title">Smart Quizzes</h3>

              <p className="steps__card-text">
                Our AI adapts to your learning speed, generating personalized
                word quizzes that challenge you just enough.
              </p>
            </div>

            {/* Card 3 */}
            <div className="steps__single-card">
              <div className="steps__icon steps__icon--orange">
                <img src="./assets/progress.svg" alt="" />
              </div>

              <h3 className="steps__card-title">Track Progress</h3>

              <p className="steps__card-text">
                Visual data dashboards show your vocabulary growth and fluency
                levels in real-time. No more guessing.
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
            <h2 className="workflow__title">How does it work</h2>

            {/* Step 1 */}
            <div className="workflow__step">
              <div className="workflow__number">1</div>

              <div className="workflow__text">
                <h3>Pick Your Words</h3>

                <p>
                  Choose words from your personal list. Our placement quiz makes
                  sure you start exactly at the right level for you.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="workflow__step">
              <div className="workflow__number">2</div>

              <div className="workflow__text">
                <h3>Create Your Quiz</h3>

                <p>
                  Click the button to generate your quiz instantly. You can
                  start right away or create another quiz anytime.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="workflow__step">
              <div className="workflow__number">3</div>

              <div className="workflow__text">
                <h3>Unlock Your Quiz</h3>

                <p>
                  Go through your quiz as often as you like and practice at your
                  own pace.
                </p>
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
          <h2 className="journey__title">Start Your Journey Today</h2>

          <p className="journey__text">
            Join thousands of learners who are already breaking language
            barriers with QuizWord.
          </p>

          <Link to="/create-account" className="journey__button">
            Create Free Account
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Website;
