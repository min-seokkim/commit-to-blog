import Fleuron from "./Fleuron";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <Fleuron />
      <p className={styles["footer__copy"]}>
        <span className={styles["footer__gear"]} aria-hidden="true">
          ⚙
        </span>
        Smart Blog
      </p>
    </footer>
  );
}

export default Footer;
