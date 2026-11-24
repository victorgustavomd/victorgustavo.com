# Site pessoal (victorgustavo.com) e perfil do GitHub — design

Data: 2026-11-24

## Intenção

Uma vitrine para colegas, não para pacientes: mostrar que o Víctor é residente
de Medicina Intensiva no Hospital Universitário Regional dos Campos Gerais
(HU-UEPG, Ponta Grossa/PR) e também escreve software para o próprio trabalho.
O Tasy Helper precisa de um endereço fácil de mandar no grupo, com o botão de
download e as instruções.

## Objetivos

- `victorgustavo.com`: apresentação curta + projetos (Tasy Helper, Plantão Fast)
  + contato (GitHub e e-mail).
- `victorgustavo.com/tasy-helper`: o que o app faz, botão "Baixar para Windows",
  passos de instalação (com o aviso do SmartScreen) e como entrar.
- README de perfil no GitHub com a mesma apresentação, apontando para o site.

## Não-objetivos e anti-objetivos

- Nada voltado a pacientes: sem agendamento, WhatsApp, "agende sua consulta".
- Sem framework, build, analytics ou rastreadores.
- Falha, mesmo funcionando: parecer landing page de vendas; o botão de download
  apontar para uma versão fixa (tem de ser sempre a mais nova).

## Abordagens consideradas

- **A. HTML + CSS puros no Cloudflare (escolhida).** Duas páginas e um CSS, sem
  build; o domínio já está no Cloudflare, junto do Plantão Fast.
- B. Astro: layout compartilhado e bom para crescer (blog), mas Node, dependências
  e build não se pagam em duas páginas.
- C. GitHub Pages: grátis, mas divide a hospedagem entre GitHub e Cloudflare e
  exige repositório público.

## Visual (decidido: o estilo do deck "Psicofarmacologia do Transtorno Depressivo")

- Fundo `#262624`, faixas alternadas `#1F1E1D` / `#141413`, cards `#30302E`,
  linhas `#3D3D3A`.
- Texto `#FAF9F5`, secundário `#C2C0B6`, apagado `#A8A69E`.
- Destaques: verde-água `#5DCAA5` (principal) e terracota `#D97757` (avisos e o
  segundo projeto).
- Títulos em Space Grotesk, texto em Inter.
- "Eyebrow" em maiúsculas espaçadas acima dos títulos; cards com borda colorida
  no topo (6px) e cantos de 16px; cards entram subindo (desligado com
  `prefers-reduced-motion`).

## Conteúdo (decidido)

**Início:** nome; "Residente de Medicina Intensiva · HU-UEPG, Ponta Grossa/PR";
2–3 linhas de apresentação; dois cards de projeto:

- Tasy Helper (borda verde-água): app de Windows para a UTI e a hemato do HU que
  gera o fluxograma diário a partir do Tasy → `/tasy-helper`.
- Plantão Fast (borda terracota): textos SOAP em segundos no plantão, funciona
  offline e instala no celular → https://plantaofast.com.br (nova aba).

Rodapé: GitHub (`victorgustavomd`) e e-mail `eu@victorgustavo.com` (o que já
está público no perfil).

**/tasy-helper:** título e uma linha do que é; 3 cards (Fluxograma da UTI, entra
com a sua conta do Tasy, atualiza sozinho); botão grande "Baixar para Windows"
→ `https://github.com/victorgustavomd/tasy-helper-releases/releases/latest/download/Tasy-Helper-Setup.exe`;
passos numerados: baixar, abrir (sem administrador, instala só para o usuário),
SmartScreen → "Mais informações" → "Executar assim mesmo" (em terracota, como
aviso), entrar com login e senha do Tasy na página do próprio Tasy (o app não
lê nem guarda a senha; a sessão vale enquanto o app está aberto). Link para
"todas as versões".

## Hospedagem e repositórios (decidido)

- Repositório público novo `victorgustavomd/victorgustavo.com`, clonado em
  `Documents/GitHub/victorgustavo.com`.
- Publicado como site estático no Cloudflare com o `cf` CLI, no domínio
  `victorgustavo.com` (`www` redireciona para o domínio sem `www`).
- Repositório público `victorgustavomd/victorgustavomd` com o README do perfil.

## Decisões minhas (para conferir)

- **Sem foto** na página; dá para pôr depois.
- **Versão no botão:** um script pequeno lê a última release na API pública do
  GitHub e mostra "Versão 1.7 · 20/11/2026" embaixo do botão; se falhar, o botão
  funciona igual, só sem a linha.
- **Fontes** pelo Google Fonts (o mesmo que o deck usa).
- **Favicon** "VG" em SVG, verde-água sobre grafite; Open Graph com título e
  descrição para o link ficar bonito no WhatsApp.
- **README do perfil** sóbrio: apresentação, os dois projetos e links; sem
  widgets de estatísticas de terceiros (quebram e não contam repositórios
  privados).
- **Bio do GitHub** passa de "Code • Infra • Open Source • Coffee ☕" para algo
  como "Residente de Medicina Intensiva · escrevo software para a UTI".
- **README do `tasy-helper-releases`** ganha uma linha apontando para
  `victorgustavo.com/tasy-helper`.
- **Publicação automática a cada push** (Workers Builds) depende de conectar o
  GitHub no painel do Cloudflare; se não der pelo CLI, fica o deploy manual
  com `cf` e eu explico como ligar.

## Fica para quem constrói

Texto final da apresentação (no tom acima), detalhes de espaçamento e
responsividade (tem de funcionar bem no celular, onde o link vai ser aberto pelo
WhatsApp), ícones dos cards.

## Pendente fora do escopo

Excluir o repositório antigo `victorgustavomd/site`: precisa de
`gh auth refresh -h github.com -s delete_repo`.
