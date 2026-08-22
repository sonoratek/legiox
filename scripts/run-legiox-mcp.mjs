#!/usr/bin/env node
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const pluginRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const server = path.join(pluginRoot, 'mcp', 'AI-LEGIOX', 'legiox-mcp', 'legiox-mcp-server.js');
const child = spawn(process.execPath, [server, ...process.argv.slice(2)], {
  cwd: pluginRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    LEGIOX_PLUGIN_MODE: '1',
    LEGIOX_FILE_INFO_BACKEND: 'filesystem',
    LEGIOX_SDK_NODE_MODULES: path.join(pluginRoot, 'mcp', 'AI-LEGIOX', 'node_modules')
  }
});
child.on('exit', (code) => process.exit(code ?? 1));
