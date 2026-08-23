# LegioX MCP hosted — self-host (premium / MCPaaS)
# Build: docker build -f hosted/Dockerfile -t ghcr.io/sonoratek/legiox-mcp-hosted:1.0.3 .
FROM node:18-alpine

WORKDIR /app

# Engine bundle (free-tier static: server, engine, lenses, index, schema)
COPY packages/legiox-mcp/package*.json ./bundle/
RUN cd bundle && npm ci --omit=dev && npm cache clean --force
COPY packages/legiox-mcp/ ./bundle/

# Hosted service (Express + MCP SDK streamable-http)
COPY hosted/package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY hosted/ ./

ENV PORT=3000 \
    LEGIOX_DATA=/app/data \
    LEGIOX_BUNDLE=/app/bundle \
    LEGIOX_SDK_NODE_MODULES=/app/node_modules \
    LEGIOX_FILE_INFO_BACKEND=filesystem

RUN addgroup -g 1001 -S nodejs && adduser -S legiox -u 1001 && chown -R legiox:nodejs /app
USER legiox

VOLUME ["/app/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "mcp-http-server.mjs"]