#!/usr/bin/env node
/**
 * LegioX MCP — hosted Streamable HTTP server with per-user namespaces.
 *
 * Endpoint: POST /mcp/v1/:namespace   (Streamable HTTP transport)
 * Auth:     Authorization: Bearer <licenseKey>
 * Sessions: Mcp-Session-Id header ↔ child stdio legiox-mcp process per session.
 * Namespace layout:
 *   <data>/<ns>/AI-CONTEXT/           user knowledge base (searched by legiox-knowledge)
 *   <data>/<ns>/legiox/               engine bundle (server, free lenses, index, schema)
 *   <data>/<ns>/legiox/legiox-truth-lens/   user truth-lens library (purchased/generated skillsets)
 *
 * Alpha: licenses live in <data>/licenses.json: { "<key>": { namespace, plan, expiresAt } }.
 * Billing hooks (connect.software / legiox.pro) replace this in the paid tier.
 */
import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.LEGIOX_DATA || path.resolve(process.cwd(), 'data');
const BUNDLE_DIR = process.env.LEGIOX_BUNDLE || path.resolve(process.cwd(), 'bundle');
const SDK_MODULES = process.env.LEGIOX_SDK_NODE_MODULES || path.resolve(process.cwd(), 'node_modules');
const LICENSES_PATH = path.join(DATA_DIR, 'licenses.json');
const AI_CONTEXT_CLASSES = ['concepts', 'implementations', 'patterns', 'workflows', 'troubleshooting', 'timeline', 'features', 'services', 'core'];

const sessions = new Map(); // sessionId -> { child, transport, ns, lastActive }
const SESSION_IDLE_MS = Number(process.env.LEGIOX_SESSION_IDLE_MS || 30 * 60 * 1000);

function touchSession(sid) {
  const s = sessions.get(sid);
  if (s) s.lastActive = Date.now();
}

function cleanupSession(transport) {
  for (const [sid, s] of sessions) {
    if (s.transport === transport) {
      sessions.delete(sid);
      try { s.child.kill(); } catch { /* noop */ }
      log('session closed', sid);
      return;
    }
  }
}

// Idle sweep: close sessions that exceeded SESSION_IDLE_MS without traffic.
setInterval(() => {
  const now = Date.now();
  for (const [sid, s] of [...sessions]) {
    if (now - (s.lastActive || 0) > SESSION_IDLE_MS) {
      log('session idle timeout', sid);
      sessions.delete(sid);
      try { s.child.kill(); } catch { /* noop */ }
      try { s.transport.close(); } catch { /* noop */ }
    }
  }
}, 60 * 1000).unref();

function loadLicenses() {
  try { return JSON.parse(fs.readFileSync(LICENSES_PATH, 'utf8')); } catch { return {}; }
}

function authorize(req) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) return null;
  const lic = loadLicenses()[token];
  if (!lic) return null;
  if (lic.expiresAt && new Date(lic.expiresAt).getTime() < Date.now()) return null;
  return lic;
}

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }

function provisionNamespace(ns) {
  const nsRoot = path.join(DATA_DIR, ns);
  const marker = path.join(nsRoot, '.provisioned');
  if (fs.existsSync(marker)) return path.join(nsRoot, 'legiox');
  // knowledge base skeleton
  const aiContext = path.join(nsRoot, 'AI-CONTEXT');
  for (const cls of AI_CONTEXT_CLASSES) ensureDir(path.join(aiContext, cls));
  const root = {
    schema_version: '1.0',
    object_type: 'ai_first_root',
    project_name: ns,
    workspace: nsRoot,
    generated_at: new Date().toISOString(),
    legiox_plugin_version: 'hosted-1.0.3',
    note: 'Hosted LegioX namespace — run legiox-context-update after adding docs.'
  };
  fs.writeFileSync(path.join(aiContext, 'AI-CONTEXT-ROOT.json'), JSON.stringify(root, null, 2) + '\n');
  // engine bundle copy (static parts only)
  const legioxRoot = path.join(nsRoot, 'legiox');
  ensureDir(legioxRoot);
  if (!fs.existsSync(path.join(legioxRoot, 'legiox-mcp'))) {
    for (const rel of ['legiox-mcp', 'legiox-truth-lens', 'cohorts', 'scripts']) {
      const src = path.join(BUNDLE_DIR, rel);
      if (fs.existsSync(src)) fs.cpSync(src, path.join(legioxRoot, rel), { recursive: true });
    }
    for (const f of ['AI-AGENT-INDEX.json', 'LEGIOX-COHORTS.json', 'package.json']) {
      const src = path.join(BUNDLE_DIR, f);
      if (fs.existsSync(src)) fs.copyFileSync(src, path.join(legioxRoot, f));
    }
  }
  fs.writeFileSync(marker, new Date().toISOString());
  log('provisioned namespace', ns);
  return legioxRoot;
}

