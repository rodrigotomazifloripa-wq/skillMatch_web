// main.js — ponto de entrada: liga os módulos (motor, ui, dados)
// e controla o fluxo da aplicação.

import {
  criarVagas,
  analisarVagas,
  melhorResultado,
  recomendarEstudo,
  criarContadorAnalises,
  filtrarPorModalidade,
  ordenarResultados,
} from "./motor.js";
import {
  buscarVagas,
  salvarPerfil,
  carregarPerfil,
  limparPerfil,
  salvarPreferencia,
  carregarPreferencias,
} from "./dados.js";
import {
  capturarPerfil,
  validarPerfil,
  exibirErros,
  limparErros,
  preencherFormulario,
  mostrarEstado,
  ocultarEstado,
  renderizarResultados,
  renderizarPerfilResumo,
  renderizarDestaque,
  limparResultados,
} from "./ui.js";

const MENSAGEM_INICIAL =
  "Preencha o formulário acima e clique em “Analisar compatibilidade” para ver as vagas.";

const formulario = document.querySelector("#formulario-perfil");
const botaoLimpar = document.querySelector("#botao-limpar");
const seletorModalidade = document.querySelector("#filtro-modalidade");
const seletorOrdenacao = document.querySelector("#ordenacao");

// Closure do motor: o total de análises fica preservado entre as chamadas
const registrarAnalise = criarContadorAnalises();

// Guarda a última análise para reaplicar filtro/ordenação sem novo fetch
let ultimosResultados = [];

/**
 * Aplica o filtro de modalidade e a ordenação escolhida sobre a última
 * análise e renderiza. Se o filtro não deixar nenhuma vaga, mostra o
 * estado de "nada encontrado".
 */
function renderizarComFiltros() {
  const filtrados = filtrarPorModalidade(ultimosResultados, seletorModalidade.value);
  const ordenados = ordenarResultados(filtrados, seletorOrdenacao.value);

  if (ultimosResultados.length > 0 && ordenados.length === 0) {
    mostrarEstado("Nada encontrado para essa modalidade. Tente outro filtro.");
  } else if (ultimosResultados.length > 0) {
    ocultarEstado();
  }

  renderizarResultados(ordenados);
}

/**
 * Fluxo completo da análise, tratando os três estados da tela:
 * carregando (feedback imediato), vazio (catálogo sem vagas) e
 * erro (falha de rede) — o sucesso renderiza os resultados.
 */
async function executarAnalise(perfil) {
  limparResultados();
  mostrarEstado("Carregando vagas…");

  try {
    const dadosVagas = await buscarVagas();
    const vagas = criarVagas(dadosVagas);

    if (vagas.length === 0) {
      mostrarEstado("Nada encontrado: o catálogo de vagas está vazio no momento.");
      return;
    }

    // O callback recebe os resultados prontos e cuida da renderização
    analisarVagas(perfil, vagas, (resultados) => {
      const totalAnalises = registrarAnalise();
      ultimosResultados = resultados;
      ocultarEstado();
      renderizarPerfilResumo(perfil);
      // O destaque considera TODAS as vagas, independentemente do filtro
      renderizarDestaque(melhorResultado(resultados), recomendarEstudo(resultados), totalAnalises);
      renderizarComFiltros();
    });
  } catch (erro) {
    console.error("Falha ao carregar as vagas:", erro);
    mostrarEstado(
      "Não foi possível carregar as vagas. Verifique sua conexão e tente novamente.",
      true
    );
  }
}

// Envio do formulário: valida, persiste o perfil e dispara a análise
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
  executarAnalise(perfil);
});

// Botão "Limpar perfil salvo": apaga do localStorage e reseta a tela
botaoLimpar.addEventListener("click", () => {
  limparPerfil();
  formulario.reset();
  limparErros();
  limparResultados();
  ultimosResultados = [];
  mostrarEstado(MENSAGEM_INICIAL);
});

// Filtro e ordenação reagem na hora, sem precisar reenviar o formulário
seletorModalidade.addEventListener("change", renderizarComFiltros);

seletorOrdenacao.addEventListener("change", () => {
  // A ordenação escolhida é uma preferência do usuário: fica salva
  salvarPreferencia("ordenacao", seletorOrdenacao.value);
  renderizarComFiltros();
});

// Restaura a preferência de ordenação salva em visitas anteriores
const preferencias = carregarPreferencias();
if (preferencias.ordenacao) {
  seletorOrdenacao.value = preferencias.ordenacao;
}

// Na abertura da página, recupera o perfil salvo (null na primeira visita)
// e, se existir, já refaz a análise automaticamente
const perfilSalvo = carregarPerfil();
if (perfilSalvo !== null) {
  preencherFormulario(perfilSalvo);
  executarAnalise(perfilSalvo);
}
