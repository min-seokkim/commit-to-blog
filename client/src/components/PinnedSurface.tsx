import type { ReactNode } from "react";

import PaperClip from "./PaperClip";
import styles from "./PinnedSurface.module.css";

export type PinnedSurfaceVariant = "card" | "memo" | "letter" | "large";
export type PinnedSurfaceRotate = "a" | "b" | "c" | "d";

type PinnedSurfaceProps = {
  children: ReactNode;
  className?: string;
  variant?: PinnedSurfaceVariant;
  rotate?: PinnedSurfaceRotate;
};

function PinnedSurface({
  children,
  className,
  variant = "card",
  rotate = "a",
}: PinnedSurfaceProps) {
  const classes = [
    styles["pinned-surface"],
    styles[`pinned-surface--${variant}`],
    styles[`pinned-surface--rotate-${rotate}`],
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={classes}>
      <span className={styles["pinned-surface__pin"]}>
        <PaperClip size={variant === "memo" ? "small" : "medium"} />
      </span>
      {children}
    </article>
  );
}

export default PinnedSurface;
