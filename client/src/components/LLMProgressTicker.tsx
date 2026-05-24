import { useEffect, useState } from "react";

import styles from "./LLMProgressTicker.module.css";

const STAGE_MESSAGES = [
  { delayMs: 0, message: "1단계 — 커밋 분석 중..." },
  { delayMs: 8000, message: "2단계 — 글 작성 중..." },
  { delayMs: 18000, message: "마무리 중..." },
] as const;

type LLMProgressTickerProps = {
  active: boolean;
};

function LLMProgressTicker({ active }: LLMProgressTickerProps) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setMessage(null);
      return;
    }

    setMessage(STAGE_MESSAGES[0].message);

    const timers = STAGE_MESSAGES.slice(1).map((stage) =>
      window.setTimeout(() => setMessage(stage.message), stage.delayMs),
    );

    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, [active]);

  if (message === null) {
    return null;
  }

  return (
    <p
      className={styles["llm-progress-ticker"]}
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}

export default LLMProgressTicker;
