// main.js — ponto de entrada: liga os módulos (motor, ui, dados)
// e controla o fluxo da aplicação.

import {
  criarVagas,
  analisarVagas,
  melhorResultado,
  recomendarEstudo,
  criarContadorAnalises,
} from "./motor.js";
import {
  buscarVagas,
  salvarPerfil,
  carregarPerfil,
  limparPerfil,
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

// Closure do motor: o total de análises fica preservado entre as chamadas
const registrarAnalise = criarContadorAnalises();

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
      ocultarEstado();
      renderizarPerfilResumo(perfil);
      renderizarDestaque(melhorResultado(resultados), recomendarEstudo(resultados), totalAnalises);
      renderizarResultados(resultados);
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
  mostrarEstado(MENSAGEM_INICIAL);
});

// Na abertura da página, recupera o perfil salvo (null na primeira visita)
// e, se existir, já refaz a análise automaticamente
const perfilSalvo = carregarPerfil();
if (perfilSalvo !== null) {
  preencherFormulario(perfilSalvo);
  executarAnalise(perfilSalvo);
}
