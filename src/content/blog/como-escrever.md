---
title: "Como publicar um write-up neste site"
description: "Crie um arquivo .md, preencha o cabeçalho e faça push. O resto é automático."
date: 2026-11-06
tags: [meta]
draft: false
---

## 1. Crie o arquivo

Dentro de `src/content/blog/`, crie `meu-writeup.md`. O nome do arquivo vira a URL: `/blog/meu-writeup/`.

## 2. Preencha o cabeçalho

```yaml
---
title: "Título do write-up"
description: "Uma frase que aparece na lista do blog."
date: 2026-11-07
tags: [wazuh, threat-hunting]
draft: true   # true = só aparece no `npm run dev`
---
```

## 3. Escreva em Markdown

Títulos `##` aparecem no índice do post. Blocos de código com linguagem (` ```xml `, ` ```powershell `, ` ```python `) ganham destaque de sintaxe nos temas claro e escuro.

Imagens vão em `public/img/` e entram assim: `![descrição](/img/print.png)`.

## 4. Publique

```powershell
git add .
git commit -m "post: meu write-up"
git push
```

O GitHub Actions gera o site e publica em poucos minutos.
