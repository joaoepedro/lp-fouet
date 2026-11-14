/* =========================================================
   Calendário com a cara da marca (o do navegador não aceita estilo).
   Uso: Calendario.ligar(input) num <input type="date" min="AAAA-MM-DD">.
   O input original continua guardando o valor (AAAA-MM-DD), escondido;
   no lugar dele aparece um botão que abre um calendário mensal.
   Teclado: setas mudam o dia, PageUp/PageDown o mês, Enter escolhe, Esc fecha.
   ========================================================= */
window.Calendario = (function () {
    "use strict";
    const MESES = [
        "janeiro",
        "fevereiro",
        "março",
        "abril",
        "maio",
        "junho",
        "julho",
        "agosto",
        "setembro",
        "outubro",
        "novembro",
        "dezembro",
    ];
    const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
    const SEMANA_NOME = [
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado",
    ];
    const iso = (d) =>
        d.getFullYear() +
        "-" +
        String(d.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(d.getDate()).padStart(2, "0");
    const deIso = (s) => {
        const [a, m, d] = s.split("-").map(Number);
        return new Date(a, m - 1, d);
    };
    const legivel = (d) =>
        SEMANA_NOME[d.getDay()] +
        ", " +
        String(d.getDate()).padStart(2, "0") +
        "/" +
        String(d.getMonth() + 1).padStart(2, "0");
    let contador = 0;
    let aberto = null;

    document.addEventListener("click", (e) => {
        if (aberto && !aberto.raiz.contains(e.target)) aberto.fechar(false);
    });

    function ligar(input) {
        if (input.dataset.calendarioLigado) return;
        input.dataset.calendarioLigado = "";
        const id = "cal-" + ++contador;
        const minimo = input.min ? deIso(input.min) : new Date();
        minimo.setHours(0, 0, 0, 0);

        const raiz = document.createElement("div");
        raiz.className = "calendario";
        raiz.innerHTML =
            '<button type="button" class="calendario__campo" aria-haspopup="dialog" aria-expanded="false" aria-controls="' +
            id +
            '"><span data-cal-texto>Escolha o dia</span>' +
            '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M5 6h14v14H5zM5 10h14M9 3v4M15 3v4"/></svg></button>' +
            '<div class="calendario__painel" id="' +
            id +
            '" role="dialog" aria-modal="false" aria-label="Escolher o dia" hidden>' +
            '<div class="calendario__topo">' +
            '<button type="button" data-cal-mes="-1" aria-label="Mês anterior">‹</button>' +
            '<p class="calendario__mes" aria-live="polite"></p>' +
            '<button type="button" data-cal-mes="1" aria-label="Próximo mês">›</button></div>' +
            '<table class="calendario__grade" role="grid"><thead><tr>' +
            SEMANA.map(
                (s, i) =>
                    '<th scope="col"><abbr title="' +
                    SEMANA_NOME[i] +
                    '">' +
                    s +
                    "</abbr></th>",
            ).join("") +
            "</tr></thead><tbody></tbody></table></div>";
        input.insertAdjacentElement("afterend", raiz);
        input.classList.add("visually-hidden");
        input.tabIndex = -1;
        input.setAttribute("aria-hidden", "true");

        const campo = raiz.querySelector(".calendario__campo");
        const texto = raiz.querySelector("[data-cal-texto]");
        const painel = raiz.querySelector(".calendario__painel");
        const titulo = raiz.querySelector(".calendario__mes");
        const corpo = raiz.querySelector("tbody");
        const voltar = raiz.querySelector('[data-cal-mes="-1"]');
        // O rótulo do campo é o mesmo do input original
        const rotulo = input.closest(".campo");
        if (rotulo) {
            const span = rotulo.querySelector("span");
            if (span) {
                span.id = id + "-rotulo";
                campo.setAttribute(
                    "aria-labelledby",
                    span.id + " " + id + "-valor",
                );
                texto.id = id + "-valor";
            }
        }

        let foco = input.value ? deIso(input.value) : new Date(minimo);

        function desenhar() {
            const ano = foco.getFullYear();
            const mes = foco.getMonth();
            titulo.textContent = MESES[mes] + " " + ano;
            voltar.disabled =
                ano < minimo.getFullYear() ||
                (ano === minimo.getFullYear() && mes <= minimo.getMonth());
            const primeiro = new Date(ano, mes, 1);
            const inicio = new Date(ano, mes, 1 - primeiro.getDay());
            let html = "";
            for (let semana = 0; semana < 6; semana++) {
                html += "<tr>";
                for (let dia = 0; dia < 7; dia++) {
                    const d = new Date(
                        inicio.getFullYear(),
                        inicio.getMonth(),
                        inicio.getDate() + semana * 7 + dia,
                    );
                    const fora = d.getMonth() !== mes;
                    const antes = d < minimo;
                    const escolhido = input.value === iso(d);
                    const focado = iso(d) === iso(foco);
                    html +=
                        '<td role="gridcell"' +
                        (escolhido ? ' aria-selected="true"' : "") +
                        ">" +
                        (fora
                            ? ""
                            : '<button type="button" data-dia="' +
                              iso(d) +
                              '" tabindex="' +
                              (focado ? "0" : "-1") +
                              '"' +
                              (antes ? " disabled" : "") +
                              ' aria-label="' +
                              d.getDate() +
                              " de " +
                              MESES[d.getMonth()] +
                              ", " +
                              SEMANA_NOME[d.getDay()] +
                              '">' +
                              d.getDate() +
                              "</button>") +
                        "</td>";
                }
                html += "</tr>";
            }
            corpo.innerHTML = html;
        }
        function focar() {
            const b = corpo.querySelector('[tabindex="0"]');
            if (b) b.focus();
        }
        function abrir() {
            if (aberto && aberto !== api) aberto.fechar(false);
            foco = input.value ? deIso(input.value) : new Date(minimo);
            desenhar();
            painel.hidden = false;
            campo.setAttribute("aria-expanded", "true");
            aberto = api;
            focar();
        }
        function fechar(devolverFoco) {
            painel.hidden = true;
            campo.setAttribute("aria-expanded", "false");
            if (aberto === api) aberto = null;
            if (devolverFoco) campo.focus();
        }
        function escolher(valor) {
            input.value = valor;
            texto.textContent = legivel(deIso(valor));
            raiz.dataset.preenchido = "";
            input.dispatchEvent(new Event("change", { bubbles: true }));
            fechar(true);
        }
        function mover(dias, meses) {
            const n = new Date(foco);
            if (meses) n.setMonth(n.getMonth() + meses);
            if (dias) n.setDate(n.getDate() + dias);
            if (n < minimo) return;
            foco = n;
            desenhar();
            focar();
        }

        campo.addEventListener("click", () =>
            painel.hidden ? abrir() : fechar(true),
        );
        painel.addEventListener("click", (e) => {
            const b = e.target.closest("button");
            if (!b || b.disabled) return;
            if (b.dataset.dia) escolher(b.dataset.dia);
            if (b.dataset.calMes) {
                const n = new Date(
                    foco.getFullYear(),
                    foco.getMonth() + Number(b.dataset.calMes),
                    1,
                );
                foco = n < minimo ? new Date(minimo) : n;
                desenhar();
            }
        });
        painel.addEventListener("keydown", (e) => {
            const teclas = {
                ArrowLeft: [-1, 0],
                ArrowRight: [1, 0],
                ArrowUp: [-7, 0],
                ArrowDown: [7, 0],
                PageUp: [0, -1],
                PageDown: [0, 1],
            };
            if (e.key === "Escape") {
                e.preventDefault();
                fechar(true);
            } else if (teclas[e.key] && e.target.dataset.dia) {
                e.preventDefault();
                mover(...teclas[e.key]);
            }
        });

        const api = { raiz, fechar, abrir };
        input.addEventListener("calendario:abrir", abrir);
        return api;
    }

    return { ligar };
})();
