import {createBetaAuth} from './beta-auth.mjs';
import {createServer} from 'node:http';
import {createReadStream, existsSync, statSync, writeFileSync} from 'node:fs';
import {resolve, dirname, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readyFile = process.argv[2];
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.glb':'model/gltf-binary','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp3':'audio/mpeg','.ogg':'audio/ogg','.wav':'audio/wav'};
const ready = port => { const result = {url:`http://127.0.0.1:${port}`,root}; if (readyFile) writeFileSync(readyFile,JSON.stringify(result)); console.log(JSON.stringify(result)); };
const auth = createBetaAuth(resolve(root,'.local','beta-auth.sqlite'));
const server = createServer(async (req,res) => {
  try {
    if (await auth.handle(req,res)) return;
    const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (pathname === '/__colors_workspace') { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({root,authVersion:3})); return; }
    const file = resolve(root,'.'+(pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root+sep) || file.slice(root.length).split(/[\\/]/).some(part => part.startsWith('.')) || !existsSync(file) || !statSync(file).isFile()) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type',types[extname(file).toLowerCase()] ?? 'application/octet-stream');
    res.setHeader('Cache-Control','no-cache');
    const stream = createReadStream(file); stream.on('error',()=>res.destroy()); stream.pipe(res);
  } catch { res.writeHead(400).end(); }
});
for (let port=4173; port<=4193; port++) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/__colors_workspace`,{signal:AbortSignal.timeout(500)});
    if (response.ok && await response.json().then(info=>info.root === root && info.authVersion === 3)) { ready(port); process.exit(0); }
  } catch {}
  try {
    await new Promise((done,reject)=>{ const fail=error=>{server.off('listening',success);reject(error);};const success=()=>{server.off('error',fail);done();};server.once('error',fail);server.once('listening',success);server.listen(port,'127.0.0.1'); });
    ready(port); break;
  } catch(error) { if (!['EADDRINUSE','EACCES'].includes(error.code) || port===4193) throw error; }
}
