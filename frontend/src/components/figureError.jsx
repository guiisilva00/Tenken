export default function FigureError({ onRetry }) {
  return (
    <main
      style={{
        minHeight: "65vh",
        display: "grid",
        placeContent: "center",
        padding: "2rem",
        background: "#0b090a",
        color: "#f5f3f4",
      }}
    >
      <section
        aria-labelledby="titulo-erro"
        style={{
          width: "min(100%, 920px)",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 1rem",
              color: "#ba181b",
              fontSize: ".8rem",
              fontWeight: 700,
              letterSpacing: ".16em",
              textTransform: "uppercase",
            }}
          >
            Falha inesperada
          </p>
          <h1
            id="titulo-erro"
            style={{
              margin: 0,
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              lineHeight: 1.05,
            }}
          >
            Algo interrompeu esta página.
          </h1>
          <p style={{ maxWidth: "34rem", margin: "1.25rem auto 0", color: "#b1a7a6", lineHeight: 1.7 }}>
            Ocorreu um problema inesperado. Você pode tentar carregar esta área novamente.
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: ".75rem",
              marginTop: "1.5rem",
            }}
          >
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                style={{
                  minHeight: "48px",
                  padding: ".75rem 1.25rem",
                  border: "1px solid #ba181b",
                  background: "#a4161a",
                  color: "#fff",
                  font: "inherit",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Tentar novamente
              </button>
            )}
            <a
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "48px",
                padding: ".75rem 1.25rem",
                border: "1px solid #b1a7a6",
                color: "#f5f3f4",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Voltar ao início
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
