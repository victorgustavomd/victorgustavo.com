// Mostra a versão mais nova do Tasy Helper embaixo do botão de download.
// Se a API do GitHub falhar, fica o texto genérico que já está no HTML.
function textoVersao(tag, publicadoEm) {
  var versao = String(tag).replace(/^v/, "").replace(/\.0$/, "");
  var data = new Date(publicadoEm).toLocaleDateString("pt-BR", {
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric"
  });
  return "Versão " + versao + " · " + data + " · instalador .exe";
}

if (typeof document !== "undefined" && typeof fetch === "function") {
  fetch("https://api.github.com/repos/victorgustavomd/tasy-helper-releases/releases/latest", {
    headers: { Accept: "application/vnd.github+json" }
  })
    .then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
    .then(function (rel) {
      var el = document.getElementById("versao");
      if (el && rel.tag_name && rel.published_at) el.textContent = textoVersao(rel.tag_name, rel.published_at);
    })
    .catch(function () { /* mantém o texto genérico */ });
}
