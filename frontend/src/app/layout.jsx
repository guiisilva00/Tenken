import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import InitialLoader from "../components/InitialLoader";

export const metadata = {
  title: "Tenken",
  description: "Tenken organiza o uso, a inspeção e a manutenção de equipamentos de laboratórios educacionais.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&amp;family=Malik:wght@400;700&amp;display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <InitialLoader />
        <Header/>
        {children}
        <Footer/>
      </body>
    </html>
  );
}
