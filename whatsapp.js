/* ============================================================
   Botão flutuante de WhatsApp (canto inferior direito) e medição dos cliques em qualquer link de WhatsApp.
   Carregar depois do config.js e do analise.js, com os atributos:
     data-pagina   nome da página nos eventos (lp, online, quiz)
     data-mensagem texto que já vem escrito na conversa
     data-mostrar  "rolagem" (depois de rolar ~meia tela), "tempo" (depois de 3 s) ou "manual" (a página chama TTZap.mostrar)
   O número é o da equipe (CONFIG.whatsapp), atendido pelo ManyChat.
   ============================================================ */
(function () {
  const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  const opc = (document.currentScript && document.currentScript.dataset) || {};
  if (!cfg.whatsapp) { window.TTZap = { mostrar() {} }; return; }
  const pagina = opc.pagina || location.pathname;
  const link = `https://wa.me/${cfg.whatsapp}?text=${encodeURIComponent(opc.mensagem || "Olá, tenho uma dúvida sobre o Técnica & Testemunho.")}`;

  const css = document.createElement("style");
  css.textContent = `
    .zap { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 45;
      width: 56px; height: 56px; border-radius: 50%; background: #25d366; color: #fff;
      display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(0,0,0,.22);
      opacity: 0; transform: translateY(12px) scale(.9); pointer-events: none;
      transition: opacity .25s ease, transform .25s ease, bottom .25s ease; }
    .zap.visivel { opacity: 1; transform: none; pointer-events: auto; }
    .zap:focus-visible { outline: 3px solid #1c120c; outline-offset: 3px; }
    .zap svg { width: 30px; height: 30px; fill: currentColor; }
    @media print { .zap { display: none; } }
    @media (prefers-reduced-motion: reduce) { .zap { transition: none; } }`;
  document.head.appendChild(css);

  const btn = document.createElement("a");
  btn.className = "zap";
  btn.href = link;
  btn.target = "_blank";
  btn.rel = "noopener";
  btn.dataset.zap = "flutuante";
  btn.setAttribute("aria-label", "Tirar dúvidas com a equipe no WhatsApp");
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.47-2.39-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.41-.08-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41z"/></svg>';
  document.body.appendChild(btn);

  // Sobe o botão quando uma barra fixa de compra estiver na tela (LP no celular e resultado do quiz)
  const ajustar = () => {
    let h = 0;
    document.querySelectorAll(".fixa.ativa, .barra-compra.visivel").forEach(el => {
      if (getComputedStyle(el).display === "none") return;
      const r = el.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) h = Math.max(h, innerHeight - r.top);
    });
    btn.style.bottom = h ? `${Math.round(h + 12)}px` : "";
  };
  setInterval(ajustar, 400);
  addEventListener("resize", ajustar);

  const mostrar = sim => { btn.classList.toggle("visivel", !!sim); ajustar(); };
  if (opc.mostrar === "tempo") { setTimeout(() => mostrar(true), 3000); }
  else if (opc.mostrar !== "manual") {
    const checar = () => mostrar(scrollY > innerHeight * 0.5);
    addEventListener("scroll", checar, { passive: true });
    checar();
  }
  window.TTZap = { mostrar };
  // Quiz: se a página já abriu no resultado (progresso salvo), mostra logo
  if (opc.mostrar === "manual" && document.querySelector('[data-tela="resultado"]')) mostrar(true);

  // Mede o clique em qualquer link de WhatsApp da página (botão flutuante, FAQ, rodapé, quiz)
  document.addEventListener("click", ev => {
    const a = ev.target.closest && ev.target.closest('a[href*="wa.me/"]');
    if (!a) return;
    const tela = a.closest("[data-tela]");
    const secao = a.closest("section[id], footer, details");
    const local = a.dataset.zap || (tela && tela.dataset.tela) || (secao && (secao.id || (secao.tagName === "DETAILS" ? "faq" : secao.tagName.toLowerCase()))) || "pagina";
    try { window.TTA && TTA.evento("whatsapp_clique", { pagina, local }); } catch (e) {}
    try { window.fbq && fbq("track", "Contact", { content_name: pagina }); } catch (e) {}
  });
})();
