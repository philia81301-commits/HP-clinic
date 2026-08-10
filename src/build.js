/**
 * 建置腳本：把 rules.json 與 engine.js 內嵌進單一 HTML 檔
 *
 * 目的：規格卡要求「決策工具與衛教單張共用同一份規則表，不得各自實作」。
 *       以建置方式注入，而非複製貼上，確保 src/rules.json 永遠是唯一真相來源。
 *
 * 執行： node src/build.js
 * 產出：
 *   output/幽門螺旋桿菌陽性處置_診間決策工具.html（單檔、可離線、無外部相依）
 *   output/幽門螺旋桿菌陽性處置_病人衛教單張.html（210×279.4mm，目標 1 頁）
 */

const fs = require('fs');
const path = require('path');

const SRC = __dirname;
const OUT_DIR = path.join(SRC, '..', 'output');
const OUT_DECISION = path.join(OUT_DIR, '幽門螺旋桿菌陽性處置_診間決策工具.html');
const OUT_LEAFLET = path.join(OUT_DIR, '幽門螺旋桿菌陽性處置_病人衛教單張.html');

const decisionTemplate = fs.readFileSync(path.join(SRC, 'decision.template.html'), 'utf8');
const leafletTemplate = fs.readFileSync(path.join(SRC, 'leaflet.template.html'), 'utf8');
const rulesRaw = fs.readFileSync(path.join(SRC, 'rules.json'), 'utf8');
let engineRaw = fs.readFileSync(path.join(SRC, 'engine.js'), 'utf8');

// 驗證 rules.json 合法
let rules;
try {
  rules = JSON.parse(rulesRaw);
} catch (e) {
  console.error('✗ rules.json 解析失敗：' + e.message);
  process.exit(1);
}

/**
 * 內嵌到 <script> 區塊時，內容中任何 </script>（即使在註解或字串裡）
 * 都會被 HTML 解析器當成腳本結束標籤，導致整段語法錯誤。必須跳脫。
 */
function escapeForInlineScript(code) {
  return code.replace(/<\/(script)/gi, '<\\/$1');
}

/**
 * 確保產出的 HTML 沒有殘留外部資源請求（可離線要求）。
 */
function assertNoExternal(html, label) {
  const external = html.match(/(?:src|href)\s*=\s*["']https?:\/\/[^"']+["']/gi) || [];
  if (external.length) {
    console.error('✗ ' + label + ' 偵測到外部資源載入（違反可離線要求）：\n  ' + external.join('\n  '));
    process.exit(1);
  }
}

function buildDecision() {
  if (decisionTemplate.indexOf('/*__RULES_JSON__*/') === -1 || decisionTemplate.indexOf('/*__ENGINE_JS__*/') === -1) {
    console.error('✗ decision.template.html 缺少注入標記');
    process.exit(1);
  }
  const html = decisionTemplate
    .replace('/*__RULES_JSON__*/', escapeForInlineScript(JSON.stringify(rules, null, 2)))
    .replace('/*__ENGINE_JS__*/', escapeForInlineScript(engineRaw));

  // 回歸測試：確認注入後沒有殘留未跳脫的結束標籤
  const scriptBodies = html.split(/<script[^>]*>/i).slice(1).map(function (s) { return s.split(/<\/script>/i)[0]; });
  if (scriptBodies.length !== 3) {
    console.error('✗ 決策工具腳本區塊數量異常（預期 3，實得 ' + scriptBodies.length + '），可能有未跳脫的 </script>');
    process.exit(1);
  }
  assertNoExternal(html, '診間決策工具');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_DECISION, html, 'utf8');
  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log('✅ 診間決策工具：' + OUT_DECISION + '（' + kb + ' KB，單檔、無外部相依）');
}

function buildLeaflet() {
  if (leafletTemplate.indexOf('/*__VERIFIED_DATE__*/') === -1) {
    console.error('✗ leaflet.template.html 缺少驗證日注入標記');
    process.exit(1);
  }
  const html = leafletTemplate.replace('/*__VERIFIED_DATE__*/', rules.meta.verifiedDate);
  assertNoExternal(html, '病人衛教單張');
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_LEAFLET, html, 'utf8');
  const kb = (Buffer.byteLength(html, 'utf8') / 1024).toFixed(1);
  console.log('✅ 病人衛教單張：' + OUT_LEAFLET + '（' + kb + ' KB，A4∩Letter 210×279.4mm）');
}

console.log('建置開始：rules.json v' + rules.meta.version + '（更新日 ' + rules.meta.updated + '）\n');
buildDecision();
buildLeaflet();
console.log('\n✅ 建置完成');
