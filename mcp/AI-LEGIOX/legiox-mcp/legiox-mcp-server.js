#!/usr/bin/env node

/**
 * LegioX MCP server (official @modelcontextprotocol/sdk transport)
 */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { execSync, spawnSync } = require('node:child_process');
const { URL } = require('node:url');

const LEGIOX_ROOT = process.env.LEGIOX_ROOT || path.resolve(__dirname, '..');
const LEGIOX_PLUGIN_MODE = process.env.LEGIOX_PLUGIN_MODE === '1' || process.env.LEGIOX_PLUGIN_MODE === 'true';
const RINGDOM_ROOT = process.env.RINGDOM_ROOT
  || process.env.CURSOR_WORKSPACE
  || (LEGIOX_PLUGIN_MODE ? process.cwd() : path.resolve(LEGIOX_ROOT, '..'));
const LEGIOX_FILE_INFO_BACKEND = (
  process.env.LEGIOX_FILE_INFO_BACKEND
  || (LEGIOX_PLUGIN_MODE ? 'filesystem' : 'postgres')
).toLowerCase();
const RINGDOM_PG_HOST = process.env.RINGDOM_PG_HOST || process.env.PGHOST || '';
const RINGDOM_PG_PORT = process.env.RINGDOM_PG_PORT || process.env.PGPORT || '5432';
const RINGDOM_PG_DATABASE = process.env.RINGDOM_PG_DATABASE || process.env.POSTGRES_DB || 'ring_file_registry';
const RINGDOM_PG_USER = process.env.RINGDOM_PG_USER || process.env.POSTGRES_USER || 'ring_user';
const RINGDOM_PG_PASSWORD = process.env.RINGDOM_PG_PASSWORD || process.env.POSTGRES_PASSWORD || 'ring_password_2024';
const AGENT_INDEX_PATH = path.join(LEGIOX_ROOT, 'AI-AGENT-INDEX.json');
/** AI-AGENT-INDEX.json grows with truth-lens count; must exceed file size or readSafeText returns empty and cross-check falsely fails. */
const AGENT_INDEX_JSON_MAX_BYTES = Number(process.env.LEGIOX_AGENT_INDEX_MAX_BYTES) > 0
  ? Number(process.env.LEGIOX_AGENT_INDEX_MAX_BYTES)
  : 8 * 1024 * 1024;
const COHORTS_PATH = path.join(LEGIOX_ROOT, 'LEGIOX-COHORTS.json');
const COHORTS_DIR = path.join(LEGIOX_ROOT, 'cohorts');
const SYNC_COHORTS_INDEX_SCRIPT = path.join(LEGIOX_ROOT, 'scripts', 'sync-legiox-cohorts-index.mjs');
const AI_CONTEXT_ROOT = path.resolve(LEGIOX_ROOT, '..', 'AI-CONTEXT');
const TRUTH_LENS_ROOT = path.join(LEGIOX_ROOT, 'legiox-truth-lens');
const GENERATOR_PROMPTS_DIR = path.join(LEGIOX_ROOT, 'generator-prompts');
const { runLegioxCreateNodus } = require('./engine/nodus-creator');
const KNOWLEDGE_CACHE_TTL_MS = 5 * 60 * 1000;
const KNOWLEDGE_STOP_TERMS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'did',
  'for',
  'from',
  'had',
  'has',
  'have',
  'how',
  'i',
  'in',
  'is',
  'it',
  'of',
  'on',
  'or',
  'ring',
  'that',
  'the',
  'these',
  'they',
  'this',
  'to',
  'was',
  'were',
  'what',
  'when',
  'where',
  'which',
  'with',
  'why',
  'you',
  'your',
  'will',
  'would',
  'can',
  'platform',
  'should',
  'could',
  'about',
  'not'
]);
const knowledgeCorpusCache = {
  loadedAt: 0,
  entries: [],
  discovery: null
};
const decisionTreeCache = {
  loadedAt: 0,
  trees: {}
};
const cohortsCache = {
  loadedAt: 0,
  data: null
};
const COHORT_PRIORITY_WEIGHTS = {
  MAXIMUM: 5,
  CRITICAL: 4,
  high: 3,
  medium: 2,
  low: 1,
  critical: 4,
  revolutionary: 5,
  standard: 2
};
const KNOWLEDGE_CORPUS_WARNING_THRESHOLD = 50;
const KNOWLEDGE_CORPUS_FALLBACK_THRESHOLD = 100;
const LEGIOX_SCHEMA_COMPLIANT_SCORE = 82;
const LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS = {
  type: 10,
  name: 10,
  terms: 9,
  date: 8,
  problems: 10,
  solutions: 12,
  pitfalls: 14,
  decisions: 10,
  files_affected: 10,
  insights: 14,
  descriptions: 8,
  project: 5
};
const LEGIOX_AGENT_SCHEMA_WEIGHTS = {
  id: 18,
  mission: 20,
  truth_lens: 20,
  expertise: 14,
  keywords: 12,
  consult_when: 10,
  key_patterns: 8,
  priority: 8,
  status: 10
};

const TOOL_CAPABILITY_MAPPINGS = {
  deploy: ['deployment', 'devops', 'environment'],
  build: ['build', 'artifact', 'ci', 'automation'],
  test: ['test', 'qa', 'validation'],
  security: ['security', 'vulnerability', 'hardening', 'auth'],
  database: ['database', 'migration', 'query', 'schema'],
  monitor: ['monitor', 'performance', 'metrics', 'health'],
  document: ['docs', 'documentation', 'api', 'readme'],
  migrate: ['migration', 'schema', 'data']
};

function loadSdkModule(relativePath) {
  const primaryRequest = `@modelcontextprotocol/sdk/${relativePath}`;
  const fallbackRoots = [
    process.env.LEGIOX_SDK_NODE_MODULES,
    process.env.LEGIOX_SDK_ROOT,
    path.resolve(LEGIOX_ROOT, 'node_modules'),
    path.resolve(LEGIOX_ROOT, '..', 'AI-REGGIE', 'reggie-mcp', 'node_modules')
  ];

  try {
    return require(primaryRequest);
  } catch (primaryError) {
    for (const root of fallbackRoots) {
      if (!root) continue;

      const rootMarker = fs.existsSync(path.join(root, 'package.json'))
        ? root
        : path.join(root, '@modelcontextprotocol', 'sdk');
      const packageMarker = path.join(rootMarker, 'package.json');

      if (!fs.existsSync(packageMarker)) {
        continue;
      }

      try {
        const packageRequire = createRequire(packageMarker);
        return packageRequire(primaryRequest);
      } catch (_fallbackError) {
        continue;
      }
    }

    throw primaryError;
  }
}

const { Server } = loadSdkModule('server/index.js');
const { StdioServerTransport } = loadSdkModule('server/stdio.js');
const {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} = loadSdkModule('types.js');

const LEGIOX_LENS_URI_PREFIX = 'legiox-lens://';
let truthLensResourceCache = null;
let truthLensResourceCacheMtime = 0;

function buildTruthLensResourceIndex() {
  const agents = loadAgents();
  return agents.map((agent) => {
    const agentType = agent.key || agent.agent_type || 'unknown';
    const name = agent.name || agentType;
    const description = truncateText(
      agent.truth_lens || agent.role || `LegioX truth lens: ${name}`,
      240
    );
    return {
      uri: `${LEGIOX_LENS_URI_PREFIX}${agentType}`,
      name,
      description,
      mimeType: 'application/json',
      agent_type: agentType,
      file: agent.file
    };
  });
}

function getTruthLensResources() {
  let indexMtime = 0;
  try {
    indexMtime = fs.statSync(AGENT_INDEX_PATH).mtimeMs;
  } catch (_error) {
    indexMtime = Date.now();
  }

  if (!truthLensResourceCache || truthLensResourceCacheMtime !== indexMtime) {
    truthLensResourceCache = buildTruthLensResourceIndex();
    truthLensResourceCacheMtime = indexMtime;
  }

  return truthLensResourceCache;
}

function readTruthLensResource(uri) {
  const normalized = String(uri || '').trim();
  if (!normalized.startsWith(LEGIOX_LENS_URI_PREFIX)) {
    throw new Error(`Unsupported resource URI: ${normalized}`);
  }

  const agentType = normalizeAgentLookupKey(normalized.slice(LEGIOX_LENS_URI_PREFIX.length));
  if (!agentType) {
    throw new Error('Missing agent_type in resource URI');
  }

  const resources = getTruthLensResources();
  const match = resources.find((entry) => normalizeAgentLookupKey(entry.agent_type) === agentType);
  if (!match) {
    throw new Error(`Truth lens not found: ${agentType}`);
  }

  const lensPath = path.join(TRUTH_LENS_ROOT, match.file);
  if (!safeFileExists(lensPath)) {
    throw new Error(`Truth lens file missing: ${match.file}`);
  }

  const payload = JSON.parse(fs.readFileSync(lensPath, 'utf8'));
  const operational = {
    schema_version: payload.schema_version,
    agent_type: payload.agent_type,
    name: payload.name,
    mission: payload.mission,
    truth_lens: payload.truth_lens,
    consult_when: payload.consult_when,
    key_patterns: payload.key_patterns,
    expertise: payload.expertise,
    keywords: payload.keywords,
    priority: payload.priority,
    status: payload.status,
    core_principles: payload.core_principles || []
  };

  return {
    uri: match.uri,
    mimeType: 'application/json',
    text: JSON.stringify(operational, null, 2)
  };
}

