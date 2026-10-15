import { Link } from "react-router-dom";
import BackButton from "../../../components/BackButton/BackButton";
import styles from "./invalid-link.module.scss";

function InvalidLink() {
  return (
    <main className={styles["invalid-link"]}>
      <section className={styles["content"]}>
        <BackButton to="/login" />
        <div className={styles["title"]}>
          <h1 className={styles["heading"]}>Invalid Link</h1>
        </div>
        <div className={styles["description"]}>
          <p>Dieser Link ist ungültig oder abgelaufen.</p>
          <Link className={styles["link"]} to="/resend-new-link">
            Neuen Bestätigungslink anfordern
          </Link>
        </div>
      </section>
    </main>
  );
}

export default InvalidLink;
