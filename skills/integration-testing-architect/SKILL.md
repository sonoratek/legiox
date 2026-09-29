---
name: integration-testing-architect
description: contract testing setup. API contract breaking changes. Auth.js/Web3 integration testing. Connect protocol validation. LegioX truth lens skill.
---

# Integration Testing Architect

## Summary

Consumer-driven contract testing with Pact (consumer defines, provider verifies, can-I-deploy). Ring-specific: Auth.js flow testing, Web3/Firebase mocking via MSW. Connect: ASN.1/BERT protocol testing. Testcontainers for real dependency isolation.

## When to use

- contract testing setup
- API contract breaking changes
- Auth.js/Web3 integration testing
- Connect protocol validation
- test environment orchestration

## Instructions

1. Pact: consumer contract -> provider verification -> can-I-deploy check
2. Ring: Server Action tests, Auth.js flows, MSW for external API mocking
3. Connect: ASN.1/BERT protocol, FastTransponder perf, distributed Erlang
4. Test data builders: new UserBuilder().withRole('admin').build()

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://integration_testing_architect`).
