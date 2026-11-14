# Auditoria do projeto: Fouet

Feita em 13/11/2026 na pasta `C:\portfolio\lp-fouet`.

## 1. Arquivos sem uso (apagar com `apagar-arquivos.bat`)

O `.bat` fica na raiz do projeto: dois cliques, ele mostra a lista e pergunta antes de apagar.

| Arquivo | Por que sai |
|---|---|
| `video/motor.js` | motor do vídeo de apresentação da The Bake Club (cenas de cookies, Natal-RN) |
| `video/palco.html` | palco do mesmo vídeo da Bake Club |
| `video/roteiro.js` | roteiro do vídeo da Bake Club |
| `video/titulos.js` | títulos do vídeo da Bake Club |
| `video/scripts/gravar.py` | gravador do vídeo da Bake Club |
| `video/scripts/servidor.py` | servidor do gravador acima |
| `docs/dossie.md` | pesquisa da The Bake Club |
| `docs/identidade-visual.md` | identidade da The Bake Club (a da Fouet está em css/variables.css e docs/contraste.md) |
| `docs/mensagens.md` | mensagens de abordagem da The Bake Club |
| `docs/roteiro-video.md` | roteiro do vídeo da The Bake Club |
| `public/js/direcoes-demo.js` | seletor das 3 direções de cor; a direção pistache já foi escolhida e nenhuma página carrega mais o arquivo |
| `public/assets/img/logo-creme-360.webp` | logo antigo (Fouet Doceria), trocado pelo Fouet Studio |
| `public/assets/img/logo-creme-900.webp` | logo antigo |
| `public/assets/img/logo-chocolate-360.webp` | logo antigo |
| `public/assets/img/logo-chocolate-900.webp` | logo antigo |
| `public/assets/img/historia.webp` | foto da seção "feito à mão", que saiu do site |
| `public/assets/img/mascote-ok-480.webp` | versão grande do mascote; o site só usa a de 220 px |
| `public/assets/img/mascote-dedo-480.webp` | versão grande do mascote; o site só usa a de 220 px |

**Mantidos de propósito:** `fotos-brutas/` e `identidade-fouet/` (originais, não vão para o ar), `docs/direcoes/` (as 3 propostas de cor, registro da escolha), `public/assets/fonts/LICENCAS-fontes.txt` (licença das fontes, exigida pela OFL).

## 2. Código limpo nesta auditoria

| Onde | O que mudou |
|---|---|
| `css/variables.css` | As direções cacau e framboesa saíram: ficou só a pistache, aprovada. Saíram também as variáveis que não eram usadas (`--chocolate-fundo` e `--framboesa`) |
| `js/config.js` | Saiu a troca de direção pelo endereço (`?direcao=`) |
| `index.html` e páginas | `config.js` voltou a carregar com `defer` (não trava mais a página) e saiu o `data-direcao` do `<html>` |
| `css/style.css` | Saíram o estilo do seletor de direções e o seletor da seção "história", que não existe mais. Seções renumeradas |
| `index.html` | Saiu o `onsubmit` escrito no HTML; "Pagar agora" virou o botão de envio do formulário do carrinho (Enter num campo também leva ao pagamento, com a validação do nome) |
| `js/main.js` | **Erro corrigido:** o botão do iFood no rodapé apontava para `#`. Agora ele pega o link do `config.js` e some quando o campo `ifood` está vazio, igual ao do Instagram |
| `js/carrinho.js` | Ordem dos títulos corrigida (bolos e festas em `h3`, tortas em `h4`), fotos do cardápio com versão de 300 px para celular |
| `js/aviso-demo.js` e `css/demo.css` | Comentários atualizados (WhatsApp, Instagram e iFood); áreas de rolagem das prévias acessíveis pelo teclado; azul e vermelho das prévias escurecidos para passar no contraste |
| `404.html` | Estilo escrito no HTML virou classe; texto alternativo do logo corrigido |
| `README.md`, `docs/contraste.md`, `docs/cardapio-e-fotos.md` | Atualizados para a direção pistache e sem a seção "história" |
| `.gitignore` | Saíram as regras da pasta de vídeo da Bake Club; `fotos-brutas/` (cerca de 75 MB) fica fora do repositório |

