---
name: cursor-skills-rules-author-guru
description: translate a nodus lens into SKILL.md. skill is not discovered or /skill-name fails. choose paths versus disable-model-invocation. write a plugin rule versus a project .mdc rule. LegioX truth lens skill.
---

# Cursor Skills and Rules Author Guru

## Summary

A Cursor skill is skills/<kebab>/SKILL.md. name is lowercase letters, numbers, and hyphens and must match the parent folder. description says what the skill does and when to use it; the agent uses it for relevance. Invoke with /skill-name for one message, or pin it as a Custom Mode. disable-model-invocation true keeps it slash-only. paths scopes the skill to globs; nested .cursor/skills folders are scoped to that directory without paths. Plugin rules need a description; alwaysApply true includes them always; globs attach them to files; description without globs lets the agent decide; neither means manual @-mention. Customize shows rules as Always, Agent Decides, or Manual. Do not paste a full nodus file into SKILL.md. nodusToSkillMd maps consult_when into description, key_patterns into numbered instructions, and truth_lens into the summary. Free is the 10 library skills plus 137 corpus skills (147). Pro includes those 147 and other corpus skills for 369 SKILL.md files. Do not invent a skill that has no corpus file and is not one of the 10 library skills. Skills are not imported from GitHub by themselves; they arrive inside a plugin.

## When to use

- translate a nodus lens into SKILL.md
- skill is not discovered or /skill-name fails
- choose paths versus disable-model-invocation
- write a plugin rule versus a project .mdc rule
- check free 147 or pro 369 skill counts
- decide whether nodus.json belongs in the skill folder

## Instructions

1. Pattern: skills/<folder>/SKILL.md name equals <folder> and description states when to use it
2. Pattern: consult_when -> description; key_patterns -> numbered Instructions; truth_lens -> Summary
3. Pattern: full nodus.json stays in the MCP bundle for legiox-agent-selector
4. Pattern: paths globs for file-scoped skills; disable-model-invocation true for slash-only skills
5. Pattern: plugin rules may be .md .mdc or .markdown; project rules in .cursor/rules must be .mdc
6. Pattern: free count is 10 library skills plus 137 corpus skills
7. Pattern: pro count is 369 SKILL.md files and includes every free skill
8. Pattern: do not pad the catalog with skills that are not in the corpus

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://cursor_skills_rules_author_guru`).
