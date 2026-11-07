# CLAUDE.md — Portfólio de David Lima

Contexto para o Claude Code continuar este projeto. Este arquivo **é** o mapa do projeto — não releia o repositório inteiro para descobrir a estrutura.

## Economia de tokens (regras de trabalho)

- **Não explorar o projeto inteiro.** Use a seção *Estrutura* abaixo para ir direto ao arquivo certo; leia só os arquivos que a tarefa toca (e só o trecho necessário em arquivos grandes como `VoxelOwl.astro`).
- **Não reler** arquivos já lidos na sessão nem para "conferir" uma edição que deu certo.
- **Não reinstalar**: só rode `npm install` se `node_modules/` não existir ou se `package.json` mudou.
- **Validação proporcional à mudança**, uma vez no fim (não a cada edição):
  - só texto/Markdown/CSS → nenhuma validação (o `npm run dev` recarrega sozinho);
  - `.ts`/`.astro` → `npm run check`;
  - config, dependências, rotas ou schema → `npm run check` e `npm run build`.
- Não subir `npm run dev` se já estiver rodando (porta 4321) e não abrir o site/HTML gerado para verificação, a menos que pedido.
- Não usar subagentes para buscas neste repo — ele é pequeno; `Grep`/`Glob` direto bastam.
- Respostas curtas: o que mudou e o que falta.

## Agentes e skills (`.claude/`, gitignored — adaptados do Vitrix)

- Skills: `/context-optimize`, `/repo-map`, `/smart-plan`, `/implement`, `/verify` (validação proporcional), `/code-simplify`, `/session-summary`.
- Agentes: `frontend-engineer` (Astro/Three.js), `product-ux-designer` (specs em `.claude/design/`), `devops-ci-cd-engineer` (Actions/Pages), `code-reviewer` (read-only), `detection-writeup-reviewer` (revisão técnica dos posts).
- Use agente só quando a tarefa é grande ou pede outra perspectiva (revisão, write-up). Tarefa pequena: sessão principal direto.
- Para o Claude Code carregar os agentes, abra o VS Code na pasta `portfolio/portfolio` (raiz do repo).

## O que é

Site portfólio **estático** com blog para write-ups de segurança (detection engineering, SOC, blue team).
Inspiração direta: **craftz.dog** (Takuya Matsuyama / canal devaslife no YouTube) — home minimalista com uma
figura **voxel 3D** girando no topo, bio, trajetória, links, e abas separadas.

- Dono: David Lima — Security Engineer (4+ anos em SOC, detection engineering, Wazuh SIEM em larga escala), Fortaleza, Brasil.
- Idioma do site: **português (pt-BR)**.
- Terminal do dono: **PowerShell** no Windows. Comandos sugeridos devem funcionar no PowerShell (sem `&&`; use linhas separadas ou `;`).

## Decisões já tomadas (não reverter sem pedir)

| Tema | Decisão |
| --- | --- |
| Stack | **Astro 7** (site estático) + **Three.js 0.187** para o 3D. Sem React/Tailwind. |
| Conteúdo do blog | Markdown em `src/content/blog/*.md` via Content Collections (`glob` loader). |
| Abas | **Home · Projetos · Blog** + link "Código" (repositório). |
| Figura 3D | **Coruja vigia voxel original**, gerada em código (sem arquivo de modelo). **Não** usar o cachorro voxel do craftz.dog — o modelo é do Takuya. |
| Visual | Estilo clássico craftz.dog: fundo creme `#f0e7db` (claro) / `#202023` (escuro), títulos em **M PLUS Rounded 1c**, corpo **Inter**, código **JetBrains Mono**, títulos de seção sublinhados grossos. |
| Acento | Claro: azul `#2f6fdb`. Escuro: teal `#5eead4`. Botão de tema roxo (lua) no claro, laranja (sol) no escuro. |
| Deploy | **GitHub Pages** via GitHub Actions (`.github/workflows/deploy.yml`, roda `npm run check` antes do build). Repo: `davivers/davivers.github.io` → https://davivers.github.io |
| Tipagem | TypeScript **strict** (`tsconfig.json`). Tipos de configuração em `src/types.ts`, código e comentários de código em **inglês**; textos visíveis do site seguem em pt-BR. |

## Estrutura

