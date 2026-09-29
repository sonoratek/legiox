---
name: devops-k8s-forgejo-guru
description: Forgejo PAT mint, rotate, revoke, or scope selection (write:repository, write:package, admin). Order Lab Source Editor auth / Contents API commit failures (401/403/404/409). ringdom-clones scaffold, collaborator grant, or per-order robot user provisioning. RING_FORGEJO_API_TOKEN / forgejo-write Secret / admin BasicAuth wiring on k3s. LegioX truth lens skill.
---

# DevOps K8s Forgejo Guru

## Summary

Ringdom Forgejo (forge.ringdom.org on k3s-3) is mesh-only: Ingress allows Tailscale CGNAT 100.64.0.0/10 and in-cluster CIDRs; public internet gets 403. ring-platform.org pods reach forge/registry via hostAliases 100.64.0.1 — never via public A records pointing at mesh IPs. API auth: mint tokens only with BasicAuth POST /users/:name/tokens (body name+scopes[+repositories]); consume REST with Authorization: token <sha1>; admin impersonation via ?sudo= or Sudo: header. Scopes are mandatory; Contents file commit/tree/history need write:repository (or read:repository for GET-only). Specific-repository PATs may pass repositories:[{owner,name}] but cannot add collaborators — provision robots and PUT /repos/{owner}/{repo}/collaborators/{user} with admin/org credentials. Hybrid PAT model: org robot for scaffold/build/registry; per-order robot + short-lived write:repository PAT for Order Source Editor, ciphertext on project_deployments.sourceAuth via encryptLabSecret. BuildKit uses buildkit/forgejo-write on k3s-3; platform uses RING_FORGEJO_API_URL/TOKEN (+ PULL_*). Do not reintroduce CoreDNS forge-mesh.override hosts blocks. Swagger SSOT: https://forge.ringdom.org/api/swagger (from mesh) / swagger.v1.json.

## When to use

- Forgejo PAT mint, rotate, revoke, or scope selection (write:repository, write:package, admin)
- Order Lab Source Editor auth / Contents API commit failures (401/403/404/409)
- ringdom-clones scaffold, collaborator grant, or per-order robot user provisioning
- RING_FORGEJO_API_TOKEN / forgejo-write Secret / admin BasicAuth wiring on k3s
- forge.ringdom.org or registry returns 403 from public or 401 from mesh
- BuildKit cannot push/pull Forgejo OCI or package registry images
- hostAliases / node /etc/hosts / CoreDNS mesh DNS for forge and registry
- Admin sudo API (?sudo= / Sudo:) to act as another Forgejo user
- Repo-restricted token vs robot-user isolation trade-offs
- Replacing admin-derived tokens with org robot least privilege
- Forgejo Ingress whitelist (100.64.0.0/10) changes on k3s-3
- Order source path allowlist commits colliding with Forgejo Contents sha requirements

## Instructions

1. Pattern: need forge auth decision → consult devops_k8s_forgejo_guru → apply MESH_ONLY + TOKEN_MINT_BASICAUTH_ONLY + PAT_IS_USER_SCOPED before coding.
2. Pattern: mint PAT → BasicAuth POST /api/v1/users/{username}/tokens with {"name","scopes":["write:repository"]} → store sha1 once encrypted → never expect sha1 on GET list.
3. Pattern: Source Editor write → resolve order robot token (or env fallback) → Authorization: token → GET contents (sha) → PUT/DELETE contents with message + sha → on 401 re-mint once.
4. Pattern: isolate one clone → create robot user → PUT collaborator on ringdom-clones/{slug} → mint token for that user only (or repositories:[{owner,name}] if Forgejo version supports it) → never reuse org-wide write PAT for buyer/integrator editor.
5. Pattern: mesh reachability → verify whitelist + hostAliases 100.64.0.1 → wget/curl forge from platform pod expects 200/401 not 403; fix DNS with hosts/aliases not second CoreDNS hosts{}.
6. Pattern: registry push → PAT with write:package (and registry ACL) often via BasicAuth user:token; validate separately from REST token header paths.
7. Pattern: validate external Forgejo assumptions against this lens and live /api/swagger before merge or deploy.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_k8s_forgejo_guru`).
