---
name: aws-eks-specialist
description: "Amazon EKS cluster mode choice (standard vs Auto Mode)"
disable-model-invocation: true
---
# AWS EKS Specialist

## Summary

Ringdom default is k3s on owned mesh (kctl mesh-first); treat EKS as credit-funded experiment or hybrid — never silent production migration. Prefer EKS Pod Identity over IRSA when EKS-only; keep IRSA for multi-distro/OIDC portability. Choose EKS standard + managed nodes/Karpenter when you need AMI/SSH/compliance control; choose Auto Mode when you accept Bottlerocket managed instances, no SSH/SSM, ~12% Auto Mode surcharge on EC2 On-Demand, and AWS-managed core add-ons. Fargate is per-pod vCPU/memory billing with DaemonSet/privileged limits — not a drop-in for node DaemonSets. Budget: $0.10/cluster/hr standard support (~$73/mo idle control plane) vs $0.60/hr extended; never leave clusters on expired versions. VPC CNI consumes real subnet IPs — plan prefix delegation before scale. Destroy or scale-to-zero labs nightly on credits; keep Ring apps on k3s unless a measured AWS dependency requires EKS.

## Instructions

1. Pattern: Prefer Ringdom k3s for Ring clone production -> expected outcome: zero EKS cluster fee and mesh-native ops on kctl.
2. Pattern: Create EKS only with budget alarm + destroy tag -> expected outcome: credits protected from forgotten control planes (~$73/mo each at $0.10/hr).
3. Pattern: Choose Auto Mode for greenfield managed data plane -> expected outcome: AWS-managed nodes/add-ons; accept Bottlerocket, no SSH, Auto Mode surcharge.
4. Pattern: Choose standard + managed node groups when AMI/SSH required -> expected outcome: operator-controlled patching and compliance access.
5. Pattern: Prefer EKS Pod Identity over IRSA on EKS-only clusters -> expected outcome: no per-cluster OIDC provider; reusable trust to pods.eks.amazonaws.com.
6. Pattern: Use IRSA when portability to EKS Anywhere/self-managed is required -> expected outcome: OIDC federation works across Kubernetes on AWS variants.
7. Pattern: Prefer managed nodes/Auto Mode over Fargate for DaemonSet-heavy stacks -> expected outcome: DaemonSets and privileged CNI agents schedule correctly.
8. Pattern: Enable VPC CNI prefix delegation before pod density crisis -> expected outcome: higher pods/node without premature /24 IP exhaustion.
9. Pattern: Set upgradePolicy supportType STANDARD and upgrade before EOL -> expected outcome: avoid silent jump to $0.60/hr extended support.
10. Pattern: Scale lab node groups to zero or delete cluster after experiment -> expected outcome: stop EC2/Auto Mode/Fargate burn; keep only intentional spend.
11. Pattern: Never put long-lived Ring production secrets only in EKS IRSA roles without k3s parity plan -> expected outcome: no single-cloud lock for empire rings.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/aws-eks-specialist.nodus.json"`
