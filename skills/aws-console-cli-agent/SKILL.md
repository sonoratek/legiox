---
name: aws-console-cli-agent
description: configuring AWS CLI v2 profiles, SSO, or named credentials for automation. creating AWS Organizations OUs, member accounts, or SCPs. setting up IAM Identity Center permission sets and account assignments. assuming IAM roles via STS for short-lived devops/k8s access. LegioX truth lens skill.
---

# AWS Console CLI Agent

## Summary

AWS Console automation = AWS CLI v2 + SigV4 APIs, not gcloud: install only official AWS CLI v2 bundled packages; authenticate via IAM Identity Center SSO profiles or AssumeRole temporary creds (never root, avoid long-lived IAM user keys); Organizations OUs + SCPs for multi-account; Budgets with IAM/SCP budget actions for credit burn brakes; Free Tier (post-2025) grants up to $200 credits with Free vs Paid plan semantics — Free plan auto-closes when credits expire; always tag CostCenter/Environment/Owner; prefer CloudFormation/CDK over clickops; Service Quotas before scale; Route53/EKS/ECR/EC2 ops stay AWS-namespaced so selectors do not confuse with GCP Resource Manager or Hetzner/PR-ops paths.

## When to use

- configuring AWS CLI v2 profiles, SSO, or named credentials for automation
- creating AWS Organizations OUs, member accounts, or SCPs
- setting up IAM Identity Center permission sets and account assignments
- assuming IAM roles via STS for short-lived devops/k8s access
- creating AWS Budgets, budget alerts, or budget actions that deny EC2/RDS spend
- protecting Free Tier or promotional AWS credits from burn
- checking Service Quotas before EKS/EC2 scale-out
- enforcing AWS resource tagging CostCenter Environment Owner
- bootstrapping CloudFormation stacks or AWS CDK apps for control-plane
- mapping AWS Management Console clicks to aws CLI commands
- diagnosing AccessDenied, ExpiredToken, or credential provider chain failures
- Ringdom credit-safe AWS account provisioning for devops kubernetes workloads

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

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://aws_console_cli_agent`).
