import PinnedSurface from "../components/PinnedSurface";
import { useSettings } from "../hooks/useSettings";

import styles from "./SettingsPage.module.css";

function SettingsPage() {
  const settings = useSettings();

  return (
    <section className={styles["settings-page"]}>
      <div className={styles["settings-page__header"]}>
        <p className={styles["settings-page__subtitle"]}>Environment</p>
        <h1 className={styles["settings-page__title"]}>Settings</h1>
      </div>

      {settings.error !== null ? (
        <p className={styles["settings-page__error"]} role="alert">
          {settings.error}
        </p>
      ) : null}

      <PinnedSurface variant="card" rotate="a" pin="left">
        <dl className={styles["settings-page__list"]}>
          <div className={styles["settings-page__row"]}>
            <dt>LLM model</dt>
            <dd>{settings.data?.llmModel ?? "loading"}</dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>GitHub token</dt>
            <dd>{settings.data?.githubToken ?? "loading"}</dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>OpenAI key</dt>
            <dd>{settings.data?.openaiKey ?? "loading"}</dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>Client origin</dt>
            <dd>{settings.data?.clientOrigin ?? "loading"}</dd>
          </div>
          <div className={styles["settings-page__row"]}>
            <dt>Server port</dt>
            <dd>{settings.data?.port ?? "loading"}</dd>
          </div>
        </dl>
      </PinnedSurface>
    </section>
  );
}

export default SettingsPage;
