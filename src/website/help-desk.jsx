import BackButton from "../components/BackButton/BackButton";
import "./help-desk.scss";

function HelpDesk() {
  return (
    <main className="help-desk-main">

      <section className="help-desk">
      <BackButton to="/"  className="back-button" />
        <h1>Die häufigsten Fragen</h1>
        <div className="help-desk-list-content">
          <details>
            <summary class="help-desk-button collapsible">
              Was kostet der Quiz Word?
            </summary>
            <div class="help-desk-list-content">
                Der Quiz word is komplett kostenlos.
            </div>
          </details>
        </div>
      </section>
    </main>
  );
}

export default HelpDesk;
