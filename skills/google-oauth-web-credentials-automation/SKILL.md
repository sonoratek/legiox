---
name: google-oauth-web-credentials-automation
description: "setting up or automating Sign in with Google for a web application using Auth.js or NextAuth"
disable-model-invocation: true
---
# Google OAuth Web Credentials Automation

## Summary

Creating a Web application OAuth client (.apps.googleusercontent.com) under Google Auth Platform has no supported GA REST API or gcloud command as of April 2026 — manual console creation is the only officially supported path. The google_iap_client Terraform resource is permanently defunct (March 2026), and google_iam_oauth_client manages Workforce Identity Federation clients with UUID-format IDs that are incompatible with Auth.js GoogleProvider and GIS One Tap. The recommended operational strategy is: create the client once manually, immediately store the GOCSPX- secret in Secret Manager, and automate everything downstream (secret rotation, env injection, consent screen scope updates via console). Firebase / Identity Platform offers a programmatic IdP-config API as an alternative architecture if the team is open to that dependency.

## Instructions

1. Pattern: map requirement -> consult_when hit for google_oauth_web_credentials_automation -> apply truth_lens constraints before code.
2. Pattern: validate external API/env assumptions against this lens before merge or deploy.

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/google-oauth-web-credentials-automation.nodus.json"`
