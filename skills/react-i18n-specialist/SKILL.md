---
name: react-i18n-specialist
description: i18n implementation. next-intl configuration. Server vs Client translation patterns. ICU MessageFormat. LegioX truth lens skill.
---

# React i18n Guru

## Summary

React 19 + next-intl i18n architecture: Server Components use getTranslations() (async), Client Components use useTranslations() (sync). Message keys follow namespace.section.key pattern. ICU MessageFormat for plurals, dates, numbers.

## When to use

- i18n implementation
- next-intl configuration
- Server vs Client translation patterns
- ICU MessageFormat
- namespace organization

## Instructions

1. Server: const t = await getTranslations('namespace')
2. Client: const t = useTranslations('namespace')
3. Keys: namespace.section.key (e.g., common.buttons.save)
4. ICU: {count, plural, one {# item} other {# items}}

## MCP

Premium: use `legiox-agent-selector` with task terms, or pick this lens from the **@** menu (MCP resource `legiox-lens://react_i18n_specialist`).
