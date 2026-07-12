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

/* ===== Estados da tela (carregando / vazio / erro) ===== */

/**
 * Mostra uma mensagem de estado na área de resultados.
 * O elemento tem aria-live="polite", então leitores de tela anunciam
 * a mudança sem roubar o foco do usuário.
 */
export function mostrarEstado(mensagem, ehErro = false) {
  const estado = document.querySelector("#estado");
  estado.textContent = mensagem;
  estado.classList.remove("estado--oculto");
  estado.classList.toggle("estado--erro", ehErro);
}

/** Esconde a mensagem de estado (usado no caminho de sucesso). */
export function ocultarEstado() {
  document.querySelector("#estado").classList.add("estado--oculto");
}

/* ===== Renderização dos resultados (DOM criado por JavaScript) ===== */

/** Atalho para criar um elemento já com classe e texto. */
function criarElemento(tag, classe = "", texto = "") {
  const elemento = document.createElement(tag);
  if (classe !== "") {
    elemento.className = classe;
  }
  if (texto !== "") {
    elemento.textContent = texto;
  }
  return elemento;
}

/** Formata o salário em reais para exibição nos cards. */
function formatarSalario(salario) {
  return salario.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Cria a lista rotulada de habilidades (encontradas ou faltantes) do card. */
function criarListaHabilidades(rotulo, habilidades) {
  const bloco = criarElemento("div", "card-vaga__detalhes");
  bloco.append(criarElemento("p", "", rotulo));

  if (habilidades.length === 0) {
    bloco.append(criarElemento("p", "", "— nenhuma —"));
    return bloco;
  }

  const lista = criarElemento("ul");
  habilidades.forEach((habilidade) => {
    lista.append(criarElemento("li", "", habilidade));
  });
  bloco.append(lista);
  return bloco;
}

// Converte a classificação do motor no sufixo da classe CSS do selo
const CLASSE_SELO = { Alta: "alta", "Média": "media", Baixa: "baixa" };

/**
 * Monta o card de uma vaga inteiramente com createElement/classList,
 * a partir do resultado calculado pelo motor.
 */
export function criarCardVaga(resultado) {
  const { vaga, percentual, classificacao, encontradas, faltantes } = resultado;

  const card = criarElemento("li", "card-vaga");
  card.append(
    criarElemento("span", `selo selo--${CLASSE_SELO[classificacao]}`, `Compatibilidade ${classificacao}`),
    criarElemento("h3", "", vaga.rotuloExibicao()),
    criarElemento("p", "card-vaga__empresa", `${vaga.modalidade} · ${formatarSalario(vaga.salario)}`),
    criarElemento("p", "card-vaga__percentual", `${percentual}%`),
    criarListaHabilidades("Você já tem:", encontradas),
    criarListaHabilidades("Falta estudar:", faltantes)
  );

  return card;
}

/** Renderiza todos os cards de vaga na lista de resultados. */
export function renderizarResultados(resultados) {
  const lista = document.querySelector("#lista-vagas");
  lista.textContent = "";
  resultados.forEach((resultado) => {
    lista.append(criarCardVaga(resultado));
  });
}

/**
 * Mostra o resumo do perfil analisado, incluindo a experiência em meses
 * (que também é usada pelo motor como critério de desempate).
 */
export function renderizarPerfilResumo(perfil) {
  const painel = criarElemento("div");
  painel.append(
    criarElemento("p", "", `Perfil analisado: ${perfil.nome} — área de ${perfil.area}`),
    criarElemento(
      "p",
      "campo__ajuda",
      `${perfil.habilidades.length} habilidade(s) informada(s) · ${perfil.experienciaMeses} mês(es) de experiência`
    )
  );

  const destino = document.querySelector("#painel-perfil");
  destino.textContent = "";
  destino.append(painel);
}

/**
 * Destaca a vaga mais compatível, a recomendação de estudo e o total de
 * análises feitas na sessão (valor vindo da closure do motor).
 */
export function renderizarDestaque(melhor, recomendacao, totalAnalises) {
  const destaque = document.querySelector("#destaque");
  destaque.textContent = "";

  if (melhor === null) {
    return;
  }

  destaque.append(
    criarElemento("h3", "", "⭐ Vaga mais compatível com seu perfil"),
    criarElemento("p", "", `${melhor.vaga.rotuloExibicao()} — ${melhor.percentual}% de compatibilidade`),
    criarElemento("p", "", recomendacao),
    criarElemento("p", "campo__ajuda", `Análises feitas nesta sessão: ${totalAnalises}`)
  );
}

/** Limpa a área de resultados antes de uma nova análise. */
export function limparResultados() {
  document.querySelector("#painel-perfil").textContent = "";
  document.querySelector("#destaque").textContent = "";
  document.querySelector("#lista-vagas").textContent = "";
}
