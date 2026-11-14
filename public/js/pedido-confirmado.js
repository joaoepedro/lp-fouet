/* =========================================================
   Página de pedido confirmado (volta do pagamento online).
   A InfinitePay devolve na URL: order_nsu, transaction_nsu, slug,
   capture_method e receipt_url. O pagamento é conferido na própria
   InfinitePay (payment_check) antes de mostrar "pago".
   O cliente envia o pedido pago pelo WhatsApp, com o link do comprovante,
   para a loja conferir em um clique.
   ========================================================= */
(function () {
    "use strict";
    const C = window.CONFIG;
    const U = window.Utils;
    const P = window.Pedido;
    const q = new URLSearchParams(location.search);
    const nsu = q.get("order_nsu") || "";
    const pedido = U.sessao.ler("pedido-" + nsu);

    const titulo = document.querySelector("[data-conf-titulo]");
    const texto = document.querySelector("[data-conf-texto]");
    const lista = document.querySelector("[data-conf-itens]");
    const totalEl = document.querySelector("[data-conf-total]");
    const botao = document.querySelector("[data-conf-whats]");
    const resumo = document.querySelector("[data-conf-resumo]");

    if (!pedido) {
        titulo.textContent = "Não achamos este pedido por aqui";
        texto.textContent =
            "Se você já pagou, mande uma mensagem pelo WhatsApp com o comprovante que a gente confere.";
        resumo.hidden = true;
        botao.href = P.linkWhats(
            "Olá! Paguei um pedido pelo site (" + (nsu || "sem número") + ").",
        );
        return;
    }

    pedido.metodo = q.get("capture_method") || "pix";
    pedido.comprovante = q.get("receipt_url") || "";
    lista.innerHTML = pedido.itens
        .map(
            (i) =>
                "<li><span>" +
                i.qtd +
                "x " +
                P.esc(i.nome) +
                (i.detalhe ? "<small>" + P.esc(i.detalhe) + "</small>" : "") +
                "</span><span>" +
                P.real(i.preco * i.qtd) +
                "</span></li>",
        )
        .join("");
    if (pedido.taxa)
        lista.insertAdjacentHTML(
            "beforeend",
            "<li><span>Taxa de entrega</span><span>" +
                P.real(pedido.taxa) +
                "</span></li>",
        );
    totalEl.textContent = P.real(pedido.total);
    document.querySelectorAll("[data-conf-numero]").forEach((el) => {
        el.textContent = pedido.numero;
    });

    function mostrarPago() {
        titulo.textContent = "Pedido pago! 🍰";
        texto.textContent =
            "Agora é só enviar o pedido para a loja pelo WhatsApp. A mensagem já vai pronta, com o comprovante.";
        botao.href = P.linkWhats(P.mensagem(pedido, true));
        botao.hidden = false;
        P.esvaziar();
    }
    function mostrarPendente() {
        titulo.textContent = "Ainda não conseguimos confirmar o pagamento";
        texto.textContent =
            "Às vezes leva alguns segundos. Envie o pedido pelo WhatsApp que a loja confere o pagamento por lá.";
        botao.href = P.linkWhats(P.mensagem(pedido, false));
        botao.hidden = false;
    }

    if (C.modoDemonstracao) {
        mostrarPago();
        return;
    }
    fetch("https://api.checkout.infinitepay.io/payment_check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            handle: C.pedidos.infiniteTag,
            order_nsu: nsu,
            transaction_nsu: q.get("transaction_nsu"),
            slug: q.get("slug"),
        }),
    })
        .then((r) => r.json())
        .then((d) => (d && d.paid ? mostrarPago() : mostrarPendente()))
        .catch(mostrarPendente);
})();
