/**
 * LegioX NODUS truth-lens creation workflow.
 * Phase 1: build extended generator prompt for web-research agents.
 * Phase 2 (finalize): validate and write *.nodus.json to legiox-truth-lens.
 */
const fs = require('node:fs');
const path = require('node:path');

const MAX_URLS = 12;
const MAX_URL_BYTES = 140000;
const FETCH_TIMEOUT_MS = 20000;
const GENERATOR_PROMPT_MAX_INLINE = 24000;

const NODUS_REQUIRED_KEYS = [
  'schema_version',
  'agent_type',
  'name',
  'mission',
  'truth_lens',
  'consult_when',
  'key_patterns',
  'expertise',
  'keywords',
  'priority',
  'status'
];

const MISSION_REQUIRED_KEYS = ['primary_objective', 'context', 'target_outcome', 'scope'];

function slugifyKebab(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 64) || 'domain';
}

function stemToSnakeCase(stem) {
  return String(stem || '')
    .trim()
    .toLowerCase()
    .replace(/\.nodus\.json$/i, '')
    .replace(/-/g, '_')
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function titleCaseFromStem(stem) {
  return String(stem || '')
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function truncateText(text, maxLen) {
  const value = String(text || '');
  if (value.length <= maxLen) {
    return value;
  }
  return `${value.slice(0, maxLen)}\n\n[... truncated ${value.length - maxLen} chars ...]`;
}

function htmlToPlainText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchUrlContent(url) {
  const normalized = String(url || '').trim();
  if (!normalized) {
    return { url: normalized, ok: false, error: 'empty_url' };
  }

  let parsed;
  try {
    parsed = new URL(normalized);
  } catch {
    return { url: normalized, ok: false, error: 'invalid_url' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { url: normalized, ok: false, error: 'unsupported_protocol' };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LegioX-NODUS-Creator/1.0 (Ringdom; +https://ringdom.org)',
        Accept: 'text/html,application/xhtml+xml,text/plain,application/json;q=0.9,*/*;q=0.8'
      },
      redirect: 'follow'
    });

    const contentType = String(response.headers.get('content-type') || '').toLowerCase();
    const raw = await response.text();
    const isHtml = contentType.includes('html') || /<html[\s>]/i.test(raw.slice(0, 400));
    const body = isHtml ? htmlToPlainText(raw) : raw;
    const content = truncateText(body, MAX_URL_BYTES);

    return {
      url: normalized,
      ok: response.ok,
      status: response.status,
      content_type: contentType || 'unknown',
      title: isHtml ? (raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || '').trim() : '',
      content,
      bytes: Buffer.byteLength(content, 'utf8')
    };
  } catch (error) {
    return {
      url: normalized,
      ok: false,
      error: error?.name === 'AbortError' ? 'timeout' : (error?.message || 'fetch_failed')
    };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDocumentationUrls(urls) {
  const list = Array.isArray(urls) ? urls.map((item) => String(item || '').trim()).filter(Boolean) : [];
  const limited = list.slice(0, MAX_URLS);
  const results = [];

  for (const url of limited) {
    // Sequential to avoid hammering remote hosts from MCP process
    results.push(await fetchUrlContent(url));
  }

  return {
    requested: list.length,
    fetched: results.length,
    sources: results
  };
}

function loadTopicCohorts(cohortsPath) {
  try {
    const raw = fs.readFileSync(cohortsPath, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed.topic_cohorts && typeof parsed.topic_cohorts === 'object' ? parsed.topic_cohorts : {};
  } catch {
    return {};
  }
}

function selectTopicCohort({ corpusText, cohortHint, cohortsPath }) {
  const topicCohorts = loadTopicCohorts(cohortsPath);
  const hint = String(cohortHint || '').trim().toLowerCase();

  if (hint && topicCohorts[hint]) {
    const cohort = topicCohorts[hint];
    return {
      cohort_id: hint,
      name: cohort.name,
      description: cohort.description,
      path: cohort.path,
      score: 999,
      reason: 'cohort_hint'
    };
  }

  const haystack = String(corpusText || '').toLowerCase();
  let best = null;

  for (const [cohortId, cohort] of Object.entries(topicCohorts)) {
    const keywords = Array.isArray(cohort.keywords) ? cohort.keywords : [];
    let score = 0;
    const matched = [];

    for (const keyword of keywords) {
      const token = String(keyword || '').trim().toLowerCase();
      if (!token) {
        continue;
      }
      if (haystack.includes(token)) {
        score += Math.max(1, Math.min(6, token.split(/\s+/).length));
        matched.push(token);
      }
    }

    if (cohortId.length > 1 && haystack.includes(cohortId)) {
      score += 3;
      matched.push(cohortId);
    }

    if (!best || score > best.score) {
      best = {
        cohort_id: cohortId,
        name: cohort.name,
        description: cohort.description,
        path: cohort.path,
        score,
        matched_keywords: matched.slice(0, 12),
        reason: score > 0 ? 'keyword_match' : 'default_fallback'
      };
    }
  }

  if (best && best.score > 0) {
    return best;
  }

  const fallbackId = 'business';
  const fallback = topicCohorts[fallbackId];
  return {
    cohort_id: fallbackId,
    name: fallback?.name || 'Business, Growth & Strategy',
    description: fallback?.description || '',
    path: fallback?.path || 'AI-LEGIOX/cohorts/business-cohort.json',
    score: 0,
    matched_keywords: [],
    reason: 'default_fallback'
  };
}

function resolveNodusIdentity(args) {
  const subjectArea = slugifyKebab(args.subject_area);
  const subject = slugifyKebab(args.subject);
  const className = slugifyKebab(args.class || args.agent_class || args.role_class);

  if (subjectArea && subject && className) {
    const stem = `${subjectArea}-${subject}-${className}`;
    return {
      stem,
      fileName: `${stem}.nodus.json`,
      agent_type: stemToSnakeCase(stem),
      displayName: titleCaseFromStem(stem),
      subject_area: subjectArea,
      subject,
      class: className
    };
  }

  const summary = String(args.subject_summary || args.subject || args.task_description || '').trim();
  if (!summary) {
    throw new Error(
      'Provide subject_area + subject + class, or subject_summary (or task_description) to name the NODUS file'
    );
  }

  const tokens = summary
    .toLowerCase()
    .match(/[a-z0-9]+/g)
    ?.filter((token) => token.length > 2)
    .slice(0, 6) || ['domain', 'specialist'];

  const stem = tokens.length >= 3
    ? `${tokens[0]}-${tokens[1]}-${tokens[2]}`
    : `${tokens[0] || 'domain'}-${tokens[1] || 'specialist'}`;

  const normalizedStem = slugifyKebab(stem);
  return {
    stem: normalizedStem,
    fileName: `${normalizedStem}.nodus.json`,
    agent_type: stemToSnakeCase(normalizedStem),
    displayName: titleCaseFromStem(normalizedStem),
    subject_area: tokens[0] || 'domain',
    subject: tokens[1] || 'general',
    class: tokens[2] || 'specialist',
    derived_from_summary: true
  };
}

function defaultDeepKnowledgeSections(identity, subjectSummary) {
  const base = identity.stem.replace(/-/g, '_');
  return [
    `${base}_operational_playbook`,
    `${base}_reference_architecture`,
    `${base}_implementation_patterns`,
    `${base}_tooling_and_api_map`,
    `${base}_quality_and_validation`,
    `${base}_risk_and_antipatterns`,
    `${base}_ringdom_integration_notes`,
    `${base}_research_sources_and_citations`
  ];
}

function formatSourcesBlock(fetchResult) {
  if (!fetchResult?.sources?.length) {
    return '_No documentation URLs fetched — rely on web research tasks below._\n';
  }

  return fetchResult.sources.map((source, index) => {
    if (!source.ok) {
      return `### Source ${index + 1}: ${source.url}\n- Fetch failed: ${source.error || source.status}\n`;
    }
    const titleLine = source.title ? `- Title: ${source.title}\n` : '';
    return [
      `### Source ${index + 1}: ${source.url}`,
      `- HTTP: ${source.status}`,
      `- Content-Type: ${source.content_type}`,
      titleLine,
      '',
      '```text',
      truncateText(source.content, 6000),
      '```',
      ''
    ].join('\n');
  }).join('\n');
}

function buildGeneratorPromptMarkdown(options) {
  const {
    identity,
    subjectSummary,
    ringdomContext,
    upstreamAgents,
    deepSections,
    cohort,
    fetchResult,
    subjectData,
    schemaMd,
    today
  } = options;

  const upstreamBlock = Array.isArray(upstreamAgents) && upstreamAgents.length > 0
    ? upstreamAgents.map((item) => `- \`${item}\``).join('\n')
    : '- _None specified — document upstream/downstream contracts if applicable._';

  const sectionsList = deepSections
    .map((section, index) => `${index + 1}. \`${section}\``)
    .join('\n');

  const subjectBlob = subjectData
    ? truncateText(subjectData, 12000)
    : '_No inline subject_data blob provided._';

  return [
    `You are NODUS-research-agent. Your mission is to research **${identity.displayName}** (${identity.subject_area} / ${identity.subject} / ${identity.class}) using current authoritative sources (web, docs, standards) and compose a complete \`${identity.fileName}\` truth lens file for the LegioX Commander system.`,
    '',
    '---',
    '',
    '## CONTEXT: WHAT IS A NODUS TRUTH LENS',
    '',
    'A LegioX truth lens is a structured JSON agent file stored at:',
    `  AI-LEGIOX/legiox-truth-lens/${identity.fileName}`,
    '',
    'It MUST be a single JSON object (not array) and comply with:',
    '  AI-LEGIOX/legiox-truth-lens/AGENT-NODUS-SCHEMA.md',
    '  AI-LEGIOX/legiox-truth-lens/agent-schema.json',
    '',
    '### Required top-level keys (all must be present)',
    ...NODUS_REQUIRED_KEYS.map((key) => `  - "${key}"`),
  '',
    '### Mission object (exactly four string keys)',
    ...MISSION_REQUIRED_KEYS.map((key) => `  - mission.${key}`),
    '',
    '### Recommended extended fields (match production truth lenses)',
    '  - "agent_name" (same as name)',
    '  - "role"',
    '  - "core_expertise" (comma-separated)',
    '  - "key_capabilities" (array of snake_case strings)',
    '  - "version" (semver)',
    '  - "created" / "updated" (YYYY-MM-DD)',
    '  - "priority_level"',
    '  - "core_principles" (array)',
    '',
    'Domain knowledge MUST be full top-level objects (2–3 levels deep), not string references.',
    '',
    '---',
    '',
    '## COHORT ASSIGNMENT',
    '',
    `- **Selected topic cohort:** \`${cohort.cohort_id}\` — ${cohort.name}`,
    `- Manifest path: \`${cohort.path || `AI-LEGIOX/cohorts/${cohort.cohort_id}-cohort.json`}\``,
    `- Description: ${cohort.description || 'n/a'}`,
    `- Selection reason: ${cohort.reason}`,
    cohort.matched_keywords?.length ? `- Matched keywords: ${cohort.matched_keywords.join(', ')}` : '',
    '',
    'After the JSON is written, register membership in the cohort manifest `members[]` if not already present.',
    '',
    '---',
    '',
    '## SUBJECT IDENTITY',
    '',
    `- subject_area: \`${identity.subject_area}\``,
    `- subject: \`${identity.subject}\``,
    `- class: \`${identity.class}\``,
    `- agent_type: \`${identity.agent_type}\``,
    `- filename: \`${identity.fileName}\``,
    '',
    '### Subject summary (operator intent)',
    '',
    subjectSummary || '_Derive from documentation and research tasks._',
    '',
    '### Inline subject_data blob',
    '',
    '```text',
    subjectBlob,
    '```',
    '',
    '---',
    '',
    '## RINGDOM / LEGIOX CONTEXT',
    '',
    ringdomContext || [
      '- Ringdom digital kingdom: Ring Platform (Next.js/React), ConnectPlatform (Erlang/OTP), LegioX truth lenses, AI-CONTEXT knowledge graph.',
      '- Commander uses jq/rg-first workflows; zero fabrication; verify APIs before claiming support.',
      '- Truth lenses power legiox-agent-selector routing — consult_when and keywords must be concrete trigger phrases.'
    ].join('\n'),
    '',
    '---',
    '',
    '## UPSTREAM / DOWNSTREAM AGENTS',
    '',
    upstreamBlock,
    '',
    '---',
    '',
    '## PRE-FETCHED DOCUMENTATION',
    '',
    formatSourcesBlock(fetchResult),
    '',
    '---',
    '',
    '## RESEARCH TASKS — SEARCH ALL OF THESE',
    '',
    '1. Current domain standards, official docs, and API surfaces (2025–2026 where applicable).',
    '2. Production patterns, failure modes, observability, and security boundaries.',
    '3. Tooling ecosystem: CLIs, SDKs, hosted vs self-hosted tradeoffs.',
    '4. Ringdom-relevant integration points (reuse existing platform stacks when applicable).',
    '5. Anti-patterns and policy/compliance risks specific to this domain.',
    '6. Measurable success metrics and validation checklists an agent can execute.',
    '',
    'Ground claims with specific URLs. Mark non-API or manual-only controls explicitly.',
    '',
    '---',
    '',
    '## OUTPUT: COMPOSE THE TRUTH LENS JSON',
    '',
    `Create: \`${identity.fileName}\``,
    '',
    'Include these deep knowledge sections as full top-level objects:',
    '',
    sectionsList,
    '',
    'Each section should be jq-friendly (snake_case keys, 2–3 levels) and operationally dense.',
    '',
    '---',
    '',
    '## QUALITY REQUIREMENTS',
    '',
    '- Valid JSON only: no comments, no trailing commas, root MUST be `{...}`.',
    '- `truth_lens` ≥ 80 characters; dense operational brief.',
    '- `consult_when` ≥ 3 items; `key_patterns` ≥ 2; `expertise` ≥ 1; `keywords` ≥ 3.',
    '- `key_patterns`: 8–12 heuristics in format "Pattern: action -> expected outcome".',
    '- `priority` ∈ high|medium|low|critical; `status` = active unless deprecated.',
    `- Dates: use ${today} for created/updated unless historical accuracy requires otherwise.`,
    '',
    '---',
    '',
    '## SCHEMA CONTRACT EXCERPT',
    '',
    '```markdown',
    truncateText(schemaMd, 8000),
    '```',
    '',
    '---',
    '',
    '## FINAL CHECK BEFORE OUTPUT',
    '',
    '- [ ] Root is a single object, not an array.',
    '- [ ] All 11 required keys present; mission has exactly four keys.',
    '- [ ] All deep knowledge sections exist as top-level objects.',
    '- [ ] agent_type aligns with filename stem in snake_case.',
    '- [ ] JSON validates against agent-schema.json intent.',
    `- [ ] Ready to write to AI-LEGIOX/legiox-truth-lens/${identity.fileName}`,
    '',
    'Output ONLY raw JSON. No markdown fences. No preamble. No explanation.',
    ''
  ].filter(Boolean).join('\n');
}

function parseNodusJsonInput(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value;
  }
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('finalize_nodus_json must be a JSON object or JSON string');
  }
  const trimmed = value.trim();
  try {
    return JSON.parse(trimmed);
  } catch (firstError) {
    const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) {
      return JSON.parse(fenceMatch[1].trim());
    }
    throw firstError;
  }
}

function ensureMissionContract(payload, identity) {
  if (!payload.mission || typeof payload.mission !== 'object' || Array.isArray(payload.mission)) {
    payload.mission = {};
  }
  const mission = payload.mission;
  const display = payload.name || identity.displayName;
  mission.primary_objective = mission.primary_objective || `Deliver expert ${display} guidance for LegioX Commander.`;
  mission.context = mission.context || `You are a ${display} truth lens in the LegioX NODUS network.`;
  mission.target_outcome = mission.target_outcome || `Commander executes ${identity.subject} work with zero schema drift and verified patterns.`;
  mission.scope = mission.scope || `${identity.subject_area} / ${identity.subject} domain practices aligned with Ringdom stacks.`;
  return payload;
}

function registerCohortMember({ cohortId, cohortsDir, identity, nodusRelativePath }) {
  const manifestPath = path.join(cohortsDir, `${cohortId}-cohort.json`);
  if (!fs.existsSync(manifestPath)) {
    return { status: 'skipped', reason: 'manifest_missing', manifest_path: manifestPath };
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  if (!Array.isArray(manifest.members)) {
    manifest.members = [];
  }

  const agentType = identity.agent_type;
  const already = manifest.members.some(
    (member) => member.agent_type === agentType || member.path?.endsWith(identity.fileName)
  );

  if (already) {
    return { status: 'unchanged', manifest_path: manifestPath };
  }

  manifest.members.push({
    path: nodusRelativePath,
    agent_type: agentType,
    name: identity.displayName,
    priority: 'high',
    status: 'active',
    match_reason: 'legiox-create-nodus'
  });
  manifest.member_count = manifest.members.length;
  manifest.updated = todayIsoDate();
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

  return {
    status: 'added',
    manifest_path: manifestPath,
    member_count: manifest.members.length
  };
}

async function runLegioxCreateNodus(deps, args = {}) {
  const {
    legioxRoot,
    truthLensRoot,
    generatorPromptsDir,
    cohortsPath,
    cohortsDir,
    agentIndexPath,
    rebuildTruthLensAgentIndex,
    validateTruthLensAgentRecord,
    readSafeJson
  } = deps;

  const schemaMdPath = path.join(legioxRoot, 'legiox-truth-lens', 'AGENT-NODUS-SCHEMA.md');
  const schemaMd = fs.existsSync(schemaMdPath) ? fs.readFileSync(schemaMdPath, 'utf8') : '';

  const identity = resolveNodusIdentity(args);
  const subjectSummary = String(
    args.subject_summary || args.task_description || args.subject_data || ''
  ).trim();

  const corpusText = [
    subjectSummary,
    args.subject_area,
    args.subject,
    args.class,
    args.context,
    args.ringdom_context,
    Array.isArray(args.keywords) ? args.keywords.join(' ') : ''
  ].filter(Boolean).join('\n');

  const cohort = selectTopicCohort({
    corpusText,
    cohortHint: args.cohort_hint || args.cohort,
    cohortsPath
  });

  const outputPath = path.join(truthLensRoot, identity.fileName);
  const promptStem = identity.stem;
  const promptFileName = `${promptStem}.promt.md`;
  const promptPath = path.join(generatorPromptsDir, promptFileName);
  const nodusRelativePath = `AI-LEGIOX/legiox-truth-lens/${identity.fileName}`;

  if (args.finalize_nodus_json !== undefined && args.finalize_nodus_json !== null) {
    const payload = ensureMissionContract(parseNodusJsonInput(args.finalize_nodus_json), identity);
    payload.schema_version = payload.schema_version || '2.0';
    payload.agent_type = payload.agent_type || identity.agent_type;
    payload.name = payload.name || identity.displayName;
    payload.status = payload.status || 'active';
    payload.priority = payload.priority || 'high';

    if (args.dry_run === true) {
      const indexData = readSafeJson(agentIndexPath) || {};
      const validation = validateTruthLensAgentRecord(
        outputPath,
        identity.agent_type,
        payload,
        {
          byId: indexData.by_id || {},
          byFile: {}
        },
        false,
        true
      );

      return {
        tool: 'legiox-create-nodus',
        phase: 'finalize',
        status: 'dry_run',
        nodus_output_path: outputPath,
        nodus_relative_path: nodusRelativePath,
        identity,
        cohort,
        validation,
        would_write: true
      };
    }

    fs.mkdirSync(truthLensRoot, { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

    const indexData = readSafeJson(agentIndexPath) || {};
    const validation = validateTruthLensAgentRecord(
      outputPath,
      identity.agent_type,
      payload,
      {
        byId: indexData.by_id || {},
        byFile: {}
      },
      true,
      true
    );

    let cohortRegistration = { status: 'skipped' };
    if (args.register_cohort_member !== false) {
      cohortRegistration = registerCohortMember({
        cohortId: cohort.cohort_id,
        cohortsDir,
        identity,
        nodusRelativePath
      });
    }

    let reindex = { status: 'skipped' };
    if (args.reindex_after_write !== false && typeof rebuildTruthLensAgentIndex === 'function') {
      reindex = await rebuildTruthLensAgentIndex({
        sourceRoot: truthLensRoot,
        dryRun: false,
        verbose: false,
        syncTopicCohorts: true
      });
    }

    return {
      tool: 'legiox-create-nodus',
      phase: 'finalize',
      status: validation.valid ? 'ok' : 'written_with_validation_warnings',
      nodus_output_path: outputPath,
      nodus_relative_path: nodusRelativePath,
      identity,
      cohort,
      validation,
      cohort_registration: cohortRegistration,
      reindex,
      next_steps: validation.valid
        ? ['Truth lens written and indexed.', 'Invoke legiox-agent-selector with consult_when phrases to verify routing.']
        : ['Review validation.issues and patch the nodus file.', 'Re-run finalize or edit in place.', 'Run legiox-validate-schema { target: "agents" }.']
    };
  }

  const fetchResult = await fetchDocumentationUrls(args.documentation_urls || args.urls);
  const deepSections = Array.isArray(args.deep_knowledge_sections) && args.deep_knowledge_sections.length > 0
    ? args.deep_knowledge_sections.map((section) => slugifyKebab(section).replace(/-/g, '_'))
    : defaultDeepKnowledgeSections(identity, subjectSummary);

  const promptMarkdown = buildGeneratorPromptMarkdown({
    identity,
    subjectSummary,
    ringdomContext: args.ringdom_context || args.context,
    upstreamAgents: args.upstream_agents || args.related_agents,
    deepSections,
    cohort,
    fetchResult,
    subjectData: args.subject_data || args.data_blob,
    schemaMd,
    today: todayIsoDate()
  });

  let promptWritten = false;
  if (args.write_prompt !== false) {
    fs.mkdirSync(generatorPromptsDir, { recursive: true });
    fs.writeFileSync(promptPath, promptMarkdown, 'utf8');
    promptWritten = true;
  }

  const inlinePrompt = promptMarkdown.length > GENERATOR_PROMPT_MAX_INLINE
    ? truncateText(promptMarkdown, GENERATOR_PROMPT_MAX_INLINE)
    : promptMarkdown;

  return {
    tool: 'legiox-create-nodus',
    phase: 'prepare',
    status: 'ok',
    agent_task: [
      'Use the generator_prompt_markdown (or read generator_prompt_path) as your operating brief.',
      'Perform web research for all RESEARCH TASKS sections.',
      'Produce a single valid .nodus.json object (raw JSON only) matching AGENT-NODUS-SCHEMA.md.',
      `Re-invoke legiox-create-nodus with finalize_nodus_json set to the JSON and matching identity fields.`,
      'Example finalize payload keys: subject_area, subject, class, finalize_nodus_json, register_cohort_member: true'
    ],
    identity,
    cohort,
    nodus_output_path: outputPath,
    nodus_relative_path: nodusRelativePath,
    generator_prompt_path: promptWritten ? promptPath : null,
    generator_prompt_relative: promptWritten ? `AI-LEGIOX/generator-prompts/${promptFileName}` : null,
    generator_prompt_written: promptWritten,
    generator_prompt_markdown: inlinePrompt,
    generator_prompt_truncated: promptMarkdown.length > GENERATOR_PROMPT_MAX_INLINE,
    documentation_fetch: {
      requested: fetchResult.requested,
      fetched: fetchResult.fetched,
      ok_count: fetchResult.sources.filter((item) => item.ok).length,
      failures: fetchResult.sources.filter((item) => !item.ok).map((item) => ({ url: item.url, error: item.error || item.status }))
    },
    deep_knowledge_sections: deepSections,
    schema_references: [
      'AI-LEGIOX/legiox-truth-lens/AGENT-NODUS-SCHEMA.md',
      'AI-LEGIOX/legiox-truth-lens/agent-schema.json'
    ],
    example_filename_patterns: [
      'coding-rust-guru.nodus.json',
      'finance-lending-specialist.nodus.json'
    ]
  };
}

module.exports = {
  runLegioxCreateNodus,
  slugifyKebab,
  stemToSnakeCase,
  resolveNodusIdentity,
  selectTopicCohort,
  buildGeneratorPromptMarkdown
};
