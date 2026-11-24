// Checagens do site estático. Rodar com: node tests/checar.mjs
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import vm from "node:vm";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "public");
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
    // Cache de 1 hora no navegador: poupa o limite de 60 consultas/h por IP (rede do hospital)
    const lerCache = ctx.versaoEmCache;
    const gravarCache = ctx.guardarVersao;
    checar(typeof lerCache === "function" && typeof gravarCache === "function", "versao.js: falta versaoEmCache(storage, agora) / guardarVersao(storage, texto, agora)");
    if (typeof lerCache === "function" && typeof gravarCache === "function") {
      const mem = {};
      const storage = { getItem: (k) => (k in mem ? mem[k] : null), setItem: (k, v) => { mem[k] = String(v); } };
      const t0 = Date.parse("2026-11-24T12:00:00Z");
      checar(lerCache(storage, t0) === null, "versaoEmCache: cache vazio deveria dar null");
      gravarCache(storage, "Versão 1.7 · 20/11/2026 · instalador .exe", t0);
      checar(lerCache(storage, t0 + 59 * 60e3) === "Versão 1.7 · 20/11/2026 · instalador .exe", "versaoEmCache: deveria usar o cache com 59 min");
      checar(lerCache(storage, t0 + 61 * 60e3) === null, "versaoEmCache: cache com 61 min deveria expirar");
      const quebrado = { getItem: () => { throw new Error("bloqueado"); }, setItem: () => { throw new Error("bloqueado"); } };
      checar(lerCache(quebrado, t0) === null, "versaoEmCache: storage bloqueado deveria dar null, não erro");
      try { gravarCache(quebrado, "x", t0); } catch { falhas.push("guardarVersao: storage bloqueado não pode lançar erro"); }
      mem["tasy-helper-versao"] = "lixo{";
      checar(lerCache(storage, t0) === null, "versaoEmCache: conteúdo inválido deveria dar null");
    }
  } catch (e) {
    falhas.push(`versao.js quebrou fora do navegador: ${e.message}`);
  }
}

// Plantão Fast abre em nova aba (spec)
checar(/<a class="card-link" href="https:\/\/plantaofast\.com\.br" target="_blank" rel="noopener">/.test(inicio), "início: link do Plantão Fast deveria abrir em nova aba");

// Página 404
const p404 = ler("404.html");
checar(p404 !== null, "404.html não existe");
if (p404) {
  checar(p404.includes('<html lang="pt-BR">'), "404.html: falta lang");
  checar(p404.includes('href="/style.css"'), "404.html: não usa /style.css");
  checar(p404.includes('href="/"') && p404.includes('href="/tasy-helper/"'), "404.html: faltam links para / e /tasy-helper/");
  checar(p404.includes('name="robots" content="noindex"'), "404.html: deveria ter noindex");
}
const config = readFileSync(join(raiz, "..", "cloudflare.config.ts"), "utf8");
checar(/notFoundHandling:\s*"404-page"/.test(config), "cloudflare.config.ts: falta notFoundHandling \"404-page\"");

// Contraste do link terracota sobre o card (WCAG AA, texto normal: 4,5:1)
if (css) {
  const token = (nome) => (css.match(new RegExp(`--${nome}:\\s*(#[0-9A-Fa-f]{6})`)) || [])[1];
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const regra = (css.match(/\.card\.quente \.card-link\s*\{[^}]*color:\s*var\(--([\w-]+)\)/) || [])[1];
  const cor = regra && token(regra);
  const fundo = token("card");
  if (!cor || !fundo) falhas.push("style.css: não achei a cor do link terracota ou do card");
  else {
    const [a, b] = [lum(cor), lum(fundo)].sort((x, y) => y - x);
    const razao = (a + 0.05) / (b + 0.05);
    checar(razao >= 4.5, `style.css: link terracota ${cor} sobre ${fundo} tem contraste ${razao.toFixed(2)}:1 (mínimo 4,5:1)`);
  }
}

if (falhas.length) {
  console.error(`FALHOU (${falhas.length}):\n- ` + falhas.join("\n- "));
  process.exit(1);
}
console.log("OK: todas as checagens passaram");
