#!/usr/bin/env node
/**
 * MyClaw Proxy for Claude Code v3
 *
 * MyClaw always returns extended thinking blocks.
 * Claude Code doesn't request them (no beta header), so it chokes.
 * This proxy filters out all thinking content from the SSE stream.
 */

const http = require('http');
const https = require('https');
const url = require('url');

const TARGET = 'https://cxzfdbvutcaszjrxmklh.supabase.co/functions/v1/v1';
const PROXY_PORT = 9876;

const STRIP_BETA = [
  'claude-code-20250219','interleaved-thinking-2025-05-14',
  'context-management-2025-06-27','prompt-caching-scope-2026-01-05',
  'effort-2025-11-24','adaptive-thinking-2026-01-28','prompt-caching-2024-07-31',
];
const STRIP_HDR = [
  'anthropic-dangerous-direct-browser-access',
  'x-stainless-retry-count','x-stainless-timeout','x-stainless-lang',
  'x-stainless-package-version','x-stainless-os','x-stainless-arch',
  'x-stainless-runtime','x-stainless-runtime-version',
  'x-app','user-agent','connection','sec-fetch-mode','accept-language','accept-encoding',
];
const MODEL_MAP = {
  'claude-sonnet-4-6': 'claude-sonnet-4.6',
  'claude-opus-4-6':   'claude-sonnet-4.6',
  'claude-haiku-4-6':  'claude-sonnet-4.6',
  'claude-sonnet-4-5': 'claude-sonnet-4.6',
  'claude-opus-4-5':   'claude-sonnet-4.6',
};

function normalizeUsage(u) {
  if (!u) return u;
  u = {...u};
  if (u.cache_creation && typeof u.cache_creation === 'object') {
    const total = Object.values(u.cache_creation).reduce((a,b)=>a+(b||0),0);
    if (!u.cache_creation_input_tokens) u.cache_creation_input_tokens = total;
    delete u.cache_creation;
  }
  delete u.inference_geo;
  delete u.service_tier;
  delete u.speed;
  delete u.iterations;
  return u;
}

function patchObj(obj, origModel) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.model) obj.model = origModel;
  if (obj.usage) obj.usage = normalizeUsage(obj.usage);
  if (obj.message) obj.message = patchObj(obj.message, origModel);
  return obj;
}

/**
 * SSE stream filter state per request.
 * We track which content_block indices are thinking blocks,
 * then suppress all events for those indices.
 */
class StreamFilter {
  constructor(origModel) {
    this.origModel = origModel;
    this.buf = '';
    // Map from content_block index → whether it's a thinking block
    this.thinkingIndices = new Set();
    // Track current index offset after removing thinking blocks
    // (so text block index 1 becomes 0 if thinking block 0 is removed)
    this.indexRemap = new Map();
    this.textBlockCount = 0;
  }

  processLine(line) {
    if (!line.startsWith('data:')) return line;
    const jsonStr = line.slice(5).trim();
    if (!jsonStr || jsonStr === '[DONE]') return line;

    let obj;
    try { obj = JSON.parse(jsonStr); } catch { return line; }

    const type = obj.type;

    // --- Filter thinking content blocks ---

    if (type === 'content_block_start') {
      const idx = obj.index;
      const blockType = obj.content_block?.type;
      if (blockType === 'thinking') {
        this.thinkingIndices.add(idx);
        return null; // drop this event
      } else {
        // Remap the index to skip over thinking blocks
        const remapped = this.textBlockCount;
        this.indexRemap.set(idx, remapped);
        this.textBlockCount++;
        obj.index = remapped;
      }
    }

    if (type === 'content_block_delta') {
      const idx = obj.index;
      if (this.thinkingIndices.has(idx)) return null; // drop
      if (this.indexRemap.has(idx)) obj.index = this.indexRemap.get(idx);
    }

    if (type === 'content_block_stop') {
      const idx = obj.index;
      if (this.thinkingIndices.has(idx)) return null; // drop
      if (this.indexRemap.has(idx)) obj.index = this.indexRemap.get(idx);
    }

    // --- Filter thinking from message_start content array ---
    if (type === 'message_start' && obj.message && Array.isArray(obj.message.content)) {
      obj.message.content = obj.message.content.filter(b => b.type !== 'thinking');
    }

    // --- Patch model and usage ---
    patchObj(obj, this.origModel);

    return 'data: ' + JSON.stringify(obj);
  }

