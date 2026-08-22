#!/usr/bin/env node
/**
 * LegioX Free — AI-CONTEXT scaffold.
 * Creates the full 10-class knowledge ecosystem in the workspace on first open.
 * Non-destructive: skips when AI-CONTEXT-ROOT.json already exists.
 * Templates are schema-compliant with legiox-validate-schema class rubrics.
 */
import fs from 'node:fs';
import path from 'node:path';

const PLUGIN_VERSION = '1.0.2';
const workspace = process.env.CURSOR_WORKSPACE || process.env.OPENCODE_WORKSPACE || process.cwd();
const aiContextDir = path.join(workspace, 'AI-CONTEXT');
const rootFile = path.join(aiContextDir, 'AI-CONTEXT-ROOT.json');

if (fs.existsSync(rootFile)) {
  console.log('LegioX Free: AI-CONTEXT already present, skip scaffold.');
  process.exit(0);
}

const projectName = detectProjectName(workspace);
const now = new Date().toISOString();
const today = now.slice(0, 10);

fs.mkdirSync(aiContextDir, { recursive: true });

const TAXONOMY = {
  core: 'Always-load essentials',
  concepts: 'Timeless knowledge: patterns, architecture, best practices',
  implementations: 'Dated implementation logs (YYYY-MM-DD)',
  patterns: 'Reusable patterns and examples',
  workflows: 'Step-by-step SOPs with steps[]',
  troubleshooting: 'Symptoms[] + solutions[]',
  timeline: 'Dated milestones and events',
  features: 'Feature specs + acceptance criteria',
  services: 'Services with endpoints',
  'integration-guides': 'Setup + steps'
};

for (const dir of Object.keys(TAXONOMY)) {
  fs.mkdirSync(path.join(aiContextDir, dir), { recursive: true });
}

const templates = {
  'core/legiox-core.json': {
    object_type: 'core',
    name: 'legiox-core',
    description: 'Always-load essentials for the personal knowledge ecosystem. Edit with the most important project facts the agent must always know.',
    keywords: ['core', 'essentials']
  },
  'concepts/_template-concept.json': {
    object_type: 'concept',
    name: 'concept-name',
    description: 'One-paragraph timeless truth about this concept (architecture, pattern, best practice).',
    facts: ['Replace with the key facts of this concept'],
    keywords: ['concept', 'domain'],
    created: 'YYYY-MM-DD',
    updated: 'YYYY-MM-DD'
  },
  'implementations/_template-implementation.json': {
    object_type: 'implementation',
    implementation_id: 'feature-name-YYYY-MM-DD',
    summary: 'What was implemented and why.',
    facts: ['Key changes made'],
    relationships: { affects: ['list of affected files or areas'] },
    created_by: 'LegioX Free',
    created: 'YYYY-MM-DD'
  },
  'patterns/_template-pattern.json': {
    object_type: 'pattern',
    name: 'pattern-name',
    description: 'When and why to use this pattern.',
    core_principles: ['Principle 1', 'Principle 2'],
    examples: ['Example usage'],
    keywords: ['pattern', 'reuse']
  },
  'workflows/_template-workflow.json': {
    object_type: 'workflow',
    name: 'workflow-name',
    description: 'What this workflow accomplishes.',
    steps: ['Step 1', 'Step 2', 'Step 3'],
    triggers: ['When to run this workflow'],
    keywords: ['workflow', 'sop']
  },
  'troubleshooting/_template-troubleshooting.json': {
    object_type: 'troubleshooting',
    name: 'issue-symptom-name',
    symptoms: ['Symptom / error message'],
    solutions: ['Root cause', 'Fix steps'],
    keywords: ['troubleshooting', 'error']
  },
  'timeline/_template-timeline.json': {
    object_type: 'timeline',
    name: 'project-milestones',
    date: 'YYYY-MM-DD',
    summary: 'Milestone history of the project.',
    milestones: [{ date: 'YYYY-MM-DD', event: 'What happened' }],
    keywords: ['timeline', 'history']
  },
  'features/_template-feature.json': {
    object_type: 'feature',
    name: 'feature-name',
    description: 'What the feature does for the user.',
    acceptance_criteria: ['Criterion 1', 'Criterion 2'],
    keywords: ['feature', 'spec']
  },
  'services/_template-service.json': {
    object_type: 'service',
    name: 'service-name',
    description: 'What this service provides.',
    endpoints: ['/api/endpoint'],
    keywords: ['service', 'api']
  },
  'integration-guides/_template-integration-guide.json': {
    object_type: 'integration_guide',
    name: 'integration-name',
    description: 'What this integration connects.',
    steps: ['Step 1', 'Step 2'],
    keywords: ['integration', 'setup']
  }
};

for (const [rel, payload] of Object.entries(templates)) {
  writeTemplate(path.join(aiContextDir, rel), payload);
}

const root = {
  schema_version: '1.0',
  object_type: 'ai_first_root',
  project_name: projectName,
  workspace,
  context_version: '1.0.0',
  generated_at: now,
  updated: now,
  legiox_plugin_version: PLUGIN_VERSION,
  metadata: { creator: 'LegioX Free', purpose: 'Personal knowledge ecosystem', taxonomy: TAXONOMY },
  concept_libraries: [],
  index_links: [],
  knowledge_nodes: [],
  workflows: [],
  troubleshooting: [],
  projects: [{ name: projectName, path: '', context_roots: ['AI-CONTEXT-INDEX.json'], status: 'active' }],
  note: 'Scaffolded by legiox-free workspaceOpen hook. Use legiox-context-update (merge/append) to add knowledge.'
};

fs.writeFileSync(rootFile, JSON.stringify(root, null, 2) + '\n', 'utf8');

const index = {
  schema_version: '1.0',
  object_type: 'navigation',
  project: projectName,
  name: projectName,
  description: 'Personal knowledge ecosystem scaffolded by LegioX Free',
  created: today,
  created_by: 'LegioX Free',
  updated: today,
  concepts: [],
  implementations: [],
  patterns: [],
  workflows: [],
  troubleshooting: [],
  timeline: [],
  features: [],
  services: [],
  integration_guides: []
};
fs.writeFileSync(path.join(aiContextDir, 'AI-CONTEXT-INDEX.json'), JSON.stringify(index, null, 2) + '\n', 'utf8');

console.log('LegioX Free: scaffolded AI-CONTEXT at', aiContextDir);
console.log('  - 10 taxonomy dirs + schema-compliant templates');
console.log('  - AI-CONTEXT-ROOT.json + AI-CONTEXT-INDEX.json');
console.log('  - Use /legiox-create or legiox-context-update (merge/append) to start recording knowledge.');

function detectProjectName(cwd) {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
    if (pkg.name) return pkg.name;
  } catch (_e) { /* ignore */ }
  return path.basename(cwd);
}

function writeTemplate(filePath, payload) {
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8');
}
