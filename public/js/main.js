/* =========================================================
   Comportamentos padrão da página.
   O JS só procura atributos data-*, nunca classes: assim cada
   empresa pode ter o desenho e os nomes de classe que quiser.

   Ganchos disponíveis no HTML:
   data-whats  (ou data-whats="mensagem")  → link do WhatsApp com mensagem pronta
   data-local="primeira-tela"              → onde está o botão (vai para o rastreamento)
   data-instagram                          → link do Instagram
   data-ifood                              → link da loja no iFood
   data-menu-botao + data-menu             → menu do celular (estado: data-aberto)
   data-revelar                            → animação ao rolar (estado: data-visivel)
   data-whats-flutuante                    → botão que aparece depois da primeira tela (estado: data-mostrar)
   data-gatilho-flutuante                  → elemento que, ao sair da tela, mostra o flutuante
   data-ano                                → ano atual no rodapé
   data-topo                               → topo que ganha cor ao rolar (estado: data-rolou)
   data-video-fundo                        → vídeo que fica parado para quem pede menos movimento
   ========================================================= */
(function () {
    "use strict";
    const C = window.CONFIG;
    const U = window.Utils;
    const rastrear = function (ev, dados) {
        if (window.rastrear) window.rastrear(ev, dados);
    };
    const todos = (seletor) => document.querySelectorAll(seletor);

    /* 1. WhatsApp, Instagram e iFood */
    todos("[data-whats]").forEach((a) => {
        a.href = U.linkWhatsapp(a.dataset.whats);
        a.addEventListener("click", () =>
            rastrear("Contact", {
                metodo: "whatsapp",
                local: a.dataset.local || "",
            }),
        );
    });
    todos("[data-instagram]").forEach((a) => {
        if (C.contato.instagram) a.href = C.contato.instagram;
        else a.hidden = true; // sem link no config = some da página
    });
    todos("[data-ifood]").forEach((a) => {
        const item = a.closest("li") || a;
        if (C.contato.ifood) a.href = C.contato.ifood;
        else item.hidden = true; // sem link no config = some da página
    });

    /* 2. Menu do celular: abre e fecha, fecha com Esc e ao escolher um link */
    const botao = document.querySelector("[data-menu-botao]");
    const menu = document.querySelector("[data-menu]");
    if (botao && menu) {
        const fechar = () => {
            delete menu.dataset.aberto;
            botao.setAttribute("aria-expanded", "false");
        };
        botao.addEventListener("click", () => {
            const abrir = !("aberto" in menu.dataset);
            if (abrir) menu.dataset.aberto = "";
            else fechar();
            botao.setAttribute("aria-expanded", String(abrir));
        });
        menu.addEventListener("click", (e) => {
            if (e.target.closest("a")) fechar();
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && "aberto" in menu.dataset) {
                fechar();
                botao.focus();
            }
        });
    }

    /* 3. Animação ao rolar */
    const blocos = todos("[data-revelar]");
    if ("IntersectionObserver" in window) {
        const obs = new IntersectionObserver(
            (entradas) => {
                entradas.forEach((en) => {
                    if (en.isIntersecting) {
                        en.target.dataset.visivel = "";
                        obs.unobserve(en.target);
                    }
                });
            },
            { rootMargin: "0px 0px -8% 0px" },
        );
        blocos.forEach((b) => obs.observe(b));
    } else {
        blocos.forEach((b) => (b.dataset.visivel = ""));
    }

    /* 4. WhatsApp flutuante e barra "Ver pedido": aparecem quando o gatilho
          (botão da primeira tela) sai da vista, para não cobrir a primeira tela */
    const flutuante = document.querySelector("[data-whats-flutuante]");
    const gatilho = document.querySelector("[data-gatilho-flutuante]");
    const passou = (sim) => {
        if (sim) document.body.dataset.passouAbertura = "";
        else delete document.body.dataset.passouAbertura;
        if (!flutuante) return;
        if (sim) flutuante.dataset.mostrar = "";
        else delete flutuante.dataset.mostrar;
    };
    if (gatilho && "IntersectionObserver" in window) {
        new IntersectionObserver(([en]) =>
            passou(!en.isIntersecting && en.boundingClientRect.top < 0),
        ).observe(gatilho);
    } else {
        passou(true);
    }

    /* 5. Topo transparente que ganha cor depois de rolar um pouco */
    const topo = document.querySelector("[data-topo]");
    if (topo) {
        const marcar = () => {
            if (window.scrollY > 12) topo.dataset.rolou = "";
            else delete topo.dataset.rolou;
        };
        window.addEventListener("scroll", marcar, { passive: true });
        marcar();
    }

    /* 6. Vídeo de fundo: parado (só a capa) para quem pediu menos movimento ou economia de dados */
    todos("[data-video-fundo]").forEach((v) => {
        // celular em pé: capa em retrato, igual ao vídeo que vai tocar
        if (v.dataset.capaRetrato && matchMedia("(max-aspect-ratio: 4/5)").matches)
            v.poster = v.dataset.capaRetrato;
        const conexao = navigator.connection || {};
        if (
            matchMedia("(prefers-reduced-motion: reduce)").matches ||
            conexao.saveData
        ) {
            v.removeAttribute("autoplay");
            v.pause();
            v.preload = "none";
        }
    });

    /* 7. Ano do rodapé */
    todos("[data-ano]").forEach(
        (el) => (el.textContent = new Date().getFullYear()),
    );
})();
