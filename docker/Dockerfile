# LegioX MCP Server — self-hosted (premium tier, full truth-lens corpus)
# Usage:
#   docker build -f docker/Dockerfile -t ghcr.io/sonoratek/legiox-mcp:latest .
#   docker run -i --rm -v $PWD/knowledge:/knowledge ghcr.io/sonoratek/legiox-mcp:latest
#   docker run -i --rm ghcr.io/sonoratek/legiox-mcp:latest --test
FROM node:18-alpine

WORKDIR /app

# Premium bundle (server + engine + full 421-lens corpus + index + schema).
# Source: packages/legiox-mcp — populated from the pro build by the pack pipeline.
COPY packages/legiox-mcp/package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY packages/legiox-mcp/ ./

# Non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S legiox -u 1001
RUN chown -R legiox:nodejs /app
USER legiox

# Knowledge lives on a mounted volume: mount a dir containing AI-CONTEXT/ at /knowledge
ENV LEGIOX_PLUGIN_MODE=1 \
    LEGIOX_FILE_INFO_BACKEND=filesystem \
    LEGIOX_ROOT=/app \
    RINGDOM_ROOT=/knowledge

# stdio MCP server — run with `docker run -i` (stdin/stdout protocol)
# Future: Streamable HTTP transport will EXPOSE 3000 for hosted mode.
ENTRYPOINT ["node", "legiox-mcp/legiox-mcp-server.js"]