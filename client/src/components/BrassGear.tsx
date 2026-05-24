import styles from "./BrassGear.module.css";

type BrassGearProps = {
  size: "header" | "footer";
};

const TEETH = 10;
const TEETH_ROTATIONS = Array.from({ length: TEETH }, (_, index) => index);
const TEETH_STEP_DEGREES = 360 / TEETH;

function BrassGear({ size }: BrassGearProps) {
  return (
    <span
      className={`${styles["brass-gear"]} ${styles[`brass-gear--${size}`]}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" focusable="false">
        <defs>
          <radialGradient id="brass-gear-fill" cx="35%" cy="32%" r="65%">
            <stop offset="0%" stopColor="var(--brass-highlight)" />
            <stop offset="35%" stopColor="var(--brass-main)" />
            <stop offset="80%" stopColor="var(--brass-dark)" />
            <stop offset="100%" stopColor="var(--brass-edge)" />
          </radialGradient>
        </defs>
        <g transform="translate(12 12)">
          {TEETH_ROTATIONS.map((index) => (
            <rect
              key={index}
              x="-1.4"
              y="-11"
              width="2.8"
              height="3.4"
              rx="0.6"
              fill="url(#brass-gear-fill)"
              transform={`rotate(${index * TEETH_STEP_DEGREES})`}
            />
          ))}
          <circle r="7" fill="url(#brass-gear-fill)" />
          <circle
            r="2.4"
            fill="var(--paper-100)"
            stroke="var(--brass-edge)"
            strokeWidth="0.6"
          />
        </g>
      </svg>
    </span>
  );
}

export default BrassGear;