ESLint em todos os scripts: nenhuma variável, função ou chamada sem uso, nenhum nome indefinido.

## 3. Testes

### Velocidade (Lighthouse 12, com compressão como na Cloudflare)
| | Celular (4G simulado) | Computador |
|---|---|---|
| Desempenho | 94 | 100 |
| Primeira pintura (FCP) | 1,3 s | 0,3 s |
| Maior elemento na tela (LCP) | 3,1 s | 0,7 s |
| Bloqueio (TBT) | 40 ms | 0 ms |
| Mudança de layout (CLS) | 0,029 | 0,041 |
| Peso total da página | 656 KB (antes: 1.165 KB) | 743 KB |

O que baixou o peso: fotos do cardápio em 300 px no celular (antes iam as de 600 px), logo da primeira tela em 600 px no celular, duas fotos e os mascotes recomprimidos.
O LCP do celular é o logo da primeira tela; o tempo vem da simulação de 4G lento esperando os 3 arquivos de CSS e as fontes. Num celular real com a Cloudflare tende a ficar abaixo.

### Acessibilidade
- Lighthouse: **100** em todas as páginas (início, pedido pago e política de privacidade).
- axe-core (WCAG 2.2 A/AA e boas práticas), no celular e no computador: **0 falhas** em todas as páginas e nas janelas abertas (carrinho, pagamento, calendário e prévias de WhatsApp, Instagram e iFood).
- Teclado: o foco entra e fica dentro do carrinho; Esc fecha as janelas; existe o link "Pular para o conteúdo".
- Movimento reduzido: quem pede menos movimento no aparelho vê o vídeo parado e sem animações (`reset.css` e `main.js`).
- Sem JavaScript: os links de WhatsApp continuam funcionando e o cardápio aparece como texto.
- Área de toque: todos os botões e links soltos com pelo menos 24 px (WCAG 2.5.8). A exceção é o link "Política de privacidade" no rodapé, que fica dentro de uma frase e por isso é permitido.

### Contraste
Todos os pares de texto passam no AA (4,5:1). Tabela completa em `docs/contraste.md`.

### Responsividade
Sem rolagem lateral em 320, 360, 390, 414, 768, 1024, 1280, 1440 e 1920 px, nas 4 páginas.

### SEO
- Lighthouse SEO: **100** sem a etiqueta de demonstração. Com ela, 69: o `noindex` derruba a nota de propósito, enquanto for prévia.
- Título com 41 caracteres, descrição com 135, um único `h1`, `canonical`, Open Graph, `robots.txt`, `sitemap.xml` e ficha de empresa (`application/ld+json`) válida.

### Código
- HTML (html-validate): **0 erros** nas 4 páginas.
- JavaScript (ESLint): **0 problemas**.
- Console do navegador: nenhum erro em nenhuma página, nem no fluxo completo de pedido (cardápio, caixa presente, bolo com tamanho e data, festa com quantidade, carrinho, pagamento simulado e pedido pago).
- Links internos e âncoras dos atalhos: nenhum quebrado. Nenhuma página aponta para arquivo que não existe.
- Calendário: o primeiro dia liberado é sempre hoje + 2 dias, no horário de Ribeirão Preto.

## 4. Pendente (fora do código)
- Nome da marca: resolvido. Tudo passou de "Fouet Doceria" para "Fouet Studio" (textos, título da aba, ficha do Google, mensagens, pagamento e Instagram @fouetstudio).
- Itens de `docs/a-confirmar.md` (WhatsApp, horário, taxa e endereço de exemplo).
