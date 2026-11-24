# Site pessoal e perfil do GitHub — plano de implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar victorgustavo.com (início + /tasy-helper) no Cloudflare e o README de perfil no GitHub.

**Architecture:** HTML estático sem build: `index.html`, `tasy-helper/index.html`, um `style.css` comum e um `versao.js` pequeno. Os textos são os da prévia aprovada (artifact 3v4oyvnYoKoAWx53S1XUc9, versão 1795531644-5b19), agora escritos direto no HTML. Deploy como Worker de assets estáticos com o `cf` CLI.

**Tech Stack:** HTML/CSS/JS puros; Node só para o script de checagem; `cf` CLI; `gh` CLI.

**Spec:** `docs/superpowers/specs/2026-11-24-site-pessoal-design.md`

## Global Constraints

- Visual do deck: tokens `--bg #262624`, `--bg-alt #1F1E1D`, `--bg-deep #141413`, `--card #30302E`, `--line #3D3D3A`, `--ink #FAF9F5`, `--soft #C2C0B6`, `--dim #A8A69E`, `--accent #5DCAA5`, `--warm #D97757`; Space Grotesk (títulos) + Inter (texto).
- Textos: exatamente os do estado salvo na prévia, com duas correções: (a) os rótulos em maiúsculas voltam a ser escritos em caixa normal no HTML (o CSS já põe em maiúsculas); (b) a linha de setores (UTI/Hemato/Infecto) e o CSS `.setores`/`.pilula` saem.
- Nada da barra "Prévia", do modo de edição ou do JSON de estado vai para o site.
- Download sempre por `https://github.com/victorgustavomd/tasy-helper-releases/releases/latest/download/Tasy-Helper-Setup.exe`.
- Sem analytics, sem dependências de runtime; `lang="pt-BR"`; funciona a 360px de largura.

## Review Focus

- GitHub API fora do ar ou com limite de requisições: a linha de versão some e o botão continua funcionando.
- Aberto pelo WhatsApp no celular (360px): nada vaza para o lado e o botão de download ocupa a largura toda.
- `prefers-reduced-motion`: o traço de ECG e os cards aparecem parados.
- `/tasy-helper` sem barra final e `www.victorgustavo.com`: os dois chegam à página certa.
- Prévia do link no WhatsApp: título e descrição Open Graph em cada página.

---

### Task 1: Site estático

**Files:**
- Create: `index.html`, `tasy-helper/index.html`, `style.css`, `versao.js`, `favicon.svg`, `_headers`, `README.md`, `.gitignore`
- Test: `tests/checar.mjs`

**Interfaces:**
- Produces: a pasta raiz do repo é o diretório de assets do deploy (Task 2).

- [ ] **Step 1: Escrever `tests/checar.mjs`** (Node, sem dependências), que lê os HTML e falha (`process.exit(1)`) se: faltar `lang="pt-BR"`, `<title>`, `og:title` ou `og:description` em cada página; o `/tasy-helper` não tiver o link de download exato; aparecer `previa`, `data-k`, `contenteditable`, `setores` ou `pilula` em qualquer HTML/CSS; aparecer texto em caixa alta nos rótulos conhecidos (`MEDICINA INTENSIVA`, `PROJETOS`, `CONTATO`, `INSTALAÇÃO`); `versao.js` não tratar falha (precisa conter `catch`).
- [ ] **Step 2: Rodar `node tests/checar.mjs`**, que deve falhar porque os arquivos não existem.
- [ ] **Step 3: Escrever as páginas** portando a marcação de `telaInicio()`/`telaTasy()` da prévia para HTML estático, com os textos do estado salvo, mais o `style.css` (o CSS da prévia sem a barra, sem os estilos de edição e sem `.setores`/`.pilula`). `versao.js`: `fetch("https://api.github.com/repos/victorgustavomd/tasy-helper-releases/releases/latest")` → preenche `#versao` com `Versão {tag sem "v" e sem ".0" final} · {published_at em dd/mm/aaaa} · instalador .exe`; se der erro, deixa o elemento `hidden`. E-mail como `mailto:` normal (sem botão copiar). `_headers` com cache longo para css/js/svg e os cabeçalhos de segurança do site antigo.
- [ ] **Step 4: Rodar `node tests/checar.mjs`**, que deve passar. Abrir as duas páginas no Playwright a 1280px e a 360px, sem scroll horizontal (`document.documentElement.scrollWidth <= innerWidth`), e conferir se a linha de versão aparece.
- [ ] **Step 5: `git init`, commit e criar `victorgustavomd/victorgustavo.com` público com `gh repo create --source . --push`.**

### Task 2: Deploy no Cloudflare

**Files:**
- Create: o arquivo de configuração que o `cf` CLI pedir para um Worker de assets estáticos (consultar a skill `cf-cli`), com nome `victorgustavo-com`, diretório de assets `.` e exclusão de `docs/`, `tests/`, `.git`.

- [ ] **Step 1: Deploy com `cf`** e custom domains `victorgustavo.com` e `www.victorgustavo.com`. O `www` redireciona com 301 para o domínio sem `www` (regra de redirect na zona, ou checagem de host num Worker mínimo se a regra não estiver disponível pelo CLI).
- [ ] **Step 2: Verificar** que `curl -sI https://victorgustavo.com` dá 200, `https://victorgustavo.com/tasy-helper` dá 200 ou 307→200, `https://www.victorgustavo.com` dá 301 para o domínio sem `www`, e que o link de download responde com 302 do GitHub.
- [ ] **Step 3: Commit** da configuração. Se o Workers Builds (deploy a cada push) não puder ser ligado pelo CLI, anotar no README como ligar no painel.

### Task 3: Perfil do GitHub

- [ ] **Step 1:** Criar o repo público `victorgustavomd/victorgustavomd` com um `README.md`: nome, "Residente (R1) de Medicina Intensiva · HU-UEPG, Ponta Grossa/PR", a frase de apresentação do site, uma tabela com Tasy Helper (→ victorgustavo.com/tasy-helper) e Plantão Fast (→ plantaofast.com.br), e os links do site e do e-mail. Sem widgets de terceiros.
- [ ] **Step 2:** Atualizar a bio com `gh api -X PATCH user -f bio="Residente de Medicina Intensiva · escrevo software para a UTI"`.
- [ ] **Step 3:** No `tasy-helper-releases`, trocar o README por um que aponte para `https://victorgustavo.com/tasy-helper`, e definir o `homepage` do repo para o mesmo link.
- [ ] **Step 4: Verificar** com `gh api users/victorgustavomd --jq .bio` e abrindo github.com/victorgustavomd.

### Task 4 (depende do usuário): excluir `victorgustavomd/site`

- [ ] Após `gh auth refresh -h github.com -s delete_repo`: `gh repo delete victorgustavomd/site --yes`. A cópia local `Documents/GitHub/site` fica como está; perguntar antes de apagar.
