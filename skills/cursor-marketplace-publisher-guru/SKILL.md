---
name: cursor-marketplace-publisher-guru
description: submit legiox-free to the public Cursor Marketplace. decide whether pro can be a public listing. team marketplace import and installation modes. marketplace listing rejected or waiting on review. LegioX truth lens skill.
---

# Cursor Marketplace Publisher Guru

## Summary

Public Cursor Marketplace plugins are Git repositories, manually reviewed, and must be open source. Submit the repository link at https://cursor.com/marketplace/publish. Questions go to marketplace-publishing@cursor.com. Every update is reviewed again. A multi-plugin repo is indexed from root .cursor-plugin/marketplace.json, so submitting legiox-cursor-plugins would publish every plugin listed there. Rewrite that file to legiox-free and legiox-pro before any submit, then submit only the free tree (https://github.com/sonoratek/legiox as a single-plugin repo root), not the paid corpus. Pro is a downloadable zip extracted into ~/.cursor/plugins/local/legiox-pro. Team marketplaces (Teams: one, Enterprise: unlimited) are managed at Dashboard -> Plugins & MCPs, not Settings -> Plugins. Import from GitHub, GitLab, Bitbucket, or Azure DevOps. Installation modes are Default Off, Default On, and Required. Admins can limit access with Organization Groups synced by SCIM. GitHub imports can Enable Auto Refresh (Cursor GitHub App, at most once every 10 minutes) and Serve marketplace from Cursor so teammates need no GitHub access. Default marketplace members can publish a personal skill from ~/.cursor/skills/ when Allow Members to Publish is on. Checklist: valid manifest, unique kebab-case name, description, frontmatter on every component, relative logo path, README, no secrets, variables schema for every ${VAR} in mcp.json, local test already done. Do not force-push. If submit needs Ray's browser session, record the URL and SHA and stop.

## When to use

- submit legiox-free to the public Cursor Marketplace
- decide whether pro can be a public listing
- team marketplace import and installation modes
- marketplace listing rejected or waiting on review
- auto-refresh or Serve marketplace from Cursor
- publish is blocked on browser login

## Instructions

1. Pattern: marketplace.json lists legiox-free and legiox-pro before any submit attempt
2. Pattern: public submit URL is the free repo only -> cursor.com/marketplace/publish
3. Pattern: pro zip installs by copy into ~/.cursor/plugins/local/legiox-pro
4. Pattern: logo assets/logo.svg committed and referenced by relative path
5. Pattern: Dashboard -> Plugins & MCPs -> Add Marketplace for a team marketplace
6. Pattern: Default Off, Default On, or Required per plugin after marketplace access is set
7. Pattern: Auto Refresh re-indexes at most every 10 minutes; new individually added plugins need a re-import
8. Pattern: stop and record SHA when the publish form needs a logged-in browser

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://cursor_marketplace_publisher_guru`).
