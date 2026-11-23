# Refatoração JR do Corte — contrato, auditoria e evidências

## Autoridade e baseline
Pedido fornecido por Sara em 22/11/2026. Fonte: repositório Saraingridsousa/LandingPage_Barbearia, commit `9822f22508b9841a980b3b3bb6c51cafd3d4ab3b`. Clone limpo em `C:/Users/sarai/Projects/LandingPage_Barbearia`; branch `refactor/landing-page-v2`. Sem push, merge ou deploy autorizado. HTML/CSS/JS puro, marca e conteúdo real preservados. Dependências adicionadas somente para testes locais.

## Auditoria integral antes de editar produção
24 arquivos versionados inspecionados: HTML, README, JavaScript, sete folhas CSS, 12 SVGs e duas imagens raster. Metadados, hashes e estrutura XML dos SVGs examinados; imagens incorporadas serão renderizadas para otimização, mantendo originais.
- WhatsApp: CTAs usam `553299827807`; rodapé usa `5532999827807` e texto `(32) 99982-7807`. Não há prova de titularidade; nenhuma variante será presumida correta.
- A única imagem chamada depoimento é uma captura de downloads do WhatsApp, sem texto de avaliação legível ou autor. Repetida três vezes; carrossel faz clones extras e autoplay sem pausa por teclado.
- Menu móvel sem nome acessível, aria-controls/expanded ou Escape; logo usa href inválido em img.
- Hero absoluto em telas pequenas; content-box em Sobre; larguras mínimas, espaçamentos por br, mapa sem título; risco de overflow/sobreposição.
- Sete CSS com regras duplicadas/inativas; arquivo `depoismentos.css` incorreto; jQuery usado apenas em menu/carrossel; Font Awesome apenas para poucos ícones.
- Sem descrição SEO, canonical, OG, dados estruturados, testes ou instruções atuais.
- SVGs são wrappers raster base64 grandes; variantes de capa e Minicurso não referenciados no runtime, mas serão mantidos como fontes originais.
- Biografia cita idade de 17 anos, sem data: preservar literalmente, solicitar atualização ao proprietário.

## Decisões aceitas para esta implementação segura
D01: Contato centralizado em JSON não executável no HTML. WhatsApp null até confirmação. CTAs levam a #contato; Instagram original é caminho alternativo explícito. Ao preencher número confirmado, JS gera wa.me com mensagem encodeURIComponent. Não enviar mensagens automaticamente.
D02: Remover carrossel, não evidência original. Seção Depoimentos informa ausência de avaliações publicáveis; captura permanece no acervo, fora da vitrine. Nenhuma avaliação, estrela ou autor inventado.
D03: Endereço preservado conforme texto e embed concordantes do próprio repositório: Rua Vieira Pinto, 44, Centro, Lima Duarte, MG. Isso é verificação na fonte fornecida, não confirmação independente da operação atual.
D04: Preservar preto, carvão, dourado #FFB430, logo e famílias Montserrat/MedievalSharp. Superfície Decide/Learn: hero editorial dividido, serviços visuais, biografia e localização. Sem estética SaaS ou fotos externas.
D05: Gerar WebP das composições SVG pelo navegador; originais intactos. Fontes locais WOFF2 quando download autorizado publicamente funcionar, com fallback e swap.

## Critérios rastreáveis
| ID | Aceitação observável | Arquivos / evidência prevista |
|---|---|---|
| NAV | Logo funcional; menu nomeado, Enter/Espaço, Escape, fechar ao navegar/sair/redimensionar | index.html, script.js, tests/site.spec.cjs |
| CONTACT | Nenhum número presumido; fallback útil; configuração confirmada gera mensagem codificada uniforme | index.html, script.js, tests/site.spec.cjs |
| CONTENT | Seis serviços e biografia reais; sem depoimentos fictícios/duplicados | index.html, tests/site.spec.cjs |
| UI | Sem overflow/sobreposição em 320,375,390,430,768,1024,1440; alvos >=44px | CSS, testes e screenshots |
| A11Y | Sem violações automatizadas WCAG2/2.1/2.2 AA; foco e movimento reduzido; sem JS continua navegável | testes axe/teclado |
| SEO | H1 único, descrição, canonical, OG e JSON-LD sem dados inventados | HTML e testes |
| PERF | Imagens dimensionadas/otimizadas; fontes swap; sem jQuery/Font Awesome; Lighthouse real | assets e evidence/ |
| LINKS | Arquivos/âncoras locais válidos e compatibilidade com prefixo Pages; externos inspecionados sem enviar contato | testes e relatório |
| DOCS | README atualizado; resultados, limitações e arquivos registrados | README, este contrato |

