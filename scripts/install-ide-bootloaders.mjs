#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const PLUGIN_NAME = 'legiox-free';
const workspace = process.env.CURSOR_WORKSPACE || process.env.OPENCODE_WORKSPACE || process.cwd();

const CURSOR = "---\ndescription: LegioX conceptual understanding and prioritized thinking via legiox-mcp tools\nalwaysApply: true\n---\n\n## LegioX thinking patterns\n\nConceptual understanding first — resolve the concept before writing code:\n\n1. Unknown concept → `legiox-knowledge` (semantic search) before code.\n2. Domain decision → `legiox-agent-selector` with task terms; prefer it on matching terms.\n3. Verify paths → `legiox-file-info` before read/edit.\n4. Known JSON key → `jq`; never read whole files.\n5. After features → `legiox-context-update` **merge/append**; never replace without listing dropped facts and confirmation.\n6. Recurring task class → `legiox-create` to generate a new skillset.\n7. Business/project question → treat the user as a founder/niche owner (legiox-business-intelligence).\n8. MCP calls: `server: project-0-<workspace>-legiox-mcp`, `toolName` = tool name (not the mcp.json key).";
const OPENCODE = "---\nname: legiox-mcp-thinking\ndescription: LegioX conceptual understanding and prioritized thinking patterns via legiox-mcp tools\nmodel: inherit\n---\n\n## LegioX thinking patterns\n\nConceptual understanding first — resolve the concept before writing code:\n\n1. Unknown concept → `legiox-mcp_legiox-knowledge({ query })` (semantic search) before code.\n2. Domain decision → `legiox-mcp_legiox-agent-selector({ task_description })` with task terms; prefer it on matching terms.\n3. Verify paths → `legiox-mcp_legiox-file-info({ path })` before read/edit.\n4. Known JSON key → `jq`; never read whole files.\n5. After features → `legiox-mcp_legiox-context-update` **merge/append**; never replace without listing dropped facts and confirmation.\n6. Recurring task class → `legiox-create` to generate a new skillset.\n7. Business/project question → treat the user as a founder/niche owner (legiox-business-intelligence).\n8. MCP calls use the `server_toolname` convention: `legiox-mcp_legiox-knowledge()` (no `server:` parameter).";
const VSCODE = "# LegioX — Copilot Instructions\n\nConceptual understanding first — resolve the concept before writing code:\n\n1. Unknown concept → `legiox-knowledge` (semantic search) before code.\n2. Domain decision → `legiox-agent-selector` with task terms; prefer it on matching terms.\n3. Verify paths → `legiox-file-info` before read/edit.\n4. Known JSON key → `jq`; never read whole files.\n5. After features → `legiox-context-update` **merge/append**; never replace without listing dropped facts and confirmation.\n6. Recurring task class → `legiox-create` to generate a new skillset.\n7. Business/project question → treat the user as a founder/niche owner (legiox-business-intelligence).\n8. MCP calls: `server: project-0-<workspace>-legiox-mcp`, `toolName` = tool name (not the mcp.json key).";

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function writeIfMissing(p, content) {
  if (fs.existsSync(p)) { console.log('LegioX: exists, skip', p); return; }
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, content, 'utf8');
  console.log('LegioX: wrote', p);
}

// Cursor rules
if (fs.existsSync(path.join(workspace, '.cursor'))) {
  writeIfMissing(path.join(workspace, '.cursor', 'rules', 'legiox-mcp-thinking.mdc'), CURSOR);
}

// OpenCode agent
if (fs.existsSync(path.join(workspace, '.opencode'))) {
  writeIfMissing(path.join(workspace, '.opencode', 'agent', 'legiox-mcp-thinking.md'), OPENCODE);
}

// VSCode Copilot instructions
if (fs.existsSync(path.join(workspace, '.vscode'))) {
  writeIfMissing(path.join(workspace, '.vscode', 'legiox-copilot-instructions.md'), VSCODE);
  const settingsPath = path.join(workspace, '.vscode', 'settings.json');
  try {
    const settings = fs.existsSync(settingsPath) ? JSON.parse(fs.readFileSync(settingsPath, 'utf8')) : {};
    const instructions = settings['github.copilot.chat.codeGeneration.instructions'] || [];
    if (!instructions.some((i) => i.file === './legiox-copilot-instructions.md')) {
      instructions.push({ file: './legiox-copilot-instructions.md' });
      settings['github.copilot.chat.codeGeneration.instructions'] = instructions;
      fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n', 'utf8');
      console.log('LegioX: registered Copilot instructions in .vscode/settings.json');
    }
  } catch (e) {
    console.warn('LegioX: could not update .vscode/settings.json', e.message);
  }
}

console.log('LegioX (', PLUGIN_NAME, '): bootloader install complete for', workspace);