  feed(chunk) {
    this.buf += chunk;
    const lines = this.buf.split('\n');
    this.buf = lines.pop();

    const out = [];
    for (const line of lines) {
      const result = this.processLine(line);
      if (result !== null) out.push(result);
    }
    return out.join('\n') + '\n';
  }

  flush() {
    if (!this.buf) return '';
    const result = this.processLine(this.buf);
    this.buf = '';
    return result !== null ? result : '';
  }
}

// Filter thinking from non-streaming JSON response
function filterNonStreamBody(obj, origModel) {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj.content)) {
    obj.content = obj.content.filter(b => b.type !== 'thinking');
  }
  return patchObj(obj, origModel);
}

function buildUpstreamHeaders(reqHeaders, body) {
  const hdrs = {};
  for (const [k,v] of Object.entries(reqHeaders)) {
    const l = k.toLowerCase();
    if (STRIP_HDR.includes(l) || l === 'host') continue;
    if (l === 'anthropic-beta') {
      const flags = v.split(',').map(f=>f.trim()).filter(f=>!STRIP_BETA.includes(f));
      if (flags.length) hdrs[k] = flags.join(',');
      continue;
    }
    hdrs[k] = v;
  }
  const t = url.parse(TARGET);
  hdrs['host'] = t.host;
  hdrs['content-length'] = body.length.toString();
  hdrs['accept-encoding'] = 'identity';
  return hdrs;
}

const server = http.createServer((req, res) => {
  let chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    let body = Buffer.concat(chunks);
    let parsed = {};
    try { parsed = JSON.parse(body.toString()); } catch {}

    const origModel = parsed.model || 'unknown';
    if (parsed.model && MODEL_MAP[parsed.model]) {
      parsed.model = MODEL_MAP[parsed.model];
      body = Buffer.from(JSON.stringify(parsed));
    }

    const t = url.parse(TARGET);
    let path = req.url.replace(/\?.*$/, '');
    if (path.startsWith('/v1/')) path = path.slice(3);

    const hdrs = buildUpstreamHeaders(req.headers, body);
    const isStream = parsed.stream === true;

    console.log(`→ ${req.method} ${path} | ${origModel}→${parsed.model} stream:${isStream}`);

    const opts = {
      hostname: t.hostname, port: 443,
      path: t.path + path, method: req.method, headers: hdrs,
    };

    const filter = new StreamFilter(origModel);

    const pr = https.request(opts, pres => {
      const rh = {};
      for (const [k,v] of Object.entries(pres.headers)) {
        if (k.toLowerCase() !== 'content-encoding') rh[k] = v;
      }

      if (isStream && pres.statusCode === 200) {
        res.writeHead(200, rh);
        pres.on('data', chunk => {
          const out = filter.feed(chunk.toString());
          if (out) res.write(out);
        });
        pres.on('end', () => {
          const tail = filter.flush();
          if (tail) res.write(tail);
          res.end();
          console.log(`← 200 stream done`);
        });
      } else {
        let rb = [];
        pres.on('data', c => rb.push(c));
        pres.on('end', () => {
          let s = Buffer.concat(rb).toString();
          try {
            const obj = filterNonStreamBody(JSON.parse(s), origModel);
            s = JSON.stringify(obj);
          } catch {}
          console.log(`← ${pres.statusCode} | ${s.slice(0, 300)}`);
          rh['content-length'] = Buffer.byteLength(s).toString();
          res.writeHead(pres.statusCode, rh);
          res.end(s);
        });
      }
    });

    pr.on('error', e => {
      console.error('Proxy error:', e.message);
      res.writeHead(502);
      res.end(JSON.stringify({error: e.message}));
    });

    pr.write(body);
    pr.end();
  });
});

server.listen(PROXY_PORT, '127.0.0.1', () => {
  console.log(`✅ MyClaw proxy v3 on :${PROXY_PORT} — filters thinking blocks`);
  console.log(`   → ${TARGET}\n`);
});