## Pendências do cliente
Confirmar WhatsApp correto e titularidade, atualidade do endereço, idade/biografia e enviar avaliações autênticas com autorização de publicação. Validar preços e horários apenas se forem fornecidos; não adicionados.

## Estado da entrega local
Implementação segura concluída e validada, sem publicação do site. **Registro da entrega inicial, anterior à autorização de commit/push:** HEAD estava no baseline, com alterações locais na branch `refactor/landing-page-v2`, sem novos commits. Naquela verificação, o remoto `main` permanecia em `9822f22508b9841a980b3b3bb6c51cafd3d4ab3b` e a branch de refatoração ainda não existia no remoto. Não houve merge, deploy ou envio de mensagens.

**Autorização posterior de Sara:** criar commit e fazer push da implementação. Escopo aplicado: somente `refactor/landing-page-v2`, sem integração à `main`, force-push ou deploy. O hash remoto deve ser relido após o envio; a autorização de push não resolve as pendências comerciais abaixo.

### Problemas corrigidos e arquivos de produção
- `index.html`: semântica, link real no logo, skip link, landmarks, títulos, metadados, OG/canonical/JSON-LD, CTAs centralizados, layout por seções, mapa preservado com título e rotas, seis serviços e conteúdo existente. Todo espaçamento por br foi removido. Capture de downloads excluída da vitrine, não do acervo.
- `src/javascript/script.js`: jQuery e carrossel substituídos por menu nativo e geração dos links; teclado, foco, Escape, saída/redimensionamento; rejeição de JSON malformado, null, arrays e números/formato inválidos. Nenhum envio automático.
- `src/styles/styles.css`, `header.css`, `home.css`, `servicos.css`, `sobre.css`, `footer.css`: tokens, grid mobile-first, espaçamento, foco e movimento reduzido. Mantidos dourado #FFB430 e cartões #C2872A; ícones pretos preservados com contraste no fundo dourado. Tipografia original local.
- `src/styles/depoimentos.css`: nome corrigido; `depoismentos.css` removido, referências atualizadas e carrossel obsoleto eliminado.
- `src/imagens/optimized/`: 11 WebP e manifesto. Seleção comparável de nove imagens: 1.825.992 para 247.184 bytes (86,46% menor); esse comparativo é de arquivos, não tráfego medido nem velocidade garantida. Os 14 arquivos originais de imagem têm hashes preservados.
- `src/fonts/`: duas WOFF2, licenças OFL e proveniência. Montserrat declarado corretamente em 400–800.
- `scripts/`, `tests/`, `package.json`, `package-lock.json`, `playwright.config.cjs`, `.gitignore`: ferramentas locais, sem dependências em runtime.
- `README.md`, este documento e `evidence/`: instruções, decisões, evidências e capturas. Lista exata de alterações em `evidence/changed-files.json`.

### Validação realmente executada
Os logs foram preservados integralmente em `evidence/logs/`; resultados finais em JSON e imagens ficam em `evidence/`.

| Verificação | Resultado observado | Evidência |
|---|---|---|
| `npm test` | Exit 0; 24 aprovados, zero falhas, pulados ou flaky | `evidence/playwright-results.json`, `logs/evidence-validation-final.log` |
| Responsividade | 320, 375, 390, 430, 768, 1024 e 1440px; sem overflow horizontal, imagens quebradas, sobreposição entre seções ou alvos visíveis menores que 44px | `tests/validation.spec.cjs`, sete screenshots |
| Acessibilidade | Axe sem violações nas regras WCAG A/AA selecionadas nas sete larguras e com menu móvel aberto; navegação só por teclado, foco no destino, Escape, movimento reduzido e fallback sem JS aprovados | testes site/validation/review |
| HTML | `npm run check:html`: exit 0 | `logs/evidence-html-final.log` |
| JavaScript | `npm run check:js`: exit 0 | `logs/evidence-js-final.log` |
| Links locais / Pages | Âncoras e recursos locais 200; prefixo `/LandingPage_Barbearia/` exercitado; links externos nova aba com rel seguro | teste de links |
| Links externos | Quatro destinos HTTP 200: demo existente, Instagram, rotas e embed Google Maps; nenhum envio de contato | `evidence/external-links.json` |
| Dependências finais | `npm audit`: exit 0, zero vulnerabilidades | `logs/evidence-npm-audit-final.json` |
| Preservação de imagens | 14 hashes originais idênticos; 11 WebP decodificados com dimensões conferidas | manifesto e verificação Python/Pillow |
| Git | `git diff --check`: exit 0; branch e remoto lidos | relatório de verificação local |

