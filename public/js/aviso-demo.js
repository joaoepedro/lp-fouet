/* =========================================================
   Prévia do WhatsApp, do Instagram e do iFood (só no protótipo)
   Com CONFIG.modoDemonstracao = true, os links para o WhatsApp abrem uma
   conversa simulada com a mensagem que o site enviaria; os do Instagram,
   um perfil de exemplo; e os do iFood, uma loja de exemplo com o cardápio.
   Com false, este arquivo não faz nada e os links abrem os sites de verdade.
   O visual da prévia fica em css/demo.css (carregado só aqui).
   ========================================================= */
(function () {
    "use strict";
    const C = window.CONFIG;
    if (!C || !C.modoDemonstracao) return;

    // Caminhos a partir da pasta public, em qualquer página (inclusive a 404)
    const raiz = new URL("../", document.currentScript.src);

    // Carrega o estilo da prévia só no modo demonstração
    const estilo = document.createElement("link");
    estilo.rel = "stylesheet";
    estilo.href = new URL("css/demo.css?v=3", raiz).href;
    document.head.appendChild(estilo);

    const nome = C.empresa.nome;
    const logo = C.empresa.logoPrevia
        ? new URL(C.empresa.logoPrevia.replace(/^\//, ""), raiz).href
        : "";
    const avatar = logo
        ? '<img class="demo-whats__avatar" src="' +
          logo +
          '" alt="" width="40" height="40">'
        : '<span class="demo-whats__avatar" aria-hidden="true"></span>';

    const tela = document.createElement("dialog");
    tela.className = "demo-whats";
    tela.setAttribute("aria-labelledby", "demo-whats-nome");
    tela.innerHTML =
        '<div class="demo-whats__topo">' +
        '<button type="button" class="demo-whats__voltar" aria-label="Fechar prévia">‹</button>' +
        avatar +
        '<div class="demo-whats__quem"><strong id="demo-whats-nome"></strong><small>online</small></div>' +
        "</div>" +
        '<div class="demo-whats__conversa">' +
        '<p class="demo-whats__digitando" aria-hidden="true"><span></span><span></span><span></span></p>' +
        '<p class="demo-whats__balao"><span class="demo-whats__texto"></span><span class="demo-whats__hora"></span></p>' +
        "</div>" +
        '<div class="demo-whats__rodape">' +
        '<p class="demo-whats__aviso">Prévia do site: depois de publicado, este botão abre o WhatsApp de <strong></strong> com esta mensagem já escrita.</p>' +
        '<button type="button" class="demo-whats__ok">Entendi</button>' +
        "</div>";
    document.body.appendChild(tela);

    tela.querySelector("#demo-whats-nome").textContent = nome;
    tela.querySelector(".demo-whats__aviso strong").textContent = nome;
    // Sem logo (ou logo que não carregou): mostra a inicial do nome
    const letra = nome.trim().charAt(0).toUpperCase();
    const inicial = tela.querySelector("span.demo-whats__avatar");
    if (inicial) inicial.textContent = letra;
    const img = tela.querySelector("img.demo-whats__avatar");
    if (img)
        img.addEventListener("error", () => {
            const s = document.createElement("span");
            s.className = "demo-whats__avatar";
            s.setAttribute("aria-hidden", "true");
            s.textContent = letra;
            img.replaceWith(s);
        });

    const balao = tela.querySelector(".demo-whats__balao");
    const digitando = tela.querySelector(".demo-whats__digitando");
    const conversa = tela.querySelector(".demo-whats__conversa");
    let origem = null;
    let espera = null;

    function abrir(mensagem) {
        origem = document.activeElement;
        tela.querySelector(".demo-whats__texto").textContent =
            mensagem || C.contato.whatsappMensagem;
        tela.querySelector(".demo-whats__hora").textContent =
            new Date().toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
            }) + " ✓✓";
        // "digitando..." e depois a mensagem aparece (fica bonito no vídeo)
        balao.hidden = true;
        digitando.hidden = false;
        tela.showModal();
        tela.querySelector(".demo-whats__ok").focus();
        clearTimeout(espera);
        const pressa = matchMedia("(prefers-reduced-motion: reduce)").matches;
        espera = setTimeout(
            () => {
                digitando.hidden = true;
                balao.hidden = false;
                // mensagem longa: começa mostrando o fim, como no app
                conversa.scrollTop = conversa.scrollHeight;
            },
            pressa ? 0 : 900,
        );
    }

    const fechar = () => tela.close();
    tela.querySelector(".demo-whats__ok").addEventListener("click", fechar);
    tela.querySelector(".demo-whats__voltar").addEventListener("click", fechar);
    tela.addEventListener("click", (e) => {
        if (e.target === tela) fechar();
    }); // clique fora
    tela.addEventListener("close", () => {
        clearTimeout(espera);
        if (origem && origem.focus) origem.focus();
    });

    // Um só ouvinte para todos os links do WhatsApp, inclusive os criados depois
    document.addEventListener("click", (e) => {
        const link = e.target.closest(
            'a[href^="https://wa.me/"], a[href^="https://api.whatsapp.com/"]',
        );
        if (!link) return;
        e.preventDefault();
        abrir(new URL(link.href).searchParams.get("text") || "");
    });

    /* ---------- Prévia do Instagram ----------
       Os links para o instagram.com abrem um perfil de exemplo da loja,
       com as fotos do cardápio. Depois de publicado, abrem o perfil real. */
    const urlInsta = (C.contato && C.contato.instagram) || "";
    const usuario =
        (urlInsta.match(/instagram\.com\/([^/?#]+)/) || [])[1] ||
        nome.toLowerCase().replace(/\s+/g, "");
    const FOTOS = [
        "fatias-fouet",
        "bolo-confete",
        "cupcakes-red-velvet",
        "cookies-ninho",
        "brownies-oreo",
        "torta-frutas-vermelhas",
        "cheesecakes-biscoff",
        "festa-mini-cupcakes",
        "fatias-tiramisu-pistache",
    ];
    const insta = document.createElement("dialog");
    insta.className = "demo-insta";
    insta.setAttribute("aria-labelledby", "demo-insta-usuario");
    insta.innerHTML =
        '<div class="demo-insta__topo">' +
        '<button type="button" class="demo-insta__voltar" aria-label="Fechar prévia">‹</button>' +
        '<strong id="demo-insta-usuario"></strong><span aria-hidden="true">···</span></div>' +
        '<div class="demo-insta__rolagem" tabindex="0" role="region" aria-label="Perfil de exemplo">' +
        '<div class="demo-insta__perfil">' +
        avatar.replace("demo-whats__avatar", "demo-insta__avatar") +
        '<ul class="demo-insta__numeros" role="list">' +
        "<li><b>128</b> publicações</li><li><b>4.812</b> seguidores</li><li><b>213</b> seguindo</li></ul></div>" +
        '<div class="demo-insta__bio"><strong></strong>' +
        "<span>Confeitaria</span>" +
        "<p>um pequeno luxo para cada dia 🍰<br>Cookies, fatias e bolos de aniversário<br>Ribeirão Preto · SP · encomendas com 2 dias</p>" +
        '<span class="demo-insta__link">🔗 cardápio e encomendas</span></div>' +
        '<div class="demo-insta__acoes"><span>Seguir</span><span>Mensagem</span></div>' +
        '<ul class="demo-insta__grade" role="list">' +
        FOTOS.map(
            (f) =>
                '<li><img src="' +
                new URL("assets/img/" + f + ".webp", raiz).href +
                '" alt="" loading="lazy" width="200" height="200"></li>',
        ).join("") +
        "</ul></div>" +
        '<div class="demo-insta__rodape">' +
        '<p class="demo-insta__aviso">Prévia do site: depois de publicado, este botão abre o Instagram de <strong></strong>.</p>' +
        '<button type="button" class="demo-insta__ok">Entendi</button></div>';
    document.body.appendChild(insta);
    insta.querySelector("#demo-insta-usuario").textContent = usuario;
    insta.querySelector(".demo-insta__bio strong").textContent = nome;
    insta.querySelector(".demo-insta__aviso strong").textContent = nome;
    let origemInsta = null;
    const fecharInsta = () => insta.close();
    insta
        .querySelector(".demo-insta__ok")
        .addEventListener("click", fecharInsta);
    insta
        .querySelector(".demo-insta__voltar")
        .addEventListener("click", fecharInsta);
    insta.addEventListener("click", (e) => {
        if (e.target === insta) fecharInsta();
    });
    insta.addEventListener("close", () => {
        if (origemInsta && origemInsta.focus) origemInsta.focus();
    });
    document.addEventListener("click", (e) => {
        const link = e.target.closest(
            'a[href*="instagram.com"], a[data-instagram]',
        );
        if (!link) return;
        e.preventDefault();
        origemInsta = document.activeElement;
        insta.querySelector(".demo-insta__rolagem").scrollTop = 0;
        insta.showModal();
        insta.querySelector(".demo-insta__ok").focus();
    });

    /* ---------- Prévia da loja no iFood ----------
       Os links para o ifood.com.br abrem uma loja de exemplo montada com o
       próprio cardápio (js/cardapio.js). Depois de publicado, abrem a loja real. */
    const M = window.CARDAPIO;
    const real = (c) =>
        (c / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    const esc = (t) =>
        String(t).replace(
            /[&<>"]/g,
            (ch) =>
                ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch],
        );
    const foto = (f) => new URL("assets/img/" + f + ".webp", raiz).href;
    const secoes = M
        ? M.categorias
              .map(
                  (cat) =>
                      '<section class="demo-ifood__secao"><h3>' +
                      esc(cat.nome) +
                      '</h3><ul role="list">' +
                      cat.itens
                          .map(
                              (p) =>
                                  "<li><div><strong>" +
                                  esc(p.nome) +
                                  "</strong><p>" +
                                  esc(p.desc) +
                                  "</p><span>" +
                                  real(p.preco) +
                                  '</span></div><img src="' +
                                  foto(cat.id + "-" + p.id) +
                                  '" alt="" loading="lazy" width="88" height="88"></li>',
                          )
                          .join("") +
                      "</ul></section>",
              )
              .join("")
        : "";
    const ifood = document.createElement("dialog");
    ifood.className = "demo-ifood";
    ifood.setAttribute("aria-labelledby", "demo-ifood-nome");
    ifood.innerHTML =
        '<div class="demo-ifood__topo">' +
        '<button type="button" class="demo-ifood__voltar" aria-label="Fechar prévia">‹</button>' +
        "<b>iFood</b><span></span></div>" +
        '<div class="demo-ifood__rolagem" tabindex="0" role="region" aria-label="Loja de exemplo">' +
        '<div class="demo-ifood__capa" style="background-image:url(' +
        foto("fatias-fouet") +
        ')"></div>' +
        '<div class="demo-ifood__loja">' +
        avatar.replace("demo-whats__avatar", "demo-ifood__avatar") +
        '<div><h2 id="demo-ifood-nome"></h2>' +
        "<p>Doces · Ribeirão Preto · ★ 4,9 (312)</p></div></div>" +
        '<ul class="demo-ifood__info" role="list">' +
        "<li><b>35–45 min</b>entrega</li><li><b>R$ 7,99</b>taxa</li><li><b>R$ 20,00</b>pedido mínimo</li></ul>" +
        '<nav class="demo-ifood__abas" aria-hidden="true">' +
        (M
            ? M.categorias
                  .map((c) => "<span>" + esc(c.nome) + "</span>")
                  .join("")
            : "") +
        "</nav>" +
        secoes +
        "</div>" +
        '<div class="demo-ifood__rodape">' +
        '<p class="demo-ifood__aviso">Prévia do site: depois de publicado, este botão abre a loja de <strong></strong> no iFood. Pedindo pelo site, o pedido chega direto na loja, sem taxa do aplicativo.</p>' +
        '<button type="button" class="demo-ifood__ok">Entendi</button></div>';
    document.body.appendChild(ifood);
    ifood.querySelector("#demo-ifood-nome").textContent = nome;
    ifood.querySelector(".demo-ifood__aviso strong").textContent = nome;
    let origemIfood = null;
    const fecharIfood = () => ifood.close();
    ifood
        .querySelector(".demo-ifood__ok")
        .addEventListener("click", fecharIfood);
    ifood
        .querySelector(".demo-ifood__voltar")
        .addEventListener("click", fecharIfood);
    ifood.addEventListener("click", (e) => {
        if (e.target === ifood) fecharIfood();
    });
    ifood.addEventListener("close", () => {
        if (origemIfood && origemIfood.focus) origemIfood.focus();
    });
    document.addEventListener("click", (e) => {
        const link = e.target.closest('a[href*="ifood.com.br"], a[data-ifood]');
        if (!link) return;
        e.preventDefault();
        origemIfood = document.activeElement;
        ifood.querySelector(".demo-ifood__rolagem").scrollTop = 0;
        ifood.showModal();
        ifood.querySelector(".demo-ifood__ok").focus();
    });
})();
