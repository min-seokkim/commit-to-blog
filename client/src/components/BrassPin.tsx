import styles from "./BrassPin.module.css";

export type BrassPinSize = "small" | "medium";

type BrassPinProps = {
  size?: BrassPinSize;
};

function BrassPin({ size = "medium" }: BrassPinProps) {
  return (
    <span
      className={`${styles["brass-pin"]} ${styles[`brass-pin--${size}`]}`}
      aria-hidden="true"
    />
  );
}

export default BrassPin;
