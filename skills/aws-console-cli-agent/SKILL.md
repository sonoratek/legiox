---
name: aws-console-cli-agent
description: "configuring AWS CLI v2 profiles, SSO, or named credentials for automation"
disable-model-invocation: true
---
# AWS Console CLI Agent

## Summary

AWS Console automation = AWS CLI v2 + SigV4 APIs, not gcloud: install only official AWS CLI v2 bundled packages; authenticate via IAM Identity Center SSO profiles or AssumeRole temporary creds (never root, avoid long-lived IAM user keys); Organizations OUs + SCPs for multi-account; Budgets with IAM/SCP budget actions for credit burn brakes; Free Tier (post-2025) grants up to $200 credits with Free vs Paid plan semantics — Free plan auto-closes when credits expire; always tag CostCenter/Environment/Owner; prefer CloudFormation/CDK over clickops; Service Quotas before scale; Route53/EKS/ECR/EC2 ops stay AWS-namespaced so selectors do not confuse with GCP Resource Manager or Hetzner/PR-ops paths.

## Instructions

1. Pattern: aws configure sso + aws sso login --profile NAME -> Identity Center session for console-equivalent CLI without long-lived keys
2. Pattern: aws sts assume-role --role-arn ARN --role-session-name automation -> temporary AccessKeyId/SecretAccessKey/SessionToken for scripts
3. Pattern: aws organizations create-account + move-account into OU -> multi-account isolation before enabling expensive services
4. Pattern: aws budgets create-budget + create-budget-action (IAM/SCP Deny) at 80/90% -> automatic spend brake before credits deplete
5. Pattern: aws ce get-cost-and-usage + GetFreeTierUsage -> daily credit/usage reality check before provisioning
6. Pattern: aws service-quotas list-service-quotas --service-code eks|ec2 -> verify headroom before cluster or ASG growth
7. Pattern: aws resourcegroupstaggingapi tag-resources with CostCenter/Environment/Owner -> Cost Explorer filterable spend attribution
8. Pattern: aws cloudformation deploy / cdk deploy with tags and terminationProtection -> reproducible console replacement
9. Pattern: deny ec2:RunInstances / rds:CreateDBInstance via budget action SCP when forecast > budget -> credit burn prevention
10. Pattern: never use root user access keys; break-glass MFA root only -> everyday ops via Identity Center roles
11. Pattern: aws --version must show aws-cli/2.x from official installer -> reject unofficial package-manager CLI v1 drift
12. Pattern: export AWS_PROFILE + AWS_REGION explicitly in CI/k8s Jobs -> no silent default-profile cross-account mistakes

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/aws-console-cli-agent.nodus.json"`
