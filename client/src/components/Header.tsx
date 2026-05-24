import { NavLink } from "react-router";

import PageDivider from "./PageDivider";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { to: "/saved", label: "Saved" },
  { to: "/my-blog", label: "My blog" },
  { to: "/settings", label: "Settings" },
] as const;

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles["header__inner"]}>
        <NavLink to="/saved" className={styles["header__brand"]}>
          <span>Smart Blog</span>
          <span className={styles["header__gear"]} aria-hidden="true">
            ⚙
          </span>
        </NavLink>
        <nav className={styles["header__nav"]} aria-label="Primary navigation">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  styles["header__nav-link"],
                  isActive ? styles["header__nav-link--active"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <PageDivider />
    </header>
  );
}

export default Header;