### Lighthouse de laboratório
Executado no site local com Lighthouse 12.6.1 e Chromium, perfil mobile padrão e configuração desktop própria do Lighthouse. Resumo final em `evidence/lighthouse-summary.json`; resultados brutos também foram preservados localmente (ignorados no Git).

| Perfil | Performance | Acessibilidade | Boas práticas | SEO | LCP | CLS | TBT |
|---|---:|---:|---:|---:|---:|---:|---:|
| Mobile | 98 | 100 | 100 | 100 | 2,1 s | 0 | ~100 ms |
| Desktop | 100 | 100 | 100 | 100 | ~0,5 s | 0 | 0 ms |

Uma rodada inicial reproduziu CLS móvel 0,338: o menu inicialmente expandido era recolhido após carregar JS. Um teste RED reproduziu deslocamento de 316px com script atrasado; a preparação mínima no head e a regra de menu antes da inicialização eliminaram o salto, mantendo a navegação sem JS. O teste GREEN passou e a nova medição apresentou CLS 0.

Lighthouse não mede INP real nesta execução; TBT não deve ser apresentado como INP. Pontuações e métricas variam com ambiente, rede e serviços externos. Permanecem oportunidades de cache/compressão da hospedagem, consolidação de requisições CSS e versões menores dos ícones para displays de baixa densidade, a avaliar sem prejudicar nitidez. A versão publicada não foi alterada, logo não há validação de deploy ou campo/CrUX.

A instalação inicial de Lighthouse apresentou 30 alertas transitivos e a versão fixada 12.6.1 apresentou 10. A ferramenta foi removida do package/lock do projeto e isolada em pasta temporária fora dele; sua cadeia de auditoria isolada continua contendo alertas. `npm audit` final do repositório: zero. Não houve mascaramento por override nem inclusão em produção.

### Revisão independente e regressões
Revisão somente leitura: `passed=true`, sem preocupações de segurança ou erros de lógica bloqueantes. Sugestões verificadas e tratadas: faixa correta da fonte, configuração JSON null protegida (falha reproduzida antes do ajuste), axe com menu aberto, navegação por teclado e evidência final atualizada para 24 testes. O número de teste para WhatsApp é somente fixture em resposta interceptada; não está publicado, não foi usado para contato e não valida titularidade real.

### Graphify e suas limitações
Grafo inicial extraído fora do repositório: 15 nós / 30 arestas; consulta `setPosition()` confirmou relações do carrossel, verificadas no código. Grafo atualizado preservado separadamente em `C:/Users/sarai/AppData/Local/hermes/project-notes/LandingPage_Barbearia/refactored/graphify-out/`: 92 nós, 101 arestas, oito comunidades; diagnóstico sem endpoints ausentes, dangling ou colapsos no grafo exportado. A extração cobre ferramentas/dados e não CSS/HTML; nesta versão do extrator, o novo script.js com IIFEs não gerou símbolos. Portanto o grafo não é prova de cobertura completa: o script final foi inspecionado diretamente e exercitado no navegador. Nenhuma extração semântica/cloud foi usada.

### Aceitação e limites
NAV, CONTACT (implementação segura com fallback), CONTENT, UI, A11Y (escopo automatizado), SEO, PERF (laboratório), LINKS e DOCS: verificados com os limites acima. Ativação WhatsApp real, avaliações publicáveis, atualidade operacional e publicação permanecem pendentes de decisões do cliente, não foram declaradas concluídas. Endereço validado por concordância do conteúdo e embed da fonte, não por confirmação independente do estabelecimento.

### Próximos passos e responsáveis
- Proprietário/Sara: confirmar número e titularidade, endereço e biografia; fornecer avaliações autorizadas.
- Sara: revisar a branch de refatoração e autorizar eventual merge/deploy separadamente. Commit e push dessa branch foram autorizados no pedido posterior à entrega inicial; a demo atual permanece na versão anterior.
- Desenvolvimento, após autorização: ativar contato confirmado, revisão manual com leitor de tela e em Safari/Firefox; medir novamente na hospedagem real e avaliar métricas de campo. Preços e horários só devem ser incluídos quando fornecidos pelo proprietário.