function truncateText(value, maxLength) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength - 1)}…`;
}

const LEGIOX_TOOLS = {
  'legiox-knowledge': {
    description: 'Search LegioX knowledge index and return quick contextual matches',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query text' },
        context: { type: 'string', description: 'Optional context for better matching' },
        debug: { type: 'boolean', description: 'Return corpus discovery diagnostics' }
      },
      required: ['query']
    },
    handler: async (args) => {
      const query = (args.query || '').trim();
      if (!query) {
        throw new Error('Missing required "query"');
      }

      return runLegacyKnowledgeLookup(query, args.context || null, args.debug === true);
    }
  },
  'legiox-codebase-grep': {
    description: 'Search codebase snippets with quick semantic-style matching',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query or code pattern' },
        path: { type: 'string', description: 'Optional root path override for search' }
      },
      required: ['query']
    },
    handler: async (args) => {
      const searchRoot = typeof args.path === 'string' ? args.path.trim() : LEGIOX_ROOT;
      const query = typeof args.query === 'string' ? args.query.trim() : '';
      if (!query) {
        throw new Error('Missing required query');
      }
      return runCodebaseGrep({ query, pathOverride: searchRoot, namespace: 'local' });
    }
  },
  'legiox-decision-tree': {
    description: 'Start structured decision guidance for complex implementation issues',
    inputSchema: {
      type: 'object',
      properties: {
        tree: { type: 'string', description: 'Optional decision-tree name' },
        path: { type: 'string', description: 'Optional dot-path to walk down tree nodes (e.g., "1.2")' },
        context: { type: 'string', description: 'Optional decision context' }
      },
      required: []
    },
    handler: async (args) => {
      return runDecisionTree({
        tree: typeof args.tree === 'string' && args.tree.trim() ? args.tree.trim() : null,
        pathSelection: args.path,
        context: args.context || null
      });
    }
  },
  'legiox-agent-selector': {
    description: 'Select the strongest LegioX specialist for a specific task',
    inputSchema: {
      type: 'object',
      properties: {
        task_description: {
          type: 'string',
          description: 'Task text for selector routing'
        },
        semantic: {
          type: 'array',
          description: 'Optional semantic tokens/phrases that should bias routing',
          items: { type: 'string' }
        },
        context: { type: 'string', description: 'Optional context used for vector routing' },
        cohort_hint: { type: 'string', description: 'Optional direct cohort id to bias search' },
        priority: {
          type: 'string',
          enum: ['critical', 'high', 'medium', 'low']
        },
        max_results: { type: 'number', description: 'Limit how many candidates are returned' },
        requirements: {
          type: 'object',
          properties: {
            capabilities: { type: 'array', items: { type: 'string' } },
            semantic_array: {
              type: 'array',
              description: 'Optional tokenized semantic inputs to strengthen ranking',
              items: { type: 'string' }
            },
            priority: {
              type: 'string',
              enum: ['critical', 'high', 'medium', 'low']
            },
            context: { type: 'string' },
            cohort_hint: { type: 'string' },
            max_results: { type: 'number' }
          }
        }
      },
      required: ['task_description']
    },
    handler: async (args) => {
      const taskDescription = typeof args.task_description === 'string' ? args.task_description.trim() : '';
      if (!taskDescription) {
        throw new Error('Missing required task_description');
      }

      const requirements = args.requirements || {};
      const topLevelSemantic = args.semantic || args.semantic_array;
      const mergedRequirements = {
        ...requirements,
        semantic_array: Array.isArray(topLevelSemantic)
          ? topLevelSemantic
          : (typeof topLevelSemantic === 'string' ? [topLevelSemantic] : requirements.semantic_array),
        cohort_hint: args.cohort_hint || requirements.cohort_hint,
        context: args.context || requirements.context,
        priority: args.priority || requirements.priority
      };

      const result = selectAgent(taskDescription, mergedRequirements);
      return {
        tool: 'legiox-agent-selector',
        task_description: taskDescription,
        selectedAgent: result.selectedAgent,
        selectedAgentFile: result.agent_file,
        selectedAgentCohorts: result.selectedAgentCohorts,
        selectedTruthLenses: result.selectedTruthLenses || [],
        certainty: result.confidence,
        weighted_signals: result.weightedSignals || [],
        alternatives: result.alternatives,
        reasoning: result.reasoning,
        top_count: Array.isArray(result.scoredCandidates) ? result.scoredCandidates.length : 0,
        matched_cohorts: result.matchedCohorts || [],
        scored_candidates: result.scoredCandidates || []
      };
    }
  },
  'legiox-validate-schema': {
    description: 'Validate JSON document schema compliance for AI-CONTEXT and/or legiox-truth-lens files with scoring',
    inputSchema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          enum: ['knowledge', 'agents', 'both'],
          description: 'Validate AI-CONTEXT knowledge files, truth-lens agent files, or both'
        },
        knowledge_root: {
          type: 'string',
          description: 'Override AI-CONTEXT scan root'
        },
        truth_lens_root: {
          type: 'string',
          description: 'Override legiox-truth-lens scan root'
        },
        max_depth: {
          type: 'number',
          description: 'Maximum directory depth for schema scans'
        },
        max_files: {
          type: 'number',
          description: 'Cap on rows in each scope files array; omit or 0 = no cap. Positive integer applies after filters.'
        },
        include_non_compliant_only: {
          type: 'boolean',
          description: 'Return only files with compliance score below compliant threshold'
        },
        verbose: {
          type: 'boolean',
          description: 'Include detailed field-level scoring'
        },
        cross_check_agent_index: {
          type: 'boolean',
          description: 'Verify truth-lens files are represented in AI-AGENT-INDEX.json'
        }
      },
      required: []
    },
    handler: async (args) => {
      const requestedTarget = typeof args.target === 'string' ? args.target.trim().toLowerCase() : 'both';
      const target = ['knowledge', 'agents', 'both'].includes(requestedTarget) ? requestedTarget : 'both';
      const rawKnowledgeRoot = typeof args.knowledge_root === 'string' ? args.knowledge_root.trim() : '';
      const rawTruthLensRoot = typeof args.truth_lens_root === 'string' ? args.truth_lens_root.trim() : '';

      return runSchemaValidation({
        target,
        knowledgeRoot: rawKnowledgeRoot || AI_CONTEXT_ROOT,
        truthLensRoot: rawTruthLensRoot || TRUTH_LENS_ROOT,
        maxDepth: Number.isFinite(args.max_depth) ? Number(args.max_depth) : 12,
        maxFiles: Number.isFinite(args.max_files) ? Number(args.max_files) : 0,
        includeNonCompliantOnly: args.include_non_compliant_only === true,
        verbose: args.verbose === true,
        crossCheckAgentIndex: args.cross_check_agent_index === true
      });
    }
  },
  'legiox-implementation-guide': {
    description: 'Generate step-by-step implementation guidance for requested features',
    inputSchema: {
      type: 'object',
      properties: {
        feature: { type: 'string', description: 'Feature name or topic' },
        current_state: { type: 'string', description: 'Optional current implementation state' },
        constraints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional constraints to include'
        }
      },
      required: ['feature']
    },
    handler: async (args) => {
      const feature = typeof args.feature === 'string' ? args.feature.trim() : '';
      if (!feature) {
        throw new Error('Missing required feature');
      }
      return buildImplementationGuide({
        feature,
        currentState: args.current_state,
        constraints: Array.isArray(args.constraints) ? args.constraints : []
      });
    }
  },
  'legiox-index-rebuilder': {
    description: 'Rebuild LegioX internal indexes and metadata caches',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['full', 'delta', 'metadata'],
          description: 'Rebuild mode'
        },
        verbose: {
          type: 'boolean',
          description: 'Return discovery diagnostics in response'
        }
      },
      required: []
    },
    handler: async (args) => {
      const mode = args.mode || 'metadata';
      return rebuildIndexes(mode, args.verbose === true);
    }
  },
  'legiox-agent-index-rebuilder': {
    description:
      'Reindex legiox-truth-lens into AI-AGENT-INDEX.json and sync LEGIOX-COHORTS.json topic_cohorts index from AI-LEGIOX/cohorts/*-cohort.json manifests',
    inputSchema: {
      type: 'object',
      properties: {
        dry_run: {
          type: 'boolean',
          description: 'Prepare changes without writing to AI-AGENT-INDEX.json when true'
        },
        source_root: {
          type: 'string',
          description: 'Optional truth-lens root override'
        },
        max_depth: {
          type: 'number',
          description: 'Maximum recursion depth while scanning truth-lens files'
        },
        verbose: {
          type: 'boolean',
          description: 'Return per-file and validation details'
        }
      },
      required: []
    },
    handler: async (args) => {
      return rebuildTruthLensAgentIndex({
        sourceRoot: typeof args.source_root === 'string' ? args.source_root.trim() : null,
        maxDepth: Number.isFinite(args.max_depth) ? Number(args.max_depth) : null,
        dryRun: args.dry_run === true,
        verbose: args.verbose === true
      });
    }
  },
  'legiox-white-label-cloner': {
    description: 'Create white-label clone scaffolds from LegioX templates',
    inputSchema: {
      type: 'object',
      properties: {
        client_name: { type: 'string', description: 'Client name' },
        project_name: { type: 'string', description: 'Project name' },
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'Feature flags to enable'
        }
      },
      required: ['client_name', 'project_name']
    },
    handler: async (args) => {
      const clientName = String(args.client_name || '').trim();
      const projectName = String(args.project_name || '').trim();
      if (!clientName || !projectName) {
        throw new Error('client_name and project_name are required');
      }
      const features = Array.isArray(args.features) ? args.features : [];

      return {
        tool: 'legiox-white-label-cloner',
        status: 'ready',
        client_name: clientName,
        project_name: projectName,
        scaffold_plan: [
          `Create/ensure clone overlay at ringdom-clones/${projectName.startsWith('ring-') ? projectName : `ring-${projectName}`}/web under RINGDOM_ROOT`,
          `Apply brand layer + ring-config *.preset names for ${clientName}`,
          'Add custom presets under features/*/presets/<name>.ts and overlay registry index if niche is clone-local',
          'Merge for build via ringdom-mcp ringdom-clone-build: platform → tmp, then clone overlay (clone truth prevails)',
          'Create Postgres DB + apply flattened data/schema.sql via ./install.sh setup-db or scripts/setup-clone-db.sh (do not replay numbered migrations)',
          'Wire DATABASE_URL + AUTH_SECRET + Firebase/OAuth into .env.local / k8s Secret',
          'Validate configuration and run smoke checks from build_dir'
        ],
        database: {
          ssot: 'ring-platform.org/data/schema.sql',
          setup: './install.sh setup-db --clone-name <slug> --db-name ring_<slug> [--create-role]',
          helper: 'ring-platform.org/scripts/setup-clone-db.sh'
        },
        selected_features: features,
        build_merge_tool: 'ringdom-clone-build',
        suggested_template_path: `AI-LEGIOX/legiox-truth-lens/white-label/${projectName || 'template'}.nodus.json`
      };
    }
  },
  'legiox-context-update': {
    description: 'Merge facts/patterns/relationships into an existing AI-CONTEXT concept (append unique). Does not replace the file unless mode=replace and confirm_replace=true.',
    inputSchema: {
      type: 'object',
      properties: {
        updates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              concept: { type: 'string' },
              facts: { type: 'array', items: { type: 'string' } },
              patterns: { type: 'array', items: { type: 'string' } },
              relationships: { type: 'array', items: { type: 'string' } },
              mode: { type: 'string', enum: ['merge', 'replace'], description: 'Default merge. replace requires confirm_replace=true.' },
              confirm_replace: { type: 'boolean', description: 'Required true when mode=replace, or the write is refused and existing facts are returned.' }
            },
            required: ['concept']
          }
        }
      },
      required: ['updates']
    },
    handler: async (args) => {
      return processContextUpdates(Array.isArray(args.updates) ? args.updates : []);
    }
  },
  'legiox-file-git-commit': {
    description: 'Create traceable commits with context-aware metadata',
    inputSchema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string' }, description: 'Files to include' },
        message: { type: 'string', description: 'Commit message' },
        scope: { type: 'string', description: 'Optional scope tag' },
        dry_run: { type: 'boolean', description: 'Build command only by default when true' }
      },
      required: ['files', 'message']
    },
    handler: async (args) => {
      const files = Array.isArray(args.files) ? args.files : [];
      const existing = [];
      const missing = [];
      for (const file of files) {
        const absolute = path.isAbsolute(file) ? file : path.join(LEGIOX_ROOT, file);
        if (safeFileExists(absolute)) {
          existing.push(absolute);
        } else {
          missing.push(file);
        }
      }

      const prepared = {
        git_add: files.map((file) => String(file)),
        message: args.message,
        scope: args.scope || 'default'
      };

      if ((args.dry_run ?? true)) {
        return {
          tool: 'legiox-file-git-commit',
          status: missing.length === 0 ? 'ready' : 'ready_with_missing',
          dry_run: true,
          existing_files: existing.length,
          missing_files: missing,
          prepared_command: `git add ${prepared.git_add.join(' ')} && git commit -m "${prepared.message.replace(/\"/g, '\\"')}"`
        };
      }

      try {
        const addResult = execSync(`git add ${prepared.git_add.join(' ')}`, {
          cwd: LEGIOX_ROOT,
          encoding: 'utf8'
        });
        const commitResult = execSync(`git commit -m "${prepared.message.replace(/\"/g, '\\"')}"`, {
          cwd: LEGIOX_ROOT,
          encoding: 'utf8',
          maxBuffer: 2 * 1024 * 1024
        });
        return {
          tool: 'legiox-file-git-commit',
          status: 'ok',
          scope: prepared.scope,
          add_output: String(addResult).slice(0, 2000),
          commit_output: String(commitResult).slice(0, 2000)
        };
      } catch (error) {
        return {
          tool: 'legiox-file-git-commit',
          status: 'failed',
          add_output: String(error.stdout || ''),
          commit_output: String(error.stderr || error.message || '')
        };
      }
    }
  },
  'legiox-project-analysis': {
    description: 'Run project health and architecture analysis',
    inputSchema: {
      type: 'object',
      properties: {
        project_path: { type: 'string', description: 'Project root path' },
        depth: {
          type: 'string',
          enum: ['quick', 'standard', 'deep'],
          description: 'Analysis depth'
        }
      },
      required: ['project_path']
    },
    handler: async (args) => {
      const projectRoot = path.isAbsolute(args.project_path)
        ? args.project_path
        : path.resolve(LEGIOX_ROOT, args.project_path);

      const packageJsonPath = path.join(projectRoot, 'package.json');
      const hasPackageJson = safeFileExists(packageJsonPath);
      const readmePath = path.join(projectRoot, 'README.md');
      const hasReadme = safeFileExists(readmePath);
      const gitExists = safeFileExists(path.join(projectRoot, '.git'));
      const srcPath = path.join(projectRoot, 'src');

      return {
        tool: 'legiox-project-analysis',
        project_path: projectRoot,
        depth: args.depth || 'quick',
        status: 'ok',
        findings: {
          has_package_json: hasPackageJson,
          has_readme: hasReadme,
          has_git: gitExists,
          has_src_folder: safeFileExists(srcPath),
          note: hasPackageJson
            ? 'Node-style project detected.'
            : 'Non-Node project or incomplete metadata.'
        }
      };
    }
  },
  'legiox-security-audit': {
    description: 'Run security scans and highlight likely risk patterns',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'Target path or service' },
        strict: { type: 'boolean', description: 'Enable strict policy mode' }
      },
      required: ['target']
    },
    handler: async (args) => {
      const target = typeof args.target === 'string' ? args.target.trim() : '';
      if (!target) {
        return {
          tool: 'legiox-security-audit',
          status: 'error',
          error: 'target required'
        };
      }

      const targetPath = path.isAbsolute(target) ? target : path.resolve(LEGIOX_ROOT, target);
      const scanResult = runQuickSecurityScan(targetPath);
      return {
        tool: 'legiox-security-audit',
        target: targetPath,
        strict: Boolean(args.strict),
        status: scanResult.findings > 0 ? 'needs_review' : 'ok',
        findings_count: scanResult.findings,
        samples: scanResult.samples
      };
    }
  },
  'legiox-performance-analyzer': {
    description: 'Collect and summarize performance telemetry',
    inputSchema: {
      type: 'object',
      properties: {
        scope: { type: 'string', description: 'Analysis scope' },
        timeframe_minutes: { type: 'number', description: 'Window minutes' }
      },
      required: []
    },
    handler: async (args) => {
      return {
        tool: 'legiox-performance-analyzer',
        scope: args.scope || 'project',
        timeframe_minutes: args.timeframe_minutes || 15,
        status: 'simulated',
        note: 'Performance analytics are computed from local repository statistics only in this lightweight MCP runtime.'
      };
    }
  },
  'legiox-batch-operations': {
    description: 'Execute multiple operations as one coordinated batch',
    inputSchema: {
      type: 'object',
      properties: {
        operations: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tool: { type: 'string' },
              args: { type: 'object' }
            }
          }
        }
      },
      required: ['operations']
    },
    handler: async (args) => {
      const operations = Array.isArray(args.operations) ? args.operations : [];
      return executeBatchOperations(operations);
    }
  },
  'legiox-stream-status': {
    description: 'Query stream and batch operation status',
    inputSchema: {
      type: 'object',
      properties: {
        operation_id: { type: 'string', description: 'Optional operation identifier' }
      },
      required: []
    },
    handler: async (args) => {
      return {
        tool: 'legiox-stream-status',
        operation_id: args.operation_id || 'N/A',
        status: 'not_found',
        note: 'Streaming operation tracker is lightweight and currently supports ad-hoc batch ops only.'
      };
    }
  },
  'legiox-file-info': {
    description: 'Resolve file metadata and verify repository paths',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File path to inspect' }
      },
      required: ['path']
    },
    handler: async (args) => {
      const requestedPath = typeof args.path === 'string' ? args.path.trim() : '';
      if (!requestedPath) {
        throw new Error('Missing required path');
      }

      const absolutePath = path.isAbsolute(requestedPath)
        ? requestedPath
        : path.join(LEGIOX_ROOT, requestedPath);
      const exists = safeFileExists(absolutePath);
      const stats = exists ? fs.statSync(absolutePath) : null;
      const backend = LEGIOX_FILE_INFO_BACKEND;
      const registryPath = resolveRegistryProjectAndPath(absolutePath);
      let registry = {
        backend,
        connected: false,
        entry_found: false,
        project_name: registryPath ? registryPath.projectName : null,
        relative_path: registryPath ? registryPath.relativePath : null,
        registry_id: null,
        note: null
      };

      if (backend !== 'filesystem') {
        if (!registryPath) {
          registry.note = 'path_not_in_ringdom_project_root';
        } else {
          const result = queryRegistryEntry(registryPath.projectName, registryPath.relativePath);
          registry = {
            ...registry,
            connected: result.connected,
            entry_found: result.entryFound,
            registry_id: result.registryId || null,
            note: result.error || null
          };
        }
      } else {
        registry.note = 'filesystem_only_backend';
      }

      return {
        tool: 'legiox-file-info',
        path: requestedPath,
        absolute_path: absolutePath,
        exists,
        is_directory: exists ? stats.isDirectory() : false,
        size_bytes: exists ? stats.size : 0,
        registry
      };
    }
  },
  'legiox-vector-search': {
    description: 'Experimental vector search for semantic similarity',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Query text for semantic lookup' },
        limit: { type: 'number', description: 'Max results' }
      },
      required: ['query']
    },
    handler: async (args) => {
      const query = typeof args.query === 'string' ? args.query.trim() : '';
      if (!query) {
        throw new Error('Missing required query');
      }
      const limit = Number.isFinite(Number(args.limit)) ? Number(args.limit) : 10;
      return runVectorSearch(query, limit);
    }
  },
  'legiox-kingdom-grep': {
    description: 'Run kingdom-wide grep-like lookup with context',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        context: { type: 'number', description: 'Context lines' }
      },
      required: ['query']
    },
    handler: async (args) => {
      const query = typeof args.query === 'string' ? args.query.trim() : '';
      if (!query) {
        throw new Error('Missing required query');
      }
      return runCodebaseGrep({
        query,
        pathOverride: path.resolve(LEGIOX_ROOT, '..'),
        namespace: 'kingdom',
        contextRadius: Number.isFinite(Number(args.context)) ? Number(args.context) : 120
      });
    }
  },
  'legiox-test-runner': {
    description: 'Run lint/type-check/test/build gates for configured scope',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Command override' },
        project_path: { type: 'string', description: 'Project root path' },
        dry_run: { type: 'boolean', description: 'Prepare without executing command when true' }
      },
      required: ['project_path']
    },
    handler: async (args) => {
      return runTestCommand({
        command: args.command || 'npm test',
        project_path: args.project_path || LEGIOX_ROOT,
        dryRun: args.dry_run === undefined ? true : Boolean(args.dry_run)
      });
    }
  },
  'legiox-env-validator': {
    description: 'Validate required environment variables and .env contracts',
    inputSchema: {
      type: 'object',
      properties: {
        env_file: { type: 'string', description: 'Environment file path' },
        required_vars: { type: 'array', items: { type: 'string' } }
      },
      required: []
    },
    handler: async (args) => {
      return validateEnvFile({
        env_file: args.env_file || '.env.example',
        required_vars: Array.isArray(args.required_vars) ? args.required_vars : []
      });
    }
  },
  'legiox-docs-generator': {
    description: 'Generate lightweight docs from source and execution context',
    inputSchema: {
      type: 'object',
      properties: {
        module_path: { type: 'string', description: 'Module path' },
        format: {
          type: 'string',
          enum: ['md', 'txt'],
          description: 'Output format'
        }
      },
      required: ['module_path']
    },
    handler: async (args) => {
      const modulePath = typeof args.module_path === 'string' ? args.module_path.trim() : '';
      if (!modulePath) {
        throw new Error('Missing required module_path');
      }
      return generateModuleDocs({
        modulePath,
        format: args.format || 'md'
      });
    }
  },
  'legiox-dependency-analyzer': {
    description: 'Analyze dependencies for drift, vulnerabilities, and stale lockfiles',
    inputSchema: {
      type: 'object',
      properties: {
        project_path: { type: 'string', description: 'Project root path' },
        depth: { type: 'string', description: 'Scan depth' }
      },
      required: ['project_path']
    },
    handler: async (args) => {
      return analyzeDependencies({
        project_path: args.project_path,
        depth: args.depth || 'standard'
      });
    }
  },
  'legiox-api-tester': {
    description: 'Validate API endpoints and request/response behavior',
    inputSchema: {
      type: 'object',
      properties: {
        endpoint: { type: 'string', description: 'Endpoint URL' },
        method: {
          type: 'string',
          enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
        }
      },
      required: ['endpoint']
    },
    handler: async (args) => {
      return runApiCheck({
        endpoint: args.endpoint,
        method: args.method || 'GET'
      });
    }
  },
  'legiox-deployment-orchestrator': {
    description: 'Generate deployment plan and execute guarded deployment steps',
    inputSchema: {
      type: 'object',
      properties: {
        environment: { type: 'string', description: 'Target environment' },
        project_path: { type: 'string', description: 'Project root path' }
      },
      required: ['environment', 'project_path']
    },
    handler: async (args) => {
      return {
        tool: 'legiox-deployment-orchestrator',
        environment: args.environment,
        project_path: args.project_path,
        status: 'planned',
        plan: [
          'Validate environment guardrails and approvals',
          'Run smoke checks and dependency verification',
          'Generate deployment command graph with rollback point',
          'Execute with progressive gates only when explicitly approved'
        ],
        note: 'Execution path remains queued for governance compliance.'
      };
    }
  },
  'legiox-db-migrator': {
    description: 'Manage DB migration checks and safe execution steps',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Migration command' },
        target: { type: 'string', description: 'Database target' }
      },
      required: ['command']
    },
    handler: async (args) => {
      const command = typeof args.command === 'string' ? args.command.trim() : '';
      const target = typeof args.target === 'string' && args.target.trim() ? args.target.trim() : 'ring-platform.org';
      const rootHint = 'ring-platform.org';
      return {
        tool: 'legiox-db-migrator',
        command,
        target,
        status: 'planned',
        ssot: {
          fresh_install: `${rootHint}/data/schema.sql (v4.1.0 flattened — apply ONLY this file)`,
          incremental: `${rootHint}/data/migrations/*.sql (existing DBs only; then re-flatten)`,
          flatten: `${rootHint}/scripts/flatten-schema-from-migrations.sh`,
          setup: `${rootHint}/scripts/setup-clone-db.sh`,
          install_cli: `./install.sh setup-db --clone-name <slug> --db-name ring_<slug> [--create-role]`
        },
        recommended_commands: [
          `cd ${rootHint} && ./install.sh setup-db --clone-name ${target.replace(/^ring-/, '').replace(/[^a-z0-9]+/gi, '-')} --create-role`,
          `cd ${rootHint} && ./scripts/setup-clone-db.sh --db-name <db> --db-user <user> [--create-role]`,
          `cd ${rootHint} && ./scripts/setup-clone-db.sh --database-url "$DATABASE_URL"`,
          `cd ${rootHint} && ./scripts/flatten-schema-from-migrations.sh  # after adding a new migration`
        ],
        note:
          'Do not replay numbered migrations on empty clone DBs. Legacy 001_email_crm_schema.sql is skipped (global_users). Extensions (uuid-ossp, pgcrypto, postgis) may need a role with CREATE EXTENSION.'
      };
    }
  },
  'legiox-ai-coder': {
    description: 'Generate and iterate implementation code suggestions',
    inputSchema: {
      type: 'object',
      properties: {
        task: { type: 'string', description: 'Coding task description' },
        language: { type: 'string', description: 'Target language' }
      },
      required: ['task']
    },
    handler: async (args) => {
      const task = typeof args.task === 'string' ? args.task.trim() : '';
      if (!task) {
        throw new Error('Missing required task');
      }

      return {
        tool: 'legiox-ai-coder',
        status: 'ready',
        task,
        language: args.language || 'TypeScript',
        suggestion: {
          approach: 'Divide task into smallest safe edit with a clear acceptance check.',
          next_steps: [
            'Create a small test reproducer first',
            'Implement incremental patch',
            'Run targeted validation',
            'Update context notes'
          ],
          sample_prompt: `Implement ${task} in ${args.language || 'TypeScript'} with explicit imports, typed inputs, and safe fallbacks.`
        }
      };
    }
  },
  'legiox-create-nodus': {
    description:
      'Prepare or finalize a LegioX NODUS truth lens: fetch documentation, emit an extended generator prompt for web research, then validate/write *.nodus.json to legiox-truth-lens',
    inputSchema: {
      type: 'object',
      properties: {
        subject_area: {
          type: 'string',
          description: 'Domain area slug (e.g. coding, finance, ai) for filename <area>-<subject>-<class>.nodus.json'
        },
        subject: {
          type: 'string',
          description: 'Subject slug (e.g. rust, lending, youtube-seo)'
        },
        class: {
          type: 'string',
          description: 'Agent class slug (e.g. guru, specialist, commander)'
        },
        subject_summary: {
          type: 'string',
          description: 'Free-form subject description when subject_area/subject/class are not provided'
        },
        task_description: {
          type: 'string',
          description: 'Alias for subject_summary'
        },
        documentation_urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Official docs or reference URLs to prefetch into the generator prompt'
        },
        urls: {
          type: 'array',
          items: { type: 'string' },
          description: 'Alias for documentation_urls'
        },
        subject_data: {
          type: 'string',
          description: 'Inline subject-matter blob (notes, specs, requirements)'
        },
        data_blob: {
          type: 'string',
          description: 'Alias for subject_data'
        },
        context: {
          type: 'string',
          description: 'Optional Ringdom/LegioX context for the generator prompt'
        },
        ringdom_context: {
          type: 'string',
          description: 'Alias for context'
        },
        cohort_hint: {
          type: 'string',
          description: 'Optional topic cohort id override (ai, code, business, k8s, ...)'
        },
        cohort: {
          type: 'string',
          description: 'Alias for cohort_hint'
        },
        upstream_agents: {
          type: 'array',
          items: { type: 'string' },
          description: 'Related truth-lens filenames or paths for upstream/downstream contracts'
        },
        related_agents: {
          type: 'array',
          items: { type: 'string' },
          description: 'Alias for upstream_agents'
        },
        deep_knowledge_sections: {
          type: 'array',
          items: { type: 'string' },
          description: 'Top-level domain section names to require in the output nodus JSON'
        },
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional keywords to improve cohort routing'
        },
        write_prompt: {
          type: 'boolean',
          description: 'Write generator prompt to AI-LEGIOX/generator-prompts/<stem>.promt.md (default true)'
        },
        finalize_nodus_json: {
          type: 'string',
          description: 'When set (JSON string or object), validate and write the nodus file to legiox-truth-lens'
        },
        dry_run: {
          type: 'boolean',
          description: 'For finalize phase: validate only, do not write files'
        },
        register_cohort_member: {
          type: 'boolean',
          description: 'On finalize: append member to topic cohort manifest (default true)'
        },
        reindex_after_write: {
          type: 'boolean',
          description: 'On finalize: run legiox-agent-index-rebuilder (default true)'
        }
      },
      required: []
    },
    handler: async (args) => {
      return runLegioxCreateNodus(
        {
          legioxRoot: LEGIOX_ROOT,
          truthLensRoot: TRUTH_LENS_ROOT,
          generatorPromptsDir: GENERATOR_PROMPTS_DIR,
          cohortsPath: COHORTS_PATH,
          cohortsDir: COHORTS_DIR,
          agentIndexPath: AGENT_INDEX_PATH,
          rebuildTruthLensAgentIndex,
          validateTruthLensAgentRecord,
          readSafeJson
        },
        args
      );
    }
  }
};

