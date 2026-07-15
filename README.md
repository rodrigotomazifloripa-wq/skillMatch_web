# SkillMatch Web

Aplicação web (Single Page) que compara o perfil de um candidato com vagas de
front-end júnior, calcula o percentual de compatibilidade de cada vaga, destaca
a melhor oportunidade e recomenda o que estudar em seguida.

Evolução do mini-projeto **SkillMatch JS** (motor de compatibilidade que rodava
no console), agora com interface completa: formulário, cards de vagas, filtro,
ordenação, tema claro/escuro e perfil salvo entre visitas.

## 🔗 Links

- **Repositório:** <https://github.com/rodrigotomazifloripa-wq/skillMatch_web>
- **Aplicação no ar (GitHub Pages):** <https://rodrigotomazifloripa-wq.github.io/skillMatch_web/>
- **Quadro Kanban (Trello):** <https://trello.com/b/LaTinLbc>
- **Vídeo de apresentação:** <https://drive.google.com/file/d/1dE8ySXL6QTW4LcRDbj-LYjsEJgXWJC11/view?usp=sharing>

## O problema que ele resolve

Quem está começando em front-end olha uma vaga e não sabe responder: *"estou
pronto para me candidatar? E se não estou, o que falta?"*. O SkillMatch responde
às duas perguntas: cruza as habilidades do candidato com os requisitos de cada
vaga, mostra o percentual de compatibilidade (com classificação Alta / Média /
Baixa), lista o que o candidato **já tem** e o que **falta estudar**, e ainda
recomenda as habilidades que destravam o maior número de vagas de uma vez.

## Como executar

O projeto é estático (HTML + CSS + JavaScript puro) e **não precisa de
instalação nem de back-end**. Como usa módulos ES e `fetch`, ele não funciona
abrindo o `index.html` direto pelo arquivo (`file://`) — é preciso um servidor
local:

1. Clone o repositório:
   ```bash
   git clone https://github.com/rodrigotomazifloripa-wq/skillMatch_web.git
   ```
2. Abra a pasta no VS Code.
3. Clique com o botão direito no `index.html` e escolha **"Open with Live Server"**
   (extensão Live Server instalada).
4. O navegador abre em `http://127.0.0.1:5500`.

Alternativa com npm (opcional, só conforto de desenvolvimento — a aplicação
roda sem Node):

```bash
npm run dev
```

## Fluxo de uso

```text
[ abrir a página ]
      │  (se já usou antes, o perfil volta do localStorage e a análise refaz sozinha)
      ▼
[ formulário de perfil ] → nome / área / habilidades / experiência → validação
      ▼
[ análise ] motor compara o perfil com as vagas (carregadas via fetch)
      │  "Carregando vagas…" | vazio → "Nada encontrado" | falha → erro acessível
      ▼
[ resultado ] cards responsivos (Flexbox) com % de compatibilidade,
  classificação, habilidades encontradas × faltantes
  + destaque da vaga mais compatível + recomendação de estudo
      ▼
[ persistência ] perfil e preferências (tema, ordenação) salvos para a próxima visita
```

## Estrutura do projeto

```text
skillmatch-web/
├── index.html                  # página única (HTML semântico)
├── README.md
├── package.json                # script opcional de servidor local
└── assets/
    ├── styles/
    │   └── index.style.css     # estilos mobile-first + temas claro/escuro
    ├── scripts/
    │   ├── main.js             # ponto de entrada: orquestra os módulos
    │   ├── motor.js            # REGRAS: classes, compatibilidade, recomendação
    │   ├── ui.js               # TELA: formulário, validação, render dos cards
    │   └── dados.js            # DADOS: fetch das vagas + localStorage
    ├── dados/
    │   └── vagas.json          # catálogo de vagas (carregado via fetch)
    └── img/
        ├── logo.svg            # logo (imagem informativa, alt descritivo)
        └── alvo.svg            # ícone decorativo (alt="")
```

A divisão segue a ideia **dados × regras × tela**: o `motor.js` não conhece o
DOM, o `ui.js` não faz conta e o `dados.js` é o único que fala com a rede e o
`localStorage`. O `main.js` liga tudo por `import`/`export`.

