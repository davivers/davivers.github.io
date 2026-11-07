---
title: "[Exemplo] Detectando dump de LSASS com Sysmon e Wazuh"
description: "Modelo de write-up: hipótese, telemetria, regra, teste com Atomic Red Team e tuning. Apague ou substitua pelo seu."
date: 2026-11-07
tags: [wazuh, sysmon, detection, windows]
draft: true
---

> **Este é um post de exemplo** para mostrar o formato. Troque pelo seu write-up ou apague o arquivo `src/content/blog/exemplo-lsass-dump.md`.

## Resumo

| Campo | Valor |
| --- | --- |
| Técnica | T1003.001 — OS Credential Dumping: LSASS Memory |
| Fonte | Sysmon Event ID 10 (ProcessAccess) |
| Plataforma | Wazuh 4.x |
| Severidade | Alta |

## Hipótese

Um atacante com privilégio local tenta ler a memória do `lsass.exe` para extrair credenciais. Isso exige abrir um handle no processo com direitos de leitura de memória, o que o Sysmon registra como **Event ID 10**.

## Telemetria

Configuração mínima do Sysmon para capturar o acesso:

```xml
<RuleGroup name="lsass-access" groupRelation="or">
  <ProcessAccess onmatch="include">
    <TargetImage condition="end with">\lsass.exe</TargetImage>
  </ProcessAccess>
</RuleGroup>
```

## Regra

```xml
<group name="windows,sysmon,credential_access,">
  <rule id="100410" level="12">
    <if_sid>61612</if_sid>
    <field name="win.eventdata.targetImage" type="pcre2">(?i)\\lsass\.exe$</field>
    <field name="win.eventdata.grantedAccess" type="pcre2">(?i)^0x(1010|1410|1438|143a|1fffff)$</field>
    <description>Possível dump de LSASS: $(win.eventdata.sourceImage) abriu lsass.exe com acesso $(win.eventdata.grantedAccess)</description>
    <mitre><id>T1003.001</id></mitre>
  </rule>
</group>
```

### Por que esses `GrantedAccess`?

Os valores combinam `PROCESS_VM_READ` (`0x10`) com `PROCESS_QUERY_INFORMATION` ou `QUERY_LIMITED_INFORMATION`, que é o padrão de ferramentas como `procdump` e `comsvcs.dll MiniDump`.

## Teste

```powershell
Invoke-AtomicTest T1003.001 -TestNumbers 2
```

Resultado esperado: alerta `100410` em menos de 30 segundos no dashboard.

## Tuning

- Excluir o seu EDR e o próprio `MsMpEng.exe` por `sourceImage` assinado.
- Monitorar volume por 7 dias antes de subir para nível 12.

## Referências

- MITRE ATT&CK — T1003.001
- Documentação do Sysmon — Event ID 10
