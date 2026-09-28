import { Link } from "react-router-dom";
import styles from "./page-not-found.module.scss";
import PageTitle from "../PageTitle/PageTitle";

function PageNotFound() {
  return (
    <main className={styles["page-not-found"]}>
      <PageTitle title="Seite nicht gefunden" />
      <section className={styles["content"]}>
        <div className={styles["title"]}>
          <h1 className={styles["heading"]}>404 – Seite nicht gefunden</h1>
        </div>

        <div className={styles["description"]}>
          <p>Die gesuchte Seite existiert nicht.</p>
          <Link className={styles["link"]} to="/">
            Zur Startseite
          </Link>
        </div>
      </section>
    </main>
  );
}

export default PageNotFound;
