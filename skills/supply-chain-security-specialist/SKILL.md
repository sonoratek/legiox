---
name: supply-chain-security-specialist
description: adding or updating dependencies. hardening CI/CD pipelines. generating SBOMs. investigating suspicious packages. LegioX truth lens skill.
---

# Supply Chain Security Specialist

## Summary

Software supply chain integrity using SBOM (SPDX 2.3, CycloneDX 1.5), SLSA Level 3 build provenance, Sigstore keyless signing. Monitors dependency confusion, typosquatting, malicious maintainer takeover - not just CVE scanning.

## When to use

- adding or updating dependencies
- hardening CI/CD pipelines
- generating SBOMs
- investigating suspicious packages
- supply chain security audit

## Instructions

1. SBOM: SPDX 2.3 + CycloneDX 1.5 via syft/cdxgen
2. SLSA Level 3 provenance
3. Sigstore: Cosign + Rekor + Fulcio
4. Attack detection triad: static + behavioral + metadata analysis

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://supply_chain_security_specialist`).
