// dados.js — camada de dados: busca das vagas na rede (fetch)
// e persistência local do perfil (localStorage).

// Caminho relativo à página (index.html), não a este arquivo .js
const URL_VAGAS = "./assets/dados/vagas.json";

/**
 * Busca o catálogo de vagas com fetch + async/await.
 * Lança um erro quando a resposta não é OK (ex.: arquivo não encontrado),
 * para que quem chamou trate o estado de erro na tela.
 */
export async function buscarVagas() {
  const resposta = await fetch(URL_VAGAS);

  if (!resposta.ok) {
    throw new Error(`Não foi possível carregar as vagas (HTTP ${resposta.status}).`);
  }

  return resposta.json();
}

// Chaves com prefixo para não colidir com outros dados do mesmo domínio.
// Fronteira de segurança: aqui só ficam dados NÃO sensíveis (nada de senha/token).
const CHAVE_PERFIL = "skillmatch:perfil";
const CHAVE_PREFERENCIAS = "skillmatch:preferencias";

/**
 * Salva o perfil do candidato para a próxima visita.
 * Objetos precisam virar texto antes de ir para o localStorage (JSON.stringify).
 */
export function salvarPerfil(perfil) {
  localStorage.setItem(CHAVE_PERFIL, JSON.stringify(perfil));
}

/**
 * Recupera o perfil salvo. Na primeira visita o getItem devolve null,
 * então devolvemos null explicitamente para quem chamou tratar esse caso.
 */
export function carregarPerfil() {
  const textoSalvo = localStorage.getItem(CHAVE_PERFIL);

  if (textoSalvo === null) {
    return null;
  }

  try {
    return JSON.parse(textoSalvo);
  } catch (erro) {
    // Dado corrompido no armazenamento: descarta e recomeça do zero
    console.error("Perfil salvo em formato inválido, descartando:", erro);
    localStorage.removeItem(CHAVE_PERFIL);
    return null;
  }
}

/** Remove o perfil salvo (botão "Limpar perfil salvo"). */
export function limparPerfil() {
  localStorage.removeItem(CHAVE_PERFIL);
}

/**
 * Salva preferências de uso da interface (ex.: tema e ordenação escolhida).
 * Mescla com as preferências já existentes para não apagar as demais.
 */
export function salvarPreferencia(nome, valor) {
  const preferencias = carregarPreferencias();
  preferencias[nome] = valor;
  localStorage.setItem(CHAVE_PREFERENCIAS, JSON.stringify(preferencias));
}

/** Recupera as preferências salvas ({} na primeira visita). */
export function carregarPreferencias() {
  const textoSalvo = localStorage.getItem(CHAVE_PREFERENCIAS);

  if (textoSalvo === null) {
    return {};
  }

  try {
    return JSON.parse(textoSalvo);
  } catch (erro) {
    console.error("Preferências salvas em formato inválido, descartando:", erro);
    localStorage.removeItem(CHAVE_PREFERENCIAS);
    return {};
  }
}
