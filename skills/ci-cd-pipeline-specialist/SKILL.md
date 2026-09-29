---
name: ci-cd-pipeline-specialist
description: CI/CD for new project. pipeline performance. Erlang hot code loading deploy. mobile store deployment. LegioX truth lens skill.
---

# Ringdom CI/CD Pipeline Specialist

## Summary

Platform-specific pipelines: Ring (TS -> Next.js build -> Playwright -> Vercel), Connect (rebar3 -> EUnit/Dialyzer -> hot code loading), Mobile (Flutter/Gradle/Xcode -> store). <10min builds, >10 deploys/day target.

## When to use

- CI/CD for new project
- pipeline performance
- Erlang hot code loading deploy
- mobile store deployment
- DORA metrics

## Instructions

1. Ring: TypeScript -> jest -> Playwright -> Lighthouse CI -> Vercel
2. Connect: rebar3 -> EUnit + Dialyzer -> hot code loading with supervision validation
3. Progressive delivery: canary, blue-green, rolling + feature flags

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://ci_cd_pipeline_specialist`).
