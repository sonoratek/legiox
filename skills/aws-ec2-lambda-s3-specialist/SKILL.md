---
name: aws-ec2-lambda-s3-specialist
description: "launching or terminating Amazon EC2 instances under promotional credits"
disable-model-invocation: true
---
# AWS EC2 Lambda S3 Specialist

## Summary

Ringdom AWS triad truth: EC2 bills while running (per-second, 1-minute minimum) and EBS/EIP keep billing after stop — terminate-after-use is mandatory for credit survival. Prefer Always Free Lambda (1M requests + 400K GB-seconds/month) and S3 Standard within Always Free (commonly cited ~5 GB + 20K GET + 2K PUT/month; verify live Free Tier page) before burning Free-plan credits (up to $200 / 6 months). Lambda Functions = event-driven ≤15 min; Lambda MicroVMs = developer-controlled sessions ≤8 h with suspend/resume state — do not confuse them. S3 buckets are private by default; leave Block Public Access enabled. Top credit burns: forgotten EC2, orphan EBS, unattached EIP, NAT Gateway, provisioned concurrency, Glacier early-delete fees, and public-bucket incident response. Pair with aws-console-cli-agent for auth/profile and aws-cost-budgets-specialist for spend guards; prefer Hetzner for cheap always-on VMs when AWS credits are not required.

## Instructions

1. Pattern: launch EC2 for a lab -> set DeleteOnTermination=true on root, tag Owner/Expires, run work, terminate immediately -> zero idle compute burn.
2. Pattern: stop EC2 thinking it is free -> still pay EBS (+ possibly EIP) -> terminate + delete volumes/release EIP for true stop of spend.
3. Pattern: event API or S3/SQS trigger under Always Free caps -> Lambda Function (not EC2) -> stay inside 1M req + 400K GB-s without credit burn.
4. Pattern: need per-user isolated long session with state -> Lambda MicroVM suspend/resume (≤8 h) -> avoid leaving MicroVM running; terminate when idle policy insufficient.
5. Pattern: unknown access pattern object store -> S3 Intelligent-Tiering (or Standard + lifecycle) -> automatic tiering without retrieval-fee surprises on Standard path.
6. Pattern: create S3 bucket -> leave Block Public Access all-on + bucket owner enforced -> no accidental public objects.
7. Pattern: finish EC2 session -> aws ec2 terminate-instances + describe-volumes filter available + delete-volume + release-address -> no orphan billables.
8. Pattern: archive rarely read data -> Glacier Instant/Flexible/Deep with awareness of 90/180-day minimums -> avoid early-delete prorated charges.
9. Pattern: open SSH/RDP to 0.0.0.0/0 -> replace with SG sourced from operator IP or SSM Session Manager -> reduced blast radius and audit trail.
10. Pattern: Free-plan credit clock ticking -> prefer Always Free Lambda/S3/CloudFront path; avoid NAT Gateway and idle ALB -> credits last for intentional experiments.
11. Pattern: always-on Ring clone VM without AWS dependency -> prefer Hetzner (devops-hetzner-api-specialist) over EC2 -> preserve AWS credits for managed-service trials.
12. Pattern: before upsizing instance or enabling provisioned concurrency -> check Budgets/Cost Explorer with aws-cost-budgets-specialist -> prevent silent multiplier burns.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/aws-ec2-lambda-s3-specialist.nodus.json"`
