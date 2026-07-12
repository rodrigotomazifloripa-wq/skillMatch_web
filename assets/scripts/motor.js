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
