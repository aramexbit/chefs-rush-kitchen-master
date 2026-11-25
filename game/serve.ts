// Dev server kecil untuk Chef's Rush: sajikan folder game sebagai file statis.
// Jalankan: node serve.ts [port]  (default 8901)
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const root = process.cwd();
const port = Number(process.argv[2] || 8901);
const types = {
  '.html': 'text/html', '.js': 'text/javascript', '.ts': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
};

createServer(async (req, res) => {
  const path = (req.url || '/').split('?')[0];
  const file = join(root, path === '/' ? 'index.html' : path);
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('not found');
  }
}).listen(port, () => console.log('serving on ' + port));
