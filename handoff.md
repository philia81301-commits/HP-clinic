# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian。

## ⏯️ 目前做到哪

**階段二（決策工具＋衛教單張）全部完成，含驗收。**

- `src/acceptance.py` 完成並驗收全綠（19 PASS／0 FAIL）：A 資料層、B 可離線、C 無孤兒建議、D 衛教 1 頁（Chrome 實渲染）四組全過
- 修正 acceptance.py 兩處誤判：出處行判斷只認 `出處[:：]`（不再把「出處薄弱／出處為」當出處行）；新增「同 [ID]」引用有效性檢查
- `data/01` 補 [EPI-02] 位階行（原本缺位階，A1 檢查抓出）
- 兩份成品已複製到 OneDrive `文件\HP-clinic_成品\`（準備發給同仁），**分享連結尚未產生**

## 🚦 目前狀態

- `rdq/RDQ-spec-hpylori-treatment-20260809.md`：已確認、需求凍結
- `data/`：01–06 六份（階段一）；7 條 🔲 待溯源 fact（AMR-03、DX-02、EPI-02、EPI-03、EPI-04、FU-03、FU-05）不擋階段三
- `src/`：rules.json v1.0.0、engine.js、build.js、serve.js、**engine.test.js（128 項全過）**、**acceptance.py**、兩個 template 齊備
- `output/`：兩份 HTML（決策＋衛教，衛教 1 頁）
- OneDrive `文件\HP-clinic_成品\`：兩份 HTML（發送用副本）

## ⭐ 本階段最重要的發現（決策工具已實作）

**篩檢陽性、無潰瘍的病人，治療後複檢沒有健保代碼可走。**

| 環節 | 給付 |
|---|---|
| 篩檢（45–74 歲首次） | ✅ 公費，代碼 3F，終身一次 |
| 初次除菌治療 | ✅ 健保，憑陽性報告即可（113/8/1 起） |
| 第二線治療 | ✅ 健保 |
| **治療後複檢** | ❌ **無可用代碼** |

原因：30512C 適應症仍卡在「消化性潰瘍」且**自 103.08.01 從未修訂**；糞便抗原 3F 是 0 點數、限公費篩檢方案本身且終身一次。實務只有兩條路：自費複檢，或以「確實服藥」紀錄替代生物學複驗上傳國健署系統。詳見 `data/04` 的 [NHI-05]～[NHI-09]。

## ➡️ 下一步

1. **產生 OneDrive 分享連結**：`onedrive.live.com` → `文件\HP-clinic_成品` → 共用 → 「任何擁有此連結的人」→ 傳給同仁（要找 Agent 代操作也行）
2. **階段三：整理報告（HTML）＋簡報（PPTX）** —— 簡報走 pptx 技能；淺色底、內文 20–24pt 粗體、留白 30%、有數列畫原生圖表；報告與簡報一起對應 RDQ 驗收條件再跑一次 acceptance.py
3. 可選：清 `data/` 7 條待溯源（成品引用前需補實或降級，不擋階段三）

## ⚠️ 注意事項

- **兩台電腦都放 `C:\projects\HP-clinic\`**，開工前 `git pull`、收工後 `git push`；不要放進 OneDrive 或 Google 雲端硬碟（**注意：`HP-clinic_成品` 副本例外的放在 OneDrive，那是發送用）**
- **repo 私有**，內含健保給付條文，不得轉公開、不得開 GitHub Pages；GitHub 私人 repo 無法給「免登入」連結，發送一律靠聊天室／OneDrive 分享／隨身碟
- 原始素材（3 份 docx）在 `C:\Users\phili\Downloads\`，用 pandoc 轉 md，**不要直接讀 docx**
- **抗藥率官方查無**（已確認，不必再找），現用學術研究資料收集於 2013–2019，成品引用必須顯示年份；AMR-01 於 acceptance.py 已有專項檢查
- 用詞統一：複檢時機一律寫「**吃完藥滿一個月**」，不要混用「停藥後一個月」與「療程結束後 4 週」
- 話術陷阱：家庭篩檢**不可**寫成「全家一起治療」，正確是先篩檢、陽性才治療
- 自費金額**不要寫死**（各院自訂），成品寫「依各院所公告」
- 給付規定會變，成品必須顯示「本資料查證日：**2026-08-09**」
- **衛教單張尺寸鐵律**：`@page size:210mm 279.4mm`（A4∩Letter 交集），**不要改成 size:Letter**；溢頁只靠縮字級/行距/文案解決
- **驗證渲染原則**：一律以 **Chrome exe 實渲染 PDF 為準**（Playwright chromium 字體不同量測不準）；`node src/build.js` 後可用 `python src/acceptance.py` 自動驗（D2 會用 Chrome 實渲染數頁＋檢查紙張 595pt）
- acceptance.py 的 36 條 WARN 全是資料層已知狀態（7 條待溯源＋缺年份）**不是失敗**；FAIL 只會是結構破口
- **UI 預設值**：決策工具「有無潰瘍診斷」預設「無潰瘍診斷」
- **`.playwright-mcp/` 已加進 .gitignore**；serve.js 是本機預覽用
- 決策工具不收集任何病人資料（純前端、無表單、無後端）
- PowerShell 5.1 會把 git／gh 的 stderr 包成 NativeCommandError，看起來像失敗其實成功，看最後幾行判斷

## 🕐 最後更新

- 時間：2026-08-10
- 更新者：opencode @ DESKTOP-LVSV9Q5
- Git push：✅ 已推（8d469aa）