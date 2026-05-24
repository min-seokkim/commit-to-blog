import { NavLink } from "react-router";

import PageDivider from "./PageDivider";
import styles from "./Header.module.css";

const NAV_ITEMS = [
  { to: "/saved", label: "저장된 글" },
  { to: "/my-blog", label: "새 글 쓰기" },
  { to: "/settings", label: "설정" },
] as const;

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles["header__inner"]}>
        <NavLink to="/saved" className={styles["header__brand"]}>
          <span>스마트 블로그</span>
          <span className={styles["header__gear"]} aria-hidden="true">
            ⚙
          </span>
        </NavLink>
        <nav className={styles["header__nav"]} aria-label="주 내비게이션">
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
