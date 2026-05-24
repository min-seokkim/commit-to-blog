import type { ButtonHTMLAttributes } from "react";

import styles from "./SecondaryButton.module.css";

type SecondaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

function SecondaryButton({
  children,
  className,
  ...buttonProps
}: SecondaryButtonProps) {
  const classes = [styles["secondary-button"], className ?? ""]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} type="button" {...buttonProps}>
      {children}
    </button>
  );
}

export default SecondaryButton;
