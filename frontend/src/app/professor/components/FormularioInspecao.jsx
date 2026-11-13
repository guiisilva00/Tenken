"use client";

import { useState } from "react";
import styles from "./FormularioInspecao.module.css";

export default function FormularioInspecao({ etapa, checklist = [], onSubmit, onCancel, salvando: salvandoPai = false }) {
  const [answers, setAnswers] = useState({});
  const [fotos, setFotos] = useState({});
  const [observacoes, setObs] = useState("");
  const [chamadoDescricao, setChamadoDescricao] = useState("");
  const [chamadoSeveridade, setChamadoSeveridade] = useState("ALTA");
  const [erro, setErro] = useState("");
  const [busy, setBusy] = useState(false);
  const respondidos = checklist.filter((i) => typeof answers[i.id] === "boolean").length;
  const progresso = checklist.length ? Math.round((respondidos / checklist.length) * 100) : 0;
  const salvando = busy || salvandoPai;
  const reprovada = checklist.some((item) => item.critico && answers[item.id] === false);

  async function enviar(e) {
    e.preventDefault();
    setErro("");
    if (!checklist.length) { setErro("Este checklist não possui itens para responder."); return; }
    if (checklist.some((i) => typeof answers[i.id] !== "boolean")) { setErro("Responda todos os itens antes de concluir."); return; }
    if (reprovada && !chamadoDescricao.trim()) { setErro("Descreva o problema para abrir o chamado."); return; }
    setBusy(true);
    try {
      const resposta = await onSubmit({
        respostas: checklist.map((i) => ({ itemId: i.id, conforme: answers[i.id], foto: fotos[i.id] || null })),
        observacoes: observacoes.trim(),
        chamadoDescricao: chamadoDescricao.trim(),
        chamadoSeveridade,
      });
      if (!resposta?.ok) setErro(resposta?.message || "Não foi possível salvar a inspeção.");
    } catch (e) { setErro(e.message || "Não foi possível salvar a inspeção."); }
    finally { setBusy(false); }
  }

  return <form className={styles.formulario} onSubmit={enviar}>
    <section className={styles.progresso} aria-live="polite">
      <div className={styles.progressoInfo}><div><span>PROGRESSO DO CHECKLIST</span><strong>{etapa === "PRE_USO" ? "Vistoria pré-uso" : "Vistoria pós-uso"}</strong></div><b>{respondidos} / {checklist.length}</b></div>
      <div className={styles.trilho} role="progressbar" aria-label="Itens respondidos" aria-valuenow={respondidos} aria-valuemin={0} aria-valuemax={checklist.length}><span style={{ width: `${progresso}%` }} /></div>
      <p>{progresso === 100 ? "Todos os itens respondidos. Confira as informações antes de concluir." : `Faltam ${checklist.length - respondidos} ${checklist.length - respondidos === 1 ? "item" : "itens"} para concluir.`}</p>
    </section>
    <fieldset className={styles.listaItens}>
      <legend>Itens de verificação <span>{checklist.length} itens</span></legend>
      {checklist.map((i, n) => {
        const value = answers[i.id];
        const falha = value === false;
        return <article key={i.id} className={`${styles.item} ${value === true ? styles.itemOk : ""} ${falha ? styles.itemFalha : ""} ${falha && i.critico ? styles.itemCritico : ""}`}>
          <div className={styles.enunciado}><span className={styles.numero}>{String(n + 1).padStart(2, "0")}</span><div><p className={styles.categoria}>{i.critico ? "ITEM CRÍTICO" : "VERIFICAÇÃO"}</p><h2>{i.texto}</h2>{i.critico && <small>Uma falha neste item reprova a inspeção e bloqueia o equipamento.</small>}</div></div>
          <div className={styles.opcoes} role="group" aria-label={`Resposta para ${i.texto}`}>
            <label className={value === true ? styles.selecionado : ""}><input type="radio" name={`item-${i.id}`} checked={value === true} onChange={() => setAnswers((a) => ({ ...a, [i.id]: true }))} />Conforme</label>
            <label className={value === false ? styles.selecionadoFalha : ""}><input type="radio" name={`item-${i.id}`} checked={value === false} onChange={() => setAnswers((a) => ({ ...a, [i.id]: false }))} />Não conforme</label>
          </div>
          <label className={styles.campoFoto}>
            <span>Foto de evidência <small>OPCIONAL · JPEG, PNG OU WEBP · MÁX. 2 MB</small></span>
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={salvando} onChange={(evento) => setFotos((atuais) => ({ ...atuais, [i.id]: evento.target.files?.[0] || null }))} />
            {fotos[i.id] && <span className={styles.nomeFoto}>{fotos[i.id].name}</span>}
          </label>
        </article>;
      })}
    </fieldset>
    <label className={styles.campoObservacao}><span>Observações gerais <small>OPCIONAL</small></span><textarea rows={4} value={observacoes} onChange={(e) => setObs(e.target.value)} placeholder="Registre informações adicionais desta inspeção." /></label>
    {reprovada && <section className={styles.painelChamado} aria-labelledby="titulo-chamado-inspecao">
      <div><p className={styles.chamadoEyebrow}>INSPEÇÃO REPROVADA</p><h2 id="titulo-chamado-inspecao">Abrir chamado</h2><p>O equipamento e os dados desta inspeção serão vinculados automaticamente. Será criado um único chamado para esta inspeção.</p></div>
      <label className={styles.campoObservacao}><span>Descrição do problema <small>OBRIGATÓRIA</small></span><textarea rows={4} required maxLength={5000} value={chamadoDescricao} onChange={(e) => setChamadoDescricao(e.target.value)} placeholder="Descreva o problema identificado e o que precisa de atenção." /></label>
      <label className={styles.campoPrioridade}><span>Prioridade</span><select value={chamadoSeveridade} onChange={(e) => setChamadoSeveridade(e.target.value)}><option value="BAIXA">Baixa</option><option value="MEDIA">Média</option><option value="ALTA">Alta</option><option value="CRITICA">Crítica</option></select></label>
    </section>}
    {erro && <p className={styles.erro} role="alert">{erro}</p>}
    <div className={styles.acoes}><p>Ao concluir, o resultado será registrado e aplicado ao equipamento.</p><div><button type="button" onClick={onCancel} disabled={salvando}>Cancelar</button><button className={styles.salvar} type="submit" disabled={salvando || !checklist.length}>{salvando ? "Salvando…" : reprovada ? "Abrir chamado e concluir" : "Concluir inspeção →"}</button></div></div>
  </form>;
}
