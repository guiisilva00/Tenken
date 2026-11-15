import Image from "next/image";
import styles from "./AuthLayout.module.css";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className={styles.layout}>
      <aside className={styles.videoPanel} aria-hidden="true">
        <video
          className={styles.video}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          src="/assets/videos/braco-robotico-vermelho.mp4"
        />

        <div className={styles.videoOverlay} />

        <div className={styles.videoCaption}>
          <span className={styles.videoEyebrow}>
            TENKEN <span>点検</span>
          </span>

          <p className={styles.videoTitle}>
            Precisão em cada
            <br />
            detalhe.
          </p>

          <span className={styles.videoDescription}>
            Tecnologia, inspeção e cuidado com equipamentos.
          </span>
        </div>
      </aside>

      <section className={styles.contentPanel}>
        <div className={styles.content}>
          <Image
            className={styles.logo}
            src="/assets/img/logo-site/logo_horizontal.svg"
            alt="Tenken"
            width={240}
            height={80}
            priority
          />

          <div className={styles.heading}>
            <span className={styles.headingEyebrow}>ÁREA DE ACESSO</span>
            <h1 className={styles.title}>{title}</h1>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>

          <div className={styles.formContent}>{children}</div>
        </div>
      </section>
    </main>
  );
}
