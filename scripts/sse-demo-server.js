// scripts/sse-demo-server.js
// Simple CORS-enabled Server-Sent Events (SSE) demo server
// Usage: npm run sse:demo (defaults to PORT=3002)

const http = require('http');
const url = require('url');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3002;

function setCORSHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Last-Event-ID');
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url || '/', true);

  // CORS preflight (even though GET usually doesn't need it, included for convenience)
  if (req.method === 'OPTIONS' && parsed.pathname === '/api/sse-demo') {
    setCORSHeaders(res);
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method === 'GET' && parsed.pathname === '/api/sse-demo') {
    // CORS + SSE headers
    setCORSHeaders(res);
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const clientId = Math.random().toString(36).slice(2);
    const startedAt = Date.now();

    // Advise the client to retry in case of disconnect
    res.write(`retry: 3000\n\n`);

    // Send a welcome event
    const hello = {
      type: 'welcome',
      clientId,
      startedAt,
      note: 'SSE demo stream connected',
    };
    res.write(`event: sse-demo\n`);
    res.write(`data: ${JSON.stringify(hello)}\n\n`);

    // Periodic updates
    const interval = setInterval(() => {
      const ev = {
        type: 'tick',
        ts: Date.now(),
        uptimeMs: Date.now() - startedAt,
        value: Math.floor(Math.random() * 1000),
      };
      res.write(`event: sse-demo\n`);
      res.write(`data: ${JSON.stringify(ev)}\n\n`);
    }, 2000);

    // Heartbeat comment (helps some proxies keep the stream alive)
    const hb = setInterval(() => {
      res.write(`: heartbeat ${Date.now()}\n\n`);
    }, 15000);

    req.on('close', () => {
      clearInterval(interval);
      clearInterval(hb);
      try {
        res.end();
      } catch (_) {}
    });

    return;
  }

  // Root help page
  if (req.method === 'GET' && parsed.pathname === '/') {
    setCORSHeaders(res);
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(
      `SSE Demo Server\n\n` +
        `GET  /api/sse-demo  -> text/event-stream\n` +
        `PORT=${PORT}\n` +
        `CORS: *\n\n` +
        `Example Storybook config:\n  SSE URL: http://localhost:${PORT}/api/sse-demo\n`,
    );
    return;
  }

  // Not found
  setCORSHeaders(res);
  res.statusCode = 404;
  res.end('Not found');
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[sse-demo-server] Listening on http://localhost:${PORT}`);
});