function tokenizeText(text, options = {}) {
  return (String(text || '')
    .toLowerCase()
    .match(/[a-z0-9_]+/g) || [])
    .filter((token) => token.length > 1)
    .filter((token) => (options.removeStopWords ? !KNOWLEDGE_STOP_TERMS.has(token) : true));
}

function readSafeText(filePath, maxBytes = 250000) {
  try {
    if (!safeFileExists(filePath)) {
      return '';
    }

    const stats = fs.statSync(filePath);
    if (stats.size > maxBytes) {
      return '';
    }

    return fs.readFileSync(filePath, 'utf8');
  } catch (_error) {
    return '';
  }
}

function readSafeJson(filePath, maxBytes = 500000) {
  try {
    const content = readSafeText(filePath, maxBytes);
    if (!content) {
      return null;
    }
    return JSON.parse(content);
  } catch (_error) {
    return null;
  }
}

function normalizeTextValues(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0);
  }
  return [];
}

function normalizeTextValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  return '';
}

function normalizeTruthLensRecordName(payload, fallbackKey, fallbackFile) {
  if (!payload || typeof payload !== 'object') {
    return fallbackKey;
  }

  const candidate = payload.name
    || payload.title
    || (payload.agent && typeof payload.agent.name === 'string' ? payload.agent.name : '')
    || (payload.agent && typeof payload.agent.job_title === 'string' ? payload.agent.job_title : '')
    || fallbackKey
    || fallbackFile;

  return String(candidate).trim();
}

function deriveMissionText(payload) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  if (typeof payload.mission === 'string') {
    const mission = payload.mission.trim();
    if (mission) {
      return mission;
    }
  }

  if (payload.mission && typeof payload.mission === 'object') {
    const parts = [
      normalizeTextValue(payload.mission.primary_objective),
      normalizeTextValue(payload.mission.target_outcome),
      normalizeTextValue(payload.mission.context),
      normalizeTextValue(payload.mission.scope)
    ];
    const missionText = parts.filter(Boolean).join(' ').trim();
    if (missionText) {
      return missionText;
    }
  }

  return [
    normalizeTextValue(payload.purpose),
    normalizeTextValue(payload.goal),
    normalizeTextValue(payload.context),
    normalizeTextValue(payload.summary),
    normalizeTextValue(payload.description),
    normalizeTextValue(payload.objective)
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function deriveTruthLensText(payload) {
  if (!payload || typeof payload !== 'object') {
    return '';
  }

  const values = [
    normalizeTextValue(payload.truth_lens),
    deriveMissionText(payload)
  ];

  return values
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectTextFromValue(value, collector) {
  if (value == null || typeof collector !== 'object') {
    return;
  }

  if (typeof value === 'string') {
    const valueText = value.trim();
    if (valueText) {
      collector.push(valueText);
    }
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectTextFromValue(item, collector));
    return;
  }

  if (typeof value === 'object') {
    Object.keys(value).forEach((key) => {
      if (key === 'schema_version') {
        return;
      }

      collectTextFromValue(value[key], collector);
    });
  }
}

function truthLensFileStem(fileName) {
  const name = String(fileName || '');
  const lower = name.toLowerCase();
  if (lower.endsWith('.nodus.json')) {
    return name.slice(0, -'.nodus.json'.length);
  }
  if (lower.endsWith('.json')) {
    return name.slice(0, -'.json'.length);
  }
  return name;
}

function collectJsonFiles(rootDir, maxDepth = 2, currentDepth = 0, entries = []) {
  if (!safeFileExists(rootDir) || currentDepth > maxDepth) {
    return entries;
  }

  let directoryEntries = [];
  try {
    directoryEntries = fs.readdirSync(rootDir, { withFileTypes: true });
  } catch (_error) {
    return entries;
  }

  for (const entry of directoryEntries) {
    if (entry.name.startsWith('.')) {
      continue;
    }

    const entryPath = path.join(rootDir, entry.name);
    if (entry.isDirectory()) {
      collectJsonFiles(entryPath, maxDepth, currentDepth + 1, entries);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      // JSON Schema for NODUS agents — not an agent payload; do not index as a truth lens.
      if (entry.name === 'agent-schema.json') {
        continue;
      }
      entries.push(entryPath);
    }
  }

  return entries;
}

function normalizeAgentIndexFileName(agentKey, sourceFileName, existingById = {}) {
  const normalizedExisting = normalizeAgentLookupKey(agentKey);
  if (existingById[normalizedExisting]) {
    return normalizeTextValue(existingById[normalizedExisting]);
  }

  const dashForm = normalizedExisting.replace(/_/g, '-');
  const candidates = [
    sourceFileName,
    `${normalizedExisting}.nodus.json`,
    `${dashForm}.nodus.json`,
    `${normalizedExisting}.json`,
    `${dashForm}.json`
  ];
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    const candidatePath = path.join(TRUTH_LENS_ROOT, candidate);
    if (safeFileExists(candidatePath)) {
      return candidate;
    }
  }
  return normalizeTextValue(sourceFileName) || `${normalizedExisting}.nodus.json`;
}

function extractAgentRecordsFromTruthLensPayload(payload, sourceFileName, sourceByIdLookup = {}) {
  const normalizedSource = normalizeAgentLookupKey(sourceFileName ? truthLensFileStem(sourceFileName) : '');
  const sourceIsMap = payload && typeof payload === 'object' && !Array.isArray(payload);
  const records = [];

  const addRecord = (record, explicitKey) => {
    if (!record || typeof record !== 'object') {
      return;
    }

    const key = normalizeAgentLookupKey(
      explicitKey
      || record.agent_type
      || record.agent_id
      || record.id
      || normalizedSource
    );

    records.push({
      key,
      sourceFileName,
      record
    });
  };

  if (!sourceIsMap) {
    return records;
  }

  const hasTopLevelAgent = [
    payload.agent_type,
    payload.agent_id,
    payload.id,
    payload.name,
    payload.mission,
    payload.consult_when,
    payload.key_patterns,
    payload.expertise,
    payload.keywords,
    payload.file,
    payload.agent
  ].some((candidate) => candidate !== undefined && candidate !== null);

  if (hasTopLevelAgent) {
    addRecord(payload);
    return records;
  }

  const mapCandidateKeys = Object.keys(payload).filter((key) => {
    if (['schema_version', 'agent', 'knowledge_layers', 'core_principles', 'anti_patterns', 'meta', 'quick_reference', 'jq_usage_guide', 'key_papers_and_references'].includes(key)) {
      return false;
    }
    const value = payload[key];
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return false;
    }
    if (value.truths && Array.isArray(value.truths)) {
      return false;
    }
    if (value.concept && typeof value.concept === 'string') {
      return false;
    }
    return (
      typeof value.agent_type === 'string'
      || typeof value.agent_id === 'string'
      || (typeof value.mission === 'object' && value.mission.primary_objective)
      || (typeof value.truth_lens === 'string' && (value.consult_when || value.expertise || value.keywords))
    );
  });

  if (mapCandidateKeys.length === 0) {
    if (sourceByIdLookup[normalizedSource]) {
      addRecord(payload, sourceByIdLookup[normalizedSource]);
    } else {
      addRecord(payload);
    }
    return records;
  }

  for (const key of mapCandidateKeys) {
    const nested = payload[key];
    const explicitKey = normalizeAgentLookupKey(key);
    if (explicitKey) {
      addRecord(nested, explicitKey);
    }
  }

  return records;
}

function buildTruthLensAgentIndexEntry(payload, options = {}) {
  const merged = { ...options, ...payload };
  const key = normalizeAgentLookupKey(merged.key || options.key || '');
  if (!key) {
    return null;
  }

  const sourceFileName = merged.sourceFileName || options.sourceFileName || '';
  const sourceFile = normalizeTruthLensRecordName(payload.record, key, sourceFileName);
  const fileName = normalizeTruthLensRecordName(payload.record, merged.fileName || options.fileName, sourceFileName);
  const file = normalizeAgentIndexFileName(
    key,
    sourceFileName,
    merged.byIdLookup || options.byIdLookup || {}
  );
  const status = String(payload.record?.status || 'active').toLowerCase();
  const priority = String(payload.record?.priority_level || payload.record?.priority || 'medium').toLowerCase();
  const consultWhen = normalizeTextValues(payload.record?.consult_when || payload.record?.trigger_conditions);
  const keyPatterns = normalizeTextValues(payload.record?.key_patterns);
  const expertise = normalizeTextValues(payload.record?.expertise || payload.record?.capabilities);
  const keywords = normalizeTextValues(payload.record?.keywords || payload.record?.tags || payload.record?.topics);
  const missionText = deriveMissionText(payload.record || {});
  const truthLens = deriveTruthLensText(payload.record || {});

  return {
    agent_id: normalizeAgentLookupKey(payload.record?.agent_id || payload.record?.id || key),
    agent_type: key,
    file: file,
    json_config: fileName,
    file_name: fileName,
    consult_when: consultWhen,
    expertise,
    keywords,
    key_patterns: keyPatterns,
    truth_lens: truthLens || 'No truth lens defined',
    mission: missionText || 'No mission defined',
    status,
    priority_level: priority,
    priority: priority,
    tier: normalizeTextValue(payload.record?.tier) || 'specialist',
    name: normalizeTruthLensRecordName(payload.record || {}, key, options.sourceFileName),
    source_file: normalizeTextValue(options.sourceFileName),
    source_dir: TRUTH_LENS_ROOT
  };
}

function listJsonFilesWithRipgrep(rootDir) {
  try {
    const result = spawnSync('rg', ['--files', '--hidden', '--no-ignore', '-g', '**/*.json', rootDir], {
      encoding: 'utf8',
      timeout: 15000,
      maxBuffer: 40 * 1024 * 1024
    });

    const stdout = String(result?.stdout || '');
    if (!stdout) {
      return [];
    }

    const matches = [];
    const seen = new Set();
    for (const line of stdout.split('\n')) {
      const trimmed = String(line || '').trim();
      if (!trimmed) {
        continue;
      }

      const absolutePath = path.isAbsolute(trimmed) ? path.resolve(trimmed) : path.resolve(rootDir, trimmed);
      const relativePath = path.relative(rootDir, absolutePath);
      if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        continue;
      }

      if (!safeFileExists(absolutePath) || path.extname(absolutePath).toLowerCase() !== '.json') {
        continue;
      }

      const normalized = path.normalize(absolutePath);
      if (seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      matches.push(normalized);
    }

    return matches;
  } catch (_error) {
    return [];
  }
}

function extractIndexedJsonPathsWithJq(indexPath) {
  try {
    const result = spawnSync('jq', ['-r', '.. | objects | .path? // empty', indexPath], {
      encoding: 'utf8',
      timeout: 10000,
      maxBuffer: 20 * 1024 * 1024
    });

    if (!result || result.status !== 0) {
      return [];
    }

    const entries = [];
    const seen = new Set();
    const raw = String(result.stdout || '');
    for (const line of raw.split('\n')) {
      const candidate = String(line || '').trim();
      if (!candidate || path.extname(candidate).toLowerCase() !== '.json') {
        continue;
      }

      const normalizedCandidate = candidate.replace(/^\/?AI-CONTEXT\/?/i, '').replace(/^\/+/, '');
      const absolutePath = path.resolve(AI_CONTEXT_ROOT, normalizedCandidate);
      const relativePath = path.relative(AI_CONTEXT_ROOT, absolutePath);

      if (!relativePath || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
        continue;
      }

      if (!safeFileExists(absolutePath)) {
        continue;
      }

      const normalized = path.normalize(absolutePath);
      if (seen.has(normalized)) {
        continue;
      }

      seen.add(normalized);
      entries.push(normalized);
    }

    return entries;
  } catch (_error) {
    return [];
  }
}

function collectAiContextIndexFiles(rootDir) {
  const discovered = listJsonFilesWithRipgrep(rootDir)
    .filter((filePath) => path.basename(filePath).toLowerCase() === 'ai-context-index.json');

  if (discovered.length > 0) {
    return discovered;
  }

  const fallback = [];
  for (const filePath of collectJsonFiles(rootDir, 12, 0, [])) {
    if (path.basename(filePath).toLowerCase() === 'ai-context-index.json') {
      fallback.push(filePath);
    }
  }

  return fallback;
}

function discoverAiContextJsonCorpusFiles() {
  const discovered = new Set();
  const discoveryMeta = {
    requested_root: AI_CONTEXT_ROOT,
    rg_discovered: 0,
    index_file_count: 0,
    index_reference_count: 0,
    fallback_used: false,
    fallback_paths_added: 0,
    reasons: []
  };

  const rgDiscovered = listJsonFilesWithRipgrep(AI_CONTEXT_ROOT);
  discoveryMeta.rg_discovered = rgDiscovered.length;
  for (const entry of rgDiscovered) {
    discovered.add(entry);
  }

  const indexFiles = collectAiContextIndexFiles(AI_CONTEXT_ROOT);
  discoveryMeta.index_file_count = indexFiles.length;
  for (const indexFile of indexFiles) {
    const extracted = extractIndexedJsonPathsWithJq(indexFile);
    discoveryMeta.index_reference_count += extracted.length;
    for (const extractedPath of extracted) {
      discovered.add(extractedPath);
    }
  }

  if (discovered.size < KNOWLEDGE_CORPUS_FALLBACK_THRESHOLD) {
    discoveryMeta.fallback_used = true;
    discoveryMeta.reasons.push(`Fallback triggered: ${discovered.size} candidate files found by rg+index (threshold ${KNOWLEDGE_CORPUS_FALLBACK_THRESHOLD})`);
    const fallbackSizeBefore = discovered.size;
    const fallbackPaths = collectJsonFiles(AI_CONTEXT_ROOT, 12, 0, []);
    for (const fallbackPath of fallbackPaths) {
      discovered.add(fallbackPath);
    }
    discoveryMeta.fallback_paths_added = discovered.size - fallbackSizeBefore;
  }

  const orderedPaths = Array.from(discovered).sort();
  return {
    paths: orderedPaths,
    meta: discoveryMeta
  };
}

function buildQuickAnswersFromText(text, maxAnswers = 2) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean) {
    return [];
  }

  const sentences = clean
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);
  return sentences.slice(0, maxAnswers);
}

function normalizeCorpusText(text) {
  const clean = String(text || '')
    .replace(/\s+/g, ' ')
    .replace(/[\u0000-\u001f]/g, ' ')
    .trim();

  return clean.slice(0, 9000);
}

function extractSnippet(text, terms, snippetLength = 240) {
  const normalizedText = String(text || '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normalizedText) {
    return '';
  }

  const lowerText = normalizedText.toLowerCase();
  let matchIndex = -1;
  for (const term of terms) {
    const found = lowerText.indexOf(term.toLowerCase());
    if (found !== -1) {
      matchIndex = found;
      break;
    }
  }

  if (matchIndex === -1) {
    return normalizedText.slice(0, snippetLength);
  }

  const start = Math.max(0, matchIndex - 120);
  const end = Math.min(normalizedText.length, start + snippetLength);

  const prefix = start > 0 ? '...' : '';
  const suffix = end < normalizedText.length ? '...' : '';

  return `${prefix}${normalizedText.slice(start, end)}${suffix}`;
}

function scoreAndRankKnowledgeItem(item, terms) {
  const text = normalizeCorpusText(item.text || '').toLowerCase();
  const words = new Set(tokenizeText(text));
  const concept = String(item.concept || '').toLowerCase();
  const itemPath = String(item.path || '').toLowerCase();

  let score = 0;
  const matchedTerms = [];
  const queryTerms = Array.from(new Set(terms || [])).filter((term) => term.length > 1);

  for (const term of queryTerms) {
    const hasExactWord = words.has(term);
    const inText = text.includes(term);
    const inPath = itemPath.includes(term);
    const inConcept = concept.includes(term);

    if (hasExactWord) {
      score += 12;
      matchedTerms.push(term);
    }

    if (inConcept) {
      score += 8;
    }

    if (inPath) {
      score += 6;
    }

    if (inText && !hasExactWord) {
      score += term.length < 4 ? 4 : 10;
    }

    if (term.length >= 4) {
      for (const word of words) {
        if (word.startsWith(term)) {
          score += 6;
          break;
        }
      }
    }
  }

  const minimumScore = terms.length <= 2 ? 12 : 18;
  if (score < minimumScore) {
    return null;
  }

  const uniqueMatchedTerms = Array.from(new Set(matchedTerms)).slice(0, 12);
  const snippet = extractSnippet(item.text || '', queryTerms);
  const confidence = Number(Math.min(0.98, score / 35).toFixed(2));

  return {
    concept: item.concept,
    confidence,
    path: item.path,
    matched_terms: uniqueMatchedTerms,
    score,
    snippet,
    quick_answers: item.quick_answers || [],
    related_concepts: item.related_concepts || []
  };
}

