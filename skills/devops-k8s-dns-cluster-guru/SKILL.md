---
name: devops-k8s-dns-cluster-guru
description: "setting up self-hosted authoritative DNS on k3s / Kubernetes"
disable-model-invocation: true
---
# K8s DNS Cluster Guru — Self-Hosted Authoritative DNS on Dual k3s Nodes

## Summary

Self-hosted authoritative DNS infrastructure for Ringdom k3s clusters: two independent k3s single-node servers (ns1 @ 5.161.246.54, ns2 @ 135.181.161.60) each running PowerDNS Authoritative Server in hostNetwork mode, connected via AXFR primary/secondary zone transfer; ExternalDNS (pdns provider) on k3s-1 watches Ingress annotations and syncs A/CNAME records to PowerDNS REST API; static zone records (MX, TXT/SPF/DKIM/DMARC, SRV) stored as DNSEndpoint CRDs committed to git; CoreDNS remains cluster-internal DNS only; registrar NS delegation updated with glue records (ns1/ns2 in-bailiwick); cert-manager HTTP-01 via nginx ingress continues unchanged; full ringdom.org zone migrated from Cloudflare including all A/AAAA/CNAME/MX/SRV/TXT records.

## Instructions

1. Pattern: map requirement → consult_when hit for devops_k8s_dns_cluster_guru → apply core_principles and architecture.data_flow before registrar or ExternalDNS changes.
2. Pattern: verify matching SOA serial on ns1 and ns2 (dig +notify path) before shortening TTLs or switching NS at registrar.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/devops-k8s-dns-cluster-guru.nodus.json"`
