// main.js — ponto de entrada: liga os módulos (motor, ui, dados)
// e controla o fluxo da aplicação.

import {
  capturarPerfil,
  validarPerfil,
  exibirErros,
  limparErros,
  preencherFormulario,
} from "./ui.js";
import { salvarPerfil, carregarPerfil, limparPerfil } from "./dados.js";

const formulario = document.querySelector("#formulario-perfil");
const botaoLimpar = document.querySelector("#botao-limpar");

// Envio do formulário: valida e persiste o perfil
formulario.addEventListener("submit", (evento) => {
  // Impede o recarregamento padrão da página (SPA)
  evento.preventDefault();
  limparErros();

  const perfil = capturarPerfil();
  const erros = validarPerfil(perfil);

  if (erros.length > 0) {
    exibirErros(erros);
    return;
  }

  salvarPerfil(perfil);
});

// Botão "Limpar perfil salvo": apaga do localStorage e reseta o formulário
botaoLimpar.addEventListener("click", () => {
  limparPerfil();
  formulario.reset();
  limparErros();
});

// Na abertura da página, recupera o perfil salvo (null na primeira visita)
const perfilSalvo = carregarPerfil();
if (perfilSalvo !== null) {
  preencherFormulario(perfilSalvo);
}
