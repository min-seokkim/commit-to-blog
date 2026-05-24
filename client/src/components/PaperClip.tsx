import styles from "./PaperClip.module.css";

export type PaperClipSize = "small" | "medium";

type PaperClipProps = {
  size?: PaperClipSize;
};

function PaperClip({ size = "medium" }: PaperClipProps) {
  return (
    <span
      className={`${styles["paper-clip"]} ${styles[`paper-clip--${size}`]}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 50" focusable="false">
        <path
          d="M5 5 L5 38 A5.5 5.5 0 0 0 16 38 L16 13 A4 4 0 0 0 8 13 L8 30 A2.5 2.5 0 0 0 13 30 L13 19"
          fill="none"
          stroke="var(--brass-main)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export default PaperClip;
