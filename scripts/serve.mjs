import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import './build.mjs';
const types = { html: 'text/html', js: 'text/javascript', css: 'text/css', json: 'application/json', svg: 'image/svg+xml' };
createServer(async (req, res) => {
  const file = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
  if (!['index.html','style.css','app.js','model.js','favicon.svg','data.json'].includes(file)) { res.writeHead(404).end(); return; }
  try { res.setHeader('Content-Type', types[file.split('.').pop()]); res.end(await readFile(`dist/${file}`)); }
  catch { res.writeHead(500).end('Could not read website file'); }
}).listen(4173, '127.0.0.1', () => console.log('Guild dashboard: http://localhost:4173'));
