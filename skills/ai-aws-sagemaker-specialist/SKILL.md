---
name: ai-aws-sagemaker-specialist
description: "SageMaker AI Studio notebooks JupyterLab Code Editor idle shutdown"
disable-model-invocation: true
---
# AI AWS SageMaker Specialist

## Summary

Amazon SageMaker AI (renamed 2024-12-03 from SageMaker; sagemaker API/CLI/IAM/CFN namespaces unchanged) is the managed build-train-deploy surface for custom ML and open/custom FMs: Studio/JupyterLab notebooks, Training jobs (built-in, script mode, BYOC, JumpStart, HyperPod), and inference (realtime, serverless, async, batch). Next-gen Amazon SageMaker (unified platform) also folds Lakehouse, governance, Unified Studio, and Bedrock access—do not confuse platform brand with SageMaker AI service APIs. Choose Bedrock for serverless FM APIs, Knowledge Bases, Guardrails, AgentCore; choose SageMaker AI for container-level control, classical/predictive ML, custom training, instance-level latency/throughput/cost tradeoffs, or train-then-import-to-Bedrock patterns. Hard anti-patterns: forgotten realtime endpoints (bill 24/7), Studio apps without idle shutdown, Spot without checkpoints, defaulting whole stack to instances because one classifier needs an endpoint. Ringdom: complement Bedrock when credits allow; consult ai-aws-bedrock-specialist and aws-cost-budgets-specialist.

## Instructions

1. Pattern: GenAI chat/RAG/agents with managed FMs -> Bedrock APIs first; escalate to SageMaker AI only for custom train/host control
2. Pattern: Need container pins, VPC-only weights, or classical ML -> SageMaker AI training + dedicated or serverless endpoint
3. Pattern: Train/fine-tune on SageMaker then serverless serve -> export/import to Bedrock Custom Model Import when supported
4. Pattern: Spiky or idle inference -> Serverless Inference (scale to zero) or async/batch; avoid always-on realtime
5. Pattern: Studio cost control -> enable AppLifecycleManagement IdleSettings on JupyterLab and Code Editor (SMD ≥2.0)
6. Pattern: Interruptible training -> use_spot_instances=True + checkpoint_s3_uri; expect stop/resume
7. Pattern: Reproducible MLOps -> Pipelines Processing→Training→Eval→Condition→RegisterModel with step caching and retry
8. Pattern: Orphan cost hunt -> list InService endpoints and running Studio apps; delete/stop; budget alert via Cost Explorer
9. Pattern: Large resilient FM training -> HyperPod (EKS/Slurm) instead of single Training job
10. Pattern: Low-code first model -> Canvas or JumpStart; graduate to script mode/BYOC when flexibility required
11. Pattern: Mixed stack -> Bedrock for primary LLM + small SageMaker endpoint for custom classifier; do not instance-default everything
12. Pattern: Ringdom credits gate -> confirm budget with aws-cost-budgets-specialist before creating domains/endpoints

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ai-aws-sagemaker-specialist.nodus.json"`
