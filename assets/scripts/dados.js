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
