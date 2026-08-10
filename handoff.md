# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian。

## ⏯️ 目前做到哪

**階段二（決策工具＋衛教單張）進行中，主體已完成。**

- `src/rules.json` v1.0.0：20 條 sources、6 個療程、4 條決策規則、4 條給付規則，JSON 驗證通過
- `src/engine.js`：決策引擎完成，Node 驗證 5 情境全對（first/second × 過敏 × refractory），過敏防呆（洩漏 amoxicillin 會回 error）
- `src/build.js`：已產出 `output/` 兩份 HTML（決策工具 38.7KB＋衛教單張 8.2KB），單檔、無外部資源
- `src/decision.template.html`：決策工具 UI（ulcer 預設「無潰瘍診斷」）
- `src/leaflet.template.html`：衛教單張（210×279.4mm，A4∩Letter）
- `src/serve.js`：本機預覽 http://127.0.0.1:8765（背景 process）
- Playwright 實測：**決策工具四情境全對**——預設情境顯示「複檢無健保可走：自費或確實服藥替代」、過敏分支無 amoxicillin、refractory 轉診消化內科、有潰瘍顯示 30512C 健保

## 🚦 目前狀態

- `rdq/RDQ-spec-hpylori-treatment-20260809.md`：已確認，需求凍結，唯一需求來源
- `data/`：01–06 六份完成（階段一），17 條 🔲 待溯源未清、不擋階段二
- `src/`：rules.json、engine.js、build.js、serve.js、decision.template.html、leaflet.template.html 齊備
- `output/`：兩份 HTML 已產出
- **衛教單張仍是 2 頁**（footer 溢到第二頁）——見下方注意事項，需以 PDF 實渲染為準再縮

## ⭐ 本階段最重要的發現（決策工具已實作）

**篩檢陽性、無潰瘍的病人，治療後複檢沒有健保代碼可走。**

| 環節 | 給付 |
|---|---|
| 篩檢（45–74 歲首次） | ✅ 公費，代碼 3F，終身一次 |
| 初次除菌治療 | ✅ 健保，憑陽性報告即可（113/8/1 起） |
| 第二線治療 | ✅ 健保 |
| **治療後複檢** | ❌ **無可用代碼** |

原因：30512C 適應症仍卡在「消化性潰瘍」且**自 103.08.01 從未修訂**；糞便抗原 3F 是 0 點數、限公費篩檢方案本身且終身一次。實務只有兩條路：自費複檢，或以「確實服藥」紀錄替代生物學複驗上傳國健署系統。

詳見 `data/04-健保給付與申報.md` 的 [NHI-05]～[NHI-09]。

## ➡️ 下一步（階段二剩餘）

1. **衛教單張壓回 1 頁**：已把字級縮到 13.5px、行距 1.38、精簡三處文案，screen 下 body 850px < 可用 973px，但 **headless PDF 實渲染仍 2 頁**（第二頁只剩 footer）——研判是 headless 無「Noto Sans TC」走 fallback 字體偏高所致。以 `pdftotext` 驗證（temp: leaflet_check.pdf），需再縮 footer 字級或精簡內容
2. 建 `src/engine.test.js`（窮舉＋情境測試）
3. 建 `src/acceptance.py`（對 RDQ 驗收條件）
4. 執行 test＋acceptance

## ⚠️ 注意事項

- **兩台電腦都放 `C:\projects\HP-clinic\`**，開工前 `git pull`、收工後 `git push`；不要放進 OneDrive 或 Google 雲端硬碟
- **repo 私有**，內含健保給付條文，不得轉公開、不得開 GitHub Pages
- 原始素材（3 份 docx）在 `C:\Users\phili\Downloads\`，用 pandoc 轉 md，**不要直接讀 docx**
- **抗藥率官方查無**（已確認，不必再找），現用學術研究資料收集於 2013–2019，成品引用必須顯示年份
- 用詞統一：複檢時機一律寫「**吃完藥滿一個月**」，不要混用「停藥後一個月」與「療程結束後 4 週」
- 話術陷阱：家庭篩檢**不可**寫成「全家一起治療」，正確是先篩檢、陽性才治療
- 自費金額**不要寫死**（各院自訂），素材原寫的「1,200–1,300 元」偏高且範圍過窄，已改用 [NHI-09]
- 給付規定會變，成品必須顯示「本資料查證日：**2026-08-09**」
- PowerShell 5.1 會把 git／gh 的 stderr 包成 NativeCommandError，看起來像失敗其實成功，看最後幾行判斷
- **衛教單張尺寸鐵律**：用 `@page size:210mm 279.4mm`（A4∩Letter 交集），**不要改成 size:Letter**（會比 A4 寬 5.9mm 被裁）；溢頁只靠縮字級/行距/文案解決
- **UI 預設值**：決策工具「有無潰瘍診斷」預設「無潰瘍診斷」（貼合主流情境）
- **`.playwright-mcp/` 已加進 .gitignore**，不 commit
- 用詞：決策工具不收集任何病人資料（純前端、無表單、無後端）

## 🕐 最後更新

- 時間：2026-08-10
- 更新者：opencode @ DESKTOP-LVSV9Q5
- Git push：待推（本次 commit 後回填）
