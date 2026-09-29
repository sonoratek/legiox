---
name: devops-auto-repair-shop-crm-guru
description: deploying Twenty CRM to Kubernetes. setting up IMAP email sync in Twenty CRM. connecting service@subiworx.com to the CRM. creating custom Vehicle or WorkOrder objects in Twenty. LegioX truth lens skill.
---

# DevOps Auto Repair Shop CRM Guru

## Summary

Twenty CRM (GPL-licensed, github.com/twentyhq/twenty) is the leading open-source Salesforce alternative with a modern React frontend, NestJS backend, PostgreSQL persistence, and Redis for BullMQ job queues. It natively supports IMAP/SMTP/CalDAV since v1.3+ via the feature flag IS_IMAP_SMTP_CALDAV_ENABLED=true on both server and worker containers — critical: the flag must be set on the WORKER, not just the server. Email sync polling interval is ~15 minutes by default; the worker background job fetches messages, auto-creates contact records, and attaches email threads to matching CRM records by address. For service@subiworx.com, configure MESSAGING_PROVIDER_IMAP_ENABLED=true and add the account under Settings → Lab → Email. The Helm chart (artifacthub: amecea/twentycrm or cloud-exit/twentycrm-helm) deploys server + worker + optional PostgreSQL + Redis; the worker must share PG_DATABASE_URL and APP_SECRET with the server via the same K8s Secret. Custom auto-repair objects (Vehicle, WorkOrder, TuningJob) are created via Settings → Data Model or via the Metadata REST API (POST /rest/metadata/objects), then related one-to-many using the GraphQL relation API — treat each vehicle as a child of a People/Company record. The pipeline for repair orders maps to Twenty's native Kanban pipeline stages: Intake → Diagnosis → Estimate → Approved → In-Progress → Waiting-Parts → Ready → Picked-Up. Anti-patterns: running migrations on worker replicas (set DISABLE_DB_MIGRATIONS=true on workers, run on server only); using env-only config (IS_CONFIG_VARIABLES_IN_DB_ENABLED=true is the correct production mode — admin panel changes replicate to all pods). Metabase connects to the same PostgreSQL DB on the public schema for dashboards; n8n automates Twenty webhooks → SMS/email reminders via SMTP.

## When to use

- deploying Twenty CRM to Kubernetes
- setting up IMAP email sync in Twenty CRM
- connecting service@subiworx.com to the CRM
- creating custom Vehicle or WorkOrder objects in Twenty
- configuring Helm chart for Twenty CRM
- building auto repair shop data model in an open-source CRM
- setting up repair order Kanban pipeline
- tracking Subaru VIN and service history in CRM
- integrating n8n with Twenty CRM webhooks
- building Metabase dashboards on CRM data
- debugging Twenty worker IMAP sync not working
- managing TwentyCRM secrets in Kubernetes
- configuring SMTP outbound email from CRM
- setting up technician assignment and job tracking
- auto-creating contacts from incoming customer emails

## Instructions

1. IMAP_FLAG_ON_WORKER — IS_IMAP_SMTP_CALDAV_ENABLED=true and MESSAGING_PROVIDER_IMAP_ENABLED=true must be set on the worker container, not just the server; missing this is the #1 cause of mail-sync silently showing 'synced' with zero messages imported.
2. SHARED_SECRET_K8S — APP_SECRET and PG_DATABASE_URL must be injected from the same K8s Secret into both server and worker Deployments; mismatch causes JWT validation failures and broken email thread attachment.
3. WORKER_NO_MIGRATIONS — Set DISABLE_DB_MIGRATIONS=true and DISABLE_CRON_JOBS_REGISTRATION=true on all worker replicas; run migrations only from the server Deployment's init container or pre-upgrade Helm hook.
4. DB_CONFIG_MODE — Use IS_CONFIG_VARIABLES_IN_DB_ENABLED=true in production so that admin panel changes (OAuth, SMTP, feature flags) propagate to all pods without restarts; only infrastructure vars (PG_DATABASE_URL, SERVER_URL, APP_SECRET) must remain in .env/K8s Secret.
5. CUSTOM_OBJECTS_VIA_API — Create Vehicle (fields: vin, make, model, year, mileage, trim) and WorkOrder (fields: ro_number, status, labor_hours, parts_cost, total, technician, notes) objects via POST /rest/metadata/objects; relate Vehicle → People (many-to-one) and WorkOrder → Vehicle (many-to-one) using POST /rest/metadata/relations.
6. PIPELINE_STAGES — Map the shop workflow as a Twenty pipeline: Intake → Diagnosis → Estimate → Customer-Approved → In-Progress → Waiting-on-Parts → Quality-Check → Ready-for-Pickup → Closed; attach WorkOrder records to pipeline stages rather than Opportunities.
7. N8N_WEBHOOK_TRIGGER — Use Twenty webhooks (Settings → API & Webhooks → New Webhook, event: record.updated, object: work_order) pointing to n8n to trigger SMS/email notifications when status changes to 'Ready-for-Pickup' or 'Waiting-on-Parts'.
8. METABASE_READ_REPLICA — Connect Metabase to PostgreSQL using a read-only DB user scoped to the Twenty workspace schema; key dashboard queries: open ROs by technician, ARO (average repair order value), parts-waiting aging, and monthly Subaru model breakdown.
9. TLS_INGRESS — Use cert-manager with Let's Encrypt ClusterIssuer; annotate the Twenty Ingress with cert-manager.io/cluster-issuer; set SERVER_URL=https://crm.subiworx.com in the K8s Secret before first boot — changing it post-boot breaks CORS and auth redirects.
10. PVC_INIT_CONTAINER — Add an initContainer (image: busybox) to the server Deployment to chown /app/packages/twenty-server/.local-storage to UID 1000 when using hostPath or NFS PVCs; omit for cloud-managed PVCs with correct storage class defaults.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_auto_repair_shop_crm_guru`).
