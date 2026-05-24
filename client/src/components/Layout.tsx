import { Outlet } from "react-router";

import Footer from "./Footer";
import Header from "./Header";
import styles from "./Layout.module.css";

function Layout() {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles["layout__main"]}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
