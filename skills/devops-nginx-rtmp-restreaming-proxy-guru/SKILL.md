---
name: devops-nginx-rtmp-restreaming-proxy-guru
description: AJA HELO or similar appliance RTMP push to self-hosted ingest. nginx-rtmp-module push pull relay restream configuration. RTMP port 1935 on Kubernetes Service LoadBalancer or NodePort. scaling nginx-rtmp behind Kubernetes without splitting publisher and viewers. LegioX truth lens skill.
---

# DevOps NGINX RTMP Restreaming Proxy Guru — HELO Ingest, arut Relay, Kubernetes TCP

## Summary

Ringdom-style self-hosted Kubernetes favors explicit TCP services for live RTMP: the arut nginx-rtmp-module implements ingest and relay in rtmp {} with application blocks where live on enables publishing, push forwards to one or more RTMP upstream URLs (multi-CDN restream), and pull ingests remote RTMP for local fan-out or HLS packaging. AJA HELO family devices publish RTMP using server URL, stream name/key, optional credentials, default TCP 1935, and configurable handshake modes when CDNs are picky about URL vs stream key composition. Standard Ingress controllers are the wrong abstraction for RTMP; use LoadBalancer/NodePort/hostNetwork or Gateway TCP routes, and treat multi-replica nginx-rtmp as a stateful edge unless an external coordinator fixes subscriber/publisher affinity. Combine with Ring k3s patterns from devops_k8s_guru (node networking, PDBs, observability) but never conflate HTTP Gateway Fabric guidance with RTMP path setup.

## When to use

- AJA HELO or similar appliance RTMP push to self-hosted ingest
- nginx-rtmp-module push pull relay restream configuration
- RTMP port 1935 on Kubernetes Service LoadBalancer or NodePort
- scaling nginx-rtmp behind Kubernetes without splitting publisher and viewers
- RTMPS or TLS in front of nginx-rtmp termination patterns
- HLS generation from nginx-rtmp with static pull
- troubleshooting RTMP handshake or stream key URL parsing with CDNs

## Instructions

1. Pattern: map encoder RTMP URL → Kubernetes TCP exposure → nginx rtmp server listen 1935 → application live { live on; } → validate on_publish before relay → push rtmp://cdn/app/key per destination.
2. Pattern: for multi-replica risk, default to one active RTMP edge per stream key namespace; add external routing (DNS to pod IP, Consul, or MetalLB pinned IP) before horizontally scaling stateless RTMP without shared storage.
3. Pattern: validate with ffmpeg/ffplay from inside cluster: rtmp://svc.ns.svc.cluster.local:1935/live/stream and from internet via LB IP; correlate nginx error.log with HELO handshake mode changes.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://devops_nginx_rtmp_restreaming_proxy_guru`).
