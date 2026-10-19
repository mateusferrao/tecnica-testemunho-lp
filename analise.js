/* ============================================================
   Análise do funil e gravação de sessão (PostHog) e gravação com mapa de calor (Microsoft Clarity).
   Só liga se as chaves estiverem no config.js (são chaves públicas, feitas para ficar na página).
   Nunca mande nome, telefone ou e-mail para essas ferramentas: a ligação com o lead
   é feita pelo código da visita (o mesmo event_id que vai para o n8n).
   Uso nas páginas: TTA.evento(nome, propriedades), TTA.identificar(id, propriedades).
   ============================================================ */
(function () {
  // CONFIG é declarado com const no config.js, então não fica em window.CONFIG
  const cfg = typeof CONFIG !== "undefined" ? CONFIG : {};
  const ph = cfg.posthog || {};

  // Nas páginas de obrigado, nenhum endereço sai com parâmetros: o checkout pode acrescentar dados do comprador.
  // A página já limpa a URL ao abrir, mas o evento de desempenho ($web_vitals) guarda o endereço original.
  const noObrigado = location.pathname.indexOf("/obrigado") === 0;
  const semParametros = (v, n) => {
    if (typeof v === "string") return v.indexOf("/obrigado") > -1 && v.indexOf("?") > -1 ? v.split("?")[0] : v;
    if (v && typeof v === "object" && n < 5) Object.keys(v).forEach(k => { v[k] = semParametros(v[k], n + 1); });
    return v;
  };
  const limparObrigado = ev => (noObrigado && ev ? semParametros(ev, 0) : ev);

  // PostHog: carregador oficial em versão legível (fila os eventos até o script carregar)
  if (ph.chave && ph.host) {
    const stub = window.posthog = window.posthog || [];
    if (!stub.__SV) {
      stub._i = [];
      stub.init = function (chave, opcoes, nome) {
        const s = document.createElement("script");
        s.async = true;
        s.crossOrigin = "anonymous";
        s.src = opcoes.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") + "/static/array.js";
        document.head.appendChild(s);
        ["capture", "identify", "register", "register_once", "reset", "set_config"].forEach(m => {
          stub[m] = function () { stub.push([m].concat([].slice.call(arguments))); };
        });
        stub._i.push([chave, opcoes, nome]);
      };
      stub.__SV = 1;
      stub.init(ph.chave, {
        api_host: ph.host,
        defaults: "2026-05-30",
        person_profiles: "identified_only", // perfil só para quem passou do WhatsApp
        autocapture: { dom_event_allowlist: ["click"] }, // só toques (sem textos digitados), para ver onde a pessoa toca
        capture_pageview: true,
        capture_pageleave: true,
        session_recording: { maskAllInputs: true }, // grava a navegação com nome e telefone ocultos
        persistence: "localStorage+cookie",
        before_send: limparObrigado
      });
    }
  }

  // Microsoft Clarity (snippet oficial). Campos de formulário ficam mascarados por padrão.
  if (cfg.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, "clarity", "script", cfg.clarityId);
  }

  const seguro = f => { try { f(); } catch (e) {} };
  window.TTA = {
    evento(nome, props) {
      seguro(() => window.posthog && window.posthog.capture && window.posthog.capture(nome, props || {}));
      seguro(() => window.clarity && window.clarity("event", nome));
    },
    identificar(id, props) {
      if (!id) return;
      seguro(() => window.posthog && window.posthog.identify && window.posthog.identify(id, props || {}));
      seguro(() => window.clarity && window.clarity("identify", id));
    },
    marcar(chave, valor) {
      seguro(() => window.posthog && window.posthog.register && window.posthog.register({ [chave]: valor }));
      seguro(() => window.clarity && window.clarity("set", chave, String(valor)));
    }
  };
})();
