"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import styles from "./page.module.css";
import { chamarApi } from "../lib/adminApi";
import { useModalExit } from "../../useModalExit";
import FeedbackModal from "../components/FeedbackModal";

export default function PaginaTurmas() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [nome, setNome] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [turmaEditando, setTurmaEditando] = useState(null);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todas");
  const [modalAberto, setModalAberto, fechandoModal, finalizarFechamentoModal] =
    useModalExit(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [feedback, setFeedback] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const [listaTurmas, listaProfessores] = await Promise.all([
        chamarApi("/turmas", token),
        chamarApi(
          "/usuarios?pagina=1&limite=100&perfil=PROFESSOR&ativo=true",
          token,
        ),
      ]);
      setTurmas(listaTurmas.dados ?? listaTurmas ?? []);
      setProfessores(listaProfessores.dados ?? listaProfessores ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const totalAlunos = turmas.reduce(
    (soma, turma) => soma + Number(turma.alunos ?? 0),
    0,
  );

  const termo = busca.trim().toLocaleLowerCase("pt-BR");
  const turmasFiltradas = turmas.filter((turma) => {
    const correspondeBusca =
      !termo ||
      [turma.nome, turma.professor_nome, String(turma.id)].some((valor) =>
        String(valor ?? "")
          .toLocaleLowerCase("pt-BR")
          .includes(termo),
      );
    const correspondeFiltro =
      filtro === "todas" || Number(turma.alunos ?? 0) === 0;
    return correspondeBusca && correspondeFiltro;
  });

  async function criarTurma(evento) {
    evento.preventDefault();
    setErro("");
    setSalvando(true);
    try {
      await chamarApi(turmaEditando ? `/turmas/${turmaEditando.id}` : "/turmas", token, {
        method: turmaEditando ? "PUT" : "POST",
        body: { nome, professor_id: Number(professorId) },
      });
      setFeedback({
        type: "success",
        message: `Turma ${nome.trim()} ${turmaEditando ? "atualizada" : "criada"} com sucesso.`,
      });
      setNome("");
      setProfessorId("");
      setTurmaEditando(null);
      setModalAberto(false);
      await carregar();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    } finally {
      setSalvando(false);
    }
  }

  async function excluirTurma(turma) {
    if (!window.confirm(`Excluir a turma ${turma.nome}?`)) return;
    try {
      await chamarApi(`/turmas/${turma.id}`, token, { method: "DELETE" });
      setFeedback({ type: "success", message: `Turma ${turma.nome} excluída.` });
      await carregar();
    } catch (e) {
      setFeedback({ type: "error", message: e.message });
    }
  }

  const filtros = [
    { id: "todas", label: "Todas", quantidade: turmas.length },
    {
      id: "sem-alunos",
      label: "Sem alunos",
      quantidade: turmas.filter((turma) => Number(turma.alunos ?? 0) === 0)
        .length,
    },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.title}>Turmas</h1>
          <p className={styles.subtitle}>
            Organize as turmas, os professores e os alunos vinculados.
          </p>
        </div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            setErro("");
            setTurmaEditando(null);
            setNome("");
            setProfessorId("");
            setModalAberto(true);
          }}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            add
          </span>
          Nova turma
        </button>
      </header>

      {erro && !modalAberto && (
        <div className={styles.alertError} role="alert">
          <span>{erro}</span>
          <button type="button" onClick={carregar}>
            Tentar novamente
          </button>
        </div>
      )}

      <section className={styles.metrics} aria-label="Resumo das turmas">
        <Metric
          icon="groups"
          label="Turmas cadastradas"
          value={turmas.length}
          loading={loading}
        />
        <Metric
          icon="school"
          label="Alunos vinculados"
          value={totalAlunos}
          loading={loading}
        />
        <Metric
          icon="person_apron"
          label="Professores ativos"
          value={professores.length}
          loading={loading}
        />
      </section>

      <section className={styles.listSection} aria-label="Turmas cadastradas">
        <div className={styles.toolbar}>
          <label className={styles.searchBox}>
            <span className="material-symbols-outlined" aria-hidden="true">
              search
            </span>
            <span className={styles.visuallyHidden}>Buscar turmas</span>
            <input
              type="search"
              value={busca}
              onChange={(evento) => setBusca(evento.target.value)}
              placeholder="Buscar turma ou professor"
            />
            {busca && (
              <button
                type="button"
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            )}
          </label>
          <div
            className={styles.filterGroup}
            role="group"
            aria-label="Filtrar turmas"
          >
            {filtros.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`${styles.filterButton} ${filtro === item.id ? styles.filterButtonActive : ""}`}
                aria-pressed={filtro === item.id}
                onClick={() => setFiltro(item.id)}
              >
                {item.label}
                <span>{item.quantidade}</span>
              </button>
            ))}
          </div>
          <p className={styles.resultCount} aria-live="polite">
            <span className="material-symbols-outlined" aria-hidden="true">
              view_list
            </span>
            {loading
              ? "Carregando turmas"
              : `${turmasFiltradas.length} ${turmasFiltradas.length === 1 ? "turma encontrada" : "turmas encontradas"}`}
          </p>
        </div>

        {loading ? (
          <div
            className={styles.skeletonList}
            aria-label="Carregando turmas"
            aria-busy="true"
          >
            {Array.from({ length: 5 }, (_, index) => (
              <SkeletonRow key={index} />
            ))}
          </div>
        ) : erro ? (
          <div className={styles.filteredEmpty}>
            <span className="material-symbols-outlined" aria-hidden="true">
              cloud_off
            </span>
            <h2>Não foi possível carregar as turmas</h2>
            <p>Verifique a conexão e tente novamente.</p>
            <button
              type="button"
              className={styles.textButton}
              onClick={carregar}
            >
              Tentar novamente
            </button>
          </div>
        ) : turmas.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon} aria-hidden="true">
              <span className="material-symbols-outlined">groups</span>
            </div>
            <h2>Nenhuma turma cadastrada</h2>
            <p>
              Crie a primeira turma para começar a organizar alunos e
              professores do laboratório.
            </p>
            <div className={styles.emptyActions}>
              <button
                type="button"
                className={styles.primaryButton}
                onClick={() => {
                  setErro("");
                  setTurmaEditando(null);
                  setNome("");
                  setProfessorId("");
                  setModalAberto(true);
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  add
                </span>
                Criar primeira turma
              </button>
              <button
                type="button"
                className={styles.textButton}
                onClick={() => {
                  setBusca("");
                  setFiltro("todas");
                }}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  restart_alt
                </span>
                Limpar filtros de busca
              </button>
            </div>
          </div>
        ) : turmasFiltradas.length === 0 ? (
          <div className={styles.filteredEmpty}>
            <span className="material-symbols-outlined" aria-hidden="true">
              search_off
            </span>
            <h2>Nenhuma turma encontrada</h2>
            <p>Altere a busca ou remova o filtro para ver outras turmas.</p>
            <button
              type="button"
              className={styles.textButton}
              onClick={() => {
                setBusca("");
                setFiltro("todas");
              }}
            >
              Limpar busca e filtros
            </button>
          </div>
        ) : (
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Turma</th>
                  <th scope="col">Professor responsável</th>
                  <th scope="col">Alunos</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {turmasFiltradas.map((turma) => (
                  <tr key={turma.id}>
                    <td>
                      <div className={styles.classCell}>
                        <span className={styles.classIcon} aria-hidden="true">
                          <span className="material-symbols-outlined">
                            groups
                          </span>
                        </span>
                        <span>
                          <strong>{turma.nome}</strong>
                          <small>Turma #{turma.id}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.professorCell}>
                        <span
                          className={styles.professorAvatar}
                          aria-hidden="true"
                        >
                          {iniciais(turma.professor_nome)}
                        </span>
                        {turma.professor_nome || "Professor não informado"}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`${styles.studentCount} ${Number(turma.alunos ?? 0) === 0 ? styles.studentCountEmpty : ""}`}
                      >
                        <span
                          className="material-symbols-outlined"
                          aria-hidden="true"
                        >
                          group
                        </span>
                        {Number(turma.alunos ?? 0)}{" "}
                        {Number(turma.alunos ?? 0) === 1 ? "aluno" : "alunos"}
                      </span>
                    </td>
                    <td>
                      <button type="button" className={styles.textButton} onClick={() => {
                        setTurmaEditando(turma); setNome(turma.nome); setProfessorId(String(turma.professor_id)); setModalAberto(true);
                      }}>Editar</button>
                      <button type="button" className={styles.textButton} onClick={() => excluirTurma(turma)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {modalAberto && (
        <div
          className={`${styles.modalOverlay} abrir-modal-fundo ${fechandoModal ? "fechar-modal-fundo" : ""}`}
          role="presentation"
          onMouseDown={(evento) => {
            if (evento.target === evento.currentTarget) setModalAberto(false);
          }}
        >
          <section
            className={`${styles.modalCard} abrir-modal ${fechandoModal ? "fechar-modal" : ""}`}
            onAnimationEnd={finalizarFechamentoModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-criar-turma"
          >
            <header className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleRow}>
                <span className={styles.modalIcon} aria-hidden="true">
                  <span className="material-symbols-outlined">groups</span>
                </span>
                <div>
                  <h2 id="titulo-criar-turma" className={styles.modalTitle}>
                    {turmaEditando ? "Editar turma" : "Criar turma"}
                  </h2>
                  <p className={styles.modalDescription}>
                    Informe o nome da turma e o professor responsável.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setModalAberto(false)}
                aria-label="Fechar"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </header>
            <form className={styles.modalForm} onSubmit={criarTurma}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="nome-turma">
                  Nome da turma
                </label>
                <input
                  id="nome-turma"
                  className={styles.modalInput}
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  maxLength={100}
                  required
                  autoFocus
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="professor-turma">
                  Professor responsável
                </label>
                <select
                  id="professor-turma"
                  className={styles.modalSelect}
                  value={professorId}
                  onChange={(evento) => setProfessorId(evento.target.value)}
                  required
                >
                  <option value="">Selecione um professor</option>
                  {professores.map((professor) => (
                    <option key={professor.id} value={professor.id}>
                      {professor.nome}
                    </option>
                  ))}
                </select>
                {professores.length === 0 && (
                  <span className={styles.modalDescription}>
                    Cadastre e ative um professor antes de criar a turma.
                  </span>
                )}
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setModalAberto(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={salvando || professores.length === 0}
                >
                  {salvando ? "Salvando..." : turmaEditando ? "Salvar alterações" : "Criar turma"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
      <FeedbackModal feedback={feedback} onClose={() => setFeedback(null)} />
    </div>
  );
}

function Metric({ icon, label, value, loading }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricIcon} aria-hidden="true">
        <span className="material-symbols-outlined">{icon}</span>
      </span>
      <span className={styles.metricCopy}>
        {loading ? (
          <span
            className={`${styles.skeleton} ${styles.metricValueSkeleton}`}
          />
        ) : (
          <strong>{value}</strong>
        )}
        <span>{label}</span>
      </span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow} aria-hidden="true">
      <div className={styles.skeletonMain}>
        <span className={`${styles.skeleton} ${styles.skeletonIcon}`} />
        <span>
          <i className={`${styles.skeleton} ${styles.skeletonLineShort}`} />
          <i className={`${styles.skeleton} ${styles.skeletonLine}`} />
        </span>
      </div>
      <div className={styles.skeletonPerson}>
        <span className={`${styles.skeleton} ${styles.skeletonAvatar}`} />
        <i className={`${styles.skeleton} ${styles.skeletonLine}`} />
      </div>
      <span className={`${styles.skeleton} ${styles.skeletonBadge}`} />
    </div>
  );
}

function iniciais(nome = "") {
  return (
    nome
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0])
      .join("")
      .toLocaleUpperCase("pt-BR") || "PR"
  );
}
