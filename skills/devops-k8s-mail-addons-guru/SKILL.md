---
name: devops-k8s-mail-addons-guru
description: "DMS mails arrive in junk but still look suspicious to users"
disable-model-invocation: true
---
# Kubernetes Mail Add-ons Guru

## Summary

For subiworx-prod, the highest signal comes from Postfix+Dovecot+Rspamd behavior, not a hard switch from DMS defaults. Rspamd is the main OSS addon already supported by docker-mailserver and already used via official docs as an opt-in service replacing legacy spam stack behavior. The modern anti-fraud layer should be implemented as a two-stage gate: deterministic anti-abuse first, then ML-assisted uncertain gating with explicit recoverability actions, because users can and will get false positives when models overfit.

## Instructions

1. Pattern: if a mail action is uncertain (not clean spam and not clean ham), run AI-assisted scoring service before final inbox decision.
2. Pattern: keep DMS Recreate strategy and one replica; do not move to multi-replica without RWO volume redesign.
3. Pattern: treat hostPort preservation and real-client-IP integrity as mandatory for SPF/RBL accuracy, then tune score thresholds.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-k8s-mail-addons-guru.nodus.json"`
