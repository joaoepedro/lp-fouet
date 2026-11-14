# Fouet Studio: site (demonstração)

Cardápio online da **Fouet Studio** (marca fictícia, projeto de portfólio): "um pequeno luxo para cada dia", em Ribeirão Preto-SP.
Mesma estrutura do site da The Bake Club: primeira tela com vídeo, cardápio com atalhos em linha (rolagem lateral), caixa presente,
bolos de aniversário e tortas inteiras com tamanho/peso e calendário (mínimo de 2 dias), encomendas para festas com quantidade e calendário,
carrinho com pagamento online (InfinitePay) e pedido pelo WhatsApp, como pedir e dúvidas.

**Direção de cor: pistache** (botões no verde do logo). Teste de contraste em `docs/contraste.md` e auditoria completa em `docs/auditoria.md`.

## Tecnologias
HTML, CSS e JavaScript puros: sem framework, sem biblioteca e sem etapa de build.

## Estrutura
```
public/                         ← só esta pasta vai para o ar
  index.html                    página principal (cardápio, caixa, encomendas, carrinho)
  pedido-confirmado.html        volta do pagamento online (sempre fora do Google)
  politica-de-privacidade.html  LGPD (fora do Google)
  404.html                      endereço que não existe (caminhos com "/" no início)
  css/
    reset.css                   base igual em todos os projetos (não mexer)
    variables.css               cores, fontes e espaços da marca
    style.css                   desenho do site
    demo.css                    prévias do WhatsApp, Instagram e iFood (só no protótipo; carrega sozinho)
  js/
    config.js                   PAINEL DE DADOS: WhatsApp, Instagram, iFood, InfinitePay, horário, rastreamento
    cardapio.js                 produtos, preços, caixa presente, bolos, tortas e festas
    carrinho.js                 cardápio, carrinho, horário, pagamento e mensagem do pedido
    calendario.js               calendário das encomendas
    pedido-confirmado.js        página de pedido pago
    utils.js                    funções de apoio
    tracking.js                 Meta Pixel, tag do Google e Clarity (só com ID preenchido)
    main.js                     comportamentos padrão (WhatsApp, menu, animações, vídeo)
    aviso-demo.js               prévias do WhatsApp, Instagram e iFood no modo demonstração
  assets/
    img/                        imagens em WebP (fotos dos produtos em 600 e 300 px) + favicons + og-capa.jpg
    video/                      vídeo da primeira tela (retrato para celular, paisagem para computador)
    fonts/                      Gloock, Mrs Saint Delafield e Poppins (OFL) — ver "Fontes" abaixo
  robots.txt · sitemap.xml
  _headers                      cache, segurança e noindex da demonstração (Cloudflare)
docs/                           auditoria.md, contraste.md, a-confirmar.md, cardapio-e-fotos.md, direcoes/ (as 3 propostas de cor)
fotos-brutas/                   fotos e vídeo originais (não vão para o ar)
identidade-fouet/               prancha da marca: logo, paleta e mascote (não vai para o ar)
```

## Fontes
A marca usa **Rigot** (títulos/logo) e **Moontime** (manuscrita), que são pagas e não estavam na pasta.
O logo é sempre imagem (recortado de `identidade-fouet/1.png`), então ele já está fiel. Nos textos entraram substitutas livres:
**Gloock** no lugar da Rigot e **Mrs Saint Delafield** no lugar da Moontime, com **Poppins** no corpo (a mesma da prancha de identidade).
Para usar as originais (com licença de uso na web): ponha os .woff2 em `assets/fonts`, troque os `@font-face` e os nomes em
`--fonte-titulo` e `--fonte-manuscrita` no `css/variables.css`.

## Convenções
- **O JS só procura atributos `data-*`**, nunca classes. Lista de ganchos no topo de `js/main.js`.
- Estados também são atributos: menu aberto `[data-aberto]`, bloco visível `[data-visivel]`, flutuante visível `[data-mostrar]`.
- Textos que o cliente pode pedir para trocar ficam entre `<!-- ✏️ EDITÁVEL -->` e `<!-- ✏️ FIM -->`.
- Links de WhatsApp já têm o número no HTML; o JS só acrescenta a mensagem. Sem JS, continuam funcionando.
- Para testar o horário: `index.html?simular=aberto` ou `?simular=fechado`.
- CSS e JS ficam até 1 hora guardados no celular de quem já visitou: uma mudança no visual pode levar esse tempo para aparecer. Se precisar que apareça na hora, acrescente um número no fim do endereço nas páginas (`style.css?v=2`) e aumente a cada mudança.

## Rodar localmente
```
cd public
python -m http.server 8000
```
Abra http://localhost:8000

## Publicar (Cloudflare Pages)
Workers & Pages › Create › Pages › Upload assets › enviar a pasta **public**.
(Ou conectar o repositório: Framework preset **None** · Build command vazio · Build output directory **public**.)

## Publicar de verdade (quando o cliente fechar)
- [ ] Confirmar os itens de `docs/a-confirmar.md` (WhatsApp, horário, taxa, endereço…)
- [ ] `config.js`: preencher `infiniteTag` (InfiniteTag da loja, sem o "$") e `modoDemonstracao: false`
- [ ] `index.html`: apagar a linha `<meta name="robots" content="noindex, nofollow">`
- [ ] `_headers`: apagar a linha `X-Robots-Tag: noindex`
- [ ] Trocar `https://lp-fouet.pages.dev` pelo domínio definitivo em `index.html`, `robots.txt` e `sitemap.xml`
- [ ] Endereço (ou só a área de entrega) e horário também na ficha da empresa (`application/ld+json` no `index.html`)
- [ ] Preencher os IDs de rastreamento em `config.js`, se houver, e atualizar a política de privacidade
- [ ] Registrar o site no Google Search Console e enviar o `sitemap.xml`
- [ ] Criar o Perfil da Empresa no Google com o link do site, e pôr o link na bio do Instagram
