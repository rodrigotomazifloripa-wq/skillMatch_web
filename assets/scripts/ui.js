// ui.js — camada de tela: captura e validação do formulário,
// mensagens de erro acessíveis e preenchimento do perfil salvo.

/**
 * Lê os campos do formulário e monta o objeto de perfil do candidato.
 * As habilidades chegam como texto separado por vírgula e viram um array
 * já normalizado (sem espaços extras e em minúsculas).
 */
export function capturarPerfil() {
  const nome = document.querySelector("#campo-nome").value.trim();
  const area = document.querySelector("#campo-area").value;
  const textoHabilidades = document.querySelector("#campo-habilidades").value;
  const textoExperiencia = document.querySelector("#campo-experiencia").value;

  const habilidades = textoHabilidades
    .split(",")
    .map((habilidade) => habilidade.trim().toLowerCase())
    .filter((habilidade) => habilidade !== "");

  // Campo opcional: vazio ou inválido vira 0 meses de experiência
  const numeroExperiencia = Number(textoExperiencia);
  const experienciaMeses =
    textoExperiencia === "" || Number.isNaN(numeroExperiencia) || numeroExperiencia < 0
      ? 0
      : numeroExperiencia;

  return { nome, area, habilidades, experienciaMeses };
}

/**
 * Valida o perfil e devolve uma lista de erros { campo, mensagem }.
 * Lista vazia significa perfil válido.
 */
export function validarPerfil(perfil) {
  const erros = [];

  if (perfil.nome === "") {
    erros.push({ campo: "nome", mensagem: "Informe seu nome." });
  }

  if (perfil.area === "") {
    erros.push({ campo: "area", mensagem: "Selecione uma área de interesse." });
  }

  if (perfil.habilidades.length === 0) {
    erros.push({
      campo: "habilidades",
      mensagem: "Informe pelo menos uma habilidade, separando por vírgula.",
    });
  }

  return erros;
}

/**
 * Mostra os erros de validação: o JavaScript marca o campo e escreve a
 * mensagem no <span> ligado ao input por aria-describedby; o CSS pinta.
 * O foco vai para o primeiro campo inválido (feedback acessível).
 */
export function exibirErros(erros) {
  limparErros();

  erros.forEach((erro, indice) => {
    const campoEntrada = document.querySelector(`#campo-${erro.campo}`);
    const mensagemErro = document.querySelector(`#erro-${erro.campo}`);

    campoEntrada.closest(".campo").classList.add("campo--invalido");
    campoEntrada.setAttribute("aria-invalid", "true");
    mensagemErro.textContent = erro.mensagem;

    if (indice === 0) {
      campoEntrada.focus();
    }
  });
}

/** Remove todas as marcações de erro do formulário. */
export function limparErros() {
  document.querySelectorAll(".campo--invalido").forEach((campo) => {
    campo.classList.remove("campo--invalido");
  });
  document.querySelectorAll("[aria-invalid]").forEach((entrada) => {
    entrada.removeAttribute("aria-invalid");
  });
  document.querySelectorAll(".mensagem-erro").forEach((mensagem) => {
    mensagem.textContent = "";
  });
}

/**
 * Preenche o formulário com um perfil vindo do localStorage,
 * para o usuário não digitar tudo de novo a cada visita.
 */
export function preencherFormulario(perfil) {
  document.querySelector("#campo-nome").value = perfil.nome;
  document.querySelector("#campo-area").value = perfil.area;
  document.querySelector("#campo-habilidades").value = perfil.habilidades.join(", ");
  document.querySelector("#campo-experiencia").value =
    perfil.experienciaMeses > 0 ? perfil.experienciaMeses : "";
}
