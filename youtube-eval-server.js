const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

const PORT = 8080;
const HOST = '0.0.0.0';

const HTML_PATH = path.join(__dirname, 'youtube-eval-ui.html');
function getHTML() {
  try { return fs.readFileSync(HTML_PATH, 'utf8'); }
  catch (e) { return '<h1>Error loading UI</h1><p>' + e.message + '</p>'; }
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (parsedUrl.pathname === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHTML());
    return;
  }

  if (parsedUrl.pathname === '/api/evaluate' && req.method === 'GET') {
    const ytUrl = parsedUrl.query.url;
    if (!ytUrl) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing url parameter' }));
      return;
    }
    const safeUrl = ytUrl.replace(/[^a-zA-Z0-9:\/\.\-\_\@\?\=\&\+\%]/g, '');
    const scriptPath = path.join(__dirname, 'youtube-eval.sh');

    exec(`bash "${scriptPath}" "${safeUrl}"`, {
      timeout: 120000,
      maxBuffer: 2 * 1024 * 1024
    }, (error, stdout, stderr) => {
      res.writeHead(200, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*'
      });
      if (error && !stdout) {
        res.end(JSON.stringify({ error: error.message }));
        return;
      }
      // stdout should already be JSON
      try {
        JSON.parse(stdout); // validate
        res.end(stdout);
      } catch (e) {
        res.end(JSON.stringify({ error: 'Invalid response', raw: stdout }));
      }
    });
    return;
  }

  if (parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', uptime: process.uptime() }));
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, HOST, () => {
  console.log('YouTube KOL Eval running on http://' + HOST + ':' + PORT);
});
