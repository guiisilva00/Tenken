import Patrocinadores from "../components/Patrocinadores";
import Carrossel from "../components/Carrossel";

const etapas = [
    ["01", "Agendamento", "Organize a reserva dos equipamentos e consulte os horários disponíveis."],
    ["02", "Inspeção prévia", "Confira as condições do equipamento antes de iniciar a atividade."],
    ["03", "Utilização", "Use a bancada, o robô ou os componentes com segurança."],
    ["04", "Inspeção posterior", "Registre o estado do equipamento ao final do uso."],
    ["05", "Manutenção", "Quando necessário, encaminhe ocorrências para acompanhamento."],
];

export default function App() {
    return (
        <>
            <section id="inicio" className="secao-destaque" aria-labelledby="titulo-tenken">
                <video autoPlay muted loop playsInline aria-hidden="true" tabIndex={-1}>
                    <source src="/assets/videos/video-home.mp4" type="video/mp4" />
                </video>
                <div className="camada-destaque container-fluid">
                    <p className="texto-destaque"><span className="texto-destaque__ano">EST. 2026</span><span className="texto-destaque__significado">"てんけん"
                        <i aria-hidden="true">-</i> inspeção, checagem e verificação.</span></p>
                    <h1 id="titulo-tenken" className="titulo-destaque">Tenken</h1>
                    <p className="chamada-destaque">Equipamentos prontos. Uso responsável. Histórico em dia.</p>
                </div>
                <a className="indicacao-rolagem" href="#parceiros">Role para explorar <span aria-hidden="true">↓</span></a>
            </section>

            <main>
                <Patrocinadores />
                <section id="sobre" className="secao-sobre">
                    <div className="container py-5 py-lg-6">
                        <p className="sobretitulo">O que é a Tenken?</p>
                        <div className="row g-4 align-items-end">
                            <div className="col-lg-7"><h2>Mais <span className="destaque-vermelho">cuidado</span> com cada <span className="destaque-vermelho">equipamento</span>. Mais <span className="destaque-vermelho">clareza</span> em cada etapa.</h2></div>
                            <div className="col-lg-5"><p>Tenken organiza o uso, as inspeções e a manutenção de equipamentos em laboratórios educacionais de robótica e automação. Um fluxo digital para apoiar a segurança, a prevenção e o histórico de utilização.</p></div>
                        </div>
                    </div>
                </section>

                <Carrossel />

                <section id="fluxo" className="secao-fluxo" aria-labelledby="titulo-fluxo">
                    <div className="container py-5 py-lg-6">
                        <p className="sobretitulo">Do início ao próximo uso</p>
                        <h2 id="titulo-fluxo">Um ciclo simples, do agendamento à manutenção.</h2>
                        <ol className="row g-0 lista-etapas">
                            {etapas.map(([numero, titulo, descricao]) => <li className="col-12 col-md-6 col-lg" key={numero}>
                                <article className="etapa"><span className="numero-etapa">{numero}</span><h3>{titulo}</h3><p>{descricao}</p></article>
                            </li>)}
                        </ol>
                    </div>
                </section>

                <section className="secao-cta">
                    <div className="container py-5 py-lg-6 d-lg-flex align-items-end justify-content-between gap-4">
                        <div><p className="sobretitulo">Comece por aqui</p><h2>Seu laboratório, com mais organização.</h2></div>
                        <a className="botao-principal" href="/login/">Acessar sistema <span aria-hidden="true">↗</span></a>
                    </div>
                </section>
            </main>
            <footer className="rodape-tenken">
                <div className="container py-4 d-flex flex-column flex-md-row justify-content-between gap-3">
                    <a href="#inicio" className="marca-rodape" aria-label="Tenken — voltar ao início"><img src="/assets/img/logo-site/letreiro_tenken.svg" alt="Tenken" /></a>
                    <p className="rodape-tenken__descricao">O Tenken ajuda laboratórios educacionais a acompanhar seus equipamentos em cada etapa. Organize agendamentos, registre inspeções antes e depois do uso e mantenha ocorrências e manutenções no histórico.</p>
                    <div className="rodape-tenken__contato">
                        <h2>Fale com a gente</h2>
                        <a className="link-contato" href="https://github.com/guiisilva00/Tenken" target="_blank" rel="noreferrer">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.67-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.7 1.15 1.7 1.15 1 1.7 2.62 1.21 3.26.92.1-.72.39-1.21.71-1.49-2.48-.28-5.09-1.24-5.09-5.52 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.06 1.15a10.64 10.64 0 0 1 5.57 0c2.12-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.12 2.96.71.78 1.14 1.78 1.14 3.01 0 4.29-2.61 5.23-5.1 5.5.4.35.76 1.02.76 2.06V22c0 .29.2.63.77.52A11.1 11.1 0 0 0 12 .9Z" /></svg>
                            <span>GitHub do projeto</span>
                        </a>
                        <a className="link-contato" href="https://wa.me/5511919453909" target="_blank" rel="noreferrer">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.52 3.48A11.84 11.84 0 0 0 12.08 0C5.5 0 .15 5.35.15 11.93c0 2.1.55 4.15 1.6 5.96L.05 24l6.26-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.58 0 11.93-5.35 11.93-11.93a11.85 11.85 0 0 0-3.5-8.42ZM12.09 21.8a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.86 9.86 0 0 1-1.52-5.26c0-5.46 4.44-9.9 9.9-9.9a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.9 7c0 5.45-4.45 9.87-9.91 9.87Zm5.43-7.4c-.3-.15-1.76-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.88-.78-1.47-1.75-1.64-2.05-.18-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.38-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.62.72.23 1.37.2 1.88.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.18-1.42-.08-.12-.28-.2-.58-.35Z" /></svg>
                            <span>WhatsApp · (11) 91945-3909</span>
                        </a>
                    </div>
                </div>
            </footer>
        </>
    );
}