## Técnicas e tecnologias utilizadas

| Conceito | Onde está no código |
|---|---|
| Condicionais (if/else, switch, ternário) | `classificarPercentual` (if/else), `ordenarResultados` (switch), `capturarPerfil` (ternário) |
| Laço explícito | `for...of` duplo em `recomendarEstudo` (contagem de faltantes) |
| Funções e arrow functions | regras do motor e callbacks de eventos em todo o projeto |
| Métodos de array (≥3) | `map` (criarVagas, análise), `filter` (encontradas/faltantes, modalidade), `reduce` (melhor vaga), `sort`, `forEach`, `slice` |
| Objetos | perfil do candidato, vagas, contagem de habilidades |
| POO: classe, `this`, herança | `Vaga` (cálculo de compatibilidade como método) e `VagaFrontEnd extends Vaga`, que acrescenta `stack`/`experienciaMinimaMeses` e sobrescreve `rotuloExibicao` e `atendeExperiencia` |
| Callback | `analisarVagas(candidato, vagas, aoConcluir)` — quem chama decide o que fazer com os resultados |
| Closure | `criarContadorAnalises` — contador privado de análises da sessão |
| Promises / async/await | `buscarVagas` (fetch real) e `executarAnalise` |
| fetch + 3 estados | carregando / vazio / erro com `try/catch`, `response.ok` e `aria-live` |
| localStorage | perfil e preferências com `JSON.stringify`/`parse` e tratamento do `null` da primeira visita |
| HTML semântico | `header`, `nav`, `main`, `section`, `footer`, um único `h1` |
| Acessibilidade | `label/for`, `alt` informativo × decorativo, `aria-label`, `aria-live`, `aria-pressed`, foco visível, link "pular conteúdo", `lang="pt-BR"` |
| SEO on-page | `title` descritivo e `meta description` |
| CSS externo + Flexbox | layout do cabeçalho, formulário e grade de cards (`flex-wrap` + `gap`) |
| Responsividade mobile-first | unidades fluidas (`rem`, `%`, `clamp`, `min()`), `meta viewport`, media queries em 48em e 64em, mídia fluida |
| Módulos ES | `import`/`export` com `<script type="module">` |

## Decisões técnicas

- **`const` por padrão, `let` só quando reatribuo.** Quase tudo é `const`
  (elementos do DOM, funções, resultados). `let` aparece onde o valor muda de
  verdade: `totalAnalises` dentro da closure e `ultimosResultados` no
  `main.js`, que é substituído a cada análise. `var` não é usado — o escopo de
  bloco de `const`/`let` evita vazamento de variáveis para fora de `if`/`for`
  (o contador da closure é exatamente um caso em que o escopo importa: a
  variável só existe dentro da função criadora).
- **Especificidade sem `!important`.** O CSS está organizado em ordem crescente
  de especificidade (reset por elemento → classes de componente → classes de
  estado como `.campo--invalido`). Como cada regra tem um alvo claro, a cascata
  resolve os conflitos naturalmente e nenhuma regra precisou de `!important`.
- **Tema com variáveis CSS.** O tema escuro troca apenas as variáveis de cor em
  `[data-theme="escuro"]`; nenhuma outra regra é duplicada.
- **Desempate por experiência.** Quando duas vagas têm o mesmo percentual, o
  `experienciaMeses` do perfil desempata: vagas cuja experiência mínima o
  candidato atende aparecem primeiro.
- **Segurança no `localStorage`.** Só ficam salvos dados não sensíveis (nome,
  área, habilidades, preferências) — nunca senha ou token.

## Melhorias futuras

- Consumir uma API pública de vagas no lugar do `vagas.json` local.
- Usar a Geolocation API para sugerir vagas presenciais próximas.
- Permitir editar o catálogo de vagas pela própria interface.
- Testes automatizados do motor de compatibilidade.
- Paginação ou busca quando o catálogo crescer.

## 👤 Autor

**Rodrigo Tomazi** — projeto avaliativo do Módulo 01 do curso de
Desenvolvimento de Software (Front-End).
