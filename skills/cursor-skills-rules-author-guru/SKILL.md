---
name: cursor-skills-rules-author-guru
description: "translate a nodus lens into SKILL.md"
disable-model-invocation: true
---
# Cursor Skills and Rules Author Guru

## Summary

A Cursor skill is skills/<kebab>/SKILL.md. name is lowercase letters, numbers, and hyphens and must match the parent folder. description says what the skill does and when to use it; the agent uses it for relevance. Invoke with /skill-name for one message, or pin it as a Custom Mode. disable-model-invocation true keeps it slash-only. paths scopes the skill to globs; nested .cursor/skills folders are scoped to that directory without paths. Plugin rules need a description; alwaysApply true includes them always; globs attach them to files; description without globs lets the agent decide; neither means manual @-mention. Customize shows rules as Always, Agent Decides, or Manual. Do not paste a full nodus file into SKILL.md. nodusToSkillMd puts the first consult_when line in description, key_patterns into numbered instructions, and truth_lens into the summary. It does not repeat consult_when in the body. Every corpus skill and every library skill except legiox-agent-selector-workflow sets disable-model-invocation true, so only the router description sits in the prompt. Deeper nodus fields are read with jq from the MCP bundle. Free is the 10 library skills plus 137 corpus skills (147). Pro includes those 147 and other corpus skills for 369 SKILL.md files. Do not invent a skill that has no corpus file and is not one of the 10 library skills. Skills are not imported from GitHub by themselves; they arrive inside a plugin.

## Instructions

1. Pattern: skills/<folder>/SKILL.md name equals <folder> and description states when to use it
2. Pattern: first consult_when line -> description; key_patterns -> numbered Instructions; truth_lens -> Summary; do not repeat consult_when in the body
3. Pattern: disable-model-invocation true on every skill except legiox-agent-selector-workflow
4. Pattern: full nodus.json stays in the MCP bundle for legiox-agent-selector
5. Pattern: paths globs for file-scoped skills; disable-model-invocation true for slash-only skills
6. Pattern: plugin rules may be .md .mdc or .markdown; project rules in .cursor/rules must be .mdc
7. Pattern: free count is 10 library skills plus 137 corpus skills
8. Pattern: pro count is 369 SKILL.md files and includes every free skill
9. Pattern: do not pad the catalog with skills that are not in the corpus

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/cursor-skills-rules-author-guru.nodus.json"`
