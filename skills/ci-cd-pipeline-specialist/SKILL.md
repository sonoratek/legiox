---
name: ci-cd-pipeline-specialist
description: "CI/CD for new project"
disable-model-invocation: true
---
# Ringdom CI/CD Pipeline Specialist

## Summary

Platform-specific pipelines: Ring (TS -> Next.js build -> Playwright -> Vercel), Connect (rebar3 -> EUnit/Dialyzer -> hot code loading), Mobile (Flutter/Gradle/Xcode -> store). <10min builds, >10 deploys/day target.

## Instructions

1. Ring: TypeScript -> jest -> Playwright -> Lighthouse CI -> Vercel
2. Connect: rebar3 -> EUnit + Dialyzer -> hot code loading with supervision validation
3. Progressive delivery: canary, blue-green, rolling + feature flags

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/ci-cd-pipeline-specialist.nodus.json"`
