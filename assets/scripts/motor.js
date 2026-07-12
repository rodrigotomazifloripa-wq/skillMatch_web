// motor.js — regras de negócio do SkillMatch (sem tocar no DOM).
// Reaproveita o motor do mini-projeto: compatibilidade, classificação,
// melhor vaga e recomendação de estudo.

// Faixas de classificação em constantes nomeadas (nada de números mágicos)
const LIMITE_ALTA = 80;
const LIMITE_MEDIA = 50;

/**
 * Normaliza uma habilidade para comparação (minúsculas e sem espaços nas pontas),
 * para que "CSS " e "css" contem como a mesma habilidade.
 */
export function normalizarHabilidade(habilidade) {
  return String(habilidade).trim().toLowerCase();
}

/**
 * Classifica um percentual de compatibilidade em Alta / Média / Baixa.
 */
export function classificarPercentual(percentual) {
  if (percentual >= LIMITE_ALTA) {
    return "Alta";
  } else if (percentual >= LIMITE_MEDIA) {
    return "Média";
  }
  return "Baixa";
}

/**
 * Vaga genérica: guarda os dados do anúncio e sabe se analisar
 * contra a lista de habilidades de um candidato (o cálculo é método da classe).
 */
export class Vaga {
  constructor({ id, empresa, cargo, requisitos, salario, modalidade }) {
    this.id = id;
    this.empresa = empresa;
    this.cargo = cargo;
    this.requisitos = requisitos.map(normalizarHabilidade);
    this.salario = salario;
    this.modalidade = modalidade;
  }

  /**
   * Compara as habilidades do candidato com os requisitos desta vaga.
   * Retorna percentual, habilidades encontradas, faltantes e classificação.
   */
  analisarCandidato(habilidadesCandidato) {
    const habilidades = habilidadesCandidato.map(normalizarHabilidade);

    const encontradas = this.requisitos.filter(
      (requisito) => habilidades.includes(requisito)
    );
    const faltantes = this.requisitos.filter(
      (requisito) => !habilidades.includes(requisito)
    );

    const percentual = this.requisitos.length > 0
      ? Math.round((encontradas.length / this.requisitos.length) * 100)
      : 0;

    return {
      vaga: this,
      percentual,
      encontradas,
      faltantes,
      classificacao: classificarPercentual(percentual),
    };
  }

  /** Título mostrado no card. As subclasses podem sobrescrever. */
  rotuloExibicao() {
    return `${this.cargo} — ${this.empresa}`;
  }

  /** Vaga genérica não exige experiência mínima. */
  atendeExperiencia() {
    return true;
  }
}

/**
 * Vaga de front-end: além dos dados comuns, conhece a stack pedida e a
 * experiência mínima. Sobrescreve o rótulo (mostra a stack) e o critério
 * de experiência — é isso que justifica a herança.
 */
export class VagaFrontEnd extends Vaga {
  constructor(dados) {
    super(dados);
    this.stack = dados.stack;
    this.experienciaMinimaMeses = dados.experienciaMinimaMeses || 0;
  }

  rotuloExibicao() {
    return `${this.cargo} (${this.stack}) — ${this.empresa}`;
  }

  atendeExperiencia(experienciaMeses) {
    return experienciaMeses >= this.experienciaMinimaMeses;
  }
}

/**
 * Transforma os objetos crus vindos do JSON em instâncias das classes do motor.
 * Vagas com area "front-end" viram VagaFrontEnd; as demais, Vaga.
 */
export function criarVagas(dadosVagas) {
  return dadosVagas.map((dados) =>
    dados.area === "front-end" ? new VagaFrontEnd(dados) : new Vaga(dados)
  );
}

