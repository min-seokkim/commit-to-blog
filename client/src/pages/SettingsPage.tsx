import PinnedSurface from "../components/PinnedSurface";
import { useSettings } from "../hooks/useSettings";

import styles from "./SettingsPage.module.css";

const LOADING_LABEL = "불러오는 중...";

const CREDENTIAL_DISPLAY: Record<"configured" | "missing", string> = {
  configured: "등록됨",
  missing: "없음",
};

function SettingsPage() {
  const settings = useSettings();

  return (
    <section className={styles["settings-page"]}>
      <div className={styles["settings-page__header"]}>
        <p className={styles["settings-page__subtitle"]}>환경</p>
        <h1 className={styles["settings-page__title"]}>설정</h1>
      </div>

      {settings.error !== null ? (
        <p className={styles["settings-page__error"]} role="alert">
          {settings.error}
        </p>
      ) : null}

      <PinnedSurface variant="card" rotate="a" pin="left">
        <dl className={styles["settings-page__list"]}>
          <div className={styles["settings-page__row"]}>
            <dt>LLM 모델</dt>
            <dd>{settings.data?.llmModel ?? LOADING_LABEL}</dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>GitHub 토큰</dt>
            <dd>
              {settings.data
                ? CREDENTIAL_DISPLAY[settings.data.githubToken]
                : LOADING_LABEL}
            </dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>OpenAI 키</dt>
            <dd>
              {settings.data
                ? CREDENTIAL_DISPLAY[settings.data.openaiKey]
                : LOADING_LABEL}
            </dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>클라이언트 주소</dt>
            <dd>{settings.data?.clientOrigin ?? LOADING_LABEL}</dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>서버 포트</dt>
            <dd>{settings.data?.port ?? LOADING_LABEL}</dd>
          </div>
        </dl>
      </PinnedSurface>
    </section>
  );
}

export default SettingsPage;
