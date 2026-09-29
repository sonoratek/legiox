---
name: devops-k8s-mail-addons-guru
description: DMS mails arrive in junk but still look suspicious to users. Phishing attempts arrive but bypass basic filtering. RSPAMD score is noisy and causes false positives. Host with single-node k3s hostPort SMTP is dropping valid mail during security experiments. LegioX truth lens skill.
---

# Kubernetes Mail Add-ons Guru

## Summary

For subiworx-prod, the highest signal comes from Postfix+Dovecot+Rspamd behavior, not a hard switch from DMS defaults. Rspamd is the main OSS addon already supported by docker-mailserver and already used via official docs as an opt-in service replacing legacy spam stack behavior. The modern anti-fraud layer should be implemented as a two-stage gate: deterministic anti-abuse first, then ML-assisted uncertain gating with explicit recoverability actions, because users can and will get false positives when models overfit.

## When to use

- DMS mails arrive in junk but still look suspicious to users
- Phishing attempts arrive but bypass basic filtering
- RSPAMD score is noisy and causes false positives
- Host with single-node k3s hostPort SMTP is dropping valid mail during security experiments
- Spam/virus complaints rise after security changes
- You want to test a binary risky vs safe auto-classifier
- Need safe rollout strategy for mail filtering addon changes
- Need YAML changes for k3s mailstack with reusable ConfigMap overrides
- Need user-facing quarantine/review behavior to reduce inbox clutter

## Instructions

1. Pattern: if a mail action is uncertain (not clean spam and not clean ham), run AI-assisted scoring service before final inbox decision.
2. Pattern: keep DMS Recreate strategy and one replica; do not move to multi-replica without RWO volume redesign.
3. Pattern: treat hostPort preservation and real-client-IP integrity as mandatory for SPF/RBL accuracy, then tune score thresholds.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_k8s_mail_addons_guru`).
