// Local-only fixed network profile for production-mode fixture previews.
// 150ms request latency and a shared 1.6Mbps download budget; no CPU throttling.
import http from "node:http";
const port = Number(process.env.NETWORK_FIXTURE_PORT || 3011);
const target = Number(process.env.FIXTURE_PORT || 3004);
if (
  ![port, target].every(
    (value) => Number.isInteger(value) && value >= 1024 && value <= 65535,
  ) ||
  port === target
)
  throw Error("Distinct localhost ports are required");
const active = new Set();
const timer = setInterval(() => {
  let budget = 4000; // 200KB/s shared across all concurrent responses.
  for (const stream of active) {
    const allowance = Math.max(1, Math.floor(budget / active.size));
    let sent = 0;
    while (stream.chunks.length && sent < allowance) {
      const chunk = stream.chunks[0];
      const size = Math.min(chunk.length, allowance - sent);
      stream.res.write(chunk.subarray(0, size));
      if (size === chunk.length) stream.chunks.shift();
      else stream.chunks[0] = chunk.subarray(size);
      stream.bytes -= size;
      sent += size;
    }
    budget -= sent;
    if (stream.bytes < 65536) stream.upstream?.resume();
    if (stream.done && !stream.chunks.length) {
      active.delete(stream);
      stream.res.end();
    }
    if (budget <= 0) break;
  }
}, 20);
const server = http.createServer((req, res) => {
  const state = { res, chunks: [], bytes: 0, done: false, upstream: undefined };
  let upstreamRequest;
  const delay = setTimeout(() => {
    if (res.destroyed) return;
    upstreamRequest = http.request(
      {
        hostname: "127.0.0.1",
        port: target,
        path: req.url,
        method: req.method,
        headers: { ...req.headers, host: `127.0.0.1:${target}` },
      },
      (upstream) => {
        state.upstream = upstream;
        res.writeHead(upstream.statusCode, upstream.headers);
        active.add(state);
        upstream.on("data", (chunk) => {
          state.chunks.push(chunk);
          state.bytes += chunk.length;
          if (state.bytes > 262144) upstream.pause();
        });
        upstream.on("end", () => {
          state.done = true;
        });
        upstream.on("error", () => res.destroy());
      },
    );
    upstreamRequest.on("error", () => {
      if (!res.headersSent) res.writeHead(502);
      res.end("Local production preview unavailable");
    });
    req.pipe(upstreamRequest);
  }, 150);
  res.on("close", () => {
    clearTimeout(delay);
    active.delete(state);
    state.upstream?.destroy();
    upstreamRequest?.destroy();
  });
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Local fixed-network fixture: http://127.0.0.1:${port} -> localhost:${target}; 150ms / 1.6Mbps aggregate; CPU unthrottled`,
  ),
);
const stop = () => {
  clearInterval(timer);
  server.close();
  for (const state of active) state.res.destroy();
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
