import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(fileURLToPath(new URL('../docs/', import.meta.url)));
const config = JSON.parse(await readFile(new URL('../site.config.json', import.meta.url), 'utf8'));
const base = config.basePath;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8' };
createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (pathname === '/') { response.writeHead(302, { Location: `${base}/` }).end(); return; }
    if (!pathname.startsWith(`${base}/`)) { response.writeHead(404).end('Not found'); return; }
    let target = path.resolve(root, pathname.slice(base.length + 1));
    if (target !== root && !target.startsWith(root + path.sep)) { response.writeHead(404).end('Not found'); return; }
    if ((await stat(target)).isDirectory()) target = path.join(target, 'index.html');
    response.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
    response.end(await readFile(target));
  } catch { response.writeHead(404).end('Not found'); }
}).listen(4173, '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:4173${base}/`));