function spawnEngine(ns, legioxRoot) {
  const child = spawn(process.execPath, [path.join(legioxRoot, 'legiox-mcp', 'legiox-mcp-server.js')], {
    stdio: ['pipe', 'pipe', 'inherit'],
    env: {
      ...process.env,
      LEGIOX_PLUGIN_MODE: '1',
      LEGIOX_FILE_INFO_BACKEND: 'filesystem',
      LEGIOX_ROOT: legioxRoot,
      RINGDOM_ROOT: path.join(DATA_DIR, ns),
      LEGIOX_SDK_NODE_MODULES: SDK_MODULES,
    },
  });
  return child;
}

const app = express();

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'legiox-mcp-hosted', version: '1.0.3', sessions: sessions.size, data: DATA_DIR });
});

app.post('/mcp/v1/:namespace', async (req, res) => {
  const ns = req.params.namespace;
  const lic = authorize(req);
  if (!lic) return res.status(401).json({ jsonrpc: '2.0', error: { code: -32001, message: 'Invalid or expired license key' }, id: null });
  if (lic.namespace !== ns) return res.status(403).json({ jsonrpc: '2.0', error: { code: -32002, message: `License not valid for namespace '${ns}'` }, id: null });

  const sessionId = req.headers['mcp-session-id'] || null;
  if (sessionId) {
    const s = sessions.get(sessionId);
    if (!s) return res.status(404).json({ jsonrpc: '2.0', error: { code: -32003, message: 'Unknown session' }, id: null });
    return s.transport.handleRequest(req, res);
  }

  // New session: one transport + one engine child process per session (SDK 1.30 stateless mode).
  const legioxRoot = provisionNamespace(ns);
  const child = spawnEngine(ns, legioxRoot);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => crypto.randomUUID(),
  });

  transport.onmessage = (msg) => {
    if (!child.stdin.writable) return;
    child.stdin.write(JSON.stringify(msg) + '\n');
  };
  transport.onclose = () => cleanupSession(transport);

  let buf = '';
  child.stdout.on('data', async (d) => {
    buf += d.toString();
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i); buf = buf.slice(i + 1);
      if (!line.trim()) continue;
      try { await transport.send(JSON.parse(line)); } catch (e) { log('send error', e.message); }
    }
  });
  child.on('exit', () => { try { transport.close(); } catch { /* already closed */ } });

  try {
    await transport.handleRequest(req, res);
    const sid = transport.sessionId;
    if (sid) {
      sessions.set(sid, { child, transport, ns, lastActive: Date.now() });
      log('session started', sid, ns, 'plan', lic.plan);
    } else {
      child.kill();
    }
  } catch (e) {
    log('handleRequest error', e.message);
    cleanupSession(transport);
    if (!res.headersSent) res.status(500).json({ jsonrpc: '2.0', error: { code: -32603, message: 'Internal error' }, id: null });
  }
});

app.get('/mcp/v1/:namespace', async (req, res) => {
  const sessionId = req.query.sessionId;
  const s = sessionId && sessions.get(sessionId);
  if (!s) return res.status(400).json({ jsonrpc: '2.0', error: { code: -32003, message: 'Unknown session' }, id: null });
  return s.transport.handleRequest(req, res);
});

app.delete('/mcp/v1/:namespace', async (req, res) => {
  const sessionId = req.query.sessionId;
  const s = sessionId && sessions.get(sessionId);
  if (!s) return res.status(400).json({ jsonrpc: '2.0', error: { code: -32003, message: 'Unknown session' }, id: null });
  sessions.delete(sessionId);
  s.child.kill();
  try { await s.transport.close(); } catch { /* noop */ }
  res.status(200).json({ ok: true, closed: sessionId });
});

app.listen(PORT, () => log(`legiox-mcp hosted listening on :${PORT} (data=${DATA_DIR}, bundle=${BUNDLE_DIR})`));