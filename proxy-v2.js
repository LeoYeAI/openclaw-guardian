#!/usr/bin/env node
// MyClaw proxy v2 — forces thinking disabled, strips bad headers

const http = require('http');
const https = require('https');
const url = require('url');

const TARGET = 'https://cxzfdbvutcaszjrxmklh.supabase.co/functions/v1/v1';
const PORT = 9877;

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
  'claude-sonnet-4-6':'claude-sonnet-4.6',
  'claude-opus-4-6':'claude-sonnet-4.6',
  'claude-haiku-4-6':'claude-sonnet-4.6',
};

function normalizeUsage(u) {
  if (!u) return u;
  u = {...u};
  if (u.cache_creation && typeof u.cache_creation === 'object') {
    const total = Object.values(u.cache_creation).reduce((a,b)=>a+(b||0),0);
    if (!u.cache_creation_input_tokens) u.cache_creation_input_tokens = total;
    delete u.cache_creation;
  }
  delete u.inference_geo; delete u.service_tier;
  return u;
}

function patchObj(obj, m) {
  if (!obj || typeof obj !== 'object') return obj;
  if (obj.model) obj.model = m;
  if (obj.usage) obj.usage = normalizeUsage(obj.usage);
  if (obj.message) obj.message = patchObj(obj.message, m);
  return obj;
}

function patchLine(line, m) {
  if (!line.startsWith('data:')) return line;
  const j = line.slice(5).trim();
  if (!j || j === '[DONE]') return line;
  try { return 'data: ' + JSON.stringify(patchObj(JSON.parse(j), m)); }
  catch { return line; }
}

let sseBuf = '';
function patchChunk(chunk, m) {
  sseBuf += chunk;
  const lines = sseBuf.split('\n');
  sseBuf = lines.pop();
  return lines.map(l => patchLine(l, m)).join('\n') + '\n';
}

http.createServer((req, res) => {
  let chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const rawBody = Buffer.concat(chunks);
    let parsed = {};
    try { parsed = JSON.parse(rawBody.toString()); } catch {}

    const origModel = parsed.model || '(none)';
    if (parsed.model && MODEL_MAP[parsed.model]) parsed.model = MODEL_MAP[parsed.model];

    // Force disable thinking — MyClaw defaults it on, breaking Claude Code
    if (parsed.thinking === undefined) {
      parsed.thinking = { type: 'disabled' };
    }

    const body = Buffer.from(JSON.stringify(parsed));
    const t = url.parse(TARGET);
    let path = req.url.replace(/\?.*$/, '');
    if (path.startsWith('/v1/')) path = path.slice(3);

    const hdrs = {};
    for (const [k,v] of Object.entries(req.headers)) {
      const l = k.toLowerCase();
      if (STRIP_HDR.includes(l) || l === 'host') continue;
      if (l === 'anthropic-beta') {
        const flags = v.split(',').map(f=>f.trim()).filter(f=>!STRIP_BETA.includes(f));
        if (flags.length) hdrs[k] = flags.join(',');
        continue;
      }
      hdrs[k] = v;
    }
    hdrs['host'] = t.host;
    hdrs['content-length'] = body.length.toString();
    hdrs['accept-encoding'] = 'identity';

    const isStream = parsed.stream === true;
    console.log(`→ ${req.method} ${path} | ${origModel}→${parsed.model} stream:${isStream} thinking:${JSON.stringify(parsed.thinking)}`);

    const opts = {
      hostname: t.hostname, port: 443,
      path: t.path + path, method: req.method, headers: hdrs,
    };
    sseBuf = '';

    const pr = https.request(opts, pres => {
      const rh = {};
      for (const [k,v] of Object.entries(pres.headers)) {
        if (k.toLowerCase() !== 'content-encoding') rh[k] = v;
      }

      if (isStream && pres.statusCode === 200) {
        res.writeHead(200, rh);
        pres.on('data', chunk => res.write(patchChunk(chunk.toString(), origModel)));
        pres.on('end', () => {
          if (sseBuf) res.write(patchLine(sseBuf, origModel));
          res.end();
          console.log(`← 200 stream done`);
        });
      } else {
        let rb = [];
        pres.on('data', c => rb.push(c));
        pres.on('end', () => {
          let s = Buffer.concat(rb).toString();
          console.log(`← ${pres.statusCode} | ${s.slice(0, 500)}`);
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
}).listen(PORT, '127.0.0.1', () => {
  console.log(`✅ MyClaw proxy v2 on :${PORT} — thinking disabled`);
});

// debug override — log full stream
