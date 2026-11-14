/* =========================================================
   Cardápio: produtos, preços e encomendas.
   Preço em centavos (1400 = R$ 14,00). PREÇOS DE EXEMPLO (marca fictícia).
   O HTML do cardápio é montado a partir daqui pelo carrinho.js.
   Cada produto usa a foto assets/img/<categoria>-<id>.webp
   ========================================================= */
window.CARDAPIO = Object.freeze({
    /* Pronta entrega: vitrine do dia */
    categorias: [
        {
            id: "cookies",
            nome: "Cookies",
            singular: "Cookie",
            faixa: "R$ 12 a 16",
            itens: [
                {
                    id: "classico",
                    nome: "Clássico",
                    preco: 1200,
                    peso: "110 g",
                    desc: "Massa amanteigada com açúcar mascavo e gotas de chocolate meio amargo.",
                },
                {
                    id: "flor-de-sal",
                    nome: "Chocolate 70% e flor de sal",
                    preco: 1400,
                    peso: "110 g",
                    desc: "Pedaços generosos de chocolate 70% cacau e flor de sal por cima.",
                },
                {
                    id: "mascavo",
                    nome: "Caramelo e baunilha",
                    preco: 1300,
                    peso: "120 g",
                    desc: "Massa de baunilha, mascavo caramelizado e chocolate ao leite.",
                },
                {
                    id: "ninho",
                    nome: "Duplo chocolate com Ninho",
                    preco: 1600,
                    peso: "130 g",
                    especial: true,
                    desc: "Massa de cacau recheada com brigadeiro cremoso de leite Ninho.",
                },
                {
                    id: "cookies-cream",
                    nome: "Cookies & cream",
                    preco: 1600,
                    peso: "130 g",
                    especial: true,
                    desc: "Massa de cacau, recheio de chocolate branco e pedaços de biscoito Oreo.",
                },
            ],
        },
        {
            id: "brownies",
            nome: "Brownies",
            singular: "Brownie",
            faixa: "R$ 14 a 18",
            itens: [
                {
                    id: "ganache",
                    nome: "Com ganache",
                    preco: 1400,
                    peso: "90 g",
                    desc: "Brownie úmido de chocolate 55% com uma camada lisa de ganache.",
                },
                {
                    id: "oreo",
                    nome: "Oreo com doce de leite",
                    preco: 1600,
                    peso: "100 g",
                    desc: "Pedaços de Oreo na massa e doce de leite escorrendo por cima.",
                },
                {
                    id: "pistache",
                    nome: "Pistache",
                    preco: 1800,
                    peso: "100 g",
                    especial: true,
                    desc: "Chocolate meio amargo, creme de pistache e pistache tostado.",
                },
            ],
        },
        {
            id: "cupcakes",
            nome: "Cupcakes",
            singular: "Cupcake",
            faixa: "R$ 13 a 16",
            itens: [
                {
                    id: "chocolate",
                    nome: "Chocolate belga",
                    preco: 1300,
                    peso: "1 unidade",
                    desc: "Massa de chocolate e buttercream de chocolate belga.",
                },
                {
                    id: "red-velvet",
                    nome: "Red velvet",
                    preco: 1400,
                    peso: "1 unidade",
                    desc: "Massa aveludada de cacau com frosting de cream cheese.",
                },
                {
                    id: "mocha",
                    nome: "Mocha",
                    preco: 1400,
                    peso: "1 unidade",
                    desc: "Massa de chocolate e buttercream de café coado na hora.",
                },
                {
                    id: "menta",
                    nome: "Menta com chocolate",
                    preco: 1400,
                    peso: "1 unidade",
                    desc: "Massa de cacau, buttercream de menta e um bombom por cima.",
                },
                {
                    id: "avela",
                    nome: "Avelã",
                    preco: 1600,
                    peso: "1 unidade",
                    especial: true,
                    desc: "Recheio de creme de avelã, praliné crocante e bombom de avelã.",
                },
            ],
        },
        {
            id: "fatias",
            nome: "Fatias",
            singular: "Fatia",
            faixa: "R$ 22 a 24",
            itens: [
                {
                    id: "fouet",
                    nome: "Fatia Fouet",
                    preco: 2400,
                    peso: "≈ 160 g",
                    desc: "A da casa: pão de ló de baunilha em camadas, ganache e calda quente de chocolate.",
                },
                {
                    id: "floresta-negra",
                    nome: "Floresta negra",
                    preco: 2200,
                    peso: "≈ 150 g",
                    desc: "Bolo de chocolate, chantilly, cerejas ao kirsch e raspas de chocolate.",
                },
                {
                    id: "tiramisu",
                    nome: "Tiramisù",
                    preco: 2200,
                    peso: "≈ 150 g",
                    desc: "Biscoito embebido no café, creme de mascarpone e cacau.",
                },
                {
                    id: "tiramisu-pistache",
                    nome: "Tiramisù de pistache",
                    preco: 2400,
                    peso: "≈ 150 g",
                    desc: "A nossa versão: creme de mascarpone com pistache e cacau por cima.",
                },
            ],
        },
        {
            id: "cheesecakes",
            nome: "Cheesecakes",
            singular: "Cheesecake",
            faixa: "R$ 22 a 24",
            itens: [
                {
                    id: "mirtilo",
                    nome: "Mirtilo",
                    preco: 2200,
                    peso: "≈ 150 g",
                    desc: "Cheesecake assado, base de biscoito e calda de mirtilo.",
                },
                {
                    id: "biscoff",
                    nome: "Biscoff",
                    preco: 2400,
                    peso: "≈ 150 g",
                    desc: "Creme leve de cream cheese, calda e biscoito Lotus Biscoff.",
                },
                {
                    id: "limao-mirtilo",
                    nome: "Limão siciliano e mirtilo",
                    preco: 2200,
                    peso: "≈ 150 g",
                    desc: "Creme de limão siciliano com uma camada de geleia de mirtilo.",
                },
            ],
        },
    ],

    // Caixa presente com 4: 2 cookies + 1 brownie + 1 cupcake.
    // Os itens marcados como "especial" somam o acréscimo ao preço da caixa.
    combo: {
        id: "caixa",
        nome: "Caixa presente com 4",
        preco: 5490,
        acrescimo: 200,
        slots: [
            { categoria: "cookies", quantidade: 2 },
            { categoria: "brownies", quantidade: 1 },
            { categoria: "cupcakes", quantidade: 1 },
        ],
    },

    /* Bolos de aniversário e tortas inteiras: tamanho + dia (antecedência no config) */
    tamanhos: {
        bolo: [
            { id: "p", nome: "P", peso: "1 kg", serve: "serve 8 a 10" },
            { id: "m", nome: "M", peso: "2 kg", serve: "serve 16 a 20" },
            { id: "g", nome: "G", peso: "3 kg", serve: "serve 25 a 30" },
        ],
        torta: [
            { id: "p", nome: "20 cm", peso: "≈ 1 kg", serve: "8 fatias" },
            { id: "g", nome: "26 cm", peso: "≈ 1,6 kg", serve: "12 fatias" },
        ],
    },
    encomendas: [
        {
            id: "bolo-trufado",
            grupo: "bolos",
            tipo: "bolo",
            nome: "Trufado de chocolate",
            desc: "Massa de chocolate, recheio trufado 50% cacau e cobertura de ganache com brigadeiros.",
            precos: { p: 16000, m: 29000, g: 41000 },
        },
        {
            id: "bolo-morangos",
            grupo: "bolos",
            tipo: "bolo",
            nome: "Chocolate com morangos",
            desc: "Massa de chocolate, brigadeiro meio amargo e morangos frescos por cima.",
            precos: { p: 17000, m: 31000, g: 44000 },
        },
        {
            id: "bolo-ninho-frutas",
            grupo: "bolos",
            tipo: "bolo",
            nome: "Ninho com frutas vermelhas",
            desc: "Massa branca, creme de Ninho, geleia de frutas vermelhas e drip de chocolate.",
            precos: { p: 17000, m: 31000, g: 44000 },
        },
        {
            id: "bolo-amendoas",
            grupo: "bolos",
            tipo: "bolo",
            nome: "Baunilha com amêndoas",
            desc: "Pão de ló de baunilha, creme de amêndoas e amêndoas laminadas tostadas.",
            precos: { p: 16000, m: 29000, g: 41000 },
        },
        {
            id: "bolo-confete",
            grupo: "bolos",
            tipo: "bolo",
            nome: "Confete",
            desc: "Massa de baunilha com confeitos coloridos e buttercream rosa. O favorito das crianças.",
            precos: { p: 15000, m: 27000, g: 38000 },
        },
        {
            id: "torta-cereja",
            grupo: "tortas",
            tipo: "torta",
            nome: "Torta de cereja",
            desc: "Massa amanteigada em treliça e recheio de cerejas cozidas devagar.",
            precos: { p: 12000, g: 17500 },
        },
        {
            id: "torta-frutas-vermelhas",
            grupo: "tortas",
            tipo: "torta",
            nome: "Torta de frutas vermelhas",
            desc: "Massa sablée, creme de baunilha e frutas vermelhas em calda brilhante.",
            precos: { p: 13000, g: 18500 },
        },
    ],

    /* Festas: quantidade (com mínimo) + dia */
    festas: [
        {
            id: "festa-mini-cupcakes",
            nome: "Mini cupcakes red velvet",
            desc: "Massa de cacau aveludada, frosting de cream cheese e farofa vermelha.",
            preco: 450,
            minimo: 25,
            passo: 5,
        },
        {
            id: "festa-mini-brownies",
            nome: "Mini brownies decorados",
            desc: "Quadradinhos de brownie com fios de chocolate e amendoim crocante.",
            preco: 390,
            minimo: 30,
            passo: 10,
        },
        {
            id: "festa-cupcakes-coracao",
            nome: "Cupcakes decorados",
            desc: "Com topo no tema da festa: cores e enfeites combinados pelo WhatsApp.",
            preco: 1200,
            minimo: 12,
            passo: 6,
        },
    ],
});
