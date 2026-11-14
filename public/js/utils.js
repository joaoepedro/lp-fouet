/* =========================================================
   Funções de apoio usadas pelos outros scripts.
   Nada aqui depende do desenho da página.
   ========================================================= */
window.Utils = (function () {
    "use strict";

    /** Link do WhatsApp com a mensagem pronta */
    function linkWhatsapp(mensagem) {
        const C = window.CONFIG.contato;
        return (
            "https://wa.me/" +
            C.whatsapp +
            "?text=" +
            encodeURIComponent(mensagem || C.whatsappMensagem)
        );
    }

    /** sessionStorage protegido (aba anônima ou bloqueio podem dar erro) */
    const sessao = {
        ler: function (chave) {
            try {
                return JSON.parse(sessionStorage.getItem(chave));
            } catch {
                return null;
            }
        },
        gravar: function (chave, valor) {
            try {
                sessionStorage.setItem(chave, JSON.stringify(valor));
            } catch {
                /* sem sessionStorage: segue sem guardar */
            }
        },
    };

    return {
        linkWhatsapp: linkWhatsapp,
        sessao: sessao,
    };
})();
