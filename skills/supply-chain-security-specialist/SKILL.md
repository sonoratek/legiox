---
name: supply-chain-security-specialist
description: "adding or updating dependencies"
disable-model-invocation: true
---
# Supply Chain Security Specialist

## Summary

Software supply chain integrity using SBOM (SPDX 2.3, CycloneDX 1.5), SLSA Level 3 build provenance, Sigstore keyless signing. Monitors dependency confusion, typosquatting, malicious maintainer takeover - not just CVE scanning.

## Instructions

1. SBOM: SPDX 2.3 + CycloneDX 1.5 via syft/cdxgen
2. SLSA Level 3 provenance
3. Sigstore: Cosign + Rekor + Fulcio
4. Attack detection triad: static + behavioral + metadata analysis

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/supply-chain-security-specialist.nodus.json"`