```
astro.config.mjs            # site, base (BASE_PATH), shiki dual theme (github-light / github-dark-dimmed)
tsconfig.json               # extends astro/tsconfigs/strict
src/
  types.ts                  # SiteConfig, SocialLink, TimelineEntry, NavItem, Project, IconName (ICON_NAMES)
  site.config.ts            # TODO o texto da home (`satisfies SiteConfig`): nome, role, greeting, work, timeline, loves, links, sourceUrl, nav
  data/projects.ts          # cards da aba Projetos (title, summary, tags, url, image?, hue, glyph)
  content.config.ts         # schema do blog: title, description, date, tags[], draft
  content/blog/*.md         # posts (o nome do arquivo vira a URL /blog/<nome>/)
  layouts/Base.astro        # <head>, fontes, navbar fixa com blur, toggle de tema, menu mobile, footer
  components/
    VoxelOwl.astro          # cena Three.js da coruja (ver seção abaixo)
    PostList.astro          # lista de posts em cards (data, tempo de leitura, tags)
    Icon.astro              # ícones SVG inline tipados por IconName (novo ícone: path aqui + nome em ICON_NAMES)
  pages/
    index.astro             # Home: VoxelOwl, greeting, nome+avatar, Trabalho, Trajetória, Eu ♥, Na web, Últimos write-ups
    projetos.astro          # grid de cards com capa gerada por CSS (gradiente com hue + glyph); sem `url` o card não é link
    blog/index.astro        # lista + filtro por tag (JS no cliente)
    blog/[...slug].astro    # página do post: breadcrumb, meta, tags, índice (h2/h3), estilos .prose
    rss.xml.ts              # feed RSS (categories = tags)
  styles/global.css         # tokens de cor por [data-theme], tipografia, .section-title, .btn, .tag
  utils.ts                  # BlogPost type, withBase(), getPosts() (filtra draft fora do dev), formatDate(pt-BR), readingTime()
public/
  favicon.svg               # coruja pixel
  avatar.jpg                # (FALTA) foto de perfil quadrada; sem ela aparecem as iniciais
```

## Tema claro/escuro

- Script inline no `<head>` (Base.astro) define `document.documentElement.dataset.theme` a partir de `localStorage('theme')` ou `prefers-color-scheme`, antes do paint.
- Todas as cores são variáveis CSS em `:root` e `:root[data-theme='dark']` (global.css). Sempre usar os tokens, nunca cores literais em componentes.
- Blocos de código usam Shiki dual theme; o override para o escuro está no `<style>` de `blog/[...slug].astro`.

## A coruja voxel (`VoxelOwl.astro`)

- Voxels montados num `Map` com `put(x, y, z, cor)`; renderizados com **um único `InstancedMesh`** (BoxGeometry 1×1×1, `MeshStandardMaterial`).
- Partes: corpo (elipsoide), barriga com manchas, asas laterais, disco facial, olhos amarelos, bico, tufos das orelhas, pés, galho com folhas, tronco e uma ilhota de grama/terra.
- `frontZ(x, y)` acha o voxel mais à frente de cada coluna — usado para pintar rosto/barriga só na superfície (e uma camada atrás para não ficar "manchado").
- **Pupilas** são meshes separados que seguem o cursor (`pointermove`) e **piscam** em intervalos aleatórios.
- Câmera **ortográfica**; animação de entrada (easeOutCirc em 100 frames, de `startPos` para `restPos`), depois `OrbitControls` com `autoRotate`, sem zoom/pan.
- Sombra suave = plano com textura de gradiente radial gerada em canvas.
- Respeita `prefers-reduced-motion` (sem intro, sem auto-rotate, sem balanço).
- Paleta no objeto `C` no topo do script — mude as cores ali.

## Pendências (TODO do dono)

- [x] GitHub `davivers` configurado em `site.config.ts`, `projects.ts` e `astro.config.mjs`.
- [ ] Preencher LinkedIn e e-mail em `src/site.config.ts` (`url: ''` esconde o link; há `TODO` no arquivo).
- [ ] Descomentar `url` de `dac-lab` e `wazuh-monitor` em `projects.ts` quando os repos forem públicos.
- [ ] Colocar a foto em `public/avatar.jpg`.
- [ ] Apagar ou substituir o post modelo `src/content/blog/exemplo-lsass-dump.md` (tem `[Exemplo]` no título).
- [ ] Opcional: o post `como-escrever.md` é um guia de uso; pode virar `draft: true`.
- [x] Repositório `davivers/davivers.github.io` criado, push feito, Pages com fonte **GitHub Actions**.

## Ideias combinadas para depois

- Trocar a figura (opções que surgiram: cadeado/escudo com partículas, rack de servidor com LEDs, raposa com terminal).
- Aba **Uses** (setup e ferramentas).
- Imagens reais nas capas dos projetos (campo `image` em `projects.ts`, arquivos em `public/`).

## Comandos (PowerShell)

```powershell
npm install
npm run dev       # http://localhost:4321 — posts com draft: true aparecem só aqui
npm run check     # type-check (astro check, strict)
npm run build     # gera dist/
npm run preview   # serve dist/ localmente
```

Publicar:

```powershell
git add .
git commit -m "post: titulo do write-up"
git push
```

## Convenções

- Textos de interface em pt-BR, frases curtas e diretas.
- Novos posts: frontmatter `title`, `description`, `date` (YYYY-MM-DD), `tags`, `draft`. Use `##`/`###` (viram o índice do post) e blocos de código com linguagem (`xml`, `powershell`, `python`, `yaml`, `bash`).
- Imagens de posts em `public/img/` e referenciadas como `/img/arquivo.png`.
- Links internos sempre via `withBase()` para funcionar se o site rodar com `base` (repo que não seja `usuario.github.io`).
- O aviso do Vite de "chunk > 500 kB" é o Three.js; é esperado e não quebra nada.
