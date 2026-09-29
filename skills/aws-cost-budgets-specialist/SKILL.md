---
name: aws-cost-budgets-specialist
description: AWS Budgets setup for cost or usage ceilings. Free Tier or promotional credit burn tracking ($100+$100). Bedrock token spend spike or runaway inference cost. Budget Actions IAM Deny or SCP kill-switch design. LegioX truth lens skill.
---

# AWS Cost Budgets Specialist

## Summary

Ringdom AWS FinOps truth: promotional and Free Tier credits ($100 on signup plus up to $100 for Explore AWS activities; Free plan ends at six months or credit exhaustion) disappear under Bedrock on-demand tokens, cache writes, and Priority tier latency premiums unless AWS Budgets track both ACTUAL and FORECASTED cost/usage with SNS+email. Budget Actions (APPLY_IAM_POLICY Deny on bedrock:Invoke*, ec2:RunInstances, etc.; org APPLY_SCP_POLICY from management account; RUN_SSM_DOCUMENTS to stop EC2/RDS) are the hard ceiling—alerts alone are insufficient. Cost Explorer UI is free; Cost Explorer API is $0.01/request; first enablement needs ~24h for current month. First two action-enabled budgets/account/month are free; extra action budgets cost $0.10/day; action-less budgets are free. Cost Anomaly Detection catches Bedrock spikes budgets miss between refresh windows. Always Free monthly allowances still apply after credits; short-term trials activate on first use. Tag every Ringdom experiment with cost allocation tags before launch; filter Cost Explorer by service=Amazon Bedrock and by tag. Pair with aws-console-cli-agent for CLI/IAM wiring and ai-aws-bedrock-specialist for model/tier choice—this lens owns spend caps, not model quality.

## When to use

- AWS Budgets setup for cost or usage ceilings
- Free Tier or promotional credit burn tracking ($100+$100)
- Bedrock token spend spike or runaway inference cost
- Budget Actions IAM Deny or SCP kill-switch design
- Cost Explorer / CUR query for service or tag rollup
- Cost Anomaly Detection monitor for AWS account
- cost allocation tags for Ringdom AWS experiments
- emergency stop when credits nearly exhausted
- Savings Plans or RI utilization/coverage budgets
- forecast vs actual budget alert thresholds

## Instructions

1. Pattern: create monthly COST budget with fixed target at remaining credit runway -> alert at 50/80/90% ACTUAL and 80/100% FORECASTED before burn-through.
2. Pattern: attach Budget Action APPLY_IAM_POLICY Deny on bedrock:InvokeModel* + related inference APIs at 90% ACTUAL -> hard stop new inference without deleting data.
3. Pattern: create USAGE budget filtered to Amazon Bedrock (or specific usage types) -> catch token volume before dollar threshold if unit prices change.
4. Pattern: enable Cost Explorer once, wait ~24h, group by Service then filter Bedrock + group by tag:Project -> allocate experiment burn to owners.
5. Pattern: activate Free Tier credit page + Budgets excluding/including credits intentionally -> know whether alert tracks cash or credit-adjusted spend.
6. Pattern: Cost Anomaly Detection monitor on linked account / service Bedrock with SNS -> catch intra-day spikes Budgets lag cannot see.
7. Pattern: require ActivateCostAllocationTags for Environment, Project, Owner, Workload -> reject untagged creates via IAM Condition aws:RequestTag.
8. Pattern: org management account APPLY_SCP_POLICY Deny expensive services on member experiment OU at threshold -> blast-radius fence for clones.
9. Pattern: prefer Bedrock Flex/Batch and prompt cache reads over Priority tier for non-latency work -> extend credit runway without code rewrite.
10. Pattern: emergency kill: attach Deny policy + stop SSM on EC2/RDS + disable model access in Bedrock console/CLI -> document revert path before auto-approve.
11. Pattern: first two action-enabled budgets free; keep kill-switch budgets action-enabled and analytics budgets action-less -> control Budgets line-item cost.
12. Pattern: reconcile CUR 2.0 Bedrock lines for input/output/cache-read/cache-write -> avoid undercount when prompt caching is on.

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://aws_cost_budgets_specialist`).
