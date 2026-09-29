---
name: integration-testing-architect
description: "contract testing setup"
disable-model-invocation: true
---
# Integration Testing Architect

## Summary

Consumer-driven contract testing with Pact (consumer defines, provider verifies, can-I-deploy). Ring-specific: Auth.js flow testing, Web3/Firebase mocking via MSW. Connect: ASN.1/BERT protocol testing. Testcontainers for real dependency isolation.

## Instructions

1. Pact: consumer contract -> provider verification -> can-I-deploy check
2. Ring: Server Action tests, Auth.js flows, MSW for external API mocking
3. Connect: ASN.1/BERT protocol, FastTransponder perf, distributed Erlang
4. Test data builders: new UserBuilder().withRole('admin').build()

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/integration-testing-architect.nodus.json"`
