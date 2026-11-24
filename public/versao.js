// Mostra a versão mais nova do Tasy Helper embaixo do botão de download.
// Se a API do GitHub falhar, fica o texto genérico que já está no HTML.
// A resposta fica guardada por 1 hora no navegador: a API aceita só 60 consultas
// por hora por IP, e na rede do hospital muita gente sai pelo mesmo IP.
var CHAVE_VERSAO = "tasy-helper-versao";
var VALIDADE_VERSAO_MS = 60 * 60 * 1000;

function textoVersao(tag, publicadoEm) {
  var versao = String(tag).replace(/^v/, "").replace(/\.0$/, "");
  var data = new Date(publicadoEm).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric"
  });
  return "Versão " + versao + " · " + data + " · instalador .exe";
}

function versaoEmCache(storage, agora) {
  try {
    var salvo = JSON.parse(storage.getItem(CHAVE_VERSAO));
    if (salvo && typeof salvo.texto === "string" && agora - salvo.em < VALIDADE_VERSAO_MS) return salvo.texto;
  } catch (e) { /* storage bloqueado ou conteúdo inválido */ }
  return null;
}

function guardarVersao(storage, texto, agora) {
  try { storage.setItem(CHAVE_VERSAO, JSON.stringify({ texto: texto, em: agora })); } catch (e) { /* ignora */ }
}

if (typeof document !== "undefined" && typeof fetch === "function") {
  (function () {
    var el = document.getElementById("versao");
    if (!el) return;
    var storage = null;
    try { storage = window.localStorage; } catch (e) { /* bloqueado */ }
    var emCache = storage && versaoEmCache(storage, Date.now());
    if (emCache) { el.textContent = emCache; return; }
    fetch("https://api.github.com/repos/victorgustavomd/tasy-helper-releases/releases/latest", {
      headers: { Accept: "application/vnd.github+json" }
    })
      .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(function (rel) {
        if (!rel.tag_name || !rel.published_at) return;
        var texto = textoVersao(rel.tag_name, rel.published_at);
        el.textContent = texto;
        if (storage) guardarVersao(storage, texto, Date.now());
      })
      .catch(function () { /* mantém o texto genérico */ });
  })();
}