/**
 * Analisa todas as vagas para um candidato e devolve os resultados ordenados
 * da maior para a menor compatibilidade. Em caso de empate no percentual,
 * a experiência do candidato desempata: vagas cuja experiência mínima ele
 * atende aparecem primeiro (uso do experienciaMeses do perfil).
 *
 * `aoConcluir` é um callback opcional chamado com os resultados prontos —
 * quem chama decide o que fazer com eles (ex.: renderizar na tela).
 */
export function analisarVagas(candidato, vagas, aoConcluir) {
  const resultados = vagas.map((vaga) =>
    vaga.analisarCandidato(candidato.habilidades)
  );

  const experiencia = candidato.experienciaMeses || 0;
  resultados.sort((a, b) => {
    if (b.percentual !== a.percentual) {
      return b.percentual - a.percentual;
    }
    // Empate: quem atende a experiência mínima da vaga vem antes
    const desempateA = a.vaga.atendeExperiencia(experiencia) ? 1 : 0;
    const desempateB = b.vaga.atendeExperiencia(experiencia) ? 1 : 0;
    return desempateB - desempateA;
  });

  if (typeof aoConcluir === "function") {
    aoConcluir(resultados);
  }

  return resultados;
}

/**
 * Encontra o melhor resultado com reduce (a lista já pode estar em qualquer ordem).
 */
export function melhorResultado(resultados) {
  if (resultados.length === 0) {
    return null;
  }
  return resultados.reduce(
    (melhor, atual) => (atual.percentual > melhor.percentual ? atual : melhor)
  );
}

// Quantas vezes cada habilidade pode aparecer na recomendação de estudo
const LIMITE_HABILIDADES_RECOMENDADAS = 3;

/**
 * Gera a recomendação de estudo: conta quantas vezes cada habilidade aparece
 * como faltante entre todas as vagas (laço explícito for...of) e sugere as
 * mais frequentes — estudá-las destrava o maior número de vagas de uma vez.
 */
export function recomendarEstudo(resultados) {
  const contagemFaltantes = {};

  for (const resultado of resultados) {
    for (const habilidade of resultado.faltantes) {
      contagemFaltantes[habilidade] = (contagemFaltantes[habilidade] || 0) + 1;
    }
  }

  const maisFrequentes = Object.keys(contagemFaltantes)
    .sort((a, b) => contagemFaltantes[b] - contagemFaltantes[a])
    .slice(0, LIMITE_HABILIDADES_RECOMENDADAS);

  if (maisFrequentes.length === 0) {
    return "Seu perfil cobre todos os requisitos das vagas analisadas. Continue praticando!";
  }

  return `Estude ${maisFrequentes.join(", ")} — são as habilidades que mais aparecem como faltantes nas vagas.`;
}

/**
 * Filtra os resultados pela modalidade da vaga ("todas" não filtra nada).
 */
export function filtrarPorModalidade(resultados, modalidade) {
  if (modalidade === "todas") {
    return resultados;
  }
  return resultados.filter((resultado) => resultado.vaga.modalidade === modalidade);
}

/**
 * Reordena os resultados pelo critério escolhido pelo usuário.
 * Trabalha numa cópia para não bagunçar a ordem original por compatibilidade.
 */
export function ordenarResultados(resultados, criterio) {
  const copia = resultados.slice();

  switch (criterio) {
    case "salario":
      copia.sort((a, b) => b.vaga.salario - a.vaga.salario);
      break;
    case "empresa":
      copia.sort((a, b) => a.vaga.empresa.localeCompare(b.vaga.empresa));
      break;
    default:
      // "compatibilidade": mantém a ordem que veio de analisarVagas
      break;
  }

  return copia;
}

/**
 * Closure: `totalAnalises` fica preservada entre as chamadas da função
 * retornada, funcionando como um contador privado de análises da sessão
 * (ninguém de fora consegue alterar o valor diretamente).
 */
export function criarContadorAnalises() {
  let totalAnalises = 0;

  return function registrarAnalise() {
    totalAnalises = totalAnalises + 1;
    return totalAnalises;
  };
}
