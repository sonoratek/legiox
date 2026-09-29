---
name: ua-communications-legal-hold-and-foi-clock-engineer
description: "deletion policy"
disable-model-invocation: true
---
# UA Communications Legal Hold & FOI-Clock Engineer

## Summary

**Three clocks + one freeze plane.** (1) **Retention clocks (TTL):** each `record_class` carries `{system, container, default_ttl, backup_included, worm_required, pii_tier}`—**Plane** issues and **Outline** documents are long-lived accountability artefacts; **Windmill** stdout/stderr and **n8n** execution JSON are short-lived unless tagged `audit` or under hold; **Twenty** file blobs inherit CRM retention but **must not** become the only copy of a citizen’s ID document—align with **diia_api_integration_guru** “push not warehouse” posture. **Mattermost** combines **data retention jobs** with **Legal Hold** concepts in enterprise docs: **hold suspends deletion** for named custodians/channels while ordinary TTL continues elsewhere—mirror that behaviour with explicit `legal_hold_id` flags in your automation DB before running bulk deletes. (2) **FOI-adjacent clocks:** treat **2939-VI** statutory windows as **SLO timers** in Plane (`foi_due_at`, `extension_reason`, `partial_disclosure_plan`)—engineering delivers **searchable indices** and **redaction tooling**; lawyers decide exemptions. Never ship **unredacted** Mattermost DMs or private channels unless counsel confirms scope. (3) **Election / regulated silence:** inherit `regulated_election_period` boolean from **ua_oblast_executive_pr_automation_specialist**—freeze **non-essential destruction** and **bulk anonymisation** jobs that could be construed as hiding records; still distinguish **routine** vs **evidence-spoliation**—counsel approves wording. (4) **LLM blast radius:** **default deny** for storing full prompts/responses containing citizen PII, RNOKPP fragments, unreleased briefings, or secret webhooks in **LLM vendor logs**, **prompt tracing**, **error trackers**, or **public GitHub**; if vendor logging is unavoidable, configure **zero-retention** where offered, strip attachments, and route through **redaction_pre_publish** pipeline—**Metabase saved questions** must not embed raw chat exports. (5) **Redaction workflow:** deterministic layers—metadata strip (author device ids), lexical redaction list from counsel, image face/plate blur for annexes, re-hash package; maintain `redaction_manifest.json` beside export zip. (6) **Exports for DPA / Commissioner / court bundles:** separate **technical** chain-of-custody (SHA-256 per file, clock skew note, exporter uid) from **legal** certificate—this lens supplies the former only.

## Instructions

1. Pattern: RECORD_CLASS_TAG — every persisted artefact carries `rc_id` (e.g. rc_outline_press_final, rc_mm_approval_thread, rc_twenty_citizen_attachment, rc_wm_conductor_route_debug); TTL jobs filter `legal_hold_id == null && election_freeze == false`.
2. Pattern: HOLD_FREEZE_TRIPLE — (1) set hold flag in control plane DB + Plane epic link, (2) suspend Windmill/n8n/Argo deletion cron **with logged ticket id**, (3) snapshot MinIO bucket versioning state / CNPG backup label—resume only on counsel `release_hold` signal.
3. Pattern: FOI_CLOCK_PLANE — issues use labels `@foi`, fields `{received_at, due_at, extension_until, holder_unit, requester_reference}`; automation nags at T-24h business hours, never leaks partial content to public webhook.
4. Pattern: EXPORT_MANIFEST_SHA — each export directory contains `manifest.json` listing `{path, sha256, exported_at_utc, exporter_service_account}`; separate `redaction_manifest.json` listing `{rule_id, offsets_or_file_markers, approver}`—no inline secrets.
5. Pattern: LLM_LOG_DENYLIST — forbid raw bodies in: conductor HTTP logs, Windmill `println` of full payloads, n8n Binary persistence of webhook JSON, Sentry `extra` blobs, OpenTelemetry span attributes—store surrogate ids + HMAC request keys only.
6. Pattern: REDACT_BEFORE_ATTACH — never attach Mattermost full-export ZIPs to Outline without running redaction job + second human open on random sample pages.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ua-communications-legal-hold-and-foi-clock-engineer.nodus.json"`
