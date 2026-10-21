/* ============================================================
   Downsell na volta do checkout (decisão de 21/10).
   A Ticto só manda para o /online/ quem já preencheu dados no checkout. Este arquivo cobre quem volta sem preencher:
   na primeira vez na sessão (aba) em que a pessoa volta do checkout pelo botão voltar, ela vai para o /online/.
   Uso: carregar na LP e no quiz e chamar TTVolta.marcar(tipo) no clique de compra.
   O /online/ e as páginas de obrigado gravam "tt_downsell_visto", para o downsell não aparecer de novo nem para quem comprou.
   ============================================================ */
(function () {
  const ABERTO = "tt_checkout_aberto", VISTO = "tt_downsell_visto";
  const LIMITE = 30 * 60 * 1000;
  window.TTVolta = {
    marcar(tipo) {
      try { sessionStorage.setItem(ABERTO, JSON.stringify({ t: Date.now(), tipo: tipo || "" })); } catch (e) {}
    }
  };
  const voltouPeloHistorico = ev => {
    if (ev.persisted) return true;
    try {
      const nav = performance.getEntriesByType("navigation")[0];
      return !!nav && nav.type === "back_forward";
    } catch (e) { return false; }
  };
  window.addEventListener("pageshow", ev => {
    try {
      const marca = JSON.parse(sessionStorage.getItem(ABERTO) || "null");
      if (!marca) return;
      if (!voltouPeloHistorico(ev)) return;
      sessionStorage.removeItem(ABERTO);
      if (sessionStorage.getItem(VISTO) || Date.now() - marca.t > LIMITE) return;
      sessionStorage.setItem(VISTO, "1");
      // location.href depois do load: antes dele, o navegador trata a ida como troca da página no histórico,
      // e o voltar do /online/ sairia do site em vez de voltar para cá.
      const ir = () => setTimeout(() => { location.href = "/online/?origem=voltar"; }, 50);
      if (document.readyState === "complete") ir(); else window.addEventListener("load", ir, { once: true });
    } catch (e) {}
  });
})();
