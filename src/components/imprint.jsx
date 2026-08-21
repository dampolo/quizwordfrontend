import BackButton from "./BackButton/BackButton";
import "./imprint.scss";

function Imprint() {
  return (
    <main>
      <section className="imprint">
        <BackButton to="/" />

        <article className="imprint-description">
          <h1 className="imprint-title">Impressum</h1>

          <h2>Angaben gemäß § 5 DDG</h2>

          <p>
            <strong>Quiz Word</strong>
            <br />
            Damian Poloczek
            <br />
            Chiemgaustraße 156
            <br />
            81549 München
            <br />
            Deutschland
          </p>

          <h2>Kontakt</h2>

          <p>
            Telefon: +49 176 99492988
            <br />
            E-Mail:{" "}
            <a href="mailto:support@quiz-word.com">
              support@quiz-word.com
            </a>
          </p>

          <h2>Verantwortlich für den Inhalt</h2>

          <p>
            Damian Poloczek
            <br />
            Chiemgaustraße 156
            <br />
            81549 München
          </p>

          <h2>EU-Streitschlichtung</h2>

          <p>
            Die Europäische Kommission stellt eine Plattform zur
            Online-Streitbeilegung (OS) bereit:
          </p>

          <p>
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
          </p>

          <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>

          <h2>Verbraucherstreitbeilegung</h2>

          <p>
            Wir sind weder verpflichtet noch bereit, an
            Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle
            teilzunehmen.
          </p>

          <h2>Haftung für Inhalte</h2>

          <p>
            Die Inhalte dieser Website wurden mit größter Sorgfalt erstellt. Für
            die Richtigkeit, Vollständigkeit und Aktualität der Inhalte
            übernehmen wir jedoch keine Gewähr.
          </p>

          <h2>Haftung für Links</h2>

          <p>
            Diese Website enthält Links zu externen Webseiten Dritter, auf deren
            Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
            fremden Inhalte keine Gewähr übernehmen.
          </p>

          <h2>Urheberrecht</h2>

          <p>
            Die durch den Seitenbetreiber erstellten Inhalte und Werke auf
            dieser Website unterliegen dem deutschen Urheberrecht. Jede
            Vervielfältigung, Bearbeitung oder Verbreitung außerhalb der Grenzen
            des Urheberrechts bedarf der schriftlichen Zustimmung des jeweiligen
            Autors.
          </p>

          <p className="imprint-source">
            Quelle:{" "}
            <a
              href="https://www.e-recht24.de"
              target="_blank"
              rel="noopener noreferrer"
            >
              eRecht24
            </a>
          </p>
        </article>
      </section>
    </main>
  );
}

export default Imprint;
