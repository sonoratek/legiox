# NODUS-AGENT-SCHEMA — Networked Object Description and Universal Schema for Agentic Knowledge Retrieval and Multi-Point Document Synthesis via jq/rg-Queryable JSON

**Purpose:** Supply this schema to a web research (or code-generation) agent so it outputs **exactly one** LegioX truth-lens skillset JSON that satisfies indexing and selector requirements. No ambiguity.

---

## CRITICAL: Root structure

- The output MUST be a **single JSON object** `{ ... }`.
- The output MUST NOT be a JSON array (e.g. not `[{ ... }]`).
- All paths in this document assume root is an object (e.g. `mission.primary_objective`, not `[0].mission.primary_objective`).

---

## 1. Required top-level keys (all must be present)

| Key | Type | Rule |
|-----|------|------|
| `schema_version` | string | `"1.0"` or `"2.0"` |
| `agent_type` | string | Unique id in **snake_case** (e.g. `mysql_database_server_guru`). Should match filename semantics. |
| `name` | string | Human-readable title (e.g. `"MySQL Database Server Guru"`) |
| `mission` | object | See §2. Must have exactly four sub-keys. |
| `truth_lens` | string | One paragraph: Ring-specific patterns, API truths, anti-patterns. Used by selector and Commander. |
| `consult_when` | array of strings | Trigger phrases for legiox-agent-selector (e.g. `["MySQL schema design", "InnoDB tuning"]`). At least 3 items. |
| `key_patterns` | array of strings | Bullet-style implementation patterns. At least 2 items. |
| `expertise` | array of strings | Short tags (e.g. `"INNODB_ONLY — All tables use InnoDB"`). At least 1 item. |
| `keywords` | array of strings | Search/discovery terms. At least 3 items. |
| `priority` | string | One of: `"high"`, `"medium"`, `"low"` |
| `status` | string | One of: `"active"`, `"deprecated"` |

---

## 2. Mission object (required sub-schema)

`mission` MUST be an object with exactly these four keys (all strings):

| Key | Description |
|-----|--------------|
| `primary_objective` | One sentence: what this agent achieves. |
| `context` | 1–3 sentences: "You are a ... Your goal is ..." |
| `target_outcome` | One sentence: desired end state. |
| `scope` | One sentence: where this applies (e.g. "MySQL 8.4 LTS on Linux and Kubernetes"). |

No extra keys in `mission`. No missing keys.

---

## 3. Optional but recommended

| Key | Type | Rule |
|-----|------|------|
| `created` | string | Date `YYYY-MM-DD`. |
| `updated` | string | Date `YYYY-MM-DD`. |
| `core_principles` | array of strings | High-level rules (e.g. `"INNODB_ONLY — ..."`). |

---

## 4. Domain body (optional)

Any number of **additional top-level keys** are allowed for domain content (e.g. `innodb_engine`, `high_availability`, `security_architecture`). Rules:

- Key names: **snake_case** (e.g. `connection_management`, not `connectionManagement`).
- Value: object or array. Prefer **2–3 levels of depth** for jq-friendly access (e.g. `.section.subsection.key`).
- Do not use keys that conflict with the required or recommended keys above.

---

## 5. Naming and file

- **Filename:** `kebab-case.json` (e.g. `mysql-database-server-guru.json`).
- **agent_type:** Must align with filename in snake_case (e.g. `mysql_database_server_guru` for `mysql-database-server-guru.json`).

---

## 6. Minimal valid example (structure only)

```json
{
  "schema_version": "2.0",
  "agent_type": "example_domain_guru",
  "name": "Example Domain Guru",
  "created": "2026-03-14",
  "updated": "2026-03-14",
  "mission": {
    "primary_objective": "One-line objective.",
    "context": "You are a ... Your goal is ...",
    "target_outcome": "One-line outcome.",
    "scope": "One-line scope."
  },
  "core_principles": ["TAG — short rule"],
  "truth_lens": "One paragraph of patterns and Ring-specific truths.",
  "consult_when": ["trigger one", "trigger two", "trigger three"],
  "key_patterns": ["Pattern one.", "Pattern two."],
  "expertise": ["TAG — description"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "priority": "high",
  "status": "active"
}
```

Domain sections (e.g. `"innodb_engine": { ... }`) go as sibling keys of the above; keep depth shallow.

---

## 7. Validation checklist (before output)

- [ ] Root is a single object `{ ... }`, not an array.
- [ ] All 11 required top-level keys present.
- [ ] `mission` has exactly: `primary_objective`, `context`, `target_outcome`, `scope`.
- [ ] `consult_when` has ≥ 3 elements.
- [ ] `key_patterns` has ≥ 2 elements.
- [ ] `expertise` has ≥ 1 element.
- [ ] `keywords` has ≥ 3 elements.
- [ ] `truth_lens` is a non-empty string (e.g. ≥ 80 characters).
- [ ] `priority` ∈ `{"high","medium","low"}` and `status` ∈ `{"active","deprecated"}`.

---

**Reference:** Full schema and evaluation details: `AI-LEGIOX/legiox-truth-lens/AGENT-SCHEMA.md`.
