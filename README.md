# victorgustavo.com

Site pessoal: quem eu sou, meus projetos e a página de download do
[Tasy Helper](https://victorgustavo.com/tasy-helper/).

HTML e CSS puros, sem build. Publicado no Cloudflare.

- `public/index.html` — início
- `public/tasy-helper/index.html` — download e instalação do Tasy Helper
- `public/style.css` — estilos das duas páginas
- `public/versao.js` — mostra a versão mais nova do Tasy Helper (API do GitHub)

Checagens: `npm test` · Publicar: `npm run deploy` (checa e publica com o `cf` CLI)

## Hospedagem

- Worker de assets estáticos `victorgustavo-com` (config em `cloudflare.config.ts`),
  nos domínios `victorgustavo.com` e `www.victorgustavo.com`.
- `www` → `victorgustavo.com` (301, mantém caminho e query): regra de redirecionamento
  da zona (Rules › Redirect Rules), fora deste repositório.
- Para publicar a cada push: no painel do Cloudflare, Workers › victorgustavo-com ›
  Settings › Builds › conectar este repositório, com o comando de deploy
  `npx cf@1.0.0-rc.4 deploy ./public`.
