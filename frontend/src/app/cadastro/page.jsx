"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import styles from "@/components/auth/authForm.module.css";
import { apiFetch } from "@/lib/api";

export default function CadastroPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState(1);
  const [formulario, setFormulario] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    matricula: "",
    senha: "",
    confirmarSenha: "",
  });
  const [erros, setErros] = useState({});
  const [alerta, setAlerta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [matriculaGerada, setMatriculaGerada] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [criandoConta, setCriandoConta] = useState(false);

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: "", contato: "" }));
  }

  async function enviarFormulario(event) {
    event.preventDefault();
    setAlerta("");
    const novosErros = {};

    if (!formulario.nome.trim()) novosErros.nome = "Informe seu nome completo.";
    if (!formulario.email.trim() && !formulario.cpf.trim()) {
      novosErros.contato = "Informe seu e-mail ou CPF.";
    }

    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    const body = Object.fromEntries(
      Object.entries(formulario)
        .filter(([campo]) => campo !== "matricula")
        .filter(([, valor]) => valor.trim()),
    );

    setEnviando(true);
    try {
      const resultado = await apiFetch("/api/alunos/gerar-matricula", {
        method: "POST",
        body,
      });
      setMatriculaGerada(resultado.matricula);
    } catch (error) {
      if (error.status === 400 && Array.isArray(error.errors)) {
        const errosCampos = {};
        error.errors.forEach(({ field, message }) => {
          if (["nome", "email", "cpf", "telefone"].includes(field))
            errosCampos[field] = message;
        });
        setErros(errosCampos);
      } else if (error.status === 409) {
        setAlerta("Já existe uma solicitação de matrícula para estes dados");
      } else {
        setAlerta("Não foi possível gerar a matrícula. Tente de novo.");
      }
    } finally {
      setEnviando(false);
    }
  }

  async function enviarCadastro(event) {
    event.preventDefault();
    setAlerta("");
    const novosErros = {};
    if (formulario.senha.length < 8)
      novosErros.senha = "A senha deve ter pelo menos 8 caracteres.";
    if (formulario.senha !== formulario.confirmarSenha)
      novosErros.confirmarSenha = "As senhas não coincidem.";
    setErros(novosErros);
    if (Object.keys(novosErros).length) return;

    setCriandoConta(true);
    try {
      await apiFetch("/api/alunos/cadastro", {
        method: "POST",
        body: {
          matricula: formulario.matricula,
          senha: formulario.senha,
          confirmarSenha: formulario.confirmarSenha,
        },
      });
      router.replace("/login?cadastro=ok");
    } catch (error) {
      if (error.status === 404) {
        setAlerta("Matrícula não encontrada");
      } else if (error.status === 409) {
        setAlerta("Esta matrícula já foi utilizada");
      } else if (error.status === 400 || error.status === 422) {
        const errosCampos = {};
        if (Array.isArray(error.errors)) {
          error.errors.forEach(({ field, message }) => {
            if (["matricula", "senha", "confirmarSenha"].includes(field))
              errosCampos[field] = message;
          });
        }
        if (Object.keys(errosCampos).length) setErros(errosCampos);
        else setAlerta(error.message);
      } else {
        setAlerta("Não foi possível criar a conta. Tente de novo.");
      }
    } finally {
      setCriandoConta(false);
    }
  }

  function irParaEtapaMatricula() {
    setFormulario((atual) => ({ ...atual, matricula: "" }));
    setEtapa(2);
  }

  async function copiarMatricula() {
    try {
      await navigator.clipboard.writeText(matriculaGerada);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  function campo(nome, rotulo, tipo = "text", obrigatorio = false) {
    return (
      <div className={styles.field}>
        <label className={styles.label} htmlFor={nome}>
          {rotulo}
        </label>
        <input
          className={`${styles.input} ${erros[nome] || ((nome === "email" || nome === "cpf") && erros.contato) ? styles.inputError : ""}`}
          id={nome}
          name={nome}
          type={tipo}
          placeholder={
            nome === "nome"
              ? "Seu nome completo"
              : nome === "email"
                ? "voce@exemplo.com"
                : nome === "cpf"
                  ? "000.000.000-00"
                  : nome === "telefone"
                    ? "(00) 00000-0000"
                    : nome === "matricula"
                      ? "MAT-XXXXX"
                      : nome === "senha"
                        ? "Digite sua senha"
                        : "Confirme sua senha"
          }
          value={formulario[nome]}
          onChange={atualizarCampo}
          required={obrigatorio}
          aria-invalid={Boolean(
            erros[nome] ||
            ((nome === "email" || nome === "cpf") && erros.contato),
          )}
        />
        {erros[nome] && (
          <span className={styles.fieldError}>{erros[nome]}</span>
        )}
        {(nome === "email" || nome === "cpf") && erros.contato && (
          <span className={styles.fieldError}>{erros.contato}</span>
        )}
      </div>
    );
  }

  return (
    <AuthLayout
      title="Criar conta"
      subtitle="Você precisa de uma matrícula para entrar"
    >
      <Link className={styles.backHome} href="/login">
        <span aria-hidden="true">←</span> Voltar para login
      </Link>
      <div className={styles.stepper}>
        <span className={etapa === 1 ? styles.stepActive : ""}>
          1. Gerar matrícula
        </span>
        <span className={etapa === 2 ? styles.stepActive : ""}>
          2. Criar senha
        </span>
      </div>
      {alerta && (
        <p className={styles.alert} role="alert">
          {alerta}
        </p>
      )}
      {etapa === 1 ? (
        <>
          {matriculaGerada ? (
            <div className={styles.generatedEnrollment}>
              <p>Matrícula gerada:</p>
              <strong className={styles.generatedNumber}>
                {matriculaGerada}
              </strong>
              <p>Guarde esta matrícula: ela é o seu login.</p>
              <div className={styles.buttonGroup}>
                <button
                  className={styles.button}
                  type="button"
                  onClick={copiarMatricula}
                >
                  {copiado ? "Matrícula copiada" : "Copiar matrícula"}
                </button>
                <button
                  className={styles.button}
                  type="button"
                  onClick={() => {
                    setFormulario((atual) => ({
                      ...atual,
                      matricula: matriculaGerada,
                    }));
                    setEtapa(2);
                  }}
                >
                  Continuar
                </button>
                <button
                  className={styles.linkButton}
                  type="button"
                  onClick={() => {
                    setMatriculaGerada("");
                    setCopiado(false);
                    setEtapa(1);
                  }}
                >
                  Voltar e corrigir os dados
                </button>
              </div>
            </div>
          ) : (
            <>
              <form
                className={styles.form}
                onSubmit={enviarFormulario}
                noValidate
              >
                {campo("nome", "Nome completo", "text", true)}
                {campo("email", "E-mail", "email")}
                {campo("cpf", "CPF")}
                {campo("telefone", "Telefone (opcional)", "tel")}
                <button
                  className={styles.button}
                  type="submit"
                  disabled={enviando}
                >
                  {enviando ? "Gerando" : "Gerar matrícula"}
                </button>
              </form>
              <p className={styles.linkRow}>
                Você já é matriculado?{" "}
                <button
                  className={styles.linkButton}
                  type="button"
                  onClick={irParaEtapaMatricula}
                >
                  Já tenho matrícula
                </button>
              </p>
            </>
          )}
        </>
      ) : (
        <form className={styles.form} onSubmit={enviarCadastro} noValidate>
          {campo("matricula", "Matrícula")}
          {campo("senha", "Senha", "password", true)}
          {campo("confirmarSenha", "Confirmar senha", "password", true)}
          <button
            className={styles.button}
            type="submit"
            disabled={criandoConta}
          >
            {criandoConta ? "Criando conta" : "Criar conta"}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
