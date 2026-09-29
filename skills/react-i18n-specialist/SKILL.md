---
name: react-i18n-specialist
description: "i18n implementation"
disable-model-invocation: true
---
# React i18n Guru

## Summary

React 19 + next-intl i18n architecture: Server Components use getTranslations() (async), Client Components use useTranslations() (sync). Message keys follow namespace.section.key pattern. ICU MessageFormat for plurals, dates, numbers.

## Instructions

1. Server: const t = await getTranslations('namespace')
2. Client: const t = useTranslations('namespace')
3. Keys: namespace.section.key (e.g., common.buttons.save)
4. ICU: {count, plural, one {# item} other {# items}}

## Deeper fields

`jq -r '.mission, .expertise, .keywords' "mcp/AI-LEGIOX/legiox-truth-lens/react_i18n_specialist.nodus.json"`
