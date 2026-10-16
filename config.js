/* ============================================================
   CONFIG · tudo que muda (preço, parcela, lote, link) fica aqui.
   Usado pela LP (index.html), pelo quiz (quiz/index.html) e pelo downsell (online/index.html).
   Nunca coloque aqui o token da API de Conversões nem o do ManyChat: o arquivo é público.
   ============================================================ */
const CONFIG = {
  pixelId: "1324439740761727",
  whatsapp: "5531953491799",
  // n8n "TT · Quiz lead": recebe o WhatsApp e as respostas do quiz (sem token na página)
  webhookLead: "https://n8n.automato.pro/webhook/tt-quiz-lead",
  // Valor de cada parcela em 12x (Ticto, juros do comprador), por preço à vista
  parcelas: {
    1297: "134,13",
    497: "51,40", 597: "61,74", 697: "72,08",
    397: "41,05", 477: "49,33", 557: "57,60",
    197: "20,37"
  },
  vip: { preco: 1297, checkout: "https://payment.ticto.app/O99FD1428" },
  // Ingresso online (downsell em /online/, só via back redirect da Ticto). Obrigado em /obrigado/remoto/.
  online: { preco: 197, checkout: "https://payment.ticto.app/OF85D6B95" },
  // Lote vira na data (23h59, horário de Brasília) ou ao esgotar.
  lotes: [
    { nome: "1º lote", fim: "2026-10-25T23:59:59-03:00", fimTexto: "25/10", vagas: 100,
      profissional: { preco: 497, checkout: "https://payment.ticto.app/O29F8C641" },
      estudante:    { preco: 397, checkout: "https://payment.ticto.app/O916934E8" } },
    { nome: "2º lote", fim: "2026-11-04T23:59:59-03:00", fimTexto: "04/11", vagas: 110,
      profissional: { preco: 597, checkout: "https://payment.ticto.app/O77A23151" },
      estudante:    { preco: 477, checkout: "https://payment.ticto.app/OC5DF6A8A" } },
    { nome: "3º lote", fim: "2026-11-13T23:59:59-03:00", fimTexto: "13/11", vagas: 80,
      profissional: { preco: 697, checkout: "https://payment.ticto.app/O8F7466D1" },
      estudante:    { preco: 557, checkout: "https://payment.ticto.app/OA38F974B" } }
  ],
  // Para virar o lote antes da data (esgotou), troque para 1 ou 2.
  loteForcado: null
};
