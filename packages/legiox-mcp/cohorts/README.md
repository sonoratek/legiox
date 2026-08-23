# LegioX topic cohort manifests

Path lists over `legiox-truth-lens/*.nodus.json`. Files are **not moved** — cohorts only list paths.

**Master index:** [`../LEGIOX-COHORTS.json`](../LEGIOX-COHORTS.json) → `topic_cohorts` (description, keywords, path, member_count).

| Manifest | Domain |
|----------|--------|
| [`google-cohort.json`](google-cohort.json) | GCP, Google APIs, Vertex media, Firebase, Workspace |
| [`react-cohort.json`](react-cohort.json) | React 19, RSC, UI, Email, Three |
| [`nextjs-cohort.json`](nextjs-cohort.json) | Next.js App Router, middleware, caching |
| [`ai-cohort.json`](ai-cohort.json) | LLM, RAG, voice/video AI, agents |
| [`business-cohort.json`](business-cohort.json) | Growth, market, partnerships, revenue |
| [`code-cohort.json`](code-cohort.json) | Quality, testing, TypeScript, APIs |
| [`k8s-cohort.json`](k8s-cohort.json) | Kubernetes, DevOps, Helm, GitOps |
| [`web3-cohort.json`](web3-cohort.json) | Blockchain, Solidity, DeFi, wallets |
| [`pr-ops-cohort.json`](pr-ops-cohort.json) | PR, comms, Metabase dashboards |
| [`ua-regional-cohort.json`](ua-regional-cohort.json) | Ukraine regional / civic patterns |

Regenerate all manifests and refresh `LEGIOX-COHORTS.json`:

```bash
node /Users/insight/code/ringdom/AI-LEGIOX/scripts/build-cohort-manifests.mjs
```

Operational tier cohorts (`LEGIOX_CORE`, …) remain in `LEGIOX-COHORTS.json` → `operational_cohorts`.
