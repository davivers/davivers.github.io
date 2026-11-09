---
title: "CI de segurança para um repositório de Detection-as-Code"
description: "Segredos, dados sensíveis em casos de teste, workflows e toolchain: como montei um pipeline de segurança no GitHub Actions para um repo de regras Sigma, e por que a primeira versão nunca rodou."
date: 2026-11-09
tags: [detection-as-code, github-actions, ci-cd, supply-chain]
draft: false
---

## Resumo

| Campo | Valor |
| --- | --- |
| Objetivo | Proteger o repositório de detecções, não apenas validar as regras |
| Repositório | [davivers/my-detections](https://github.com/davivers/my-detections) |
| Plataforma | GitHub Actions |
| Gatilhos | Pull request, push na `main`, semanal (segunda, 06:23 UTC) e manual |
| Ferramentas | gitleaks 8.30.0, yamllint 1.38.0, zizmor 1.32.0, pip-audit 2.10.1, Syft (via `anchore/sbom-action`) |
| Status | Quatro jobs aprovados na `main` |

## Hipótese

Um repositório de Detection-as-Code guarda mais do que regras. Nele ficam casos de teste e logs de replay, muitas vezes copiados de incidentes reais, além do toolchain que transforma Sigma em queries de produção.

Isso abre quatro riscos que o workflow de validação (`vitrix check`) não cobre, porque ele verifica se a regra funciona, não se o repositório é seguro:

1. Um segredo entra no histórico do Git.
2. Um caso de teste leva dados da empresa, como hostnames, e-mails ou IPs internos.
3. Um workflow mal configurado permite vazamento de token ou execução de código não confiável.
4. Uma dependência vulnerável do toolchain gera ou manipula as queries publicadas.

## Telemetria

Cada risco vira um job independente, com sua própria entrada e saída:

| Job | O que analisa | Ferramenta | Resultado |
| --- | --- | --- | --- |
| `secrets` | Todo o histórico do Git | gitleaks | SARIF em Code Scanning |
| `data-hygiene` | `rules`, `cases` e `datasets` | gitleaks com regras próprias | Tabela no Summary do Actions |
| `static` | `rules`, `cases`, `vitrix.yml` e workflows | yamllint e zizmor | Falha do job |
| `toolchain` | Versões instaladas do toolchain | pip-audit e Syft | Falha do job e SBOM CycloneDX |

## Pipeline

A base do workflow nega tudo que não for leitura. Só o job `secrets` recebe permissão extra, para enviar o SARIF:

```yaml
permissions:
  contents: read

jobs:
  secrets:
    permissions:
      contents: read
      security-events: write
```

O scan de segredos usa `fetch-depth: 0` porque um segredo removido em um commit posterior continua acessível no histórico:

```yaml
- uses: actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4
  with:
    fetch-depth: 0
    persist-credentials: false
- name: Gitleaks
  run: |
    curl -sSfL "https://github.com/gitleaks/gitleaks/releases/download/v${GITLEAKS_VERSION}/gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz" | tar xz gitleaks
    ./gitleaks git . --redact --no-banner --report-format sarif --report-path gitleaks.sarif
```

A higiene de dados usa o mesmo binário em modo `dir`, com um arquivo de regras próprio. Ele procura IPs privados, e-mails e hostnames internos, e o relatório mostra apenas regra, arquivo e linha:

```bash
./gitleaks dir . --config .gitleaks-data.toml --redact --no-banner \
  --exit-code 0 --report-format json --report-path data-hygiene.json
```

As ferramentas de CI são instaladas de um lockfile com hashes, em um ambiente separado do toolchain auditado:

```bash
python -m venv "$RUNNER_TEMP/tools"
"$RUNNER_TEMP/tools/bin/pip" install -q --require-hashes -r requirements-ci-tools.txt
```

O pip-audit recebe as versões instaladas no toolchain. O Vitrix sai dessa lista porque não está no PyPI, e fica fixado por commit no `requirements-ci.txt`:

```bash
.tool/bin/pip freeze --exclude vitrix > "$RUNNER_TEMP/toolchain-freeze.txt"
pip-audit -r "$RUNNER_TEMP/toolchain-freeze.txt" --no-deps --disable-pip --desc on --strict \
  --ignore-vuln PYSEC-2026-2447
```

O workflow que valida as regras instala o mesmo arquivo. Assim, a versão auditada é a mesma que gera as queries:

```yaml
# Installs the commit pinned in requirements-ci.txt. Never install a bare "vitrix" here.
- name: Install Vitrix
  run: pip install -r requirements-ci.txt
```

### Por que essas escolhas?

- **`persist-credentials: false`** evita que o `GITHUB_TOKEN` fique gravado no `.git/config` durante o restante do job.
- **Actions fixadas por SHA** impedem que uma tag movida troque o código executado no pipeline.
- **`--redact` e relatório sem conteúdo** evitam que o próprio CI republique o dado encontrado. Isso importa mais ainda em repositório público.
- **`--exit-code 0` na higiene de dados** deixa o job apenas informativo enquanto as regras são ajustadas.
- **Ambientes separados** impedem que as ferramentas de auditoria entrem no resultado do toolchain auditado.
- **Execução semanal** detecta CVEs novas em dependências mesmo quando ninguém fez commit.
- **`--strict` no pip-audit** faz o job falhar quando alguma dependência da lista não pode ser auditada.
- **Vitrix fixado por commit** evita instalar um pacote de mesmo nome que alguém venha a publicar no PyPI.

### A exceção do `diskcache`

O pip-audit encontrou a PYSEC-2026-2447 no `diskcache` 5.6.3, uma dependência do toolchain que ainda não tem versão corrigida. A exploração exige escrita no diretório de cache, e os runners do CI são descartáveis. Por isso, a falha está ignorada de forma explícita, com a justificativa em um comentário no workflow, até sair uma correção.

## Teste

A primeira versão do workflow nunca executou. Estes foram os bloqueios e as correções:

| Problema | Efeito | Correção |
| --- | --- | --- |
| Arquivo sem extensão | O GitHub não registrava o workflow | Renomear para `dac-pipeline-security.yml` |
| `data-hygiene:` na coluna 0 | YAML inválido | Indentar dentro de `jobs:` |
| `runs-on: ubuntu_latest` | Nenhum runner corresponde ao rótulo | Usar `ubuntu-latest` |
| Faltavam `.gitleaks-data.toml`, `.yamllint.yml` e `requirements-ci.txt` | Jobs falhariam | Criar os arquivos |
| Actions sem SHA e sem `persist-credentials: false` | Reprovação no zizmor | Fixar por SHA e desativar a persistência |
| `pip-audit --strict` com pacote fora do PyPI | Auditoria abortada | Auditar as versões instaladas sem o Vitrix |
| `pip install vitrix` no workflow de validação | Com o nome livre no PyPI, quem o registrasse poderia executar código no CI | Instalar pelo `requirements-ci.txt` |

O erro mais simples foi o mais silencioso: sem a extensão, não houve execução com falha, porque o workflow nem chegou a existir para o GitHub.

Depois das correções, os quatro jobs passaram no GitHub Actions:

| Job | Resultado na `main` |
| --- | --- |
| `secrets` | Nenhum segredo encontrado, SARIF enviado ao Code Scanning com 0 resultados |
| `data-hygiene` | 0 ocorrências |
| `static` | yamllint aprovado, zizmor sem achados a partir de severidade média |
| `toolchain` | Sem vulnerabilidades, com a exceção acima, e SBOM gerado como artefato |

A separação de responsabilidades também apareceu na prática. No mesmo commit em que o pipeline de segurança passou, o `vitrix check` reprovou uma regra de modelo que disparava em um evento legítimo do SCCM.

Depois, atualizei o Vitrix para uma versão em que o replay é apenas informativo. O arquivo `.expect.yml` não reprova mais regras, e uma regra de modelo com a mesma lógica voltou a ser aprovada. Agora, uma mudança no número de eventos detectados só aparece ao rodar `vitrix replay`.

O `vitrix check --strict` também gerou uma falha pouco óbvia. Uma regra de teste tinha a mesma lógica de outra, o que produziu um aviso de lint. O quality gate indicou 4 de 4 regras prontas, mas o job terminou com erro, porque `allow_warnings: true` vale para o gate e o `--strict` transforma qualquer aviso em falha.

Depois de mudar o `logsource` da regra de teste, o aviso sumiu e os dois workflows passaram, com 19 de 19 casos aprovados. Das 4 regras aprovadas, 2 ainda são regras de teste.

Em um teste local, as regras de higiene detectaram IP privado, e-mail e hostname em um arquivo de exemplo, sem mostrar os valores no relatório.

O teste de ponta a ponta ainda está pendente: um pull request com um segredo falso e um hostname fictício em um caso de teste.

Resultado esperado: o job `secrets` falha com o achado no Code Scanning, e o `data-hygiene` lista regra, arquivo e linha no Summary, sem mostrar o valor.

## Considerações finais

Validar regras e proteger o repositório são problemas diferentes. O `vitrix check` responde se a detecção funciona. Os quatro jobs deste pipeline respondem se o repositório que guarda essa detecção é seguro. A regra reprovada no mesmo commit em que o pipeline de segurança passou mostra que um não substitui o outro.

A principal lição veio do erro mais simples: um workflow que não existe para o GitHub não falha, apenas não roda. Ter o arquivo no repositório não prova nada. O que conta é ver o job executar.

O trabalho ainda não terminou. Falta o teste de ponta a ponta com um pull request, os checks ainda não são obrigatórios na `main`, e o `data-hygiene` continua apenas informativo enquanto as regras não refletem o ambiente real. Com o replay apenas informativo, mudanças no comportamento das regras também precisam ser revisadas com `vitrix replay`.

## Referências

- [Gitleaks](https://github.com/gitleaks/gitleaks)
- [zizmor: auditorias](https://docs.zizmor.sh/audits/)
- [pip-audit](https://github.com/pypa/pip-audit)
- [yamllint](https://yamllint.readthedocs.io/)
- [Syft](https://github.com/anchore/syft)
- [GitHub Docs: Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Vitrix](https://github.com/davivers/vitrix)
