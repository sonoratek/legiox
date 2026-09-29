---
name: ua-gov-supply-chain-appsec-sbom-and-image-signing-specialist
description: "**New container image** or Dockerfile added to region-pr-ops / oblast GitOps repo (needs SBOM + sign + policy pattern)"
disable-model-invocation: true
---
# UA Gov Supply Chain AppSec — SBOM & Image Signing Specialist

## Summary

**Layering:** **CI** proves “what we built” (SBOM + scan + sign); **registry** holds immutable digests; **admission** (Kyverno `verifyImages`) proves “only what we signed enters the cluster.” Without all three, attackers pivot on **tag mutability** or **unsigned sidecar injection**. **Cosign:** prefer **keyless** signing bound to GitHub OIDC (`cosign sign --yes` with workload identity) for rotation ergonomics; use **KMS/HSM-backed** keys when oblast policy forbids ephemeral issuer trust. Publish **Sigstore bundle** expectations and verify **Fulcio/Rekor** trust roots are acceptable under **data residency** review. **Kyverno:** match **ghcr.io** image patterns explicitly; enable **mutateDigest** so admitted pods reference **digest**; pair `verifyImages` with separate policies for `latest` ban (owned by **ua_gitops_flux_kyverno_governor**). Align policy versions with Kyverno releases that document **Sigstore** integration (verifyImages overview + Sigstore pages). **SBOM:** Syft on the **final** multi-stage image; store **SPDX JSON** and **CycloneDX**; attach SBOM as an **OCI referrer** artifact with Cosign **attach** when compliance asks for signature-linked SBOM. **Trivy/Grype:** Trivy for **config + vuln + secret** scans in CI; Grype for **anchore DB**-style matching — dedupe noise with **ignore rules** under version control, not silent local ignores. **CVE triage:** SLAs by severity, **vendor advisory** priority (GHSA, K8s security announcements), **temporary unblock** only with **Plane** ticket + expiry date. **region-pr-ops:** treat **MCP** and **conductor** images as **higher blast-radius** — stricter thresholds than docs-only services. **Anti-patterns:** verifying only `latest`; signing without **admission enforcement**; SBOM from source tree only while shipping different binaries; storing **cosign private keys** in Helm values; letting **unscanned third-party** sidecars bypass `imageReferences` glob.

## Instructions

1. Pattern: **CI trilogy** — `syft packages` (or `syft scan`) on built image → `trivy image --severity` / `grype` gate → `cosign sign` (digest reference) → push SBOM + signature metadata; fail closed on any step.
2. Pattern: **Kyverno cosign attestor** — `imageReferences: ["ghcr.io/org/repo@sha256:*","ghcr.io/org/repo:release-*"]` + `attestors` matching CI OIDC or pinned `secret` keys; `mutateDigest: true` unless a workload proves incompatible.
3. Pattern: **CVE triage card** — fields: CVE, CVSS, EPSS optional, affected image digest, fixed-in version, **workaround**, owner, **expiry** for temporary policy exclude; no infinite `exclude`.
4. Pattern: **Blast-radius tiers** — `conductor-gateway`, MCP servers, `temporal-workers` = **tier A** (strictest scan + signature); docs nginx = **tier B**; third-party chart defaults = **tier C** with pinned chart version + subimage override list.
5. Pattern: **Hand-off boundary** — **ua_gitops_flux_kyverno_governor** owns `require-drop-all`, `readOnlyRootFilesystem`, NetworkPolicy; **this lens** owns **verifyImages** + **SBOM evidence** + **registry CVE** SLAs.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ua-gov-supply-chain-appsec-sbom-and-image-signing-specialist.nodus.json"`
