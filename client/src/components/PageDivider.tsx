import styles from "./PageDivider.module.css";

function PageDivider() {
  return <div className={styles["page-divider"]} aria-hidden="true" />;
}

export default PageDivider;
