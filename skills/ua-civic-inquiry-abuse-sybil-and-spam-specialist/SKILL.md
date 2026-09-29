---
name: ua-civic-inquiry-abuse-sybil-and-spam-specialist
description: "public webhook launch"
disable-model-invocation: true
---
# UA Civic Inquiry Abuse, Sybil & Spam Specialist

## Summary

**Ingress is the blast radius.** Public webhooks must assume **malicious senders**: verify **HMAC-SHA256** (or asymmetric signatures) with **constant-time** compare, reject stale **timestamps** (≈5-minute skew windows per common webhook hardening literature), require **`Idempotency-Key`** and dedupe store, cap JSON/body size, and validate JSON Schema before any Conductor or CRM side-effect—aligns with OWASP API Security **2023** themes cited in vendor hardening guides. **Rate limits:** industry guidance often cites **token-bucket** limits per **authenticated producer** (API key / mTLS client / signed app installation) rather than only per-IP—**shared NAT** (mobile carriers, shelters, schools) makes naive IP blocking a **civil-rights failure mode**; prefer **tiered budgets** (anonymous warm → Antibot → document → bank) matching **ua_non_speculative_reputation_wealth_designer** trust ladder but never **inverting** (high civic impact on anonymous). **Separate accept from heavy processing** where possible: edge returns **202** after signature pass + enqueue to **durable queue** (see `ua_event_bus_civic_pipeline_architect` in boss backlog) so retry storms do not amplify abuse. **Sybil / CIB:** pair graph signals (synchronized new accounts, identical templates across hromady, botnet User-Agent clusters) with **human moderation** queues; **quadratic** or **vouch** models from civic-tech literature reduce linear Sybil payoff but need **governance**—pair **ua_dao_public_authority_boundaries_architect** before decentralized reputation. **Fingerprint ethics:** treat high-entropy browser fingerprints as **sensitive** processing; document DPIA triggers with **ukrainian_personal_data_and_official_stats_governance_auditor**; avoid **scoring** users on OS/locale/fonts as fraud—known to **exclude** vulnerable groups (UK OPG research). **Appeals:** every automated throttle must log **reason code**, **evidence hash**, and **human review ticket** in Plane; publish **UA-language** plain-language appeal path; align retention with **ua_communications_legal_hold_and_foi_clock_engineer** when holds freeze deletion.

## Instructions

1. Pattern: PRODUCER_SCOPED_RATE — primary throttle key is `producer_id` (signed app install, API key, partner OIDC client), not raw IP; IP only as secondary signal with **high** false-positive review.
2. Pattern: SIGNATURE_BEFORE_PARSE — verify HMAC + timestamp + idempotency before JSON parse or DB write; reject oversize bodies at reverse-proxy (see planned `ua_api_gateway_webhook_hardening_specialist`).
3. Pattern: SYBIL_GRAPH_BOOST — combine `normalized_text_hash + geohash + category` (311 baseline) with `burst_velocity`, `cross_hromada_template_distance`, and `account_age_at_submission` for CIB score; never auto-publish law-enforcement accusations from scores alone.
4. Pattern: SANCTIONS_LADDER — shadow_throttle → Antibot challenge → captcha_or_proof_step → cooldown → human_queue → LE_referral_only_with_counsel_approval; each transition writes `abuse_case_id` to Twenty `citizenInquiry` or sibling CRM object.
5. Pattern: APPEALS_PAIR — `decision_id`, `automated_reason_codes[]`, `human_reviewer`, `reversal_or_upheld`, `notice_to_user_template`—default **uphold** user access to non-privileged intake after false positive.
6. Pattern: NO_FINGERPRINT_DISCRIMINATION — forbid rules like 'block Tor' or 'block Linux phone' for **basic** services; if network risk requires restriction, offer **alternate channel** (ASC phone, in-person) per **ua_oblast_digital_platform_strategist** equity review.
7. Pattern: LLM_AND_LOG_HYGIENE — align with `ua_communications_legal_hold_and_foi_clock_engineer`: webhook debug logs store **hashed** producer keys and surrogate ids, not full PII payloads.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ua-civic-inquiry-abuse-sybil-and-spam-specialist.nodus.json"`
