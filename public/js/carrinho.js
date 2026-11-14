/* =========================================================
   Cardápio, carrinho e finalização do pedido.
   - Monta os cartões do cardápio, a caixa presente, as encomendas e as festas a partir de cardapio.js
   - Guarda o carrinho na sessão (sobrevive à ida e volta do pagamento)
   - Finaliza de dois jeitos: mensagem pronta no WhatsApp ou pagamento online
     (InfinitePay: o link é criado só com a InfiniteTag, sem chave secreta)

   Ganchos no HTML:
   data-cardapio                 → onde entram as categorias
   data-combo                    → montador da caixa presente
   data-encomendas="bolos|tortas"→ cartões de encomenda (tamanho + dia)
   data-festas                   → cartões de festa (quantidade + dia)
   data-carrinho-abrir           → botões que abrem o carrinho (o contador vai em data-carrinho-qtd)
   data-carrinho                 → <dialog> do carrinho
   data-barra-pedido             → barra fixa "Ver pedido" (estado: data-mostrar)
   ========================================================= */
window.Pedido = (function () {
    "use strict";
    const C = window.CONFIG;
    const M = window.CARDAPIO;
    const U = window.Utils;

    const real = (c) =>
        (c / 100).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        });
    const esc = (s) =>
        String(s).replace(
            /[&<>"']/g,
            (ch) =>
                ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                })[ch],
        );
    // "Cookie Clássico" → "Cookie clássico" (nomes de marca ficam como estão)
    const MARCAS = ["Biscoff", "Oreo", "Ninho", "Nutella"];
    const minuscula = (nome) =>
        MARCAS.includes(nome.split(" ")[0])
            ? nome
            : nome.charAt(0).toLowerCase() + nome.slice(1);
    // A chave de cada produto é "categoria-id" (é também o nome da foto)
    const produtos = {};
    M.categorias.forEach((cat) =>
        cat.itens.forEach((p) => {
            const chave = cat.id + "-" + p.id;
            const comeca = p.nome
                .toLowerCase()
                .startsWith(cat.singular.toLowerCase());
            produtos[chave] = {
                ...p,
                chave,
                categoria: cat.id,
                nomePedido: comeca
                    ? p.nome
                    : cat.singular + " " + minuscula(p.nome),
            };
        }),
    );

    /* ---------- Carrinho (na sessão) ---------- */
    let itens = U.sessao.ler("carrinho") || [];
    const ouvintes = [];
    function salvar() {
        U.sessao.gravar("carrinho", itens);
        ouvintes.forEach((f) => f());
    }
    function adicionar(item) {
        const igual = itens.find((i) => i.chave === item.chave);
        if (igual) igual.qtd += item.qtd || 1;
        else itens.push({ qtd: 1, ...item });
        salvar();
    }
    function mudarQtd(chave, delta) {
        const i = itens.find((x) => x.chave === chave);
        if (!i) return;
        i.qtd += delta;
        if (i.qtd <= 0) itens = itens.filter((x) => x !== i);
        salvar();
    }
    const qtdDe = (chave) =>
        (itens.find((i) => i.chave === chave) || {}).qtd || 0;
    const total = () => itens.reduce((s, i) => s + i.preco * i.qtd, 0);
    const contagem = () => itens.reduce((s, i) => s + i.qtd, 0);
    function esvaziar() {
        itens = [];
        salvar();
    }

    /* ---------- Horário de atendimento ----------
       Calculado na hora de Ribeirão Preto (não na do aparelho de quem visita).
       Para testar: ?simular=fechado ou ?simular=aberto no endereço. */
    const DIAS = [
        "domingo",
        "segunda",
        "terca",
        "quarta",
        "quinta",
        "sexta",
        "sabado",
    ];
    const DIAS_NOME = [
        "domingo",
        "segunda",
        "terça",
        "quarta",
        "quinta",
        "sexta",
        "sábado",
    ];
    const minutos = (hhmm) => {
        const [h, m] = hhmm.split(":").map(Number);
        return h * 60 + m;
    };
    const horaBonita = (hhmm) => {
        const [h, m] = hhmm.split(":");
        return Number(h) + "h" + (m !== "00" ? m : "");
    };
    function situacaoLoja() {
        const H = C.pedidos.horario;
        const simular = new URLSearchParams(location.search).get("simular");
        if (!H) return { aberta: true };
        const partes = new Intl.DateTimeFormat("en-US", {
            timeZone: H.fuso,
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23",
        }).formatToParts(new Date());
        const pega = (t) => (partes.find((p) => p.type === t) || {}).value;
        const dia = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
            pega("weekday"),
        );
        const agora = Number(pega("hour")) * 60 + Number(pega("minute"));
        const hoje = H.dias[DIAS[dia]];
        let aberta =
            !!hoje && agora >= minutos(hoje[0]) && agora < minutos(hoje[1]);
        if (simular === "fechado") aberta = false;
        if (simular === "aberto") aberta = true;
        if (aberta) return { aberta, fecha: horaBonita(hoje[1]) };
        // Próxima abertura: hoje mais tarde ou nos próximos dias
        for (let k = 0; k < 8; k++) {
            const d = (dia + k) % 7;
            const h = H.dias[DIAS[d]];
            if (!h) continue;
            if (k === 0 && agora >= minutos(h[0])) continue;
            const quando = k === 0 ? "hoje" : k === 1 ? "amanhã" : DIAS_NOME[d];
            return { aberta, abre: quando + " às " + horaBonita(h[0]) };
        }
        return { aberta };
    }

    /* ---------- Mensagem do pedido ---------- */
    function mensagem(pedido, pago) {
        const linhas = [];
        linhas.push(
            pago
                ? "✅ *PEDIDO PAGO* · " + pedido.numero
                : "Olá, " + C.empresa.nome + "! Quero fazer um pedido 🍰",
        );
        if (!pago) linhas.push("Pedido " + pedido.numero);
        linhas.push("");
        pedido.itens.forEach((i) => {
            linhas.push(i.qtd + "x " + i.nome + " · " + real(i.preco * i.qtd));
            if (i.detalhe) linhas.push("   " + i.detalhe);
        });
        if (pedido.taxa) linhas.push("Taxa de entrega · " + real(pedido.taxa));
        linhas.push("");
        linhas.push("*Total: " + real(pedido.total) + "*");
        if (pago) {
            linhas.push(
                "Pago com " +
                    (pedido.metodo === "credit_card" ? "cartão" : "Pix") +
                    " pelo site",
            );
            if (pedido.comprovante)
                linhas.push("Comprovante: " + pedido.comprovante);
        }
        linhas.push("");
        linhas.push("Nome: " + pedido.nome);
        if (pedido.entrega === "entrega") {
            linhas.push("Entrega: " + pedido.endereco);
            if (C.pedidos.taxaEntrega == null)
                linhas.push("(a taxa de entrega a gente combina por aqui)");
        } else {
            linhas.push("Vou retirar " + (C.pedidos.retirada || "na loja"));
        }
        if (pedido.obs) linhas.push("Observação: " + pedido.obs);
        return linhas.join("\n");
    }
    const linkWhats = (texto) =>
        "https://wa.me/" +
        C.contato.whatsapp +
        "?text=" +
        encodeURIComponent(texto);

    /* ---------- Cartões do cardápio ---------- */
    function botaoQtd(chave) {
        const q = qtdDe(chave);
        const nome = (produtos[chave] || {}).nome || "";
        if (!q)
            return (
                '<button type="button" class="btn-add" data-add="' +
                chave +
                '">Adicionar<span class="visually-hidden"> ' +
                esc(nome) +
                "</span></button>"
            );
        return (
            '<div class="qtd" role="group" aria-label="Quantidade de ' +
            esc(nome) +
            '">' +
            '<button type="button" data-menos="' +
            chave +
            '" aria-label="Tirar um">−</button>' +
            '<output aria-live="polite">' +
            q +
            "</output>" +
            '<button type="button" data-mais="' +
            chave +
            '" aria-label="Pôr mais um">+</button></div>'
        );
    }
    function montarCardapio(alvo) {
        alvo.innerHTML = M.categorias
            .map(
                (cat) =>
                    '<div class="categoria" id="cat-' +
                    cat.id +
                    '"><h3 class="categoria__titulo"><span>' +
                    cat.nome +
                    '</span> <span class="categoria__faixa">' +
                    cat.faixa +
                    "</span></h3>" +
                    '<ul class="grade-doces" role="list">' +
                    cat.itens
                        .map((item) => {
                            const p = produtos[cat.id + "-" + item.id];
                            return (
                                '<li class="doce">' +
                                // foto pequena no celular (lista) e maior na grade do computador
                                '<img src="assets/img/' +
                                p.chave +
                                '.webp" srcset="assets/img/' +
                                p.chave +
                                "-300.webp 300w, assets/img/" +
                                p.chave +
                                '.webp 600w" sizes="(max-width: 39.99rem) 6.5rem, 17rem" alt="" width="600" height="750" loading="lazy" decoding="async">' +
                                '<h4 class="doce__nome">' +
                                p.nome +
                                "</h4>" +
                                '<p class="doce__desc">' +
                                p.desc +
                                "</p>" +
                                '<p class="doce__rodape"><span class="doce__preco">' +
                                real(p.preco) +
                                '</span><span class="doce__peso">' +
                                p.peso +
                                "</span></p>" +
                                '<div class="doce__acao" data-acao="' +
                                p.chave +
                                '">' +
                                botaoQtd(p.chave) +
                                "</div></li>"
                            );
                        })
                        .join("") +
                    "</ul></div>",
            )
            .join("");
        const atualizar = () =>
            alvo.querySelectorAll("[data-acao]").forEach((el) => {
                const foco = el.contains(document.activeElement);
                el.innerHTML = botaoQtd(el.dataset.acao);
                if (foco) {
                    const b =
                        el.querySelector("[data-mais]") ||
                        el.querySelector("[data-add]");
                    if (b) b.focus({ preventScroll: true });
                }
            });
        ouvintes.push(atualizar);
        alvo.addEventListener("click", (e) => {
            const b = e.target.closest("button");
            if (!b) return;
            const id = b.dataset.add || b.dataset.mais || b.dataset.menos;
            if (!id) return;
            if (b.dataset.menos) return mudarQtd(id, -1);
            const p = produtos[id];
            adicionar({ chave: id, nome: p.nomePedido, preco: p.preco });
            if (b.dataset.add) avisar(p.nomePedido + " no pedido");
        });
    }

    /* ---------- Caixa presente ---------- */
    function montarCombo(alvo) {
        const cb = M.combo;
        let n = 0;
        const selects = cb.slots
            .map((slot) => {
                const cat = M.categorias.find((c) => c.id === slot.categoria);
                const opcoes = cat.itens
                    .map(
                        (p) =>
                            '<option value="' +
                            cat.id +
                            "-" +
                            p.id +
                            '">' +
                            p.nome +
                            (p.especial
                                ? " (+ " + real(cb.acrescimo) + ")"
                                : "") +
                            "</option>",
                    )
                    .join("");
                let html = "";
                for (let k = 1; k <= slot.quantidade; k++) {
                    n++;
                    html +=
                        '<label class="combo__slot"><span>' +
                        cat.singular +
                        (slot.quantidade > 1 ? " " + k : "") +
                        '</span><select data-slot name="slot-' +
                        n +
                        '">' +
                        opcoes +
                        "</select></label>";
                }
                return html;
            })
            .join("");
        alvo.innerHTML =
            '<div class="combo__slots">' +
            selects +
            "</div>" +
            '<p class="combo__total">Sua caixa: <strong data-combo-preco>' +
            real(cb.preco) +
            "</strong></p>" +
            '<button type="button" class="btn btn--marca" data-combo-add>Pôr a caixa no pedido</button>';
        const precoAtual = () => {
            const ids = [...alvo.querySelectorAll("[data-slot]")].map(
                (s) => s.value,
            );
            const extra =
                ids.filter((id) => produtos[id].especial).length * cb.acrescimo;
            return { ids, preco: cb.preco + extra };
        };
        alvo.addEventListener("change", () => {
            alvo.querySelector("[data-combo-preco]").textContent = real(
                precoAtual().preco,
            );
        });
        alvo.querySelector("[data-combo-add]").addEventListener("click", () => {
            const { ids, preco } = precoAtual();
            const detalhe = ids.map((id) => produtos[id].nomePedido).join(", ");
            adicionar({
                chave: "caixa:" + ids.join("+"),
                nome: cb.nome,
                detalhe,
                preco,
            });
            avisar("Caixa presente no pedido");
        });
    }

    /* ---------- Encomendas: bolos e tortas (tamanho + dia) e festas (quantidade + dia) ---------- */
    function dataMinima() {
        // dia de hoje em Ribeirão Preto + antecedência (não o fuso do aparelho)
        const hoje = new Intl.DateTimeFormat("en-CA", {
            timeZone: C.pedidos.horario.fuso,
        }).format(new Date());
        const d = new Date(hoje + "T12:00");
        d.setDate(d.getDate() + (C.pedidos.antecedenciaEncomenda || 0));
        return d.toISOString().slice(0, 10);
    }
    const campoData = (id) =>
        '<div class="campo"><span>Para quando?</span><input type="date" name="data-' +
        id +
        '" min="' +
        dataMinima() +
        '" required><small>Pedidos com pelo menos ' +
        C.pedidos.antecedenciaEncomenda +
        " dias de antecedência.</small></div>";
    function pedirDia(data) {
        if (data.value && data.value >= data.min) return true;
        avisar("Escolha o dia da entrega", true);
        // depois do clique terminar, senão o próprio clique fecha o calendário
        setTimeout(() => data.dispatchEvent(new Event("calendario:abrir")));
        return false;
    }
    const diaBonito = (iso) =>
        new Date(iso + "T12:00").toLocaleDateString("pt-BR");

    function montarEncomendas(alvo) {
        const grupo = alvo.dataset.encomendas;
        // bolos ficam logo abaixo do título da seção (h2); tortas, abaixo de "Tortas inteiras" (h3)
        const h = grupo === "tortas" ? "h4" : "h3";
        alvo.innerHTML = M.encomendas
            .filter((e) => e.grupo === grupo)
            .map((e) => {
                const tams = M.tamanhos[e.tipo];
                const menor = Math.min(...tams.map((t) => e.precos[t.id]));
                return (
                    '<li class="encomenda" data-encomenda="' +
                    e.id +
                    '">' +
                    '<img src="assets/img/' +
                    e.id +
                    '.webp" alt="" width="720" height="540" loading="lazy" decoding="async">' +
                    "<" +
                    h +
                    ' class="encomenda__nome">' +
                    e.nome +
                    "</" +
                    h +
                    ">" +
                    '<p class="encomenda__desc">' +
                    e.desc +
                    "</p>" +
                    '<p class="encomenda__preco" data-preco-atual>a partir de ' +
                    real(menor) +
                    "</p>" +
                    '<fieldset class="tamanhos"><legend>Tamanho</legend>' +
                    tams
                        .map(
                            (t, i) =>
                                '<label><input type="radio" name="tam-' +
                                e.id +
                                '" value="' +
                                t.id +
                                '"' +
                                (i === 0 ? " checked" : "") +
                                "><span><b>" +
                                t.nome +
                                "</b> " +
                                t.peso +
                                "<small>" +
                                t.serve +
                                "</small><em>" +
                                real(e.precos[t.id]) +
                                "</em></span></label>",
                        )
                        .join("") +
                    "</fieldset>" +
                    (e.tipo === "bolo"
                        ? '<label class="campo"><span>Frase no bolo <small>(opcional)</small></span><input type="text" name="frase-' +
                          e.id +
                          '" maxlength="40" placeholder="Ex.: Feliz aniversário, Ana"></label>'
                        : "") +
                    campoData(e.id) +
                    '<button type="button" class="btn btn--marca" data-encomenda-add>Pôr no pedido</button>' +
                    "</li>"
                );
            })
            .join("");
        if (window.Calendario)
            alvo.querySelectorAll('input[type="date"]').forEach((i) =>
                window.Calendario.ligar(i),
            );
        const tamanhoDe = (li, e) => {
            const id = li.querySelector('input[type="radio"]:checked').value;
            return M.tamanhos[e.tipo].find((t) => t.id === id);
        };
        alvo.addEventListener("change", (ev) => {
            if (ev.target.type !== "radio") return;
            const li = ev.target.closest("[data-encomenda]");
            const e = M.encomendas.find((x) => x.id === li.dataset.encomenda);
            const t = tamanhoDe(li, e);
            li.querySelector("[data-preco-atual]").textContent =
                real(e.precos[t.id]) + " · " + t.peso;
        });
        alvo.addEventListener("click", (ev) => {
            const b = ev.target.closest("[data-encomenda-add]");
            if (!b) return;
            const li = b.closest("[data-encomenda]");
            const e = M.encomendas.find((x) => x.id === li.dataset.encomenda);
            const data = li.querySelector('input[type="date"]');
            if (!pedirDia(data)) return;
            const t = tamanhoDe(li, e);
            const fraseEl = li.querySelector('input[name^="frase-"]');
            const frase = fraseEl ? fraseEl.value.trim() : "";
            adicionar({
                chave: [e.id, t.id, data.value, frase].join(":"),
                nome:
                    (e.tipo === "bolo" ? "Bolo " : "") +
                    e.nome +
                    " (" +
                    t.nome +
                    ", " +
                    t.peso +
                    ")",
                detalhe:
                    "Para " +
                    diaBonito(data.value) +
                    (frase ? " · frase: “" + frase + "”" : ""),
                preco: e.precos[t.id],
            });
            avisar(e.nome + " no pedido");
        });
    }

    function montarFestas(alvo) {
        alvo.innerHTML = M.festas
            .map(
                (f) =>
                    '<li class="encomenda encomenda--festa" data-festa="' +
                    f.id +
                    '">' +
                    '<img src="assets/img/' +
                    f.id +
                    '.webp" alt="" width="720" height="540" loading="lazy" decoding="async">' +
                    '<h3 class="encomenda__nome">' +
                    f.nome +
                    "</h3>" +
                    '<p class="encomenda__desc">' +
                    f.desc +
                    "</p>" +
                    '<p class="encomenda__unidade">' +
                    real(f.preco) +
                    " a unidade · mínimo " +
                    f.minimo +
                    "</p>" +
                    '<div class="campo"><span id="rot-' +
                    f.id +
                    '">Quantidade</span>' +
                    '<div class="qtd qtd--festa" role="group" aria-labelledby="rot-' +
                    f.id +
                    '"><button type="button" data-festa-menos aria-label="Tirar ' +
                    f.passo +
                    '">−</button><output aria-live="polite" data-festa-qtd>' +
                    f.minimo +
                    '</output><button type="button" data-festa-mais aria-label="Pôr mais ' +
                    f.passo +
                    '">+</button></div></div>' +
                    '<p class="encomenda__preco" data-festa-total>' +
                    real(f.preco * f.minimo) +
                    "</p>" +
                    campoData(f.id) +
                    '<button type="button" class="btn btn--marca" data-festa-add>Pôr no pedido</button>' +
                    "</li>",
            )
            .join("");
        if (window.Calendario)
            alvo.querySelectorAll('input[type="date"]').forEach((i) =>
                window.Calendario.ligar(i),
            );
        alvo.addEventListener("click", (ev) => {
            const b = ev.target.closest("button");
            if (!b) return;
            const li = b.closest("[data-festa]");
            if (!li) return;
            const f = M.festas.find((x) => x.id === li.dataset.festa);
            const saida = li.querySelector("[data-festa-qtd]");
            let q = Number(saida.textContent);
            if ("festaMais" in b.dataset || "festaMenos" in b.dataset) {
                q += "festaMais" in b.dataset ? f.passo : -f.passo;
                q = Math.max(f.minimo, q);
                saida.textContent = q;
                li.querySelector("[data-festa-total]").textContent = real(
                    f.preco * q,
                );
                li.querySelector("[data-festa-menos]").disabled = q <= f.minimo;
                return;
            }
            if (!("festaAdd" in b.dataset)) return;
            const data = li.querySelector('input[type="date"]');
            if (!pedirDia(data)) return;
            adicionar({
                chave: f.id + ":" + q + ":" + data.value,
                nome:
                    q + " " + f.nome.charAt(0).toLowerCase() + f.nome.slice(1),
                detalhe:
                    "Festa · para " +
                    diaBonito(data.value) +
                    " · " +
                    real(f.preco) +
                    " cada",
                preco: f.preco * q,
            });
            avisar(f.nome + " no pedido");
        });
        alvo.querySelectorAll("[data-festa-menos]").forEach(
            (b) => (b.disabled = true),
        );
    }

    /* ---------- Aviso rápido ("no pedido") ---------- */
    let caixaAviso;
    let tempoAviso;
    function avisar(texto, alerta) {
        if (!caixaAviso) {
            caixaAviso = document.createElement("p");
            caixaAviso.className = "aviso-add";
            caixaAviso.setAttribute("role", "status");
            document.body.appendChild(caixaAviso);
        }
        caixaAviso.textContent = (alerta ? "" : "✓ ") + texto;
        caixaAviso.dataset.mostrar = "";
        clearTimeout(tempoAviso);
        tempoAviso = setTimeout(() => delete caixaAviso.dataset.mostrar, 2200);
    }

    /* ---------- Carrinho (dialog) e finalização ---------- */
    function numeroPedido() {
        const d = new Date();
        return (
            "FO" +
            String(d.getDate()).padStart(2, "0") +
            String(d.getMonth() + 1).padStart(2, "0") +
            "-" +
            Math.random().toString(36).slice(2, 6).toUpperCase()
        );
    }
    /* ---------- Dados para entrega (CEP → endereço pela ViaCEP) ---------- */
    const semAcento = (t) =>
        String(t || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .toLowerCase();
    function atendeCidade(cidade) {
        const area = C.pedidos.areaEntrega || [];
        return (
            !area.length || area.some((c) => semAcento(c) === semAcento(cidade))
        );
    }
    function textoEndereco(d) {
        return (
            d.logradouro +
            ", " +
            d.numero +
            (d.complemento ? ", " + d.complemento : "") +
            " – " +
            d.bairro +
            ", " +
            d.cidade +
            "-" +
            d.estado +
            ", CEP " +
            d.cep
        );
    }
    function montarEntrega(tela, aoSalvar) {
        const form = tela.querySelector("[data-entrega-form]");
        const campo = form.elements;
        const status = tela.querySelector("[data-entrega-status]");
        const erro = tela.querySelector("[data-entrega-erro]");
        const nomes = [
            "cep",
            "logradouro",
            "numero",
            "complemento",
            "bairro",
            "cidade",
            "estado",
        ];
        let buscando = null;
        let ultimoCep = "";

        const dizer = (texto, tipo) => {
            status.textContent = texto;
            if (tipo) status.dataset.tipo = tipo;
            else delete status.dataset.tipo;
        };
        const foraDaArea = () =>
            "Por enquanto entregamos só em " +
            C.pedidos.areaEntrega.join(", ") +
            ". Se preferir, volte e escolha retirar no ateliê.";

        async function buscarCep(numeros) {
            if (buscando) buscando.abort();
            const controle = new AbortController();
            buscando = controle;
            ultimoCep = numeros;
            const prazo = setTimeout(() => controle.abort(), 6000);
            dizer("Buscando o endereço…");
            form.setAttribute("aria-busy", "true");
            try {
                const r = await fetch(
                    "https://viacep.com.br/ws/" + numeros + "/json/",
                    { signal: controle.signal },
                );
                if (!r.ok) throw new Error("ViaCEP " + r.status);
                const d = await r.json();
                if (buscando !== controle) return;
                if (d.erro) {
                    ultimoCep = "";
                    return dizer(
                        "Não achamos esse CEP. Confira os números ou preencha o endereço abaixo.",
                        "erro",
                    );
                }
                campo.logradouro.value = d.logradouro || "";
                campo.bairro.value = d.bairro || "";
                campo.cidade.value = d.localidade || "";
                if (d.uf) campo.estado.value = d.uf;
                if (!atendeCidade(d.localidade))
                    return dizer(foraDaArea(), "erro");
                if (d.logradouro) {
                    dizer("Endereço encontrado. Agora é só o número.");
                    campo.numero.focus();
                } else {
                    dizer("CEP encontrado. Complete o logradouro e o bairro.");
                    campo.logradouro.focus();
                }
            } catch {
                if (buscando !== controle) return; // trocou de CEP no meio
                ultimoCep = "";
                dizer(
                    "Não deu para buscar o CEP agora. Preencha o endereço abaixo.",
                    "erro",
                );
            } finally {
                clearTimeout(prazo);
                if (buscando === controle) {
                    buscando = null;
                    form.removeAttribute("aria-busy");
                }
            }
        }

        // máscara 00000-000; com 8 números, busca sozinho
        campo.cep.addEventListener("input", () => {
            const n = campo.cep.value.replace(/\D/g, "").slice(0, 8);
            campo.cep.value =
                n.length > 5 ? n.slice(0, 5) + "-" + n.slice(5) : n;
            if (n.length === 8 && n !== ultimoCep) buscarCep(n);
            if (n.length < 8) {
                ultimoCep = "";
                dizer("");
            }
        });
        form.addEventListener("input", () => (erro.hidden = true));

        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (!form.reportValidity()) return;
            const d = {};
            nomes.forEach((n) => (d[n] = campo[n].value.trim()));
            if (!atendeCidade(d.cidade)) {
                erro.textContent = foraDaArea();
                erro.hidden = false;
                campo.cidade.focus();
                return;
            }
            U.sessao.gravar("entrega", d);
            aoSalvar(d);
            tela.close();
        });
        tela.querySelector("[data-entrega-voltar]").addEventListener(
            "click",
            () => tela.close(),
        );
        tela.addEventListener("click", (e) => {
            if (e.target === tela) tela.close();
        });

        return {
            abrir(aviso) {
                const salvo = U.sessao.ler("entrega");
                if (salvo)
                    nomes.forEach((n) => (campo[n].value = salvo[n] || ""));
                ultimoCep = campo.cep.value.replace(/\D/g, "");
                erro.hidden = true;
                dizer(aviso || "", aviso ? "erro" : "");
                tela.showModal();
                campo.cep.focus();
            },
        };
    }

    function montarCarrinho(dlg) {
        const lista = dlg.querySelector("[data-carrinho-lista]");
        const vazio = dlg.querySelector("[data-carrinho-vazio]");
        const fim = dlg.querySelector("[data-carrinho-fim]");
        const totalEl = dlg.querySelector("[data-carrinho-total]");
        const taxaEl = dlg.querySelector("[data-carrinho-taxa]");
        const taxaAviso = dlg.querySelector("[data-taxa-aviso]");
        const form = dlg.querySelector("form");
        // "Pagar agora" é o botão de envio do formulário (Enter num campo também chega nele);
        // a página nunca recarrega: quem decide o que fazer é o clique em data-pagar
        form.addEventListener("submit", (e) => e.preventDefault());
        const endereco = dlg.querySelector("[data-endereco]");
        const abrirEndereco = dlg.querySelector("[data-endereco-abrir]");
        const enderecoTitulo = dlg.querySelector("[data-endereco-titulo]");
        const enderecoTexto = dlg.querySelector("[data-endereco-texto]");
        function mostrarEndereco(d) {
            form.elements.endereco.value = d ? textoEndereco(d) : "";
            enderecoTitulo.textContent = d
                ? "Entregar em (toque para editar)"
                : "Dados para entrega";
            enderecoTexto.textContent = form.elements.endereco.value;
            enderecoTexto.hidden = !d;
        }
        const telaEntrega = document.querySelector("[data-entrega]");
        const painelEntrega = telaEntrega
            ? montarEntrega(telaEntrega, mostrarEndereco)
            : null;
        mostrarEndereco(U.sessao.ler("entrega"));
        abrirEndereco.addEventListener(
            "click",
            () => painelEntrega && painelEntrega.abrir(),
        );
        const pagar = dlg.querySelector("[data-pagar]");
        const enviar = dlg.querySelector("[data-enviar-whats]");
        const contagemEl = dlg.querySelector("[data-carrinho-contagem]");
        const limpar = dlg.querySelector("[data-limpar]");
        const limparTexto = dlg.querySelector("[data-limpar-texto]");
        const avisoHorario = dlg.querySelector("[data-horario-aviso]");
        const podePagar = C.modoDemonstracao || C.pedidos.infiniteTag;
        if (!podePagar) pagar.hidden = true;

        // Pagamento online só no horário de atendimento; o WhatsApp funciona sempre
        function conferirHorario() {
            const sit = situacaoLoja();
            pagar.disabled = !sit.aberta;
            avisoHorario.hidden = false;
            avisoHorario.dataset.aberta = sit.aberta ? "sim" : "nao";
            avisoHorario.textContent = sit.aberta
                ? "Aberto agora" +
                  (sit.fecha ? ", recebendo pedidos até as " + sit.fecha : "") +
                  "."
                : "Estamos fechados agora" +
                  (sit.abre ? " e voltamos " + sit.abre : "") +
                  ". O pagamento online volta nesse horário, mas você já pode mandar o pedido pelo WhatsApp.";
        }
        dlg.addEventListener("carrinho:aberto", conferirHorario);
        conferirHorario();

        // Limpar carrinho: pede um segundo toque para confirmar
        let confirmando = null;
        function cancelarLimpeza() {
            clearTimeout(confirmando);
            confirmando = null;
            delete limpar.dataset.confirmar;
            limparTexto.textContent = "Limpar carrinho";
        }
        limpar.addEventListener("click", () => {
            if (!confirmando) {
                limpar.dataset.confirmar = "";
                limparTexto.textContent = "Toque de novo para limpar";
                confirmando = setTimeout(cancelarLimpeza, 4000);
                return;
            }
            cancelarLimpeza();
            esvaziar();
            avisar("Carrinho limpo");
            const voltar = dlg.querySelector("[data-carrinho-fechar-link]");
            if (voltar) voltar.focus();
        });

        function desenhar() {
            vazio.hidden = itens.length > 0;
            fim.hidden = itens.length === 0;
            lista.innerHTML = itens
                .map(
                    (i) =>
                        '<li class="linha"><div><strong>' +
                        esc(i.nome) +
                        "</strong>" +
                        (i.detalhe
                            ? "<small>" + esc(i.detalhe) + "</small>"
                            : "") +
                        '<span class="linha__preco">' +
                        real(i.preco * i.qtd) +
                        "</span></div>" +
                        '<div class="qtd" role="group" aria-label="Quantidade de ' +
                        esc(i.nome) +
                        '"><button type="button" data-menos="' +
                        esc(i.chave) +
                        '" aria-label="Tirar um">−</button><output>' +
                        i.qtd +
                        '</output><button type="button" data-mais="' +
                        esc(i.chave) +
                        '" aria-label="Pôr mais um">+</button></div></li>',
                )
                .join("");
            const t = taxa();
            taxaEl.hidden = !t;
            taxaEl.querySelector("strong").textContent = real(t);
            totalEl.textContent = real(total() + t);
            const n = contagem();
            contagemEl.textContent = n + (n === 1 ? " item" : " itens");
        }
        // Taxa fixa só para "Entregar em casa" (sem valor no config, é combinada pelo WhatsApp)
        const taxaFixa = C.pedidos.taxaEntrega;
        const taxa = () =>
            taxaFixa != null && form.elements.entrega.value === "entrega"
                ? taxaFixa
                : 0;
        if (taxaFixa != null)
            taxaAviso.textContent =
                "Taxa de entrega: " + real(taxaFixa) + ", já somada no total.";
        ouvintes.push(desenhar);
        desenhar();

        lista.addEventListener("click", (e) => {
            const b = e.target.closest("button");
            if (!b) return;
            if (b.dataset.menos) mudarQtd(b.dataset.menos, -1);
            if (b.dataset.mais) mudarQtd(b.dataset.mais, +1);
            const prox = lista.querySelector("button");
            if (!lista.contains(document.activeElement))
                (prox || dlg.querySelector("[data-carrinho-fechar]")).focus();
        });
        form.addEventListener("change", () => {
            const entrega = form.elements.entrega.value === "entrega";
            endereco.hidden = !entrega;
            desenhar();
        });

        function lerPedido() {
            if (!form.reportValidity()) return null;
            // endereço fica num campo escondido: sem ele, abre o painel de entrega
            if (
                form.elements.entrega.value === "entrega" &&
                !form.elements.endereco.value
            ) {
                if (painelEntrega)
                    painelEntrega.abrir(
                        "Falta só o endereço para a gente entregar.",
                    );
                else abrirEndereco.focus();
                return null;
            }
            return {
                numero: numeroPedido(),
                itens: itens.map((i) => ({ ...i })),
                taxa: taxa(),
                total: total() + taxa(),
                nome: form.elements.nome.value.trim(),
                entrega: form.elements.entrega.value,
                endereco: form.elements.endereco.value.trim(),
                obs: form.elements.obs.value.trim(),
            };
        }

        enviar.addEventListener("click", () => {
            const p = lerPedido();
            if (!p) return;
            const a = document.createElement("a");
            a.href = linkWhats(mensagem(p, false));
            a.target = "_blank";
            a.rel = "noopener";
            document.body.appendChild(a);
            a.click();
            a.remove();
            if (window.rastrear)
                window.rastrear("Contact", {
                    metodo: "whatsapp",
                    local: "carrinho",
                });
        });

        pagar.addEventListener("click", async () => {
            if (!situacaoLoja().aberta) return conferirHorario();
            const p = lerPedido();
            if (!p) return;
            U.sessao.gravar("pedido-" + p.numero, p);
            const volta = new URL(C.pedidos.paginaConfirmacao, location.href)
                .href;
            if (C.modoDemonstracao) return checkoutSimulado(p, volta);
            pagar.disabled = true;
            pagar.textContent = "Abrindo o pagamento…";
            try {
                const r = await fetch(
                    "https://api.checkout.infinitepay.io/links",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            handle: C.pedidos.infiniteTag,
                            order_nsu: p.numero,
                            redirect_url: volta,
                            items: p.itens
                                .map((i) => ({
                                    description:
                                        i.nome +
                                        (i.detalhe
                                            ? " (" + i.detalhe + ")"
                                            : ""),
                                    price: i.preco,
                                    quantity: i.qtd,
                                }))
                                .concat(
                                    p.taxa
                                        ? [
                                              {
                                                  description:
                                                      "Taxa de entrega",
                                                  price: p.taxa,
                                                  quantity: 1,
                                              },
                                          ]
                                        : [],
                                ),
                            customer: { name: p.nome },
                        }),
                    },
                );
                const dados = await r.json();
                const url = dados.url || dados.checkout_url || dados.link;
                if (!r.ok || !url) throw new Error("sem link");
                location.href = url;
            } catch {
                pagar.disabled = false;
                pagar.textContent = "Pagar agora (Pix ou cartão)";
                avisar(
                    "Não deu para abrir o pagamento. Envie pelo WhatsApp.",
                    true,
                );
            }
        });
    }

    /* Tela de pagamento simulada (só no protótipo) */
    function checkoutSimulado(p, volta) {
        let dlg = document.querySelector(".checkout-demo");
        if (!dlg) {
            dlg = document.createElement("dialog");
            dlg.className = "checkout-demo";
            dlg.setAttribute("aria-labelledby", "checkout-demo-titulo");
            dlg.innerHTML =
                '<p class="checkout-demo__selo">Simulação do pagamento</p>' +
                '<h2 id="checkout-demo-titulo">Pagamento seguro</h2>' +
                '<p class="checkout-demo__loja"></p>' +
                '<p class="checkout-demo__valor"></p>' +
                "<fieldset><legend>Como prefere pagar?</legend>" +
                '<label><input type="radio" name="metodo" value="pix" checked> Pix</label>' +
                '<label><input type="radio" name="metodo" value="credit_card"> Cartão de crédito</label></fieldset>' +
                '<button type="button" class="btn btn--marca" data-simular>Pagar</button>' +
                '<button type="button" class="checkout-demo__cancelar" data-cancelar>Voltar ao pedido</button>' +
                '<p class="checkout-demo__nota">No site publicado, esta tela é o pagamento da InfinitePay: Pix ou cartão em até 12x, e o dinheiro cai na conta da loja.</p>';
            document.body.appendChild(dlg);
            dlg.querySelector("[data-cancelar]").addEventListener("click", () =>
                dlg.close(),
            );
        }
        dlg.querySelector(".checkout-demo__loja").textContent =
            C.empresa.nome + " · pedido " + p.numero;
        dlg.querySelector(".checkout-demo__valor").textContent = real(p.total);
        const btn = dlg.querySelector("[data-simular]");
        btn.textContent = "Pagar " + real(p.total);
        btn.onclick = () => {
            const metodo = dlg.querySelector(
                'input[name="metodo"]:checked',
            ).value;
            const u = new URL(volta);
            u.searchParams.set("order_nsu", p.numero);
            u.searchParams.set("transaction_nsu", "DEMO" + Date.now());
            u.searchParams.set("slug", "demonstracao");
            u.searchParams.set("capture_method", metodo);
            u.searchParams.set(
                "receipt_url",
                "https://comprovante.infinitepay.io/demonstracao",
            );
            location.href = u.href;
        };
        dlg.showModal();
    }

    /* ---------- Atalhos: marca o trecho que está na tela, como no iFood ----------
       Vale o último trecho cujo começo já passou logo abaixo da barra de atalhos.
       (Com o IntersectionObserver, o título "Tortas inteiras" ficava acima da faixa
       de leitura e o filtro marcado continuava sendo o de bolos.) */
    function marcarAtalhos() {
        const barra = document.querySelector("[data-atalhos]");
        if (!barra) return;
        const links = [...barra.querySelectorAll('a[href^="#"]')];
        const pares = links
            .map((a) => [a, document.querySelector(a.getAttribute("href"))])
            .filter(([, el]) => el);
        let fixo = null; // depois de um toque, marca o escolhido até a rolagem parar
        let tempoFixo;
        function ativar(link) {
            links.forEach((a) => {
                if (a === link) {
                    if (a.getAttribute("aria-current") !== "true") {
                        a.setAttribute("aria-current", "true");
                        // o escolhido fica onde o primeiro botão começa (sem pular para a borda)
                        barra.scrollTo({
                            left: a.offsetLeft - links[0].offsetLeft,
                            behavior: "smooth",
                        });
                    }
                } else a.removeAttribute("aria-current");
            });
        }
        function atualizar() {
            if (fixo) return ativar(fixo);
            const linha = barra.getBoundingClientRect().bottom + 48;
            let atual = null;
            pares.forEach(([a, el]) => {
                if (el.getBoundingClientRect().top <= linha) atual = a;
            });
            // depois do fim das festas, nada fica marcado
            const area = barra.parentElement.getBoundingClientRect();
            if (area.bottom < linha) atual = null;
            ativar(atual);
        }
        let pedido = false;
        window.addEventListener(
            "scroll",
            () => {
                if (fixo) {
                    clearTimeout(tempoFixo);
                    tempoFixo = setTimeout(() => {
                        fixo = null;
                        atualizar();
                    }, 180);
                }
                if (pedido) return;
                pedido = true;
                requestAnimationFrame(() => {
                    pedido = false;
                    atualizar();
                });
            },
            { passive: true },
        );
        barra.addEventListener("click", (e) => {
            const a = e.target.closest("a");
            if (!a) return;
            fixo = a;
            ativar(a);
            clearTimeout(tempoFixo);
            tempoFixo = setTimeout(() => {
                fixo = null;
                atualizar();
            }, 1200);
        });
        atualizar();
    }

    /* ---------- Ligações da página ---------- */
    function iniciar() {
        const cardapio = document.querySelector("[data-cardapio]");
        if (cardapio) montarCardapio(cardapio);
        const combo = document.querySelector("[data-combo]");
        if (combo) montarCombo(combo);
        document
            .querySelectorAll("[data-encomendas]")
            .forEach((el) => montarEncomendas(el));
        const festas = document.querySelector("[data-festas]");
        if (festas) montarFestas(festas);

        const dlg = document.querySelector("[data-carrinho]");
        if (dlg) {
            montarCarrinho(dlg);
            document.addEventListener("click", (e) => {
                if (e.target.closest("[data-carrinho-abrir]")) {
                    dlg.showModal();
                    dlg.dispatchEvent(new Event("carrinho:aberto"));
                }
            });
            dlg.querySelector("[data-carrinho-fechar]").addEventListener(
                "click",
                () => dlg.close(),
            );
            dlg.addEventListener("click", (e) => {
                if (
                    e.target === dlg ||
                    e.target.closest("[data-carrinho-fechar-link]")
                )
                    dlg.close();
            });
        }
        marcarAtalhos();
        document.querySelectorAll("[data-ifood]").forEach((a) => {
            if (C.contato.ifood) a.href = C.contato.ifood;
            else a.hidden = true;
        });
        const marcar = () => {
            const n = contagem();
            document.querySelectorAll("[data-carrinho-qtd]").forEach((el) => {
                el.textContent = n;
                el.hidden = n === 0;
            });
            document
                .querySelectorAll("[data-carrinho-total-barra]")
                .forEach((el) => {
                    el.textContent = real(total());
                });
            const barra = document.querySelector("[data-barra-pedido]");
            if (barra) {
                if (n) barra.dataset.mostrar = "";
                else delete barra.dataset.mostrar;
            }
            document.body.toggleAttribute("data-com-pedido", n > 0);
        };
        ouvintes.push(marcar);
        marcar();
    }
    if (document.readyState === "loading")
        document.addEventListener("DOMContentLoaded", iniciar);
    else iniciar();

    return { mensagem, linkWhats, real, esvaziar, esc };
})();
