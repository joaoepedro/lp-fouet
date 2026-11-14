/* =========================================================
   PAINEL DE CONTROLE: o único arquivo para trocar dados.
   Os outros scripts só leem daqui. Depois de editar, confira a página.
   ========================================================= */
window.CONFIG = Object.freeze({
    // true = protótipo: o botão de WhatsApp mostra uma prévia da conversa
    // e o pagamento online é simulado. Trocar para false quando o cliente fechar.
    modoDemonstracao: true,

    empresa: Object.freeze({
        nome: "Fouet Studio",
        // Imagem redonda da prévia do WhatsApp (pode ficar vazio: usa a inicial do nome)
        logoPrevia: "assets/img/favicon-180.png", // caminho a partir da pasta public
    }),

    contato: Object.freeze({
        // Só números, com 55 + DDD. NÚMERO DE EXEMPLO (marca fictícia): trocar pelo real.
        whatsapp: "5516999990000",
        whatsappMensagem: "Olá! Vim pelo site da Fouet e queria fazer um pedido 🍰",
        instagram: "https://www.instagram.com/fouetstudio/",
        // LINK DE EXEMPLO (marca fictícia): no modo demonstração abre uma prévia da loja no iFood.
        // Vazio = o botão some da página.
        ifood: "https://www.ifood.com.br/delivery/ribeirao-preto-sp/fouet-jardim-botanico",
    }),

    pedidos: Object.freeze({
        // Pagamento online pela InfinitePay: a InfiniteTag da loja, sem o "$".
        // Vazio = o botão "Pagar agora" some e fica só o pedido pelo WhatsApp.
        infiniteTag: "",
        // Página para onde o cliente volta depois de pagar
        paginaConfirmacao: "pedido-confirmado.html",
        // Taxa fixa de entrega, em centavos (1000 = R$ 10,00). null = combinada pelo WhatsApp.
        // VALOR DE EXEMPLO: confirmar (docs/a-confirmar.md).
        taxaEntrega: 1000,
        // Antecedência mínima para bolos, tortas inteiras e festas, em dias
        antecedenciaEncomenda: 2,
        // Onde o cliente retira (aparece no carrinho e na mensagem)
        retirada: "no ateliê, no Jardim Botânico",
        // Horário de atendimento (hora de Ribeirão Preto). Fora dele o pagamento online
        // fica pausado e o pedido pode ir pelo WhatsApp. null = fechado no dia.
        // HORÁRIO DE EXEMPLO: confirmar (docs/a-confirmar.md).
        horario: Object.freeze({
            fuso: "America/Sao_Paulo",
            dias: Object.freeze({
                domingo: ["13:00", "18:00"],
                segunda: null,
                terca: ["10:00", "19:00"],
                quarta: ["10:00", "19:00"],
                quinta: ["10:00", "19:00"],
                sexta: ["10:00", "19:00"],
                sabado: ["10:00", "19:00"],
            }),
        }),
    }),

    // IDs de rastreamento: deixe vazio ("") para não carregar nada.
    rastreamento: Object.freeze({
        metaPixel: "",
        googleTag: "",
        clarity: "",
    }),
});
