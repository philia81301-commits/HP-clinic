# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian。

## ⏯️ 目前做到哪

**階段二（決策工具＋衛教單張）主體與測試全數完成，剩 acceptance.py。**

- 衛教單張**已壓回 1 頁**：Chrome exe 實渲染 PDF 驗證 1 頁、footer 距底線 19pt 餘裕
- `src/engine.test.js` 建置完成：**128 項全過**（窮舉 6 組合＋過敏防呆＋給付規則六組合＋7 個 RDQ 情境＋結構完整性）
- 測試抓到 1 個真實 bug 並已修：`familyScreening` 引用 `FAM-03` 但 `rules.json` 遺漏該來源 → 已補上（國健署 health99.hpa.gov.tw/material/7475）

## 🚦 目前狀態

- `rdq/RDQ-spec-hpylori-treatment-20260809.md`：已確認，需求凍結，唯一需求來源
- `data/`：01–06 六份完成（階段一），17 條 🔲 待溯源未清、不擋階段二
- `src/`：rules.json（v1.0.0，21 條 sources）、engine.js、build.js、serve.js、decision.template.html、leaflet.template.html、**engine.test.js** 齊備
- `output/`：兩份 HTML 已產出（經此次縮排重建）
- **衛教單張 1 頁** ✅

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

## ➡️ 下一步

1. **建 `src/acceptance.py`**（對 RDQ 驗收條件）：核心檢查——每條資料有出處＋年份、決策工具輸出無孤兒建議、衛教單張 1 頁
2. **執行 test＋acceptance**：`node src/engine.test.js`（128 項）＋ acceptance.py
3. 之後可進 **階段三：整理報告（HTML）＋簡報（PPTX）**

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
- **衛教單張尺寸鐵律**：`@page size:210mm 279.4mm`（A4∩Letter 交集），**不要改成 size:Letter**（會比 A4 寬 5.9mm 被裁）；溢頁只靠縮字級/行距/文案解決
- **UI 預設值**：決策工具「有無潰瘍診斷」預設「無潰瘍診斷」（貼合主流情境）
- **`.playwright-mcp/` 已加進 .gitignore**，不 commit；serve.js 是本機預覽用，未在運作
- 用詞：決策工具不收集任何病人資料（純前端、無表單、無後端）
- **驗證渲染原則（本輪踩過）**：Playwright chromium 與實際產 PDF 的 Chrome exe 字體不同，量測高度不一致（Playwright 860px 看似 1 頁、Chrome exe 實渲染卻噴 2 頁）——**一律以 Chrome exe 實渲染 PDF 為準**，`node src/build.js` 後用 `--headless --print-to-pdf`＋`pdftotext` 數頁／`-bbox` 看 footer 餘裕

## 🕐 最後更新

- 時間：2026-08-10
- 更新者：opencode @ DESKTOP-LVSV9Q5
- Git push：❌ 未推（使用者指示只 commit 不 push。本地已 commit 63c79d5；加上先前 936db5b、3607c83，**目前領先遠端 3 個 commit，下次開工 `git push` 即可**）