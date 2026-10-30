export default function FigureNotFound() {
  return (
    <main
      style={{
        minHeight: "60vh",
        display: "grid",
        placeContent: "center",
        justifyItems: "center",
        gap: "1rem",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#ba181b",
          fontSize: "1rem",
          fontWeight: 700,
          letterSpacing: ".15em",
        }}
      >
        ERRO 404
      </p>
      <h1 style={{ margin: 0, fontSize: "clamp(2rem, 6vw, 4rem)" }}>
        Página não encontrada
      </h1>
      <p style={{ maxWidth: "32rem", margin: 0, color: "#b1a7a6" }}>
        Não encontramos a página que você está procurando.
      </p>
      <a
        href="/"
        style={{
          marginTop: ".5rem",
          padding: ".8rem 1.2rem",
          background: "#a4161a",
          color: "#fff",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Voltar ao início
      </a>
    </main>
  );
}