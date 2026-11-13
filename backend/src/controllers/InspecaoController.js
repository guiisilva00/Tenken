import * as Service from "../services/InspecaoService.js";
import { unlink } from "node:fs/promises";

export async function listar(req,res,next){try{return res.json({sucesso:true,dados:await Service.listar(Number(req.usuario.id))});}catch(e){return next(e);}}
export async function buscarRespostas(req,res,next){try{return res.json({sucesso:true,dados:await Service.buscarRespostas(req.params.id,Number(req.usuario.id))});}catch(e){return next(e);}}
export async function registrar(req,res,next){
  let dados = req.body;
  if (typeof req.body?.dados === "string") {
    try {
      dados = JSON.parse(req.body.dados);
    } catch {
      await removerArquivos(req.files);
      return res.status(400).json({ sucesso: false, mensagem: "Os dados da inspeÃ§Ã£o sÃ£o invÃ¡lidos." });
    }
  }

  try {
    return res.status(201).json({sucesso:true,dados:await Service.registrar(dados,req.usuario,req.files || [])});
  } catch(e) {
    await removerArquivos(req.files);
    return next(e);
  }
}
export async function abrirChamado(req,res,next){try{return res.status(201).json({sucesso:true,dados:await Service.abrirChamadoDeInspecao(req.params.id,req.body,req.usuario)});}catch(e){return next(e);}}

async function removerArquivos(arquivos = []) {
  await Promise.all(arquivos.map((arquivo) => unlink(arquivo.path).catch(() => {})));
}
