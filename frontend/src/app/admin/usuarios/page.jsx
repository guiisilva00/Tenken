"use client";

import { useCallback, useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import TabelaAdmin from "../components/TabelaAdmin";
import styles from "./page.module.css";
import modalStyles from "../equipamentos/page.module.css";
import { chamarApi } from "../lib/adminApi";
import { useModalExit } from "../../useModalExit";

const PERFIS = [
  { chave: "all", rotulo: "Todos", valorFiltro: "" },
  { chave: "ALUNO", rotulo: "Aluno", valorFiltro: "ALUNO" },
  { chave: "PROFESSOR", rotulo: "Professor", valorFiltro: "PROFESSOR" },
  { chave: "TECNICO", rotulo: "Técnico", valorFiltro: "TECNICO" },
  { chave: "ADMIN", rotulo: "Admin", valorFiltro: "ADMIN" },
];

const ITENS_POR_PAGINA = 10;

function extrairIniciais(nome) {
  if (!nome) return "TK";
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function PaginaUsuarios() {
  return <AdminLayout>{({ token }) => <Conteudo token={token} />}</AdminLayout>;
}

function Conteudo({ token }) {
  const [usuarios, setUsuarios] = useState([]);
  const [filtroPerfil, setFiltroPerfil] = useState("");
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [
    modalEdicaoAberto,
    setModalEdicaoAberto,
    fechandoEdicao,
    finalizarFechamentoEdicao,
  ] = useModalExit(false);
  const [dropdownAbertoId, setDropdownAbertoId] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [turmasCarregadas, setTurmasCarregadas] = useState(false);
  const [erroTurmas, setErroTurmas] = useState("");
  const [alunoEditado, setAlunoEditado] = useState(null);
  const [salvandoEdicao, setSalvandoEdicao] = useState(false);
  const [erroEdicao, setErroEdicao] = useState("");
  const [formEdicao, setFormEdicao] = useState({
    nome: "",
    email: "",
    matricula: "",
    turmaIds: [],
  });

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const q = new URLSearchParams({ pagina: "1", limite: "100" });
      if (filtroPerfil) q.set("perfil", filtroPerfil);
      const data = await chamarApi(`/usuarios?${q}`, token);
      setUsuarios(data.dados ?? data ?? []);
    } catch (e) {
      setErro(e.message);
    } finally {
      setLoading(false);
    }
  }, [token, filtroPerfil]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  useEffect(() => {
    chamarApi("/turmas", token)
      .then((dados) => setTurmas(dados.dados ?? dados ?? []))
      .catch((e) => {
        setErroTurmas(e.message);
        setErro(e.message);
      })
      .finally(() => setTurmasCarregadas(true));
  }, [token]);

  useEffect(() => {
    setPagina(1);
  }, [busca, filtroPerfil]);

  async function alterarPerfil(user, perfil) {
    setDropdownAbertoId(null);
    try {
      await chamarApi(`/usuarios/${user.id}/perfil`, token, {
        method: "PUT",
        body: { perfil },
      });
      setAviso(`Perfil de ${user.nome} atualizado para ${perfil}.`);
      await carregarUsuarios();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function alterarAtivo(user, ativo) {
    try {
      await chamarApi(`/usuarios/${user.id}/ativo`, token, {
        method: "PATCH",
        body: { ativo },
      });
      setAviso(`Usuário ${user.nome} ${ativo ? "ativado" : "desativado"}.`);
      await carregarUsuarios();
    } catch (e) {
      setErro(e.message);
    }
  }

  function abrirEdicao(aluno) {
    setErro("");
    setErroEdicao("");
    setAlunoEditado(aluno);
    setFormEdicao({
      nome: aluno.nome ?? "",
      email: aluno.email ?? "",
      matricula: aluno.matricula ?? "",
      turmaIds: (aluno.turmas ?? []).map((turma) => String(turma.id)),
    });
    setModalEdicaoAberto(true);
  }

  async function salvarEdicao(e) {
    e.preventDefault();
    if (!alunoEditado) return;
    setSalvandoEdicao(true);
    setErroEdicao("");
    try {
      await chamarApi(`/usuarios/${alunoEditado.id}`, token, {
        method: "PUT",
        body: { ...formEdicao, turmaIds: formEdicao.turmaIds },
      });
      setAviso(`Dados de ${formEdicao.nome} atualizados.`);
      setModalEdicaoAberto(false);
      await carregarUsuarios();
    } catch (e) {
      setErroEdicao(e.message);
    } finally {
      setSalvandoEdicao(false);
    }
  }

  function alternarTurma(turmaId) {
    setFormEdicao((form) => ({
      ...form,
      turmaIds: form.turmaIds.includes(String(turmaId))
        ? form.turmaIds.filter((id) => id !== String(turmaId))
        : [...form.turmaIds, String(turmaId)],
    }));
  }

  // Quick stats calculados
  const totalAtivos = usuarios.filter((u) => Boolean(u.ativo)).length;
  const totalDesativados = usuarios.filter((u) => !u.ativo).length;
  const totalBase = usuarios.length;

  // Contagem por perfil para os pills
  const contagemPerfis = usuarios.reduce(
    (counts, usuario) => {
      if (counts[usuario.perfil] !== undefined) counts[usuario.perfil] += 1;
      return counts;
    },
    { all: usuarios.length, ALUNO: 0, PROFESSOR: 0, TECNICO: 0, ADMIN: 0 },
  );

  // Filtro de busca textual
  const termoBusca = busca.toLowerCase();
  const filtrados = usuarios.filter((u) => {
    const termo = `${u.nome} ${u.email} ${u.matricula ?? ""}`.toLowerCase();
    return termo.includes(termoBusca);
  });

  // Paginação
  const totalPaginas = Math.max(
    1,
    Math.ceil(filtrados.length / ITENS_POR_PAGINA),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const usuariosPagina = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  return (
    <div className={styles.container}>
      {/* Top Operational Banner & Telemetry Bar */}
      <div className={styles.topBanner}>
        <div className={styles.bannerLeft}>
          <h1 className={styles.title}>Usuários</h1>
          <p className={styles.subtitle}>
            Cadastre usuários, ajuste o perfil de acesso e consulte quem pode
            entrar no sistema.
          </p>
        </div>

        {/* Quick Stats Cards */}
        <div className={styles.quickStatsRow}>
          <div className={styles.quickStatCard}>
            <span className={styles.statLabel}>Usuários ativos</span>
            <span className={styles.statNumber}>{totalAtivos}</span>
          </div>

          <div className={styles.quickStatCard}>
            <span className={styles.statLabel}>Desativados</span>
            <span className={`${styles.statNumber} ${styles.statNumberMuted}`}>
              {totalDesativados}
            </span>
          </div>

          <div className={styles.quickStatCard}>
            <span className={styles.statLabel}>Total de usuários</span>
            <span className={styles.statNumber}>{totalBase}</span>
          </div>
        </div>
      </div>

      {erro && (
        <div className={styles.alertError} role="alert">
          {erro}
        </div>
      )}
      {aviso && <div className={styles.alertSuccess}>{aviso}</div>}

      {/* Command Control Bar: Filters & Actions */}
      <div className={styles.controlBar}>
        {/* Filter Pills */}
        <div className={styles.pillsList}>
          <span className={styles.pillsPrefix}>Perfil:</span>
          {PERFIS.map((p) => {
            const isActive = filtroPerfil === p.valorFiltro;
            const count = contagemPerfis[p.chave] ?? 0;
            return (
              <button
                key={p.chave}
                type="button"
                className={`${styles.filterPill} ${isActive ? styles.filterPillActive : ""}`}
                onClick={() => setFiltroPerfil(p.valorFiltro)}
              >
                <span>{p.rotulo}</span>
                <span className={styles.pillCount}>({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Field & Primary Action */}
        <div className={styles.searchAndAction}>
          <div className={styles.searchWrapper}>
            <span className={`material-symbols-outlined ${styles.searchIcon}`}>
              search
            </span>
            <input
              type="text"
              placeholder="Buscar por nome, e-mail ou matrícula..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className={styles.searchInput}
            />
            {busca && (
              <button
                type="button"
                className={styles.clearBtn}
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "16px" }}
                >
                  close
                </span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Telemetry Table Frame */}
      <TabelaAdmin
        columns={[
          "Usuário & Identificação",
          "E-mail Institucional",
          "Matrícula",
          "Turma(s)",
          "Perfil de Acesso",
          "Situação",
          "Data Cadastro",
          { label: "Ações", align: "right" },
        ]}
        minWidth="74rem"
        loading={loading}
        loadingMessage="Carregando usuários..."
        empty={!loading && filtrados.length === 0}
        emptyMessage="Nenhum usuário encontrado."
        pagination={{
          page: paginaAtual,
          totalPages: totalPaginas,
          onChange: setPagina,
          info: `Mostrando ${filtrados.length ? inicio + 1 : 0} - ${Math.min(inicio + ITENS_POR_PAGINA, filtrados.length)} de ${filtrados.length} contas`,
        }}
        tableClassName={styles.table}
      >
        {usuariosPagina.map((u) => {
          const iniciais = extrairIniciais(u.nome);
          const isAdmin = u.perfil === "ADMIN";
          const isProfessor = u.perfil === "PROFESSOR";
          const isTecnico = u.perfil === "TECNICO";

          let roleColorClass = styles.roleAluno;
          if (isAdmin) roleColorClass = styles.roleAdmin;
          else if (isProfessor) roleColorClass = styles.roleProfessor;
          else if (isTecnico) roleColorClass = styles.roleTecnico;

          return (
            <tr key={u.id}>
              {/* User Identity with Avatar */}
              <td>
                <div className={styles.userCell}>
                  <div
                    className={`${styles.avatarBox} ${isAdmin ? styles.avatarAdmin : ""}`}
                  >
                    {iniciais}
                  </div>
                  <div className={styles.userMeta}>
                    <span className={styles.userName}>{u.nome}</span>
                    <span className={styles.userDepartment}>
                      {u.perfil || "Operações"}
                    </span>
                  </div>
                </div>
              </td>

              {/* Email */}
              <td className={styles.emailCell}>{u.email}</td>

              {/* Matrícula */}
              <td>
                <span className={styles.matriculaBadge}>
                  {u.matricula ?? "—"}
                </span>
              </td>

              <td>
                {u.turmas?.length ? (
                  <div className={styles.turmaList}>
                    {u.turmas.map((turma) => (
                      <span key={turma.id} className={styles.turmaBadge}>
                        {turma.nome}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className={styles.noTurma}>Sem turma</span>
                )}
              </td>

              {/* Perfil Dropdown */}
              <td>
                <div className={styles.roleDropdownWrapper}>
                  <button
                    type="button"
                    className={`${styles.roleBadgeBtn} ${roleColorClass}`}
                    onClick={() =>
                      setDropdownAbertoId(
                        dropdownAbertoId === u.id ? null : u.id,
                      )
                    }
                  >
                    <span className={`${styles.roleDot} ${roleColorClass}`} />
                    <span>{u.perfil}</span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      arrow_drop_down
                    </span>
                  </button>

                  {dropdownAbertoId === u.id && (
                    <div className={styles.roleMenu}>
                      {["ADMIN", "PROFESSOR", "TECNICO", "ALUNO"].map(
                        (perfilOpcao) => (
                          <button
                            key={perfilOpcao}
                            type="button"
                            className={`${styles.roleMenuItem} ${u.perfil === perfilOpcao ? styles.roleMenuItemSelected : ""}`}
                            onClick={() => alterarPerfil(u, perfilOpcao)}
                          >
                            {perfilOpcao}
                          </button>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </td>

              {/* Situação */}
              <td>
                <div className={styles.statusCell}>
                  <span
                    className={`${styles.statusBadge} ${u.ativo ? styles.statusActive : styles.statusInactive}`}
                  >
                    <span className={styles.statusDot} />
                    {u.ativo ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </td>

              {/* Data Cadastro */}
              <td className={styles.dateCell}>
                {u.criado_em
                  ? new Date(u.criado_em).toLocaleDateString("pt-BR")
                  : "—"}
              </td>

              {/* Ações */}
              <td style={{ textAlign: "right" }}>
                <div className={styles.actionsCell}>
                  {u.perfil === "ALUNO" && (
                    <button
                      type="button"
                      className={styles.actionBtn}
                      onClick={() => abrirEdicao(u)}
                      disabled={!turmasCarregadas}
                      title="Editar aluno"
                    >
                      <span
                        className="material-symbols-outlined"
                        aria-hidden="true"
                        style={{ fontSize: "15px" }}
                      >
                        edit_note
                      </span>
                      <span>Editar</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${u.ativo ? styles.actionBtnDanger : styles.actionBtnSuccess}`}
                    onClick={() => alterarAtivo(u, !u.ativo)}
                    title={`${u.ativo ? "Inativar" : "Reativar"} usuário`}
                  >
                    <span
                      className="material-symbols-outlined"
                      aria-hidden="true"
                      style={{ fontSize: "15px" }}
                    >
                      {u.ativo ? "power_settings_new" : "restart_alt"}
                    </span>
                    <span>{u.ativo ? "Inativar" : "Reativar"}</span>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </TabelaAdmin>

      {modalEdicaoAberto && alunoEditado && (
        <div
          className={`${styles.modalOverlay} abrir-modal-fundo ${fechandoEdicao ? "fechar-modal-fundo" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="editar-aluno-titulo"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget)
              setModalEdicaoAberto(false);
          }}
        >
          <div
            className={`${styles.modalCard} abrir-modal ${fechandoEdicao ? "fechar-modal" : ""}`}
            onAnimationEnd={finalizarFechamentoEdicao}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalHeaderTitleRow}>
                <div className={modalStyles.modalHeaderIcon}>
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                  >
                    edit
                  </span>
                </div>
                <div>
                  <h2 id="editar-aluno-titulo" className={styles.modalTitle}>
                    Editar aluno
                  </h2>
                  <p className={styles.modalDescription}>
                    Atualize os dados e as turmas vinculadas.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setModalEdicaoAberto(false)}
                aria-label="Fechar edição"
              >
                <span
                  className="material-symbols-outlined"
                  aria-hidden="true"
                  style={{ fontSize: "20px" }}
                >
                  close
                </span>
              </button>
            </div>
            <form onSubmit={salvarEdicao} className={styles.modalForm}>
              {erroEdicao && (
                <div className={styles.alertError} role="alert">
                  {erroEdicao}
                </div>
              )}
              <div className={styles.modalField}>
                <label htmlFor="aluno-nome" className={styles.modalLabel}>
                  Nome
                </label>
                <input
                  id="aluno-nome"
                  required
                  value={formEdicao.nome}
                  onChange={(e) =>
                    setFormEdicao({ ...formEdicao, nome: e.target.value })
                  }
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.modalField}>
                <label htmlFor="aluno-email" className={styles.modalLabel}>
                  E-mail
                </label>
                <input
                  id="aluno-email"
                  type="email"
                  required
                  value={formEdicao.email}
                  onChange={(e) =>
                    setFormEdicao({ ...formEdicao, email: e.target.value })
                  }
                  className={styles.modalInput}
                />
              </div>
              <div className={styles.modalField}>
                <label htmlFor="aluno-matricula" className={styles.modalLabel}>
                  Matrícula
                </label>
                <input
                  id="aluno-matricula"
                  value={formEdicao.matricula}
                  onChange={(e) =>
                    setFormEdicao({ ...formEdicao, matricula: e.target.value })
                  }
                  className={styles.modalInput}
                />
              </div>
              <fieldset
                className={styles.turmaFieldset}
                disabled={!turmasCarregadas}
              >
                <legend className={styles.modalLabel}>Turmas</legend>
                {erroTurmas ? (
                  <p className={styles.noTurma} role="alert">
                    Não foi possível carregar as turmas: {erroTurmas}
                  </p>
                ) : !turmasCarregadas ? (
                  <p className={styles.noTurma}>Carregando turmas...</p>
                ) : turmas.length ? (
                  <div className={styles.turmaOptions}>
                    {turmas.map((turma) => (
                      <label key={turma.id} className={styles.turmaOption}>
                        <input
                          type="checkbox"
                          checked={formEdicao.turmaIds.includes(
                            String(turma.id),
                          )}
                          onChange={() => alternarTurma(turma.id)}
                        />
                        <span>{turma.nome}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className={styles.noTurma}>Nenhuma turma cadastrada.</p>
                )}
              </fieldset>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelBtn}
                  onClick={() => setModalEdicaoAberto(false)}
                  disabled={salvandoEdicao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveBtn}
                  disabled={
                    salvandoEdicao || !turmasCarregadas || Boolean(erroTurmas)
                  }
                >
                  <span
                    className="material-symbols-outlined"
                    aria-hidden="true"
                    style={{ fontSize: "18px" }}
                  >
                    {salvandoEdicao ? "hourglass_top" : "save"}
                  </span>
                  <span>
                    {salvandoEdicao ? "Salvando..." : "Salvar alterações"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
