/**
 * 本機開發用靜態伺服器：把 HP-clinic 目錄以 HTTP 提供，方便用瀏覽器預覽成品。
 * 執行： node src/serve.js  [port]
 * 預設 port 8765。僅本機使用（127.0.0.1），不上線。
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = parseInt(process.argv[2], 10) || 8765;
const ROOT = path.join(__dirname, '..');

http.createServer(function (req, res) {
  let f = decodeURIComponent(req.url.split('?')[0]);
  if (f === '/') f = '/output/幽門螺旋桿菌陽性處置_診間決策工具.html';
  const p = path.normalize(path.join(ROOT, f));
  if (p.indexOf(ROOT) !== 0) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(p, function (e, d) {
    if (e) { res.writeHead(404); res.end('not found'); return; }
    const ext = path.extname(p).toLowerCase();
    const ct = ext === '.html' ? 'text/html; charset=utf-8'
      : ext === '.json' ? 'application/json; charset=utf-8'
      : ext === '.js' ? 'text/javascript; charset=utf-8'
      : 'text/plain; charset=utf-8';
    res.writeHead(200, { 'Content-Type': ct });
    res.end(d);
  });
}).listen(PORT, '127.0.0.1', function () {
  console.log('HP-clinic 預覽伺服器：http://127.0.0.1:' + PORT);
});