function findKnowledgeMatches(corpus, queryTerms, contextTerms) {
  const terms = Array.from(new Set([...(queryTerms || []), ...(contextTerms || [])]))
    .map((term) => String(term).toLowerCase())
    .filter((term) => term.length > 1);

  if (terms.length === 0) {
    return [];
  }

  const ranked = [];

  for (const item of corpus) {
    const scored = scoreAndRankKnowledgeItem(item, terms);
    if (!scored) {
      continue;
    }
    ranked.push(scored);
  }

  return ranked.sort((a, b) => b.score - a.score || a.concept.localeCompare(b.concept));
}

function buildKnowledgeCorpus() {
  const now = Date.now();
  if (
    knowledgeCorpusCache.loadedAt > 0 &&
    now - knowledgeCorpusCache.loadedAt < KNOWLEDGE_CACHE_TTL_MS &&
    knowledgeCorpusCache.entries.length > 0
  ) {
    return knowledgeCorpusCache.entries;
  }

  const entries = [];
  const includedPaths = new Set();
  const discovery = discoverAiContextJsonCorpusFiles();
  knowledgeCorpusCache.loadedAt = now;
  knowledgeCorpusCache.entries = [];
  knowledgeCorpusCache.discovery = {
    loadedAt: now,
    meta: discovery.meta
  };
  const corpusFiles = Array.isArray(discovery.paths) ? discovery.paths : [];
  if (discovery.meta) {
    discovery.meta.total_discovered = corpusFiles.length;
    discovery.meta.discovery_time = new Date(now).toISOString();
    if (corpusFiles.length < KNOWLEDGE_CORPUS_WARNING_THRESHOLD) {
      if (!Array.isArray(discovery.meta.reasons)) {
        discovery.meta.reasons = [];
      }
      discovery.meta.reasons.push(
        `Corpus size is below threshold (${corpusFiles.length} < ${KNOWLEDGE_CORPUS_WARNING_THRESHOLD}). Investigate discovery and index completeness.`
      );
    }
  }

  for (const absolutePath of corpusFiles) {
    if (includedPaths.has(absolutePath) || !safeFileExists(absolutePath)) {
      continue;
    }

    const raw = readSafeText(absolutePath, 250000);
    if (!raw) {
      continue;
    }

    const fragments = [];
    let parsed = null;
    try {
      parsed = JSON.parse(raw);
      collectTextFromValue(parsed, fragments);
    } catch (_error) {
      collectTextFromValue({ raw }, fragments);
    }

    const fileRelativePath = path.relative(AI_CONTEXT_ROOT, absolutePath).replace(/\\/g, '/');
    const concept = String(parsed?.concept || parsed?.name || parsed?.title || path.basename(absolutePath, '.json')).trim();
    const summary = String(parsed?.executive_summary || parsed?.summary || parsed?.description || '').trim();
    const mission = String(parsed?.mission || '').trim();
    const quickAnswers =
      parsed && Array.isArray(parsed.quick_answers) && parsed.quick_answers.length > 0
        ? parsed.quick_answers
        : buildQuickAnswersFromText([concept, summary, mission].filter(Boolean).join('. '));
    const domainCategory = path
      .dirname(fileRelativePath)
      .replace(/^\.\//, '')
      .split('/')
      .filter(Boolean)[0] || 'unknown';
    const relatedConcepts = Array.from(
      new Set([
        domainCategory,
        path.basename(absolutePath, '.json'),
        ...(Array.isArray(parsed?.related_concepts) ? parsed.related_concepts : []),
        ...(Array.isArray(parsed?.tags) ? parsed.tags : [])
      ].filter(Boolean))
    );

    entries.push({
      source: 'ai-context',
      concept,
      path: `AI-CONTEXT/${fileRelativePath}`,
      absolutePath,
      text: normalizeCorpusText([concept, summary, mission, ...fragments].join('\n')),
      quick_answers: quickAnswers,
      related_concepts: relatedConcepts
    });
    includedPaths.add(absolutePath);
  }

  knowledgeCorpusCache.entries = entries;

  return entries;
}

function loadAgents() {
  try {
    const raw = fs.readFileSync(AGENT_INDEX_PATH, 'utf8');
    const index = JSON.parse(raw);
    const agentsRaw = index.agents || {};
    const agents = Array.isArray(agentsRaw)
      ? agentsRaw
      : Object.entries(agentsRaw).map(([agentId, agentData]) => ({
          ...agentData,
          agent_id: agentData?.agent_id || agentId,
          agent_type: agentData?.agent_type || agentId
        }));
    const membershipLookup = buildAgentMembershipLookup();

    return agents
      .filter((agent) => agent && typeof agent === 'object' && agent.status === 'active')
      .map((agent) => {
        const rawKey = agent.agent_type || agent.agent_id;
        const key = normalizeAgentLookupKey(rawKey);
        let file = String(agent.file || agent.json_config || `${rawKey}.nodus.json`).trim();
        if (!file) {
          file = `${key}.nodus.json`;
        } else if (!/\.json$/i.test(file)) {
          file = `${file}.nodus.json`;
        }
        const priority = String(agent.priority_level || agent.priority || 'medium').toLowerCase();
        const expertise = Array.isArray(agent.expertise) ? agent.expertise : [];
        const keywords = Array.isArray(agent.keywords) ? agent.keywords : [];
        const consultWhen = Array.isArray(agent.consult_when) ? agent.consult_when : [];
        const keyPatterns = Array.isArray(agent.key_patterns) ? agent.key_patterns : [];
        const truthLens = String(agent.truth_lens || '').toLowerCase();

        const capabilities = [
          keywords.join(' '),
          expertise.join(' '),
          consultWhen.join(' '),
          keyPatterns.join(' '),
          truthLens
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        const termVector = buildAgentTermVector({
          mission: agent.mission,
          capabilities,
          expertise,
          keywords,
          consult_when: consultWhen,
          key_patterns: keyPatterns,
          truth_lens: truthLens
        });

        const lookupKeys = buildAgentLookupKeys({
          key: rawKey,
          file
        });
        const cohorts = dedupeByCohortId(
          lookupKeys.flatMap((lookupKey) => membershipLookup.get(lookupKey) || [])
        );

        return {
          key,
          file,
          capabilities,
          mission: (agent.mission || '').toLowerCase(),
          priority,
          expertise,
          keywords,
          consult_when: consultWhen,
          key_patterns: keyPatterns,
          truth_lens: truthLens,
          tier: agent.tier || 'specialist',
          agent_type: agent.agent_type || key,
          name: agent.name || key,
          cohorts,
          termVector,
          priority_weight: COHORT_PRIORITY_WEIGHTS[priority] || COHORT_PRIORITY_WEIGHTS.medium
        };
      })
      .filter((agent) => typeof agent.key === 'string' && agent.key.trim().length > 0);
  } catch (error) {
    console.error('Failed to load AI-AGENT-INDEX.json', error);
    return [];
  }
}

function loadCohorts() {
  const now = Date.now();
  if (cohortsCache.loadedAt > 0 && cohortsCache.data) {
    return cohortsCache.data;
  }

  try {
    const raw = fs.readFileSync(COHORTS_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    cohortsCache.loadedAt = now;
    cohortsCache.data = parsed;
    return parsed;
  } catch (error) {
    console.error('Failed to load LEGIOX-COHORTS.json', error);
    cohortsCache.loadedAt = now;
    cohortsCache.data = { cohorts: {} };
    return cohortsCache.data;
  }
}

function buildAgentMembershipLookup() {
  const cohorts = loadCohorts();
  const index = new Map();
  const items = cohorts && cohorts.cohorts ? Object.entries(cohorts.cohorts) : [];

  for (const [cohortId, cohort] of items) {
    const members = Array.isArray(cohort.members) ? cohort.members : [];
    const cohortPriority = String(cohort.priority || 'medium').toLowerCase();
    const cohortWeight = COHORT_PRIORITY_WEIGHTS[cohortPriority] || COHORT_PRIORITY_WEIGHTS.medium;

    for (const member of members) {
      if (!member || typeof member !== 'object') {
        continue;
      }

      const lookupKeys = buildAgentLookupKeys({
        key: member.agent || member.agent_type || '',
        file: member.json_config || ''
      });

      for (const normalizedId of lookupKeys) {
        const current = index.get(normalizedId) || [];
        current.push({
          cohort_id: String(member.cohort_id || cohortId),
          cohort_name: cohort.name || cohortId,
          source_name: cohortId,
          cohort_priority: cohortPriority,
          priority_weight: cohortWeight,
          member_priority: String(member.priority || 'medium').toLowerCase(),
          member_file: member.json_config || `${normalizedId}.nodus.json`,
          member_domain: member.domain || ''
        });
        index.set(normalizedId, current);
      }
    }
  }

  return index;
}

function buildAgentLookupKeys(input) {
  const candidates = [
    input?.key || '',
    input?.file || ''
  ];
  const keys = [];

  for (const candidate of candidates) {
    if (!candidate) continue;
    keys.push(normalizeAgentLookupKey(candidate));
    keys.push(normalizeAgentLookupKey(String(candidate).replace(/_v\d+$/i, '')));
  }

  return Array.from(new Set(
    keys
      .filter(Boolean)
      .map((item) => String(item).toLowerCase())
  ));
}

function dedupeByCohortId(items) {
  const seen = new Set();
  const output = [];
  for (const item of items) {
    const key = `${item.cohort_id || item.source_name || ''}::${item.member_file || ''}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    output.push(item);
  }
  return output;
}

function normalizeAgentLookupKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/\.nodus\.json$/i, '')
    .replace(/\.json$/i, '')
    .replace(/[-\s]/g, '_')
    .replace(/_v\d+$/i, '')
    .trim();
}

function buildAgentTermVector(agentPayload) {
  const vector = new Map();
  const fieldWeights = {
    mission: 4,
    expertise: 3.2,
    keywords: 2.6,
    consult_when: 3,
    key_patterns: 2.3,
    truth_lens: 2.8,
    capabilities: 1.5
  };

  const fields = [
    { text: agentPayload.mission || '', weight: fieldWeights.mission },
    { text: Array.isArray(agentPayload.expertise) ? agentPayload.expertise.join(' ') : '', weight: fieldWeights.expertise },
    { text: Array.isArray(agentPayload.keywords) ? agentPayload.keywords.join(' ') : '', weight: fieldWeights.keywords },
    { text: Array.isArray(agentPayload.consult_when) ? agentPayload.consult_when.join(' ') : '', weight: fieldWeights.consult_when },
    { text: Array.isArray(agentPayload.key_patterns) ? agentPayload.key_patterns.join(' ') : '', weight: fieldWeights.key_patterns },
    { text: agentPayload.truth_lens || '', weight: fieldWeights.truth_lens },
    { text: agentPayload.capabilities || '', weight: fieldWeights.capabilities }
  ];

  for (const field of fields) {
    const value = String(field.text || '')
      .toLowerCase()
      .replace(/[^a-z0-9_\s]/g, ' ');
    const tokens = tokenizeText(value, { removeStopWords: true });
    for (const token of tokens) {
      const current = vector.get(token) || 0;
      vector.set(token, current + field.weight);
    }
  }

  return Object.fromEntries(vector);
}

function safeFileExists(candidatePath) {
  try {
    return fs.existsSync(candidatePath);
  } catch (_error) {
    return false;
  }
}

function sqlLiteral(value) {
  return String(value || '').replace(/'/g, "''");
}

function resolveRegistryProjectAndPath(absolutePath) {
  try {
    const normalizedRoot = path.resolve(RINGDOM_ROOT);
    const normalizedPath = path.resolve(absolutePath);
    const relativeFromRoot = path.relative(normalizedRoot, normalizedPath);
    if (!relativeFromRoot || relativeFromRoot.startsWith('..')) return null;

    const parts = relativeFromRoot.split(path.sep).filter(Boolean);
    if (parts.length < 2) return null;
    return {
      projectName: parts[0],
      relativePath: parts.slice(1).join('/').replace(/\\/g, '/')
    };
  } catch (_error) {
    return null;
  }
}

function queryRegistryEntry(projectName, relativePath) {
  const query = `
    SELECT fr.id
    FROM file_registry fr
    JOIN file_projects fp ON fp.id = fr.project_id
    WHERE fp.name = '${sqlLiteral(projectName)}'
      AND fr.relative_path = '${sqlLiteral(relativePath)}'
    LIMIT 1;
  `.trim();

  const psqlArgs = [
    '-U', RINGDOM_PG_USER,
    '-d', RINGDOM_PG_DATABASE,
    '-At',
  ];
  if (RINGDOM_PG_HOST) {
    psqlArgs.unshift('-h', RINGDOM_PG_HOST);
    if (!RINGDOM_PG_HOST.startsWith('/')) {
      psqlArgs.push('-p', RINGDOM_PG_PORT);
    }
  }
  psqlArgs.push('-c', query);

  const proc = spawnSync('psql', psqlArgs, {
    encoding: 'utf8',
    env: { ...process.env, PGPASSWORD: RINGDOM_PG_PASSWORD },
    timeout: 8000,
    maxBuffer: 8 * 1024 * 1024
  });

  if (proc.status !== 0) {
    return {
      connected: false,
      entryFound: false,
      error: (proc.stderr || proc.stdout || '').trim() || 'registry query failed'
    };
  }

  const output = (proc.stdout || '').trim();
  return {
    connected: true,
    entryFound: Boolean(output),
    registryId: output || null
  };
}

function notImplementedToolResponse(toolName, details = {}) {
  return {
    success: true,
    tool: toolName,
    status: 'planned',
    note: 'Tool is registered and discoverable by Cursor. Implementation can be connected to full backend actions.',
    details
  };
}

function runLegacyKnowledgeLookup(queryText, context, debug = false) {
  const queryTerms = tokenizeText(queryText, { removeStopWords: true });
  const contextTerms = tokenizeText(context || '', { removeStopWords: true });
  const knowledgeCorpus = buildKnowledgeCorpus();
  const discovery = knowledgeCorpusCache.discovery || {};
  const discoveryWarnings = Array.isArray(discovery?.meta?.reasons) ? discovery.meta.reasons : [];
  const indexedMatches = findKnowledgeMatches(knowledgeCorpus, queryTerms, contextTerms).map((match) => {
    return {
      concept: match.concept,
      confidence: Number(Math.min(0.98, (match.score / Math.max(queryTerms.length + 1, 1)) / 6).toFixed(2)),
      path: match.path,
      matched_terms: match.matched_terms,
      score: Number(match.score.toFixed(2)),
      snippet: match.snippet,
      quick_answers: match.quick_answers,
      related_concepts: match.related_concepts,
      source: 'ai-context'
    };
  });

  const merged = indexedMatches.sort((a, b) => b.score - a.score).slice(0, 10).map(({ source, ...match }) => match);
  const response = {
    success: true,
    tool: 'legiox-knowledge',
    query: queryText,
    context: context || null,
    source_pool_size: knowledgeCorpus.length,
    total_matches: merged.length,
    matches: merged,
    note: merged.length > 0
      ? 'Knowledge lookup scans all JSON documents under AI-CONTEXT (ripgrep discovery + jq index fallback).'
      : 'No direct matches found. Try 2-3 key terms and add domain context.'
  };

  if (discoveryWarnings.length > 0) {
    response.warnings = discoveryWarnings;
  }

  if (debug === true) {
    response.debug = {
      discovery: {
        loaded_at: discovery.loadedAt,
        meta: discovery.meta
      },
      query_terms: queryTerms,
      context_terms: contextTerms,
      indexed_match_count: indexedMatches.length
    };
  }

  return response;
}

function normalizeSchemaDateValue(payload) {
  const values = [];
  if (payload == null || typeof payload !== 'object') {
    return '';
  }

  const fields = [
    payload.date,
    payload.created_at,
    payload.updated_at,
    payload.date_created,
    payload.date_updated,
    payload.published_at,
    payload.timestamp
  ];

  for (const value of fields) {
    if (typeof value === 'string' && value.trim()) {
      values.push(value.trim());
    }
  }

  return values[0] || '';
}

function extractTextOrArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0);
  }

  const text = normalizeTextValue(value);
  if (!text) {
    return [];
  }
  return [text];
}

function scoreFieldPresence(fieldDescriptor, payloadValue) {
  const { weight, mode } = fieldDescriptor;
  let present = false;
  let detail = '';

  if (mode === 'text') {
    const text = normalizeTextValue(payloadValue);
    present = Boolean(text);
    if (!present) {
      detail = `Missing required ${fieldDescriptor.label} field`;
    }
  } else if (mode === 'array') {
    const values = Array.isArray(payloadValue) ? payloadValue : extractTextOrArray(payloadValue);
    const nonEmpty = values.filter((item) => normalizeTextValue(item).length > 0);
    present = nonEmpty.length > 0;
    if (!present) {
      detail = `Missing valid ${fieldDescriptor.label} list`;
    }
  } else if (mode === 'date') {
    const key = Array.isArray(fieldDescriptor.aliases) && fieldDescriptor.aliases.length > 0 ? fieldDescriptor.aliases[0] : 'date';
    const text = normalizeSchemaDateValue({ [key]: payloadValue });
    present = Boolean(text && String(text).trim());
    if (!present) {
      detail = `Missing valid ${fieldDescriptor.label}`;
    }
  } else if (mode === 'multi') {
    const alternatives = Array.isArray(fieldDescriptor.altValues) ? fieldDescriptor.altValues : [];
    const alternativesWithValues = alternatives.filter((candidate) => extractTextOrArray(candidate.value(payloadValue)).length > 0);
    present = alternativesWithValues.length > 0;
    if (!present) {
      detail = `Missing valid ${fieldDescriptor.label}`;
    }
  } else {
    present = payloadValue !== undefined && payloadValue !== null;
    if (!present) {
      detail = `Missing ${fieldDescriptor.label}`;
    }
  }

  return {
    score: present ? weight : 0,
    present,
    detail,
    rawValue: payloadValue
  };
}

function pickTextCandidates(payload, candidates, fallback = '') {
  const seen = new Set();
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) {
      continue;
    }

    if (typeof candidate === 'string' && candidate.trim()) {
      if (!seen.has(candidate)) {
        seen.add(candidate);
        return candidate;
      }
    } else if (Array.isArray(candidate)) {
      const mapped = candidate
        .map((item) => String(item || '').trim())
        .filter((item) => item.length > 0);
      if (mapped.length > 0) {
        return mapped;
      }
    } else if (candidate && typeof candidate === 'object') {
      const keys = Object.keys(candidate)
        .map((item) => String(item || '').trim())
        .filter((item) => item.length > 0);
      if (keys.length > 0) {
        return keys;
      }
    }
  }

  return fallback;
}

/** 0 = no cap (return all visible rows). Explicit positive n caps the list. */
function normalizeMaxResultFiles(raw) {
  if (raw === undefined || raw === null || raw === '') {
    return 0;
  }
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n <= 0) {
    return 0;
  }
  return Math.min(100000, n);
}

/**
 * Per-class knowledge schema rubric. Replaces the single fictional "knowledge card" rubric.
 * Each rubric returns `{required: string[], recommended: string[]}` field paths (dot.notation supported).
 * Required = high weight (10), recommended = medium weight (4). Threshold: compliant ≥ 82, warning ≥ 60.
 */
const LEGIOX_KNOWLEDGE_CLASS_RUBRICS = {
  concept: {
    required: ['name|title|concept', 'description|executive_summary|summary', 'facts|patterns|core_concepts|examples', 'keywords|tags|terms'],
    recommended: ['relationships|related_concepts', 'created|date|updated']
  },
  implementation: {
    required: ['name|title|implementation_id', 'summary|description', 'facts|patterns|changes|features', 'relationships.affects|relationships.consumed_by|relationships|files_affected'],
    recommended: ['entry_points|endpoints|examples', 'status|date|created']
  },
  pattern: {
    required: ['name|title', 'description|summary', 'patterns|examples|core_principles|best_practices'],
    recommended: ['keywords|tags', 'truth_lens_agents|related_concepts']
  },
  workflow: {
    required: ['name|title', 'description|summary', 'steps|flow|stages|phases|workflow_steps'],
    recommended: ['entry_points|triggers', 'keywords|tags']
  },
  troubleshooting: {
    required: ['name|title|symptom|problem', 'symptoms|problems|issue|error', 'solutions|fix|resolution|remedies'],
    recommended: ['keywords|tags|terms', 'pitfalls|root_cause|warnings']
  },
  timeline: {
    required: ['name|title|date|summary', 'milestones|events|entries|timeline|date'],
    recommended: ['project|scope', 'description|summary']
  },
  index: {
    required: ['concept_index|index_links|relations|projects|by_id|knowledge_nodes|sections'],
    recommended: ['_meta|metadata', 'updated|version|context_version']
  },
  core: {
    required: ['name|title', 'description|summary|overview'],
    recommended: ['keywords|tags', 'relationships|related']
  },
  feature: {
    required: ['name|title|feature', 'description|summary|user_story'],
    recommended: ['keywords|tags', 'acceptance_criteria|requirements']
  },
  service: {
    required: ['name|title', 'description|summary'],
    recommended: ['endpoints|api|interface', 'keywords|tags']
  },
  integration_guide: {
    required: ['name|title', 'description|summary|overview', 'steps|setup|configuration'],
    recommended: ['keywords|tags', 'examples']
  },
  freeform: {
    required: ['name|title|concept|label', 'description|summary|overview'],
    recommended: ['keywords|tags|terms']
  }
};

const LEGIOX_KNOWLEDGE_CLASS_LABEL = {
  concept: 'concept',
  implementation: 'implementation',
  pattern: 'pattern',
  workflow: 'workflow',
  troubleshooting: 'troubleshooting',
  timeline: 'timeline',
  index: 'index',
  core: 'core',
  feature: 'feature',
  service: 'service',
  integration_guide: 'integration_guide',
  freeform: 'freeform'
};

/** Resolve dot-path on payload (`relationships.affects`); returns undefined if any segment missing. */
function resolveDottedPath(obj, dotted) {
  if (!obj || typeof obj !== 'object' || !dotted) return undefined;
  const parts = String(dotted).split('.');
  let cur = obj;
  for (const part of parts) {
    if (cur === null || cur === undefined) return undefined;
    if (typeof cur !== 'object') return undefined;
    cur = cur[part];
  }
  return cur;
}

/** True if value is meaningfully present (non-empty string / non-empty array / non-empty object / number / boolean). */
function isMeaningfullyPresent(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some((item) => isMeaningfullyPresent(item));
  if (typeof value === 'object') return Object.keys(value).length > 0;
  if (typeof value === 'number') return Number.isFinite(value);
  if (typeof value === 'boolean') return true;
  return false;
}

/** Field spec is `a|b|c` — first present alternative wins. Returns {present, matchedKey}. */
function findFirstPresentField(payload, fieldSpec) {
  const alts = String(fieldSpec).split('|').map((s) => s.trim()).filter(Boolean);
  for (const alt of alts) {
    const value = alt.includes('.') ? resolveDottedPath(payload, alt) : payload[alt];
    if (isMeaningfullyPresent(value)) {
      return { present: true, matchedKey: alt };
    }
  }
  return { present: false, matchedKey: null, primaryKey: alts[0] || fieldSpec };
}

/** Classify an AI-CONTEXT document into one of the rubric classes, using path + payload signals. */
function classifyKnowledgeDoc(filePath, payload) {
  const safePayload = (payload && typeof payload === 'object' && !Array.isArray(payload)) ? payload : {};
  const base = path.basename(filePath);
  const baseLower = base.toLowerCase();
  const norm = String(filePath).replace(/\\/g, '/').toLowerCase();

  if (
    baseLower === 'ai-context-root.json'
    || baseLower === 'ai-context-map.json'
    || /ai-context-index\.json$/i.test(base)
    || /-index\.json$/i.test(base) && norm.includes('/ai-context/')
  ) {
    return 'index';
  }

  const objectType = typeof safePayload.object_type === 'string' ? safePayload.object_type.trim().toLowerCase() : '';
  if (['navigation', 'master_context', 'ai_first_root', 'concept_index', 'registry'].includes(objectType)) {
    return 'index';
  }

  if (norm.includes('/implementations/') || isMeaningfullyPresent(safePayload.implementation_id)) {
    return 'implementation';
  }
  if (norm.includes('/troubleshooting/') || objectType === 'troubleshooting' || (typeof safePayload.concept_type === 'string' && /troubleshoot/i.test(safePayload.concept_type))) {
    return 'troubleshooting';
  }
  if (norm.includes('/patterns/') || (typeof safePayload.type === 'string' && /pattern/i.test(safePayload.type))) {
    return 'pattern';
  }
  if (norm.includes('/workflows/') || (typeof safePayload.type === 'string' && /workflow|flow/i.test(safePayload.type))) {
    return 'workflow';
  }
  if (norm.includes('/timeline/')) {
    return 'timeline';
  }
  if (norm.includes('/integration-guides/')) {
    return 'integration_guide';
  }
  if (norm.includes('/services/')) {
    return 'service';
  }
  if (norm.includes('/features/')) {
    return 'feature';
  }
  if (norm.includes('/core/')) {
    return 'core';
  }
  if (
    norm.includes('/concepts/')
    || objectType === 'concept'
    || objectType === 'ringdom_concept'
    || isMeaningfullyPresent(safePayload.concept_type)
    || (typeof safePayload.type === 'string' && safePayload.type.trim().toLowerCase() === 'concept')
  ) {
    return 'concept';
  }

  return 'freeform';
}

/** Score a single document against its class rubric. */
function validateKnowledgeDocByClass(filePath, payload, klass, includeFieldScores = false) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      file: filePath,
      class: klass || 'freeform',
      score: 0,
      status: 'non_compliant',
      valid: false,
      issues: ['Invalid JSON object'],
      missing_required: ['(payload)'],
      missing_recommended: [],
      field_scores: {}
    };
  }

  const rubric = LEGIOX_KNOWLEDGE_CLASS_RUBRICS[klass] || LEGIOX_KNOWLEDGE_CLASS_RUBRICS.freeform;
  const requiredWeight = 10;
  const recommendedWeight = 4;

  let gained = 0;
  let max = 0;
  const issues = [];
  const missingRequired = [];
  const missingRecommended = [];
  const fieldScores = {};

  for (const spec of rubric.required) {
    const probe = findFirstPresentField(payload, spec);
    max += requiredWeight;
    if (probe.present) {
      gained += requiredWeight;
      fieldScores[spec] = { score: requiredWeight, weight: requiredWeight, present: true, matched: probe.matchedKey };
    } else {
      issues.push(`Missing required field: ${spec}`);
      missingRequired.push(spec);
      fieldScores[spec] = { score: 0, weight: requiredWeight, present: false };
    }
  }

  for (const spec of rubric.recommended) {
    const probe = findFirstPresentField(payload, spec);
    max += recommendedWeight;
    if (probe.present) {
      gained += recommendedWeight;
      fieldScores[spec] = { score: recommendedWeight, weight: recommendedWeight, present: true, matched: probe.matchedKey };
    } else {
      missingRecommended.push(spec);
      fieldScores[spec] = { score: 0, weight: recommendedWeight, present: false };
    }
  }

  const score = max > 0 ? Math.round((gained / max) * 100) : 0;
  const status = score >= LEGIOX_SCHEMA_COMPLIANT_SCORE ? 'compliant' : score >= 60 ? 'warning' : 'non_compliant';

  return {
    file: filePath,
    class: LEGIOX_KNOWLEDGE_CLASS_LABEL[klass] || klass || 'freeform',
    score,
    status,
    valid: status === 'compliant',
    issues,
    missing_required: missingRequired,
    missing_recommended: missingRecommended,
    field_scores: includeFieldScores ? fieldScores : {}
  };
}

/** Build short, actionable tips out of the validation rows. */
function buildKnowledgeTips(rows, limit = 8) {
  const counter = new Map();
  for (const row of rows) {
    if (!row || row.status === 'compliant') continue;
    const klass = row.class || 'freeform';
    for (const miss of row.missing_required || []) {
      const key = `[${klass}] add required field: ${miss}`;
      counter.set(key, (counter.get(key) || 0) + 1);
    }
    for (const miss of row.missing_recommended || []) {
      const key = `[${klass}] add recommended field: ${miss}`;
      counter.set(key, (counter.get(key) || 0) + 1);
    }
  }
  return Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([msg, count]) => `${msg} (affects ${count} file${count === 1 ? '' : 's'})`);
}

/**
 * (Deprecated heuristic kept for back-compat callers.)
 * Returns true when a file looks like a legacy hand-written knowledge card.
 */
function shouldApplyLegacyKnowledgeCardValidation(filePath, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return true;
  }
  const base = path.basename(filePath);
  const baseLower = base.toLowerCase();
  const norm = String(filePath).replace(/\\/g, '/').toLowerCase();

  if (baseLower === 'ai-context-root.json' || baseLower === 'ai-context-map.json') {
    return false;
  }
  if (/ai-context-index\.json$/i.test(base)) {
    return false;
  }

  if (
    norm.includes('/concepts/')
    || norm.includes('/implementations/')
    || norm.includes('/troubleshooting/')
  ) {
    return false;
  }

  if (typeof payload.concept_type === 'string' && payload.concept_type.trim()) {
    return false;
  }

  const objectType = typeof payload.object_type === 'string' ? payload.object_type.trim().toLowerCase() : '';
  if (objectType === 'navigation' || objectType === 'registry') {
    return false;
  }

  if (typeof payload.implementation_id === 'string' && payload.implementation_id.trim()) {
    return false;
  }

  if (payload.projects && payload.workspace && payload._meta) {
    return false;
  }

  if (payload.knowledge_card === true) {
    return true;
  }

  const typeStr = typeof payload.type === 'string' ? payload.type.trim() : '';
  const docTypeStr = typeof payload.document_type === 'string' ? payload.document_type.trim() : '';
  const hasType = Boolean(typeStr || docTypeStr);
  const termsLen = Array.isArray(payload.terms) ? payload.terms.filter((t) => t !== null && t !== undefined && String(t).trim()).length : 0;
  const tagsLen = Array.isArray(payload.tags) ? payload.tags.filter((t) => t !== null && t !== undefined && String(t).trim()).length : 0;

  if (termsLen > 0 || tagsLen > 0) {
    return true;
  }
  if (hasType) {
    return true;
  }
  return false;
}

function validateKnowledgeSchemaDocument(filePath, payload, includeFieldScores = false) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      file: filePath,
      scope: 'knowledge',
      score: 0,
      status: 'non_compliant',
      issues: ['Invalid JSON object for knowledge file'],
      field_scores: {},
      valid: false
    };
  }

  const nameCandidates = [
    payload.name,
    payload.title,
    payload.concept,
    payload.label,
    payload.slug,
    path.basename(filePath, '.json')
  ];
  const terms = pickTextCandidates(payload, [payload.terms, payload.tags, payload.keywords], []);
  const problems = pickTextCandidates(payload, [payload.problems, payload.issue, payload.issues], []);
  const solutions = pickTextCandidates(payload, [payload.solutions, payload.fix, payload.resolution], []);
  const pitfalls = pickTextCandidates(payload, [payload.pitfalls, payload.warnings, payload.risks], []);
  const decisions = pickTextCandidates(payload, [payload.decisions, payload.choices, payload.lessons], []);
  const filesAffected = pickTextCandidates(
    payload,
    [payload.files_affected, payload.filesAffected, payload['files-affected'], payload.files, payload.file]
  );
  const insights = pickTextCandidates(payload, [payload.insights, payload.hints, payload.learned, payload['ah_moments']], []);
  const descriptions = pickTextCandidates(
    payload,
    [payload.description, payload.descriptions, payload.summary, payload.executive_summary, payload.overview]
  );
  const project = pickTextCandidates(payload, [payload.project, payload.scope, payload.repository], []);

  const fieldChecks = [
    {
      id: 'type',
      label: 'type',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.type,
      mode: 'text',
      value: payload.type || payload.document_type
    },
    {
      id: 'name',
      label: 'name',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.name,
      mode: 'text',
      value: pickTextCandidates(payload, nameCandidates)
    },
    {
      id: 'terms',
      label: 'terms',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.terms,
      mode: 'array',
      value: terms
    },
    {
      id: 'date',
      label: 'date',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.date,
      mode: 'text',
      value: normalizeSchemaDateValue(payload)
    },
    {
      id: 'problems',
      label: 'problems',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.problems,
      mode: 'array',
      value: problems
    },
    {
      id: 'solutions',
      label: 'solutions',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.solutions,
      mode: 'array',
      value: solutions
    },
    {
      id: 'pitfalls',
      label: 'pitfalls',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.pitfalls,
      mode: 'array',
      value: pitfalls
    },
    {
      id: 'decisions',
      label: 'decisions',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.decisions,
      mode: 'array',
      value: decisions
    },
    {
      id: 'files_affected',
      label: 'files_affected',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.files_affected,
      mode: 'array',
      value: filesAffected
    },
    {
      id: 'insights',
      label: 'insights',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.insights,
      mode: 'array',
      value: insights
    },
    {
      id: 'descriptions',
      label: 'descriptions',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.descriptions,
      mode: 'array',
      value: descriptions
    },
    {
      id: 'project',
      label: 'project',
      weight: LEGIOX_KNOWLEDGE_SCHEMA_WEIGHTS.project,
      mode: 'text',
      value: project
    }
  ];

  const fieldScores = {};
  let gained = 0;
  let max = 0;
  const issues = [];
  for (const check of fieldChecks) {
    const score = scoreFieldPresence(check, check.value);
    fieldScores[check.id] = {
      score: score.score,
      weight: check.weight,
      present: score.present,
      details: score.detail
    };
    gained += score.score;
    max += check.weight;
    if (!score.present) {
      issues.push(score.detail || `Missing ${check.label}`);
    }
  }

  const score = max > 0 ? Math.round((gained / max) * 100) : 0;
  const status = score >= LEGIOX_SCHEMA_COMPLIANT_SCORE ? 'compliant' : score >= 70 ? 'warning' : 'non_compliant';
  const payloadForMeta = {
    concept: pickTextCandidates(payload, [payload.concept, payload.name, payload.title], path.basename(filePath, '.json')),
    type: payload.type || payload.document_type || '',
    terms_count: Array.isArray(terms) ? terms.length : 0,
    pitfalls_count: Array.isArray(pitfalls) ? pitfalls.length : 0,
    insights_count: Array.isArray(insights) ? insights.length : 0
  };

  return {
    file: filePath,
    scope: 'knowledge',
    score,
    status,
    valid: status === 'compliant',
    issues,
    field_scores: includeFieldScores ? fieldScores : {},
    metadata: payloadForMeta
  };
}

function validateTruthLensAgentRecord(sourcePath, sourceKey, payload, existingAgentIndex = {}, crossCheck = false, includeFieldScores = false) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      file: sourcePath,
      scope: 'agents',
      score: 0,
      status: 'non_compliant',
      issues: ['Invalid truth-lens agent payload'],
      field_scores: {},
      valid: false,
      key: sourceKey || ''
    };
  }

  const fileName = path.basename(sourcePath);
  const recordId = normalizeAgentLookupKey(
    payload.agent_id
    || payload.id
    || sourceKey
    || payload.agent_type
    || payload.name
    || fileName
  );
  const missionText = deriveMissionText(payload);
  const truthLensText = deriveTruthLensText(payload);
  const expertise = extractTextOrArray(payload.expertise || payload.capabilities);
  const keywords = extractTextOrArray(payload.keywords || payload.tags || payload.topics);
  const consultWhen = extractTextOrArray(payload.consult_when || payload.trigger_conditions);
  const keyPatterns = extractTextOrArray(payload.key_patterns);
  const priority = normalizeTextValue(payload.priority_level || payload.priority);
  const statusValue = normalizeTextValue(payload.status);

  const checks = [
    {
      id: 'id',
      label: 'id',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.id,
      mode: 'text',
      value: recordId
    },
    {
      id: 'mission',
      label: 'mission',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.mission,
      mode: 'text',
      value: missionText
    },
    {
      id: 'truth_lens',
      label: 'truth_lens',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.truth_lens,
      mode: 'text',
      value: truthLensText
    },
    {
      id: 'expertise',
      label: 'expertise',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.expertise,
      mode: 'array',
      value: expertise
    },
    {
      id: 'keywords',
      label: 'keywords',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.keywords,
      mode: 'array',
      value: keywords
    },
    {
      id: 'consult_when',
      label: 'consult_when',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.consult_when,
      mode: 'array',
      value: consultWhen
    },
    {
      id: 'key_patterns',
      label: 'key_patterns',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.key_patterns,
      mode: 'array',
      value: keyPatterns
    },
    {
      id: 'priority',
      label: 'priority',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.priority,
      mode: 'text',
      value: priority
    },
    {
      id: 'status',
      label: 'status',
      weight: LEGIOX_AGENT_SCHEMA_WEIGHTS.status,
      mode: 'text',
      value: statusValue
    }
  ];

  const fieldScores = {};
  let gained = 0;
  let max = 0;
  const issues = [];
  for (const check of checks) {
    const score = scoreFieldPresence(check, check.value);
    fieldScores[check.id] = {
      score: score.score,
      weight: check.weight,
      present: score.present,
      details: score.detail
    };
    gained += score.score;
    max += check.weight;
    if (!score.present) {
      issues.push(score.detail || `Missing ${check.label}`);
    }
  }

  if (crossCheck) {
    const indexById = existingAgentIndex.byId || {};
    const indexByFile = existingAgentIndex.byFile || {};
    const indexCoverage = indexById[recordId]
      || indexByFile[fileName]
      || indexByFile[truthLensFileStem(fileName) + '.json']
      || indexByFile[truthLensFileStem(fileName) + '.nodus.json'];
    const inIndex = Boolean(indexCoverage);
    if (!inIndex) {
      issues.push(`Agent key '${recordId || fileName}' is not represented in AI-AGENT-INDEX.json`);
      gained = Math.max(0, gained - 8);
    }
    fieldScores.agent_index = {
      score: inIndex ? 8 : 0,
      weight: 8,
      present: inIndex,
      details: inIndex ? 'Agent present in AI-AGENT-INDEX.json' : 'Agent missing from AI-AGENT-INDEX.json'
    };
    max += 8;
  }

  const score = max > 0 ? Math.round((gained / max) * 100) : 0;
  const status = score >= LEGIOX_SCHEMA_COMPLIANT_SCORE ? 'compliant' : score >= 70 ? 'warning' : 'non_compliant';
  return {
    file: sourcePath,
    scope: 'agents',
    key: recordId,
    score,
    status,
    valid: status === 'compliant',
    issues,
    field_scores: includeFieldScores ? fieldScores : {},
    metadata: {
      source_file: sourcePath,
      mission: missionText,
      file_name: fileName,
      truth_lens_length: truthLensText.length,
      agent_type: payload.agent_type || recordId
    }
  };
}

function validateKnowledgeSchemaScope(rootDir, options = {}) {
  const absoluteRoot = path.isAbsolute(rootDir) ? rootDir : path.resolve(LEGIOX_ROOT, rootDir);
  const maxDepth = Number.isFinite(options.maxDepth) ? Math.max(1, Math.min(20, Math.floor(options.maxDepth))) : 12;
  const maxFiles = normalizeMaxResultFiles(options.maxFiles);
  const verbose = options.verbose === true;

  const files = collectJsonFiles(absoluteRoot, maxDepth, 0, []);
  const validated = [];
  let invalidJson = 0;
  for (const file of files) {
    const payload = readSafeJson(file);
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      invalidJson += 1;
      validated.push({
        file,
        class: 'invalid_json',
        score: 0,
        status: 'non_compliant',
        valid: false,
        issues: ['Invalid or unreadable JSON object'],
        missing_required: ['(payload)'],
        missing_recommended: [],
        field_scores: {}
      });
      continue;
    }
    const klass = classifyKnowledgeDoc(file, payload);
    const result = validateKnowledgeDocByClass(file, payload, klass, verbose);
    validated.push(result);
  }

  const compliant = validated.filter((item) => item.status === 'compliant').length;
  const warning = validated.filter((item) => item.status === 'warning').length;
  const nonCompliant = validated.filter((item) => item.status === 'non_compliant').length;

  const byClass = {};
  for (const row of validated) {
    const k = row.class || 'freeform';
    if (!byClass[k]) {
      byClass[k] = { count: 0, compliant: 0, warning: 0, non_compliant: 0, score_sum: 0 };
    }
    byClass[k].count += 1;
    byClass[k][row.status] = (byClass[k][row.status] || 0) + 1;
    byClass[k].score_sum += row.score || 0;
  }
  const byClassReport = {};
  for (const [k, agg] of Object.entries(byClass)) {
    byClassReport[k] = {
      count: agg.count,
      compliant: agg.compliant || 0,
      warning: agg.warning || 0,
      non_compliant: agg.non_compliant || 0,
      average_score: agg.count > 0 ? Number((agg.score_sum / agg.count).toFixed(2)) : 0
    };
  }

  const visible = options.includeNonCompliantOnly
    ? validated.filter((item) => item.status !== 'compliant')
    : validated;
  const finalList = maxFiles > 0 ? visible.slice(0, maxFiles) : visible;
  const scores = validated.map((item) => item.score);
  const average = scores.length > 0
    ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2))
    : 0;
  const compliantThreshold = LEGIOX_SCHEMA_COMPLIANT_SCORE;
  const tips = buildKnowledgeTips(validated, 8);

  return {
    scope: 'knowledge',
    root: absoluteRoot,
    scanned_files: files.length,
    validated_records: validated.length,
    invalid_json_files: invalidJson,
    returned_files: finalList.length,
    compliant_files: compliant,
    warning_files: warning,
    non_compliant_files: nonCompliant,
    compliance_score_threshold: compliantThreshold,
    average_score: average,
    by_class: byClassReport,
    tips,
    files: finalList
  };
}

function validateAgentSchemaScope(rootDir, options = {}) {
  const absoluteRoot = path.isAbsolute(rootDir) ? rootDir : path.resolve(LEGIOX_ROOT, rootDir);
  const maxDepth = Number.isFinite(options.maxDepth) ? Math.max(1, Math.min(20, Math.floor(options.maxDepth))) : 12;
  const maxFiles = normalizeMaxResultFiles(options.maxFiles);
  const verbose = options.verbose === true;
  const crossCheck = options.crossCheckAgentIndex === true;

  const indexData = readSafeJson(AGENT_INDEX_PATH, AGENT_INDEX_JSON_MAX_BYTES) || {};
  const existingIndex = {
    byId: indexData.by_id && typeof indexData.by_id === 'object' ? indexData.by_id : {},
    byFile: {}
  };
  if (indexData.agents && typeof indexData.agents === 'object' && !Array.isArray(indexData.agents)) {
    for (const [id, entry] of Object.entries(indexData.agents)) {
      if (!entry || typeof entry !== 'object') {
        continue;
      }
      const fileName = normalizeTextValue(entry.file || entry.json_config || entry.file_name);
      if (fileName) {
        existingIndex.byFile[fileName] = id;
      }
    }
  }

  const files = collectJsonFiles(absoluteRoot, maxDepth, 0, []);
  const validated = [];
  const sourceFilesWithoutAgents = [];
  const byIdCoverage = new Map();

  for (const sourceFile of files) {
    const baseName = path.basename(sourceFile);
    const sourceParsed = readSafeJson(sourceFile);
    if (!sourceParsed || typeof sourceParsed !== 'object') {
      validated.push({
        file: sourceFile,
        scope: 'agents',
        score: 0,
        status: 'non_compliant',
        valid: false,
        issues: ['Invalid JSON for truth-lens source file'],
        field_scores: {},
        metadata: { source_file: sourceFile }
      });
      continue;
    }

    const records = extractAgentRecordsFromTruthLensPayload(sourceParsed, baseName, existingIndex.byFile);
    if (!Array.isArray(records) || records.length === 0) {
      sourceFilesWithoutAgents.push(sourceFile);
      continue;
    }

    for (const record of records) {
      const recordPayload = record.record || record;
      const key = normalizeAgentLookupKey(
        record.key || recordPayload.agent_type || recordPayload.agent_id || recordPayload.id || truthLensFileStem(path.basename(sourceFile))
      );
      byIdCoverage.set(key, sourceFile);
      const validation = validateTruthLensAgentRecord(
        sourceFile,
        key,
        recordPayload,
        existingIndex,
        crossCheck,
        verbose
      );
      validated.push(validation);
    }
  }

  for (const sourceFile of sourceFilesWithoutAgents) {
    const base = normalizeTextValue(truthLensFileStem(path.basename(sourceFile)));
    if (!byIdCoverage.has(base)) {
      byIdCoverage.set(base, sourceFile);
    }
  }

  const compliant = validated.filter((item) => item.status === 'compliant').length;
  const warning = validated.filter((item) => item.status === 'warning').length;
  const nonCompliant = validated.filter((item) => item.status === 'non_compliant').length;
  const visible = options.includeNonCompliantOnly
    ? validated.filter((item) => item.status !== 'compliant')
    : validated;
  const finalList = maxFiles > 0 ? visible.slice(0, maxFiles) : visible;

  const scores = validated.map((item) => item.score);
  const average = scores.length > 0
    ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2))
    : 0;
  const compliantThreshold = LEGIOX_SCHEMA_COMPLIANT_SCORE;

  const crossCheckReport = crossCheck
    ? {
      checked_against_agent_index: true,
      index_file: AGENT_INDEX_PATH,
      index_entries: typeof existingIndex.byId === 'object' ? Object.keys(existingIndex.byId).length : 0,
      missing_from_index: Array.from(new Set(
        validated
          .filter((item) => item.issues.some((issue) => issue.includes('not represented')))
          .map((item) => item.key)
          .filter(Boolean)
      ))
    }
    : {
      checked_against_agent_index: false
    };

  return {
    scope: 'agents',
    root: absoluteRoot,
    scanned_files: files.length,
    validated_records: validated.length,
    returned_files: finalList.length,
    compliant_files: compliant,
    warning_files: warning,
    non_compliant_files: nonCompliant,
    compliance_score_threshold: compliantThreshold,
    average_score: average,
    files: finalList,
    cross_check: crossCheckReport
  };
}

function runSchemaValidation({
  target = 'both',
  knowledgeRoot = AI_CONTEXT_ROOT,
  truthLensRoot = TRUTH_LENS_ROOT,
  maxDepth = 12,
  maxFiles = 0,
  includeNonCompliantOnly = false,
  verbose = false,
  crossCheckAgentIndex = false
}) {
  const includeKnowledge = target === 'knowledge' || target === 'both';
  const includeAgents = target === 'agents' || target === 'both';

  const response = {
    tool: 'legiox-validate-schema',
    target,
    status: 'ok',
    schema_version: 'legiox-knowledge-agent-v1',
    options: {
      knowledge_root: knowledgeRoot,
      truth_lens_root: truthLensRoot,
      max_depth: maxDepth,
      max_files: maxFiles,
      include_non_compliant_only: includeNonCompliantOnly,
      verbose,
      cross_check_agent_index: crossCheckAgentIndex
    }
  };

  if (includeKnowledge) {
    response.knowledge = validateKnowledgeSchemaScope(knowledgeRoot, {
      maxDepth,
      maxFiles,
      verbose,
      includeNonCompliantOnly
    });
  }

  if (includeAgents) {
    response.agents = validateAgentSchemaScope(truthLensRoot, {
      maxDepth,
      maxFiles,
      verbose,
      crossCheckAgentIndex,
      includeNonCompliantOnly
    });
  }

  return response;
}

function runCodebaseGrep({
  query,
  pathOverride,
  namespace = 'local',
  contextRadius = 4
}) {
  const queryText = String(query || '').trim();
  if (!queryText) {
    throw new Error('Missing required query');
  }

  const absoluteRoot = path.isAbsolute(pathOverride)
    ? pathOverride
    : path.resolve(LEGIOX_ROOT, pathOverride);

  if (!safeFileExists(absoluteRoot)) {
    return {
      tool: namespace === 'kingdom' ? 'legiox-kingdom-grep' : 'legiox-codebase-grep',
      status: 'error',
      query: queryText,
      root: absoluteRoot,
      error: 'Search root not found'
    };
  }

  const pattern = compileSearchPattern(queryText);
  const normalizedQuery = queryText.toLowerCase();
  const maxResults = 120;
  const results = [];

  const walk = (directory, depth = 0, maxDepth = 6) => {
    if (results.length >= maxResults || depth > maxDepth) {
      return;
    }

    let entries = [];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (_error) {
      return;
    }

    for (const entry of entries) {
      if (results.length >= maxResults) {
        return;
      }

      if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'build' || entry.name === '.next') {
        continue;
      }

      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(full, depth + 1, maxDepth);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const content = readSafeText(full, 200000);
      if (!content) {
        continue;
      }

      const lines = content.split('\n');
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        const line = lines[lineIndex] || '';
        const lowerLine = line.toLowerCase();
        const isMatch = pattern ? pattern.test(line) : lowerLine.includes(normalizedQuery);

        if (isMatch) {
          const start = Math.max(0, lineIndex - contextRadius);
          const end = Math.min(lines.length, lineIndex + contextRadius + 1);

          results.push({
            file: `AI-LEGIOX/../${path.relative(LEGIOX_ROOT, full).replace(/\\/g, '/')}`,
            line: lineIndex + 1,
            match: line.trim(),
            context: lines.slice(start, end).join('\n').trim()
          });
          break;
        }
      }
    }
  };

  walk(absoluteRoot);

  return {
    tool: namespace === 'kingdom' ? 'legiox-kingdom-grep' : 'legiox-codebase-grep',
    status: 'ok',
    query: queryText,
    root: absoluteRoot,
    total_results: results.length,
    matches: results
  };
}

function compileSearchPattern(value) {
  try {
    return new RegExp(value, 'i');
  } catch (_error) {
    return null;
  }
}

function runDecisionTree({ tree, pathSelection, context }) {
  const trees = loadDecisionTrees();
  const available = Object.keys(trees);

  if (available.length === 0) {
    return {
      tool: 'legiox-decision-tree',
      status: 'not_ready',
      error: 'No decision trees available'
    };
  }

  const normalizedContext = String(context || '').toLowerCase();
  const defaultTree = normalizedContext.includes('build') && trees.build_failures
    ? 'build_failures'
    : available[0];
  const selectedTreeName = tree && trees[tree] ? tree : defaultTree;
  const selected = trees[selectedTreeName];

  if (!selected) {
    return {
      tool: 'legiox-decision-tree',
      status: 'error',
      error: `Unknown tree '${tree}'`,
      available_trees: available
    };
  }

  let currentNode = selected.root;
  const traversedPath = [];

  if (typeof pathSelection === 'string' && pathSelection.trim()) {
    const steps = pathSelection.split(/[./>]/).map((part) => part.trim()).filter(Boolean);
    for (const step of steps) {
      if (!currentNode.children || !currentNode.children.has(step)) {
        return {
          tool: 'legiox-decision-tree',
          status: 'error',
          tree: selectedTreeName,
          traversed_path: traversedPath,
          error: `Unknown path step '${step}'`
        };
      }

      currentNode = currentNode.children.get(step);
      traversedPath.push(step);
    }
  }

  return {
    tool: 'legiox-decision-tree',
    status: 'ok',
    tree: selectedTreeName,
    available_trees: available,
    traversed_path: traversedPath,
    current_node: {
      type: currentNode.type,
      title: currentNode.title,
      question: currentNode.question,
      options: currentNode.options
    }
  };
}

function loadDecisionTrees() {
  const now = Date.now();
  if (decisionTreeCache.loadedAt > 0 && Object.keys(decisionTreeCache.trees).length > 0) {
    return decisionTreeCache.trees;
  }

  const trees = {};
  const authenticationPath = path.join(AI_CONTEXT_ROOT, 'concepts', 'auth', 'decision-tree.json');
  const buildPath = path.join(AI_CONTEXT_ROOT, 'troubleshooting', 'build', 'flowchart.json');
  const authenticationRaw = readSafeText(authenticationPath, 500000);
  const buildRaw = readSafeText(buildPath, 500000);

  if (authenticationRaw) {
    const parsed = safeJsonParse(authenticationRaw);
    if (parsed?.decision_tree) {
      trees.authentication = normalizeDecisionTree('authentication', parsed.decision_tree);
    }
  }

  if (buildRaw) {
    const parsed = safeJsonParse(buildRaw);
    if (parsed?.step_1) {
      trees.build_failures = normalizeDecisionTree('build_failures', parsed.step_1);
    }
  }

  decisionTreeCache.loadedAt = now;
  decisionTreeCache.trees = trees;
  return trees;
}

function normalizeDecisionTree(treeName, rootNode) {
  const root = {
    type: 'question',
    title: rootNode.root_question || rootNode.question || `${treeName} guidance`,
    question: rootNode.root_question || rootNode.question || '',
    options: [],
    children: new Map()
  };

  const branches = rootNode.branches || rootNode.options || {};
  const branchEntries = Array.isArray(branches) ? branches : Object.entries(branches);

  if (Array.isArray(branchEntries)) {
    for (let index = 0; index < branchEntries.length; index++) {
      const entry = branchEntries[index];
      const key = Array.isArray(branchEntries) && Array.isArray(entry) ? entry[0] : String(index + 1);
      const nodeData = Array.isArray(entry) ? entry[1] : entry;

      const optionNode = coerceDecisionNode(key, nodeData);
      root.options.push({
        key,
        label: optionNode.title,
        type: optionNode.type
      });
      root.children.set(key, optionNode);
    }
  }

  return { name: treeName, root };
}

function coerceDecisionNode(key, branch) {
  if (!branch || typeof branch !== 'object') {
    return {
      type: 'solution',
      title: String(branch || key),
      question: String(branch || ''),
      options: [],
      children: new Map()
    };
  }

  if (branch.question) {
    const childBranches = branch.branches || branch.options || {};
    const childEntries = Array.isArray(childBranches) ? childBranches : Object.entries(childBranches);
    const children = new Map();

    if (Array.isArray(childEntries)) {
      for (let index = 0; index < childEntries.length; index++) {
        const entry = childEntries[index];
        const childKey = Array.isArray(entry) ? entry[0] : String(index + 1);
        const childData = Array.isArray(entry) ? entry[1] : entry;
        children.set(childKey, coerceDecisionNode(childKey, childData));
      }
    }

    return {
      type: 'question',
      title: branch.question,
      question: branch.question,
      options: Object.fromEntries(Array.from(children.entries()).map(([optionKey, optionNode]) => [
        optionKey,
        {
          key: optionKey,
          title: optionNode.title,
          type: optionNode.type
        }
      ])),
      children
    };
  }

  return {
    type: 'solution',
    title: branch.recommendation || branch.solution || branch.title || key,
    question: '',
    options: [],
    children: new Map(),
    details: branch.description || branch.implementation || branch.action || ''
  };
}

function buildImplementationGuide({ feature, currentState, constraints }) {
  const knowledge = runLegacyKnowledgeLookup(feature, 'implementation-guide');
  const refs = (knowledge.matches || []).slice(0, 6);

  const plan = [
    {
      step: 1,
      title: 'Clarify scope and constraints',
      detail: `Feature: ${feature}`,
      current_state: currentState || 'unspecified'
    },
    {
      step: 2,
      title: 'Load relevant guidance',
      detail: refs.length > 0 ? `Use ${refs.length} known references` : 'No direct reference found, use manual design review'
    },
    {
      step: 3,
      title: 'Design implementation sequence',
      detail: 'Split into discovery, core changes, validation, and rollout'
    },
    {
      step: 4,
      title: 'Verify behavior',
      detail: 'Run targeted checks and document outcomes'
    }
  ];

  return {
    tool: 'legiox-implementation-guide',
    status: knowledge.total_matches > 0 ? 'ready' : 'partial',
    feature,
    current_state: currentState || 'unspecified',
    constraints,
    plan,
    references: refs.map((item) => item.path)
  };
}

function rebuildIndexes(mode = 'metadata', verbose = false) {
  knowledgeCorpusCache.loadedAt = 0;
  knowledgeCorpusCache.entries = [];
  decisionTreeCache.loadedAt = 0;
  decisionTreeCache.trees = {};

  const validModes = ['full', 'delta', 'metadata'];
  if (!validModes.includes(mode)) {
    throw new Error(`Invalid mode '${mode}'`);
  }

  const response = {
    tool: 'legiox-index-rebuilder',
    requested_mode: mode,
    status: 'ok',
    note: 'All in-process index caches were invalidated.'
  };

  if (mode === 'full' || verbose) {
    const entries = buildKnowledgeCorpus();
    const discovery = knowledgeCorpusCache.discovery || {};
    response.source_pool_size = entries.length;
    response.discovery = {
      loaded_at: discovery.loadedAt,
      meta: discovery.meta
    };
    if (discovery.meta && typeof discovery.meta.total_discovered === 'number') {
      response.discovery.path_count = discovery.meta.total_discovered;
    }
    response.note = `All in-process index caches were invalidated and knowledge corpus was rebuilt (${entries.length} files).`;
  }

  if (!response.source_pool_size) {
    response.source_pool_size = knowledgeCorpusCache.entries.length;
  }

  return response;
}

function syncTopicCohortIndexFromManifests({ dryRun = false } = {}) {
  if (!fs.existsSync(SYNC_COHORTS_INDEX_SCRIPT)) {
    return {
      status: 'skipped',
      reason: `Missing script: ${SYNC_COHORTS_INDEX_SCRIPT}`
    };
  }

  const args = [SYNC_COHORTS_INDEX_SCRIPT];
  if (dryRun) {
    args.push('--dry-run');
  }

  const result = spawnSync(process.execPath, args, {
    cwd: RINGDOM_ROOT,
    encoding: 'utf8',
    env: {
      ...process.env,
      CURSOR_WORKSPACE: RINGDOM_ROOT
    }
  });

  if (result.status !== 0) {
    return {
      status: 'error',
      stderr: result.stderr || '',
      stdout: result.stdout || '',
      exit_code: result.status
    };
  }

  let payload = {};
  try {
    const lines = String(result.stdout || '')
      .trim()
      .split('\n')
      .filter(Boolean);
    payload = JSON.parse(lines[lines.length - 1] || '{}');
  } catch {
    payload = { stdout: result.stdout };
  }

  cohortsCache.loadedAt = 0;
  return {
    status: 'ok',
    dry_run: dryRun,
    ...payload
  };
}

function rebuildTruthLensAgentIndex({
  sourceRoot = TRUTH_LENS_ROOT,
  maxDepth = 12,
  dryRun = false,
  verbose = false,
  syncTopicCohorts = true
} = {}) {
  const resolvedSourceRoot = path.resolve(String(sourceRoot || TRUTH_LENS_ROOT));
  const sourceByIdLookup = {};
  const sourceFiles = collectJsonFiles(
    resolvedSourceRoot,
    Number.isFinite(maxDepth) ? Math.max(1, Math.min(20, Number(maxDepth))) : 12,
    0,
    []
  );

  const existingIndex = readSafeJson(AGENT_INDEX_PATH, AGENT_INDEX_JSON_MAX_BYTES) || {};
  const existingAgents = existingIndex.agents && typeof existingIndex.agents === 'object' && !Array.isArray(existingIndex.agents)
    ? existingIndex.agents
    : {};
  const existingById = existingIndex.by_id && typeof existingIndex.by_id === 'object' && !Array.isArray(existingIndex.by_id)
    ? existingIndex.by_id
    : {};
  const existingMetadata = existingIndex.agent_metadata && typeof existingIndex.agent_metadata === 'object' && !Array.isArray(existingIndex.agent_metadata)
    ? existingIndex.agent_metadata
    : {};

  const byIdLookup = { ...existingById };
  const updatedAgents = { ...existingAgents };

  const fileStats = {
    scanned: sourceFiles.length,
    parsed: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    errors: 0
  };

  const indexPlan = [];
  const seenKeys = new Set();
  const keywordSet = new Set();
  const sourceFileLookup = {};

  for (const sourceFile of sourceFiles) {
    const parsed = readSafeJson(sourceFile);
    if (!parsed || typeof parsed !== 'object') {
      fileStats.errors += 1;
      continue;
    }

    fileStats.parsed += 1;
    const sourceFileName = path.basename(sourceFile);
    const sourceKey = normalizeAgentLookupKey(truthLensFileStem(sourceFileName));
    sourceFileLookup[sourceKey] = sourceFileName;
    const records = extractAgentRecordsFromTruthLensPayload(parsed, sourceFileName, byIdLookup);

    for (const source of records) {
      const recordPayload = {
        record: source.record || source,
        key: source.key || source.record?.agent_type || source.record?.agent_id || sourceKey,
        sourceFileName,
        fileName: source.record?.file || source.record?.json_config || source.file || `${source.key || sourceKey}.nodus.json`,
        byIdLookup
      };

      const indexEntry = buildTruthLensAgentIndexEntry(recordPayload);
      if (!indexEntry || !indexEntry.agent_type) {
        fileStats.skipped += 1;
        continue;
      }

      const key = indexEntry.agent_type;
      if (seenKeys.has(key)) {
        continue;
      }
      seenKeys.add(key);

      const previous = updatedAgents[key] || {};
      const merged = {
        ...previous,
        ...indexEntry
      };

      if (!Array.isArray(merged.expertise)) {
        merged.expertise = normalizeTextValues(merged.expertise);
      }
      if (!Array.isArray(merged.keywords)) {
        merged.keywords = normalizeTextValues(merged.keywords);
      }
      if (!Array.isArray(merged.consult_when)) {
        merged.consult_when = normalizeTextValues(merged.consult_when);
      }
      if (!Array.isArray(merged.key_patterns)) {
        merged.key_patterns = normalizeTextValues(merged.key_patterns);
      }

      updatedAgents[key] = merged;
      const currentPlan = {
        key,
        source_file: sourceFileName,
        file: merged.file,
        status: merged.status,
        has_truth_lens: Boolean(merged.truth_lens && String(merged.truth_lens).trim().length > 0),
        by_id: byIdLookup[key] || sourceFileName
      };

      indexPlan.push(currentPlan);
      byIdLookup[key] = merged.file || byIdLookup[key] || sourceFileName;
      merged.keywords.forEach((keyword) => keywordSet.add(keyword));

      if (typeof previous.status === 'undefined') {
        fileStats.created += 1;
      } else if (JSON.stringify(previous) !== JSON.stringify(merged)) {
        fileStats.updated += 1;
      } else {
        fileStats.unchanged += 1;
      }
    }
  }

  const activeAgents = Object.values(updatedAgents).filter((agent) =>
    String(agent.status || '').toLowerCase() === 'active'
  );
  const reindexedCount = fileStats.created + fileStats.updated + fileStats.unchanged;
  const nowIso = new Date().toISOString();

  const nextMetadata = {
    ...existingMetadata,
    agents_count: Object.keys(updatedAgents).length,
    total_agents: Object.keys(updatedAgents).length,
    active_agents: activeAgents.length,
    total_keywords: keywordSet.size,
    truth_lens_enriched: indexPlan.length,
    truth_lens_date: nowIso,
    rebuild_date: nowIso,
    rebuild_reason: dryRun
      ? 'dry-run truth-lens reindex requested'
      : 'truth-lens reindex updated AI-AGENT-INDEX.json'
  };

  const nextIndex = {
    ...existingIndex,
    agent_metadata: nextMetadata,
    agents: updatedAgents,
    by_id: byIdLookup,
    agents_base_path: TRUTH_LENS_ROOT,
    agents_count: Object.keys(updatedAgents).length
  };

  if (dryRun) {
    return {
      tool: 'legiox-agent-index-rebuilder',
      status: 'ready',
      dry_run: true,
      source_root: resolvedSourceRoot,
      file_stats: fileStats,
      scanned_files: sourceFiles.length,
      reindexed_count: reindexedCount,
      metadata: nextMetadata,
      index_plan: verbose ? indexPlan : [],
      topic_cohort_sync: syncTopicCohorts
        ? syncTopicCohortIndexFromManifests({ dryRun: true })
        : null,
      note: 'Dry run mode enabled. No index was written.'
    };
  }

  try {
    fs.writeFileSync(AGENT_INDEX_PATH, JSON.stringify(nextIndex, null, 2), 'utf8');
  } catch (error) {
    return {
      tool: 'legiox-agent-index-rebuilder',
      status: 'error',
      error: String(error.message || error),
      source_root: resolvedSourceRoot,
      file_stats: fileStats
    };
  }

  const topicCohortSync = syncTopicCohorts
    ? syncTopicCohortIndexFromManifests({ dryRun: false })
    : null;

  cohortsCache.loadedAt = 0;
  return {
    tool: 'legiox-agent-index-rebuilder',
    status: 'ok',
    source_root: resolvedSourceRoot,
    file_stats: fileStats,
    scanned_files: sourceFiles.length,
    reindexed_count: reindexedCount,
    metadata: nextMetadata,
    index_plan: verbose ? indexPlan : [],
    topic_cohort_sync: topicCohortSync,
    note: 'AI-AGENT-INDEX.json was rebuilt; LEGIOX-COHORTS.json topic_cohorts index synced from cohorts/*.json.'
  };
}

/**
 * Sanitize a concept name into a safe filename (alphanumeric + hyphens, lowercase).
 */
function sanitizeConceptFilename(concept) {
  return String(concept || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120) || 'concept';
}

/**
 * Write a JSON value safely to a file atomically.
 */
function safeWriteJson(absolutePath, data) {
  const tmp = absolutePath + '.tmp.' + Date.now();
  try {
    const dir = path.dirname(absolutePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2) + '\n', 'utf8');
    fs.renameSync(tmp, absolutePath);
    return null;
  } catch (e) {
    try { fs.unlinkSync(tmp); } catch (_) { /* ignore cleanup failure */ }
    return String(e.message || e);
  }
}

function uniqAppend(oldArr, newArr, keyFn) {
  const out = Array.isArray(oldArr) ? oldArr.slice() : [];
  const seen = new Set(out.map(keyFn));
  const appended = [];
  for (const item of Array.isArray(newArr) ? newArr : []) {
    const k = keyFn(item);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(item);
      appended.push(item);
    }
  }
  return { out, appended };
}

function factKey(x) {
  return String(x || '');
}

function patternKey(x) {
  return String(x || '');
}

function relKey(r) {
  if (typeof r === 'string') {
    return r;
  }
  try {
    return JSON.stringify(r);
  } catch (_) {
    return String(r);
  }
}

function normalizeRel(r) {
  return typeof r === 'string' ? { description: r } : r;
}

function processContextUpdates(updates) {
  const accepted = [];
  const rejected = [];
  const writtenFiles = [];

  const conceptsDir = path.join(AI_CONTEXT_ROOT, 'concepts');

  for (const update of updates) {
    if (!update || typeof update !== 'object' || !String(update.concept || '').trim()) {
      rejected.push({ update, reason: 'Missing concept' });
      continue;
    }

    const concept = String(update.concept).trim();
    const incomingFacts = Array.isArray(update.facts) ? update.facts : [];
    const incomingPatterns = Array.isArray(update.patterns) ? update.patterns : [];
    const incomingRelationships = Array.isArray(update.relationships) ? update.relationships : [];
    const mode = String(update.mode || 'merge').toLowerCase() === 'replace' ? 'replace' : 'merge';
    const confirmReplace = update.confirm_replace === true;

    const filename = sanitizeConceptFilename(concept) + '.json';
    const filePath = path.join(conceptsDir, filename);

    let existing = null;
    if (safeFileExists(filePath)) {
      try {
        existing = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      } catch (e) {
        rejected.push({ update: concept, reason: 'Existing concept JSON is unreadable: ' + String(e.message || e) });
        continue;
      }
    }

    if (mode === 'replace' && existing && !confirmReplace) {
      rejected.push({
        update: concept,
        reason: 'mode=replace refused without confirm_replace=true (would overwrite the file). Default is merge. List existing facts to the user and wait, or omit mode to append.',
        would_drop_facts: Array.isArray(existing.facts) ? existing.facts : [],
        would_drop_patterns: Array.isArray(existing.patterns) ? existing.patterns : [],
        would_drop_relationships: Array.isArray(existing.relationships) ? existing.relationships : [],
        existing_path: filePath
      });
      continue;
    }

    let facts;
    let patterns;
    let relationships;
    let appendedFacts = incomingFacts;
    let appendedPatterns = incomingPatterns;
    let appendedRelationships = incomingRelationships;

    if (mode === 'merge' && existing) {
      const f = uniqAppend(existing.facts, incomingFacts, factKey);
      const p = uniqAppend(existing.patterns, incomingPatterns, patternKey);
      const r = uniqAppend(existing.relationships, incomingRelationships.map(normalizeRel), relKey);
      facts = f.out;
      patterns = p.out;
      relationships = r.out.map(normalizeRel);
      appendedFacts = f.appended;
      appendedPatterns = p.appended;
      appendedRelationships = r.appended;
    } else {
      facts = incomingFacts;
      patterns = incomingPatterns;
      relationships = incomingRelationships.map(normalizeRel);
    }

    const entry = {
      concept,
      mode,
      facts,
      patterns,
      relationships,
      appended_facts: appendedFacts,
      appended_patterns: appendedPatterns,
      appended_relationships: appendedRelationships,
      preserved_facts_count: mode === 'merge' && existing ? (Array.isArray(existing.facts) ? existing.facts.length : 0) : 0
    };
    accepted.push(entry);

    const doc = {
      schema_version: (existing && existing.schema_version) || '3.0',
      concept_version: Date.now(),
      concept_type: (existing && existing.concept_type) || 'context_update',
      name: (existing && existing.name) || concept,
      updated: new Date().toISOString().split('T')[0],
      executive_summary: (existing && existing.executive_summary) || (facts.length > 0 ? facts[0] : concept),
      description: (existing && existing.description && existing.description !== concept) ? existing.description : ((existing && existing.description) || concept),
      keywords: (existing && Array.isArray(existing.keywords) && existing.keywords.length) ? existing.keywords : [sanitizeConceptFilename(concept)],
      facts,
      patterns,
      relationships
    };

    const writeErr = safeWriteJson(filePath, doc);
    if (writeErr) {
      rejected.push({ update: concept, reason: 'Write failed: ' + writeErr });
    } else {
      writtenFiles.push(filePath);
    }
  }

  // Invalidate knowledge corpus cache so next legiox-knowledge picks up the new data
  if (writtenFiles.length > 0) {
    knowledgeCorpusCache.loadedAt = 0;
    knowledgeCorpusCache.entries = [];
  }

  // Build a verification query from the first accepted concept
  var verificationQuery = null;
  if (accepted.length > 0) {
    verificationQuery = accepted[0].concept;
  }

  return {
    tool: 'legiox-context-update',
    status: writtenFiles.length > 0 ? 'persisted' : (rejected.length > 0 && accepted.length === 0 ? 'failed' : 'accepted_no_writes'),
    accepted_count: accepted.length,
    rejected_count: rejected.length,
    written_files: writtenFiles,
    accepted,
    rejected,
    verification_query: verificationQuery,
    verification_hint: 'Call legiox-knowledge with query="' + (verificationQuery || '') + '" to verify the knowledge is searchable.',
    note: writtenFiles.length > 0
      ? 'Concept file merged (unique facts appended) unless mode=replace+confirm_replace. Knowledge corpus cache invalidated.'
      : 'No files were written. Check rejected items (replace without confirm_replace lists would_drop_*).',
    cache_invalidated: writtenFiles.length > 0
  };
}

async function executeBatchOperations(operations) {
  const results = [];
  let successCount = 0;

  for (const operation of operations) {
    const toolName = typeof operation?.tool === 'string' ? operation.tool : '';
    const args = operation && typeof operation.args === 'object' ? operation.args : {};
    const result = {
      tool: toolName || null,
      status: 'failed'
    };

    try {
      const tool = LEGIOX_TOOLS[toolName];
      if (!tool || typeof tool.handler !== 'function') {
        throw new Error(`Tool not found: ${toolName || 'undefined'}`);
      }

      result.response = await tool.handler(args);
      result.status = 'ok';
      successCount++;
    } catch (error) {
      result.error = String(error.message || error);
    }

    results.push(result);
  }

  return {
    tool: 'legiox-batch-operations',
    status: 'ok',
    operation_count: results.length,
    success_count: successCount,
    failed_count: results.length - successCount,
    results
  };
}

function runVectorSearch(query, limit = 10) {
  const queryText = String(query || '').trim();
  const queryTerms = tokenizeText(queryText, { removeStopWords: true });
  const corpus = buildKnowledgeCorpus();
  const normalizedLimit = Math.max(1, Math.min(20, Number(limit) || 10));

  const matches = findKnowledgeMatches(corpus, queryTerms, [])
    .slice(0, normalizedLimit)
    .map((match) => ({
      concept: match.concept,
      confidence: Number(Math.min(0.98, match.score / 120).toFixed(2)),
      path: match.path,
      matched_terms: match.matched_terms,
      score: Number(match.score.toFixed(2)),
      snippet: match.snippet,
      quick_answers: match.quick_answers
    }));

  return {
    tool: 'legiox-vector-search',
    query: queryText,
    status: matches.length > 0 ? 'ok' : 'partial',
    total_matches: matches.length,
    matches
  };
}

function runTestCommand({ command, project_path, dryRun = true }) {
  const cwd = path.isAbsolute(project_path)
    ? project_path
    : path.resolve(LEGIOX_ROOT, project_path);

  if (!safeFileExists(cwd)) {
    return {
      tool: 'legiox-test-runner',
      status: 'error',
      error: `Project path not found: ${cwd}`,
      command
    };
  }

  if (dryRun) {
    return {
      tool: 'legiox-test-runner',
      status: 'ready',
      project_path: cwd,
      command,
      dry_run: true,
      note: 'Set dry_run=false to execute'
    };
  }

  const token = String(command).trim().split(/\s+/)[0];
  const allowed = ['npm', 'pnpm', 'yarn', 'bun', 'node'];
  if (!allowed.includes(token)) {
    return {
      tool: 'legiox-test-runner',
      status: 'blocked',
      command,
      reason: 'Allowed commands are npm/pnpm/yarn/bun/node only'
    };
  }

  try {
    const output = execSync(command, {
      cwd,
      encoding: 'utf8',
      timeout: 120000,
      maxBuffer: 4 * 1024 * 1024
    });
    return {
      tool: 'legiox-test-runner',
      status: 'ok',
      project_path: cwd,
      command,
      output: String(output).slice(0, 8000)
    };
  } catch (error) {
    return {
      tool: 'legiox-test-runner',
      status: 'failed',
      project_path: cwd,
      command,
      exit_code: Number.isFinite(error.status) ? error.status : null,
      output: String(error.stdout || error.stderr || error.message || '')
        .slice(0, 8000)
    };
  }
}

function validateEnvFile({ env_file, required_vars }) {
  const absolutePath = path.isAbsolute(env_file)
    ? env_file
    : path.resolve(LEGIOX_ROOT, env_file);
  const text = readSafeText(absolutePath, 200000);
  if (!text) {
    return {
      tool: 'legiox-env-validator',
      status: 'missing',
      env_file: absolutePath
    };
  }

  const present = new Set();
  for (const rawLine of text.split('\n')) {
    const lineValue = String(rawLine || '').trim();
    if (!lineValue || lineValue.startsWith('#') || !lineValue.includes('=')) {
      continue;
    }
    const key = lineValue.split('=')[0].trim();
    if (key) {
      present.add(key);
    }
  }

  const required = Array.isArray(required_vars) ? required_vars.filter((item) => typeof item === 'string' && item.trim()) : [];
  const missing = required.filter((name) => !present.has(name));
  return {
    tool: 'legiox-env-validator',
    status: missing.length === 0 ? 'ok' : 'missing',
    env_file: absolutePath,
    required_count: required.length,
    missing,
    present_required_count: required.length - missing.length
  };
}

function generateModuleDocs({ modulePath, format }) {
  const absolutePath = path.isAbsolute(modulePath)
    ? modulePath
    : path.resolve(LEGIOX_ROOT, modulePath);
  const text = readSafeText(absolutePath, 400000);
  if (!text) {
    return {
      tool: 'legiox-docs-generator',
      status: 'missing',
      module_path: modulePath
    };
  }

  const lines = text.split('\n');
  const headings = lines.filter((line) => /^\\s*#{1,4}\\s+/.test(line)).slice(0, 12);
  const preview = lines.slice(0, 12).join(' ').replace(/\\s+/g, ' ').slice(0, 1800);

  return {
    tool: 'legiox-docs-generator',
    status: 'ok',
    module_path: modulePath,
    format,
    line_count: lines.length,
    size_bytes: text.length,
    headings,
    summary: preview,
    quick_answers: [
      'Prefer section headings and inline examples for future automation.',
      'Add contracts and assumptions for easier tool chaining.'
    ]
  };
}

function analyzeDependencies({ project_path, depth }) {
  const projectPath = path.isAbsolute(project_path)
    ? project_path
    : path.resolve(LEGIOX_ROOT, project_path);
  const packagePath = path.join(projectPath, 'package.json');
  const packageText = readSafeText(packagePath, 500000);
  if (!packageText) {
    return {
      tool: 'legiox-dependency-analyzer',
      status: 'missing',
      project_path: projectPath,
      requested_depth: depth || 'standard'
    };
  }

  let packageJson = null;
  try {
    packageJson = JSON.parse(packageText);
  } catch (_error) {
    return {
      tool: 'legiox-dependency-analyzer',
      status: 'invalid',
      project_path: projectPath
    };
  }

  const dependencies = Object.keys(packageJson.dependencies || {});
  const devDependencies = Object.keys(packageJson.devDependencies || {});
  const peerDependencies = Object.keys(packageJson.peerDependencies || {});
  const optionalDependencies = Object.keys(packageJson.optionalDependencies || {});

  return {
    tool: 'legiox-dependency-analyzer',
    status: 'ok',
    project_path: projectPath,
    requested_depth: depth || 'standard',
    dependency_count: dependencies.length,
    dev_dependency_count: devDependencies.length,
    peer_dependency_count: peerDependencies.length,
    optional_dependency_count: optionalDependencies.length,
    top_dependencies: [...dependencies.slice(0, 10), ...devDependencies.slice(0, 10)],
    note: 'Security and upgrade checks require dedicated scanners.'
  };
}

async function runApiCheck({ endpoint, method }) {
  const normalizedMethod = String(method || 'GET').toUpperCase();
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];
  if (!allowedMethods.includes(normalizedMethod)) {
    return {
      tool: 'legiox-api-tester',
      status: 'error',
      error: `Unsupported method '${normalizedMethod}'`
    };
  }

  const started = Date.now();
  try {
    const target = new URL(endpoint);
    const response = await fetch(target.toString(), {
      method: normalizedMethod
    });
    const responseText = await response.text();
    return {
      tool: 'legiox-api-tester',
      status: 'ok',
      endpoint: target.toString(),
      method: normalizedMethod,
      response_code: response.status,
      response_ok: response.ok,
      response_time_ms: Date.now() - started,
      response_preview: String(responseText).slice(0, 3000)
    };
  } catch (error) {
    return {
      tool: 'legiox-api-tester',
      status: 'failed',
      endpoint,
      method: normalizedMethod,
      error: String(error.message || error)
    };
  }
}

function runQuickSecurityScan(targetPath) {
  if (!safeFileExists(targetPath)) {
    return {
      findings: 1,
      samples: ['Target path does not exist']
    };
  }

  const patterns = [
    /\bpassword\s*[:=]\s*[^\s'"]+/i,
    /\bapi[-_]?key\s*[:=]\s*[^\s'"]+/i,
    /BEGIN PRIVATE KEY/i,
    /AKIA[0-9A-Z]{16}/,
    /SECRET_KEY/i
  ];

  const findings = [];
  const visit = (directory, depth = 0) => {
    if (depth > 5 || findings.length >= 8) {
      return;
    }

    let entries = [];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (_error) {
      return;
    }

    for (const entry of entries) {
      if (findings.length >= 8) {
        return;
      }

      if (entry.name === '.git' || entry.name === 'node_modules') {
        continue;
      }

      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath, depth + 1);
        continue;
      }

      if (!entry.isFile() || entry.name.endsWith('.png') || entry.name.endsWith('.jpg')) {
        continue;
      }

      const content = readSafeText(fullPath, 250000);
      if (!content) {
        continue;
      }

      for (const pattern of patterns) {
        if (pattern.test(content)) {
          findings.push(`Potential secret in ${path.relative(LEGIOX_ROOT, fullPath)} (${pattern.source})`);
          break;
        }
      }
    }
  };

  visit(targetPath);

  return {
    findings: findings.length,
    samples: findings.slice(0, 5)
  };
}

function safeJsonParse(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (_error) {
    return null;
  }
}

function extractCapabilities(text, requirements = {}) {
  const explicit = Array.isArray(requirements.capabilities) ? requirements.capabilities : [];
  const capabilities = explicit
    .map((capability) => String(capability).toLowerCase().trim())
    .filter(Boolean);

  const lowered = String(text || '').toLowerCase();
  for (const [keyword, mapped] of Object.entries(TOOL_CAPABILITY_MAPPINGS)) {
    if (lowered.includes(keyword)) {
      for (const mappedCapability of mapped) {
        capabilities.push(mappedCapability);
      }
    }
  }

  return Array.from(new Set(capabilities));
}

function buildQueryTermWeights({ taskDescription, capabilities = [], requirements = {} }) {
  const terms = new Map();
  const baseText = String(taskDescription || '').toLowerCase();
  const contextText = String(requirements.context || '').toLowerCase();
  const semanticInput = Array.isArray(requirements.semantic_array) ? requirements.semantic_array : [];

  const addTerm = (value, weight = 1) => {
    const tokens = tokenizeText(String(value || ''), { removeStopWords: true });
    for (const term of tokens) {
      const current = terms.get(term) || 0;
      terms.set(term, current + weight);
    }
  };

  addTerm(baseText, 1.4);
  addTerm(contextText, 1.1);
  for (const capability of capabilities) {
    addTerm(capability, 1.3);
  }
  for (const semanticItem of semanticInput) {
    if (typeof semanticItem === 'string') {
      addTerm(semanticItem, 1.6);
      continue;
    }
    if (semanticItem && typeof semanticItem === 'object') {
      const keyword = String(semanticItem.term || semanticItem.text || '').toLowerCase();
      const semanticWeight = Number.isFinite(Number(semanticItem.weight))
        ? Math.max(0.5, Number(semanticItem.weight))
        : 1.2;
      addTerm(keyword, semanticWeight);
    }
  }

  return Array.from(terms.entries())
    .map(([term, weight]) => ({ term, weight }))
    .sort((a, b) => b.weight - a.weight);
}

function selectAgent(taskDescription, requirements = {}) {
  const capabilities = extractCapabilities(taskDescription, requirements);
  const agents = loadAgents();
  const requestedPriority = requirements.priority;
  const priorityHint = typeof requirements.priority === 'string' ? requirements.priority.toLowerCase() : null;
  const cohortHint = typeof requirements.cohort_hint === 'string' && requirements.cohort_hint.trim()
    ? requirements.cohort_hint.trim()
    : null;
  const maxResults = Number.isFinite(Number(requirements.max_results)) ? Math.max(1, Math.min(25, Math.floor(Number(requirements.max_results)))) : 6;

  const queryTerms = buildQueryTermWeights({
    taskDescription,
    capabilities,
    requirements
  });

  const maxPossibleScore = Math.max(1, queryTerms.reduce((sum, term) => sum + term.weight, 0));

  const scored = agents.map((agent) => {
    let score = 0;
    const matched_terms = new Set();
    const weightedSignals = [];

    // Vector-like semantic scoring from agent term vector
    for (const term of queryTerms) {
      const termWeight = agent.termVector?.[term.term] || 0;
      if (termWeight > 0) {
        const contrib = termWeight * term.weight;
        score += contrib;
        matched_terms.add(term.term);
        weightedSignals.push({
          term: term.term,
          source: 'agent-transformer',
          weight: Number(term.weight.toFixed(3)),
          contribution: Number(contrib.toFixed(3))
        });
      }
    }

    // Cohort/domain matching for stronger routing
    if (agent.cohorts && agent.cohorts.length > 0) {
      for (const cohort of agent.cohorts) {
        const cohortText = `${cohort.cohort_name || ''} ${cohort.cohort_id || ''} ${cohort.member_domain || ''}`.toLowerCase();
        let matches = 0;
        for (const term of queryTerms) {
          if (cohortText.includes(term.term)) {
            const contrib = term.weight * (cohort.priority_weight || 1);
            score += contrib;
            matches++;
            weightedSignals.push({
              term: term.term,
              source: `cohort:${cohort.source_name || cohort.cohort_id}`,
              weight: Number(term.weight.toFixed(3)),
              contribution: Number(contrib.toFixed(3))
            });
            matched_terms.add(term.term);
          }
        }
        if (matches > 0) {
          score += 0.2 * matches;
        }
      }
    }

    // Context and explicit requirement hint boosts
    if (capabilities.length > 0) {
      for (const explicitCapability of capabilities) {
        if (agent.capabilities.includes(explicitCapability)) {
          score += 0.5;
          weightedSignals.push({
            term: explicitCapability,
            source: 'explicit-capability',
            weight: 1,
            contribution: 0.5
          });
        }
      }
    }

    if (cohortHint && agent.cohorts && agent.cohorts.some((cohort) => cohort.cohort_id === cohortHint || cohort.source_name === cohortHint)) {
      score += 5;
      weightedSignals.push({
        term: cohortHint,
        source: 'cohort-hint',
        weight: 1,
        contribution: 5
      });
    }

    return {
      ...agent,
      score,
      confidence: Math.min(100, Math.round((score / maxPossibleScore) * 100 * 100) / 100),
      matched_terms: Array.from(matched_terms),
      weightedSignals
    };
  }).filter((agent) => Number(agent.score) > 0);

  if (scored.length === 0) {
    return {
      selectedAgent: null,
      alternatives: [],
      matchedCohorts: [],
      scoredCandidates: [],
      reasoning: 'No matching agents found in active index',
      confidence: 0
    };
  }

  const sorted = scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.priority_weight !== a.priority_weight) return b.priority_weight - a.priority_weight;
    return (b.confidence || 0) - (a.confidence || 0);
  });

  const filtered = requestedPriority
    ? sorted.filter((agent) => agent.priority === priorityHint)
    : sorted;

  const finalSorted = filtered.length > 0 ? filtered : sorted;
  const winner = finalSorted[0];

  const topCandidates = finalSorted.slice(0, maxResults);
  const matchedCohorts = winner.cohorts || [];
  const topTruthLenses = topCandidates.map((agent) => ({
    agent: agent.key,
    file: `AI-LEGIOX/legiox-truth-lens/${agent.file}`,
    certainty: Number(Math.min(1, agent.confidence / 100).toFixed(3)),
    score: Number(agent.score.toFixed(3))
  }));
  const weightedSignalsTop = topCandidates.slice(0, 6).map((agent) => {
    return {
      agent: agent.key,
      confidence: Number(Math.min(1, agent.confidence / 100).toFixed(3)),
      terms: agent.matched_terms.slice(0, 8),
      weights: agent.weightedSignals.slice(0, 6)
    };
  });

  const alternatives = finalSorted.slice(1, Math.min(5, finalSorted.length)).map((agent) => ({
    agent: agent.key,
    file: `AI-LEGIOX/legiox-truth-lens/${agent.file}`,
    confidence: Number(Math.min(1, (agent.confidence || 0) / 100).toFixed(3)),
    score: Number(agent.score.toFixed(3)),
    matched_terms: agent.matched_terms.slice(0, 8),
    cohorts: agent.cohorts || []
  }));

  return {
    selectedAgent: winner.key,
    agent_file: winner.file,
    selectedAgentCohorts: matchedCohorts,
    selectedTruthLenses: topTruthLenses,
    confidence: Number(Math.min(100, winner.confidence || 0).toFixed(3)),
    weightedSignals: weightedSignalsTop,
    alternatives,
    reasoning: `Selected ${winner.key} (score=${winner.score.toFixed(2)})`,
    scoredCandidates: topCandidates.map((agent) => ({
      agent: agent.key,
      confidence: Number(Math.min(1, (agent.confidence || 0) / 100).toFixed(3)),
      score: Number(agent.score.toFixed(3)),
      file: `AI-LEGIOX/legiox-truth-lens/${agent.file}`,
      matched_terms: agent.matched_terms.slice(0, 10),
      cohorts: agent.cohorts || []
    })),
    matchedCohorts,
    matched_signal_count: winner.weightedSignals.length
  };
}

class LegioXMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'legiox-mcp',
        version: '1.0.0'
      },
      {
        capabilities: {
          tools: {},
          resources: {}
        }
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler(ListResourcesRequestSchema, async (request) => {
      const cursor = typeof request.params?.cursor === 'string' ? request.params.cursor : '';
      const allResources = getTruthLensResources().map(({ uri, name, description, mimeType }) => ({
        uri,
        name,
        description,
        mimeType
      }));

      const pageSize = 100;
      let startIndex = 0;
      if (cursor) {
        const decoded = Number(Buffer.from(cursor, 'base64').toString('utf8'));
        if (Number.isFinite(decoded) && decoded >= 0) {
          startIndex = decoded;
        }
      }

      const page = allResources.slice(startIndex, startIndex + pageSize);
      const nextIndex = startIndex + page.length;
      const nextCursor = nextIndex < allResources.length
        ? Buffer.from(String(nextIndex), 'utf8').toString('base64')
        : undefined;

      return {
        resources: page,
        nextCursor
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params?.uri;
      const resource = readTruthLensResource(uri);
      return {
        contents: [
          {
            uri: resource.uri,
            mimeType: resource.mimeType,
            text: resource.text
          }
        ]
      };
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = Object.entries(LEGIOX_TOOLS).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }));

      return {
        tools
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args = {} } = request.params;
      const tool = LEGIOX_TOOLS[name];
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }
      const responseResult = await tool.handler(args);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(responseResult)
          }
        ]
      };
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

async function main() {
  if (process.argv.includes('--test')) {
    const resources = getTruthLensResources();
    const sample = resources[0];
    if (!sample) {
      throw new Error('No truth lens resources available');
    }
    readTruthLensResource(sample.uri);
    console.log(JSON.stringify({
      ok: true,
      legiox_root: LEGIOX_ROOT,
      ringdom_root: RINGDOM_ROOT,
      file_info_backend: LEGIOX_FILE_INFO_BACKEND,
      plugin_mode: LEGIOX_PLUGIN_MODE,
      resource_count: resources.length,
      sample_resource: sample.uri
    }));
    return;
  }

  const server = new LegioXMCPServer();
  await server.start();
}

main().catch((error) => {
  console.error('LegioX MCP server failed to start:', error?.message || error);
  process.exit(1);
});
