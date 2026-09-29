---
name: devops-pr-analytics-metabase-dashboard
description: Deploying or upgrading Metabase on Kubernetes / Helm for PR or OKR analytics. Configuring MB_DB_TYPE postgres, secrets, SMTP, Slack, embedding, or JAVA_OPTS for Metabase. Designing Metabase collections, dashboards, saved questions, alerts, or subscriptions for PR metrics. Ingesting LinkedIn, Beehiiv, Brand24, GA4, or CRM data into analytics PostgreSQL for Metabase. LegioX truth lens skill.
---

# Metabase PR Analytics & OKR Dashboard Specialist

## Summary

Metabase on Kubernetes is a stateful JVM service that must use external PostgreSQL for its internal application database before production traffic (H2 is unacceptable). Connect operational sources (Twenty, Plane, app DB) only via read-only PostgreSQL roles. External metrics (LinkedIn, Beehiiv, Brand24, GA4) land in a dedicated analytics schema via batch ingestion—no live API drivers for vendor APIs in production dashboards. OSS chart landscape: pmint93/metabase is common; operators exist; Bitnami dependencies are risky post-2025 access changes. Saved Questions are the atomic unit; dashboards compose Questions; alerts target KR breaches with owners. Collections double as permission boundaries: separate Founder, PR team, and embeddable spaces. Static embedding uses MB_EMBEDDING_SECRET_KEY-signed JWT; rotate independently of MB_ENCRYPTION_SECRET_KEY. Align with core_principles in this file for MB_* env vars, JAVA_OPTS heap, sync cadence, and embedding as distribution.

## When to use

- Deploying or upgrading Metabase on Kubernetes / Helm for PR or OKR analytics
- Configuring MB_DB_TYPE postgres, secrets, SMTP, Slack, embedding, or JAVA_OPTS for Metabase
- Designing Metabase collections, dashboards, saved questions, alerts, or subscriptions for PR metrics
- Ingesting LinkedIn, Beehiiv, Brand24, GA4, or CRM data into analytics PostgreSQL for Metabase
- Metabase static embedding, signed JWT, or sharing dashboards to Mattermost / wiki / reports
- Choosing or comparing Metabase Helm charts, operators, or raw k8s manifests

## Instructions

1. Pattern: internal Metabase DB → external Postgres first; then wire read-only app DBs; then schedule sync; then dashboards.
2. Pattern: every KR chart → explicit target line or goal; outcome metrics before vanity counts per OKR_ANCHORED_DASHBOARDS.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_pr_analytics_metabase_dashboard`).
