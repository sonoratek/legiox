# LegioX MCP — Docker (self-host premium)

Self-host the LegioX MCP server as a stdio container, backed by your own knowledge base.

## Build

```bash
docker build -f docker/Dockerfile -t ghcr.io/sonoratek/legiox-mcp:latest .
```

## Run (stdio MCP)

MCP over stdio works over stdin/stdout, so run the container **interactively** (`-i`, no `-t`):

```bash
mkdir -p knowledge   # put your AI-CONTEXT/ here (optional — engine works with empty knowledge)
docker run -i --rm -v $PWD/knowledge:/knowledge ghcr.io/sonoratek/legiox-mcp:latest
```

Connect it from Claude Desktop / Cursor / any MCP client using the `docker` transport:

```json
{
  "mcpServers": {
    "legiox-mcp": {
      "command": "docker",
      "args": ["run", "-i", "--rm", "-v", "/abs/path/knowledge:/knowledge", "ghcr.io/sonoratek/legiox-mcp:latest"]
    }
  }
}
```

## Health check

```bash
docker run -i --rm ghcr.io/sonoratek/legiox-mcp:latest --test
# {"ok":true,"legiox_root":"/app","ringdom_root":"/knowledge","file_info_backend":"filesystem","plugin_mode":true,...}
```

## Layout

- `/app` — bundle root (`LEGIOX_ROOT`): server, engine, truth-lens corpus, agent index, schema
- `/knowledge` — your knowledge base (`RINGDOM_ROOT`): mount a dir containing `AI-CONTEXT/` so `legiox-knowledge` searches your concepts/implementations/patterns
- Non-root user `legiox` (uid 1001)

## Images

- `ghcr.io/sonoratek/legiox-mcp:<version>` — e.g. `1.0.2`, `latest`

## Future

Streamable HTTP transport (hosted mode) will expose port 3000 for remote MCP clients — the image will keep stdio as the default entrypoint.