import { apiFetch } from "@/lib/api";
export async function listarTurmas(){return (await apiFetch("/api/turmas"))?.dados??[];}
export async function listarEquipamentos(){const r=await apiFetch("/api/equipamentos?limite=100");return (r?.dados??[]).map(x=>({...x,patrimonio:x.codigo_patrimonio}));}
export async function listarAgendamentos(){return (await apiFetch("/api/agendamentos"))?.dados??[];}
export async function criarAgendamento(formulario){return (await apiFetch("/api/agendamentos",{method:"POST",body:formulario}))?.dados;}
export async function cancelarAgendamento(id){return apiFetch(`/api/agendamentos/${id}/cancelar`,{method:"PATCH"});}
export async function listarInspecoes(){return (await apiFetch("/api/inspecoes"))?.dados??[];}
export async function listarChamadosProfessor(situacao){const query=situacao?`?situacao=${encodeURIComponent(situacao)}`:"";return (await apiFetch(`/api/chamados/professor${query}`))?.dados??[];}
export async function abrirChamadoInspecao(id,dados){return (await apiFetch(`/api/inspecoes/${id}/chamado`,{method:"POST",body:dados}))?.dados;}
export async function buscarRespostasInspecao(id){return (await apiFetch(`/api/inspecoes/${id}/respostas`))?.dados??[];}
export async function registrarInspecao(dados){
  const respostas = (dados.respostas || []).map(({ foto, ...resposta }) => resposta);
  const fotos = (dados.respostas || []).filter((resposta) => typeof File !== "undefined" && resposta.foto instanceof File);
  if (!fotos.length) {
    return (await apiFetch("/api/inspecoes",{method:"POST",body:{...dados,respostas}}))?.dados;
  }

  const formulario = new FormData();
  formulario.append("dados", JSON.stringify({...dados,respostas}));
  for (const resposta of fotos) formulario.append(`foto_${resposta.itemId}`, resposta.foto);
  return (await apiFetch("/api/inspecoes",{method:"POST",body:formulario}))?.dados;
}

export function urlEvidencia(caminho){
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");
  return `${apiUrl.replace(/\/api$/, "")}${caminho}`;
}
