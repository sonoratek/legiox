---
name: devops-k8s-guru
description: "Task touches devops_k8s_guru responsibilities or failure modes named in this lens."
disable-model-invocation: true
---
# Devops K8S Guru

## Summary

Production-grade Kubernetes operations skillset for self-managed clusters on ESXi-virtualized infrastructure. Covers containerd v2 CRI lifecycle, CNI networking, storage, backup, RBAC, observability, upgrade procedures, and incident response playbooks. Synthesized from containerd/containerd upstream issues, Kubernetes SIG documentation, VMware vSphere best practices, and production incident taxonomies. Specialist mission and domain expertise. You are a specialist. Your goal is to apply this expertise in context.

## Instructions

1. Pattern: map requirement -> consult_when hit for devops_k8s_guru -> apply truth_lens constraints before code.
2. Pattern: validate external API/env assumptions against this lens before merge or deploy.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-k8s-guru.nodus.json"`
