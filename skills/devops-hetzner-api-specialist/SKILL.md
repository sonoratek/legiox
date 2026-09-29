---
name: devops-hetzner-api-specialist
description: provisioning or resizing Hetzner Cloud servers. attaching or detaching volumes to cloud servers. creating or modifying private networks and subnets. configuring firewall rules or applying firewalls to resources. LegioX truth lens skill.
---

# DevOps Hetzner API Specialist

## Summary

Hetzner Cloud API (api.hetzner.cloud/v1) is a RESTful JSON-over-HTTPS API authenticated via Bearer token scoped per project. Every write operation returns an action object that must be polled to completion — failing to poll causes phantom infrastructure states in automation pipelines. The Robot Webservice (robot-ws.your-server.de) is a separate, older REST API using HTTP Basic Auth with a dedicated webservice user; it speaks application/x-www-form-urlencoded for writes and manages Dedicated Servers, vSwitches, rescue configs, boot configs, hardware resets, reverse DNS, and traffic statistics. Storage Box management moved to api.hetzner.com/v1 in 2024-2025 and is accessed with the same Cloud Bearer token. DNS zones are now integrated into the Cloud API after the DNS beta ended November 2025. Critical anti-patterns: using the Robot console credentials instead of webservice credentials for API calls; not polling actions before attempting dependent operations; sending JSON bodies to the Robot API; setting host bits in Firewall CIDR rules (rejected since December 2025); ignoring the DHCP Router Option removal of August 2025 which breaks default routing on private interfaces unless static routes are configured. For Kubernetes on Hetzner the Cloud Controller Manager (hcloud-ccm) provisions LoadBalancer Services via the Cloud LB API and requires the HCLOUD_TOKEN secret and correct annotation set. Terraform hcloud provider mirrors the Cloud API resource model 1:1 and handles action polling internally. The hcloud CLI and Go/Python SDKs are the recommended automation layer over raw HTTP; they include exponential backoff retry logic (truncated at 60 s with jitter).

## When to use

- provisioning or resizing Hetzner Cloud servers
- attaching or detaching volumes to cloud servers
- creating or modifying private networks and subnets
- configuring firewall rules or applying firewalls to resources
- provisioning or reconfiguring load balancers
- managing floating IPs or primary IPs
- creating placement groups for spread or anti-affinity
- managing SSH keys or TLS certificates in Hetzner Cloud
- creating server snapshots or managing images
- managing DNS zones or records via Hetzner API
- managing Storage Boxes via Hetzner API
- automating Dedicated Server tasks via Robot Webservice
- configuring rescue mode or reinstalling a dedicated server
- managing vSwitches between dedicated and cloud servers
- deploying Kubernetes with Hetzner Cloud Controller Manager
- writing Terraform for hcloud resources
- debugging 429 rate limit or action polling failures
- setting up object storage buckets with Hetzner S3-compatible API
- configuring rDNS on cloud or dedicated server IPs
- Ring Platform k3s cluster operations on Hetzner

## Instructions

1. ALWAYS poll action: after any POST that mutates cloud resources, extract response.action.id and loop GET /v1/actions/{id} checking .status until 'success' or surface .error.message on 'error'.
2. LABEL-DRIVEN SELECTION: tag resources at creation with environment=, service=, cluster= labels; use GET /servers?label_selector=cluster=ring-prod to target cohorts without maintaining ID lists.
3. NETWORK ATTACHMENT: attach server to private network at create time via networks[] in POST /servers body; attaching post-creation via /actions/attach_to_network triggers a reboot on older kernels — prefer creation-time attachment.
4. FIREWALL IDEMPOTENCY: POST /firewalls/{id}/actions/set_rules replaces the entire rule set atomically; never PATCH individual rules — always POST the full desired ruleset.
5. LB HEALTH CHECKS: Load balancer services require health_check config; omitting it defaults to TCP on the service port — always specify HTTP health checks for web backends with path and expected_codes.
6. PLACEMENT SPREAD: create placement_group with type=spread before server fleet provisioning; pass placement_group.id in server creation body; removal requires server rebuild — plan upfront.
7. ROBOT RESCUE WORKFLOW: POST /boot/{server-ip}/rescue (type=linux64, authorized_keys=[]), then POST /reset/{server-ip} (type=hw) to trigger reboot into rescue; poll server availability via SSH, not API.
8. STORAGE BOX SUBACCOUNTS: POST /v1/storage_boxes/{id}/subaccounts to create isolated credentials per service; set directory, read_only, ssh, samba, webdav permissions granularly.
9. OBJECT STORAGE S3: Hetzner Object Storage uses AWS S3-compatible API at https://{region}.your-objectstorage.com; authenticate with S3 access keys generated in Cloud Console; broken with AWS CLI/SDK released between Jan-2025 and the fix — use latest versions.
10. VSWITCH HYBRID: to connect dedicated servers to cloud private networks, create subnet of type vswitch in the network resource, referencing the Robot vswitch_id; configure MTU 1400 on the VLAN interface on the dedicated side.
11. PAGINATION EXHAUSTION: always iterate until meta.pagination.next_page is null; for large fleets use per_page=50 and cache results client-side keyed by label fingerprint.
12. KUBERNETES CCM: annotate Service with load-balancer.hetzner.cloud/location=fsn1 and load-balancer.hetzner.cloud/type=lb11; set HCLOUD_TOKEN env on ccm Deployment; private LB requires load-balancer.hetzner.cloud/use-private-ip=true.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_hetzner_api_specialist`).
