# Teste de contraste: Fouet

Norma: WCAG 2.2, nível AA (texto comum precisa de **4,5:1**; texto grande, a partir de 24 px ou de 19 px em negrito, precisa de 3:1).
Fórmula de luminância relativa da W3C, calculada para cada par usado no site (`css/variables.css` anota o valor ao lado de cada cor).
Conferido também com o axe-core em todas as páginas e janelas (carrinho, pagamento, calendário e prévias): nenhuma falha de contraste.

Direção de cor aprovada: **pistache** (botões no verde do logo, texto chocolate).

## Pares usados no site (todos passam)

| Uso | Texto | Fundo | Contraste | AA |
|---|---|---|---|---|
| Texto principal | `#4B2A06` | `#FBF5EC` (creme) | 11,86:1 | ✅ |
| Texto principal | `#4B2A06` | `#FCE8EE` (rosa claro) | 10,97:1 | ✅ |
| Texto principal | `#4B2A06` | `#FFFFFF` (branco) | 12,86:1 | ✅ |
| Texto secundário (taupe escurecido) | `#6B5539` | `#FBF5EC` (creme) | 6,49:1 | ✅ |
| Texto secundário (taupe escurecido) | `#6B5539` | `#FCE8EE` (rosa claro) | 6,0:1 | ✅ |
| Texto claro | `#FBF5EC` | `#4B2A06` (chocolate) | 11,86:1 | ✅ |
| Frase manuscrita (framboesa escurecida) | `#B0365D` | `#FBF5EC` (creme) | 5,49:1 | ✅ |
| Frase manuscrita sobre chocolate | `#C3CC5F` | `#4B2A06` (chocolate) | 7,42:1 | ✅ |
| Etiqueta de preço | `#4B2A06` | `#F9C2D2` (rosa) | 8,37:1 | ✅ |
| Botão principal | `#4B2A06` | `#C3CC5F` (pistache) | 7,42:1 | ✅ |
| Botão principal (passar o mouse) | `#4B2A06` | `#CFD77A` (pistache claro) | 8,36:1 | ✅ |
| Botão flutuante do WhatsApp (ícone) | `#2A1703` | `#C3CC5F` (pistache) | 9,92:1 | ✅ |
| Botão do WhatsApp (carrinho) | `#FFFFFF` | `#0F7A3F` (verde) | 5,42:1 | ✅ |
| Prévia do Instagram: botão Seguir | `#FFFFFF` | `#0068D6` (azul escurecido) | 5,31:1 | ✅ |
| Prévia do iFood: topo e botão | `#FFFFFF` | `#C8102E` (vermelho escurecido) | 5,88:1 | ✅ |

## Cores originais que não servem para texto

Ficam só como fundo (com texto escuro por cima) ou como enfeite:

| Combinação | Contraste |
|---|---|
| Branco sobre framboesa #E45A82 | 3,45:1 ❌ |
| Chocolate sobre framboesa #E45A82 | 3,73:1 ❌ |
| Taupe #9C8262 sobre creme | 3,35:1 ❌ |
| Branco sobre taupe #9C8262 | 3,63:1 ❌ |
| Framboesa #E45A82 sobre creme | 3,18:1 ❌ |
| Rosa #F9C2D2 sobre creme | 1,42:1 ❌ |
| Pistache #C3CC5F sobre creme | 1,6:1 ❌ |
| Branco sobre o azul do Instagram #0095F6 | 3,17:1 ❌ |
| Branco sobre o vermelho do iFood #EA1D2C | 4,46:1 ❌ |

## Ajustes feitos por causa do teste

- **Taupe #9C8262**: nos textos secundários entrou um taupe escurecido, **#6B5539** (6,5:1). O original ficou só em bordas.
- **Framboesa #E45A82**: para frases manuscritas sobre o creme entrou a **framboesa escurecida #B0365D** (5,5:1).
- **Rosa e pistache**: aparecem só como fundo, sempre com texto chocolate por cima.
- **Prévias do Instagram e do iFood**: o azul e o vermelho dos apps foram escurecidos para o texto branco passar.
