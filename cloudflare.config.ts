// Configuração do cf CLI. O site é só a pasta public/ (assets estáticos):
// publicar com `npm run deploy` (= cf deploy ./public).
export default {
  worker: {
    name: "victorgustavo-com",
    compatibilityDate: "2026-11-20",
    domains: ["victorgustavo.com", "www.victorgustavo.com"],
    assets: { notFoundHandling: "404-page" },
  },
};
