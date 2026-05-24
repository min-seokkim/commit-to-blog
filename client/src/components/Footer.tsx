import BrassGear from "./BrassGear";
import Fleuron from "./Fleuron";
import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <Fleuron />
      <p className={styles["footer__copy"]}>
        <BrassGear size="footer" />
        스마트 블로그
      </p>
    </footer>
  );
}

export default Footer;
