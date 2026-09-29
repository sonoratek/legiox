---
name: aws-iam-guru
description: AWS IAM policy least privilege customer managed. IAM Identity Center permission set SSO federation. STS AssumeRole temporary credentials OIDC CI/CD. Amazon Bedrock InvokeModel Converse IAM actions. LegioX truth lens skill.
---

# AWS IAM Guru

## Summary

AWS authorization = evaluate identity-based policies, resource-based policies, SCPs, RCPs, permissions boundaries, and session policies; explicit Deny wins; default Deny if no Allow. Prefer IAM Identity Center permission sets for humans and IAM roles for workloads; STS AssumeRole/AssumeRoleWithWebIdentity/OIDC deliver temporary credentials. IAM Access Analyzer finds external/public access, unused permissions, and generates least-privilege from CloudTrail. Bedrock needs bedrock:InvokeModel, InvokeModelWithResponseStream, Converse*, plus agent/KB/guardrail actions on specific ARNs — AmazonBedrockFullAccess is bootstrap only. Ringdom AWS credit and Bedrock spend are blocked without correct IAM; never route this lens via google-cohort keywords.

## When to use

- AWS IAM policy least privilege customer managed
- IAM Identity Center permission set SSO federation
- STS AssumeRole temporary credentials OIDC CI/CD
- Amazon Bedrock InvokeModel Converse IAM actions
- IAM Access Analyzer findings unused access policy generation
- root user MFA lockdown no access keys
- Organizations SCP RCP permissions guardrails
- permissions boundary delegated IAM admin
- AccessDenied evaluation logic CloudTrail whoami
- cross-account role trust ExternalId PrincipalOrgID
- IAM Roles Anywhere X.509 workload outside AWS
- devops AWS IAM Bedrock billing EC2 role design

## Instructions

1. Pattern: human access -> Identity Center users/groups mapped to permission sets per account (no IAM users)
2. Pattern: workload on EC2/Lambda/ECS/EKS -> instance/task/pod role delivers STS creds automatically
3. Pattern: CI/CD outside AWS -> OIDC provider + AssumeRoleWithWebIdentity with sub/aud conditions
4. Pattern: cross-account -> trust policy Principal account/role + ExternalId or aws:PrincipalOrgID
5. Pattern: least privilege bootstrap -> AWS managed job-function policy then Access Analyzer policy generation from CloudTrail
6. Pattern: org guardrail -> SCP denies bedrock:InvokeModel* on disallowed models; RCP limits resource exposure
7. Pattern: Bedrock invoke -> Allow bedrock:InvokeModel on arn:aws:bedrock:REGION::foundation-model/MODEL_ID and inference-profile ARNs
8. Pattern: Access Analyzer -> enable analyzer; remediate external findings; generate policy; validate with policy checks
9. Pattern: AccessDenied triage -> aws sts get-caller-identity + CloudTrail + simulate-principal-policy; check SCP then identity then resource
10. Pattern: root hygiene -> hardware MFA, delete root access keys, account recovery contacts, break-glass runbook only

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://aws_iam_guru`).
