import type { ButtonHTMLAttributes, ReactNode } from "react";

import styles from "./WaxSealButton.module.css";

type WaxSealButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
  compact?: boolean;
};

function WaxSealButton({
  children,
  className,
  icon,
  compact = false,
  ...buttonProps
}: WaxSealButtonProps) {
  const classes = [
    styles["wax-seal-button"],
    compact ? styles["wax-seal-button--compact"] : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...buttonProps}>
      {icon !== undefined ? (
        <span className={styles["wax-seal-button__icon"]}>{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default WaxSealButton;
