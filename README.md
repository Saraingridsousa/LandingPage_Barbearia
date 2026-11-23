# JR do Corte — Barbearia em Lima Duarte, MG

Landing page comercial em **HTML, CSS e JavaScript puro**, desenvolvida por **Sara Ingrid Sousa**. A versão 2 preserva logo, fotografias, preto/carvão/dourado e as fontes Montserrat e MedievalSharp do projeto original.

## Demo e estado da entrega

- Demo existente: https://saraingridsousa.github.io/LandingPage_Barbearia/
- Esta refatoração é mantida na branch `refactor/landing-page-v2`. **A demo pública ainda não contém estas alterações.** A branch não foi integrada à `main`; nenhum merge ou deploy foi feito.
- Protótipo original: https://www.figma.com/design/9bp2bKb3GzSPIOKU8YR1ZT/Untitled?node-id=0-1&p=f&t=PybKfsOmMYwlhle9-0

## Funcionalidades

- Hero com localização e CTA; seis serviços com contato contextual.
- Menu móvel com teclado, Escape, estados ARIA, fechamento após navegação e foco no destino. Navegação continua disponível sem JavaScript.
- Biografia e imagens originais, mapa com título acessível e botão de rotas.
- Contato pelo Instagram existente; integração WhatsApp pronta, mas desativada até confirmação do número.
- Sem avaliações fictícias: a captura de downloads do WhatsApp, antes repetida como depoimento, foi retirada da vitrine; o arquivo original foi preservado.
- Layout mobile-first, foco visível, alvos de toque de pelo menos 44px e suporte a movimento reduzido.
- Meta description, canonical, Open Graph e LocalBusiness apenas com informações presentes no repositório.
- Imagens WebP responsivas, dimensões reservadas, lazy loading fora do hero, fontes WOFF2 locais com `font-display: swap`. Sem jQuery, Font Awesome ou dependências em produção.

## Executar localmente

O site é estático e pode ser aberto diretamente em `index.html`. Para desenvolver e testar, use Node.js 22 ou superior:

```sh
npm ci
npx playwright install chromium
npm run serve
```

Acesse `http://127.0.0.1:4173`. O servidor é apenas de desenvolvimento, restrito ao loopback. Não há backend nem etapa de build necessária ao GitHub Pages. Preserve caminhos relativos ao publicar sob `/LandingPage_Barbearia/`.

## Testes

```sh
npm run check:html
npm run check:js
npm test
npm audit
node scripts/check-external-links.cjs
```

`npm test` inicia e encerra seu próprio servidor; pare `npm run serve` antes de executá-lo. Ferramentas de teste são apenas devDependencies.

Última validação: **24 testes Chromium aprovados**, incluindo 320, 375, 390, 430, 768, 1024 e 1440px; axe sem violações nas regras WCAG A/AA selecionadas, com menu fechado e aberto; teclado, fallback sem JS, contatos inválidos e prefixo Pages. Isso não substitui auditoria manual completa com leitores de tela ou testes em Safari/Firefox.

Lighthouse 12.6.1 local: desempenho **98 mobile / 100 desktop** e **100** em acessibilidade, boas práticas e SEO nos dois perfis. CLS 0. São medições de laboratório em uma máquina, não promessa de Core Web Vitals de usuários reais. Resultados detalhados em `evidence/lighthouse-summary.json` e [relatório](docs/IMPLEMENTATION.md).

Lighthouse foi usado em uma instalação temporária isolada, pois sua cadeia de dependências apresentou alertas de segurança. Ele **não integra o package.json/lock final**, cujo `npm audit` apresentou zero vulnerabilidades. Para repetir opcionalmente o mesmo experimento, instale-o em uma pasta temporária fora do repositório e execute:

```sh
npm install --prefix /caminho/temporario/jr-audit-tools lighthouse@12.6.1
LIGHTHOUSE_ROOT=/caminho/temporario/jr-audit-tools node scripts/lighthouse.cjs
```

O comando acima usa sintaxe bash; no Windows use caminhos nativos `C:/...`. A ferramenta de auditoria isolada mantém os alertas documentados; não a utilize como dependência do site ou servidor público. O teste normal não precisa dela.

## Configurar WhatsApp — somente após confirmação

No `index.html`, encontre `script#business-contact`. O valor publicado permanece:

```json
{"whatsapp":null}
```

O original diverge entre `553299827807` nos CTAs e `5532999827807` no rodapé. **Não escolher por formato ou aparência.** Após o proprietário confirmar número e titularidade, substitua `null` por uma string com DDI e dígitos, sem sinal, espaços ou pontuação. O JavaScript gera todos os links `wa.me` e codifica a mensagem por serviço com `encodeURIComponent`; não envia nenhuma mensagem automaticamente. Com JavaScript desabilitado, o contato pelo Instagram continua disponível.

## Estrutura

- `index.html`: conteúdo, metadados e configuração de contato.
- `src/styles/`: tokens e estilos separados por seção; `depoimentos.css` corrige o nome anterior.
- `src/javascript/script.js`: menu e construção segura dos links.
- `src/imagens/`: acervo original intacto; `optimized/` contém derivados e manifesto com hashes.
- `src/fonts/`: WOFF2, licenças OFL e origem dos downloads.
- `scripts/`: servidor, otimização e verificações opcionais.
- `tests/`: regressões e validações Playwright/axe.
- `docs/IMPLEMENTATION.md`: contrato, decisões, alterações, resultados e pendências.
- `evidence/`: screenshots, relatórios JSON e logs reais das execuções.

Para regenerar imagens/fontes: `node scripts/optimize-assets.cjs` (requer Chromium instalado e Python com Pillow). Os downloads de fontes podem variar futuramente; o manifesto registra a versão efetivamente gerada. Não modifique os SVGs/PNG/JPG originais como parte dessa geração.

## Capturas da versão local

[Desktop completo](evidence/screenshot-1440.png) · [Celular 390px](evidence/screenshot-390.png) · [Prévia do hero](evidence/preview-desktop.png)

## Pendências antes de publicar

1. Confirmar WhatsApp correto e titularidade.
2. Confirmar atualidade do endereço e da biografia (idade de 17 anos mantida da fonte, sem atualização presumida).
3. Fornecer avaliações autênticas com autorização de publicação; não há avaliações legíveis no material atual.
4. Autorizar a publicação separadamente. Preços e horários não foram inventados nem adicionados.
5. Fazer revisão com leitor de tela e Safari/Firefox; verificar cache/compressão e métricas após uma publicação autorizada.
