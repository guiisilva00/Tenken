import Patrocinadores from "../components/patrocinadores";
import Carrossel from "../components/carrossel";

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

        </>
    );
}
