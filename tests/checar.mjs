// Checagens do site estático. Rodar com: node tests/checar.mjs
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const falhas = [];
const checar = (ok, msg) => { if (!ok) falhas.push(msg); };
const ler = (p) => (existsSync(join(raiz, p)) ? readFileSync(join(raiz, p), "utf8") : null);

const LINK_BAIXAR = "https://github.com/victorgustavomd/tasy-helper-releases/releases/latest/download/Tasy-Helper-Setup.exe";
const paginas = ["index.html", "tasy-helper/index.html"];
const css = ler("style.css");
const versao = ler("versao.js");

checar(css !== null, "style.css não existe");
checar(versao !== null, "versao.js não existe");

for (const p of paginas) {
  const html = ler(p);
  if (html === null) { falhas.push(`${p} não existe`); continue; }
  checar(html.includes('<html lang="pt-BR">'), `${p}: falta lang="pt-BR"`);
  checar(/<title>[^<]+<\/title>/.test(html), `${p}: falta <title>`);
  checar(html.includes('property="og:title"'), `${p}: falta og:title`);
  checar(html.includes('property="og:description"'), `${p}: falta og:description`);
  checar(html.includes('name="viewport"'), `${p}: falta meta viewport`);
  checar(html.includes('href="/style.css"'), `${p}: não usa /style.css`);
  checar(html.includes('href="/favicon.svg"'), `${p}: falta favicon`);
  for (const proibido of ["previa", "data-k", "contenteditable", "setores", "pilula", 'id="estado"']) {
    checar(!html.includes(proibido), `${p}: sobrou "${proibido}" da prévia`);
  }
  for (const caixaAlta of ["MEDICINA INTENSIVA", "PROJETOS", "CONTATO", "INSTALAÇÃO", "O QUE ELE FAZ", "TASY HELPER · WINDOWS", "WINDOWS · HU-UEPG"]) {
    checar(!html.includes(caixaAlta), `${p}: rótulo gravado em caixa alta: ${caixaAlta}`);
  }
}

const tasy = ler("tasy-helper/index.html") ?? "";
checar(tasy.includes(`href="${LINK_BAIXAR}"`), "tasy-helper: falta o link de download da última versão");
checar(tasy.includes('id="versao"'), "tasy-helper: falta o elemento #versao");
checar(tasy.includes('src="/versao.js"'), "tasy-helper: não carrega /versao.js");
checar(tasy.includes("O Windows protegeu o computador"), "tasy-helper: falta o aviso do SmartScreen");

const inicio = ler("index.html") ?? "";
checar(inicio.includes('href="/tasy-helper/"'), "início: falta link para /tasy-helper/");
checar(inicio.includes('href="https://plantaofast.com.br"'), "início: falta link do Plantão Fast");
checar(inicio.includes("mailto:eu@victorgustavo.com"), "início: falta e-mail");

if (css) {
  for (const proibido of [".previa", ".setores", ".pilula", "editando", ".aba"]) {
    checar(!css.includes(proibido), `style.css: sobrou "${proibido}" da prévia`);
  }
  checar(css.includes("prefers-reduced-motion"), "style.css: falta prefers-reduced-motion");
}

if (versao) {
  checar(versao.includes("catch"), "versao.js: não trata falha da API");
  const ctx = {};
  vm.createContext(ctx);
  try {
    vm.runInContext(versao, ctx);
    const f = ctx.textoVersao;
    checar(typeof f === "function", "versao.js: não define textoVersao(tag, data)");
    if (typeof f === "function") {
      const casos = [
        [["v1.7.0", "2026-11-20T15:40:13Z"], "Versão 1.7 · 20/11/2026 · instalador .exe"],
        [["v1.10.0", "2026-12-01T12:00:00Z"], "Versão 1.10 · 01/12/2026 · instalador .exe"],
        [["v2.0.1", "2027-01-05T12:00:00Z"], "Versão 2.0.1 · 05/01/2027 · instalador .exe"],
        // 01h UTC ainda é dia 20 em Ponta Grossa (UTC-3)
        [["v1.8.0", "2026-11-21T01:00:00Z"], "Versão 1.8 · 20/11/2026 · instalador .exe"],
      ];
      for (const [args, esperado] of casos) {
        const obtido = f(...args);
        checar(obtido === esperado, `textoVersao(${args.join(", ")}) deu "${obtido}", esperado "${esperado}"`);
      }
    }
  } catch (e) {
    falhas.push(`versao.js quebrou fora do navegador: ${e.message}`);
  }
}

if (falhas.length) {
  console.error(`FALHOU (${falhas.length}):\n- ` + falhas.join("\n- "));
  process.exit(1);
}
console.log("OK: todas as checagens passaram");
