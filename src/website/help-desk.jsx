import BackButton from "../components/BackButton/BackButton";
import "./help-desk.scss";

function HelpDesk() {
  return (
    <main className="help-desk-main">
      <section className="help-desk">
        <BackButton to="/" className="back-button" />
        <h1>Die häufigsten Fragen</h1>

        <div className="help-desk-list-content">
          <details>
            <summary class="help-desk-button collapsible">
              Was ist Quiz Word?
            </summary>
            <div className="help-desk-list-content">
              Quiz Word ist deine persönliche Vokabeldatenbank, in der du alle
              Wörter speichern kannst, die du lernen möchtest. Aus diesen
              Wörtern kannst du beliebig viele Quizze erstellen.
            </div>
          </details>

          <details>
            <summary className="help-desk-button collapsible">
              Was kostet Quiz Word?
            </summary>
            <div className="help-desk-list-content">
              Quiz Word is komplett kostenlos.
            </div>
          </details>

          <details>
            <summary className="help-desk-button collapsible">
              Für wen ist Quiz Word?
            </summary>
            <div className="help-desk-list-content">
              Quiz Word wurde erstellt für alle Menschen die gerne Sprachen
              lernen.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

export default HelpDesk;
