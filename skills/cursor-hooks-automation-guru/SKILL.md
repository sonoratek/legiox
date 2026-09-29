---
name: cursor-hooks-automation-guru
description: add or repair hooks/hooks.json in a LegioX plugin. workspaceOpen should load a plugin path. block force-push or destructive shell from a hook. hook event name is rejected. LegioX truth lens skill.
---

# Cursor Hooks Automation Guru

## Summary

hooks/hooks.json maps event names to command arrays. Each entry may set command, matcher, and failClosed or other fields the hooks doc allows. Agent events: sessionStart, sessionEnd, preToolUse, postToolUse, postToolUseFailure, subagentStart, subagentStop, beforeShellExecution, afterShellExecution, beforeMCPExecution, afterMCPExecution, beforeReadFile, afterFileEdit, beforeSubmitPrompt, preCompact, stop, afterAgentResponse, afterAgentThought. Tab events: beforeTabFileRead, afterTabFileEdit. App event: workspaceOpen, which can return additional plugin paths. Script paths are relative to the plugin, typically ./scripts/. Use ${CURSOR_PLUGIN_ROOT} when a script must find plugin files. Both legiox-free and legiox-pro ship hooks (bootloader on workspaceOpen, plus guardrails). Do not ship a hooks file that only exists as a comment in a README. Never exfiltrate file contents. Matchers such as git push --force belong on beforeShellExecution. Create hooks with the built-in /create-hook skill when authoring new ones.

## When to use

- add or repair hooks/hooks.json in a LegioX plugin
- workspaceOpen should load a plugin path
- block force-push or destructive shell from a hook
- hook event name is rejected
- decide which hooks ship in free versus pro
- hook script needs the plugin root path

## Instructions

1. Pattern: hooks/hooks.json workspaceOpen -> bootloader script
2. Pattern: beforeShellExecution matcher on force-push and rm -rf
3. Pattern: afterFileEdit reminder when AI-CONTEXT implementations change
4. Pattern: beforeMCPExecution logs the tool name and does not copy file bodies
5. Pattern: workspaceOpen additionalPluginPaths when a workspace needs an extra local plugin
6. Pattern: script command ./scripts/<name>.sh relative to the plugin root
7. Pattern: free and pro both ship hooks; do not leave a commented example as the only hook
8. Pattern: /create-hook writes hooks.json for a new event

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://cursor_hooks_automation_guru`).
