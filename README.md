# Portfólio — David Lima

Site estático em Astro, com uma coruja voxel 3D (Three.js) na home, abas **Projetos** e **Blog** e tema claro/escuro.

## Onde editar

| O quê | Arquivo |
| --- | --- |
| Nome, bio, trajetória, links | `src/site.config.ts` (tipos em `src/types.ts`) |
| Projetos | `src/data/projects.ts` |
| Posts / write-ups | `src/content/blog/*.md` |
| Foto de perfil | `public/avatar.jpg` (quadrada; sem ela aparecem as iniciais) |
| Cores e fontes | `src/styles/global.css` |
| Coruja voxel | `src/components/VoxelOwl.astro` |

## Novo write-up

Crie `src/content/blog/nome-do-post.md`:

```markdown
---
title: "Título"
description: "Resumo de uma linha."
date: 2026-11-07
tags: [wazuh, detection]
draft: false
---

Conteúdo em Markdown…
```

Com `draft: true` o post só aparece no `npm run dev`.

## Checar tipos

```powershell
npm run check
```

O deploy também roda essa checagem; se algum campo estiver errado, o build falha antes de publicar.

## Publicar

O site está em https://davivers.github.io (repo `davivers/davivers.github.io`). Cada `git push` na `main` publica em poucos minutos:

```powershell
git add .
git commit -m "post: titulo do write-up"
git push
```
