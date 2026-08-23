# LegioX MCP — hosted endpoint (MCPaaS)

Streamable HTTP MCP server with **per-user namespaces**. Each license key owns one namespace: a private knowledge base (`AI-CONTEXT/`) + a private truth-lens library (`legiox-truth-lens/`), served 24×7 by a bundled LegioX engine.

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness |
| POST | `/mcp/v1/:namespace` | Streamable HTTP MCP (init / messages) |
| GET | `/mcp/v1/:namespace?sessionId=…` | SSE event stream for an active session |
| DELETE | `/mcp/v1/:namespace?sessionId=…` | Close session |

**Auth:** `Authorization: Bearer <licenseKey>` — license grants exactly one namespace (403 otherwise).

## Namespace layout (auto-provisioned on first connect)

```
data/<ns>/
  AI-CONTEXT/                  # user knowledge base — searched by legiox-knowledge
  legiox/                      # engine bundle (server, free lenses, index, schema)
  legiox/legiox-truth-lens/    # user truth-lens library (generated/purchased skillsets)
  .provisioned
```

## Client configuration

```json
{
  "mcpServers": {
    "legiox-mcp": {
      "type": "http",
      "url": "https://mcp.legiox.pro/mcp/v1/emperor",
      "headers": { "Authorization": "Bearer <licenseKey>" }
    }
  }
}
```

## Run locally

```bash
cp hosted/licenses.example.json data/licenses.json   # add your keys
LEGIOX_DATA=$PWD/data LEGIOX_BUNDLE=$PWD/packages/legiox-mcp \
  LEGIOX_SDK_NODE_MODULES=$PWD/node_modules node hosted/mcp-http-server.mjs
```

## Docker

```bash
docker build -f hosted/Dockerfile -t ghcr.io/sonoratek/legiox-mcp-hosted:1.0.3 .
docker run -d -p 3000:3000 -v $PWD/data:/app/data ghcr.io/sonoratek/legiox-mcp-hosted:1.0.3
```

## License model (alpha)

`data/licenses.json` maps key → namespace/plan/expiry. The paid tier (legiox.pro / connect.software) provisions keys via billing; `plan: pro` unlocks premium corpus streaming in a later iteration.

## Security

- Per-namespace isolation: the engine process for each session runs with `RINGDOM_ROOT` scoped to its own `data/<ns>` — no cross-tenant reads.
- Namespace paths are validated against `[a-z0-9-]+` by Express routing; license namespace must match the URL namespace.
- Rate limiting / quotas: TODO before public launch (see VISION).