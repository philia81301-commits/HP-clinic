# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian。

## ⏯️ 目前做到哪

**階段二完成後的 bug 修復＋內容補強（2026-08-12）。**

潘醫師請 Claude Code 讀決策工具 HTML 抓問題，抓到並修好：

- `engine.js` 的 `decide()` 警示收集**漏接兩條規則表已定義的安全警語**：`bloodAntibody`（不可用血液抗體確認根除）與 `metronidazoleAlcohol`（服藥期間禁酒）——規則表寫了，前端永遠不會顯示。已修，並在 `engine.test.js` 加兩條回歸測試鎖住
- `bloodAntibody` 的引用標籤 `[DX-02]` 是斷鏈（`meta.sources` 沒有這個 key，雖然 `data/02` 有這個 fact 但屬「待溯源」等級），改引用同一事實已經在用的 `[FU-01]`
- 新增 `data/03-處方與抗藥性.md` 的 `[PPI-01]`：6 個 PPI 成分（esomeprazole／lansoprazole／omeprazole／pantoprazole／rabeprazole／dexlansoprazole）的學名／台灣商品名／常見錠劑規格／除菌 BID 劑量對照表，掛回決策工具 5 個含 PPI 處方；**BID 劑量數字本身仍標 🔲 待溯源**（引用一般臨床常識，非官方指引原文，尚待補實）
- 決策工具＋衛教單張頁尾加註署名「高雄榮總家庭醫學部　潘醫師」（潘醫師本人要求，見 agents.md 署名慣例段）
- `rules.json` 版本 1.0.0 → 1.0.2；`engine.test.js` 151 項全過；`acceptance.py` 19 PASS／0 FAIL
- 已 commit + push（`da73d3a`）
- **OneDrive `文件\HP-clinic_成品\` 的發送用副本已同步成修好的版本**（原本是 bug 修復前的舊版，這次一併更新）；資料夾內另有一個「病人衛教單張 複製.html」疑似重複檔，尚未處理，留給潘醫師確認要不要刪

## 🚦 目前狀態

- `rdq/RDQ-spec-hpylori-treatment-20260809.md`：已確認、需求凍結
- `data/`：01–06 六份；7 條 🔲 待溯源 fact（AMR-03、DX-02、EPI-02、EPI-03、EPI-04、FU-03、FU-05，跟上次一樣，PPI-01 本身有部分出處不算在這清單裡）不擋階段三
- `src/`：rules.json **v1.0.2**、engine.js、build.js、serve.js、**engine.test.js（151 項全過）**、**acceptance.py（19 PASS／0 FAIL）**、兩個 template 齊備
- `output/`：兩份 HTML（決策＋衛教，衛教 1 頁），皆為最新版
- OneDrive `文件\HP-clinic_成品\`：兩份 HTML，**已同步為最新版**（發送用副本）

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

- **改了 `output/` 的成品內容，記得同步更新 OneDrive `文件\HP-clinic_成品\` 的發送用副本**（這次就是漏了這步才發現舊版還帶著 bug；`cp output/*.html` 到那個資料夾即可）
- **署名固定寫「高雄榮總家庭醫學部　潘醫師」**（決策工具與衛教單張頁尾都有），改版面時不要漏掉或改掉這行
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

- 時間：2026-08-12
- 更新者：Claude Code @ DESKTOP-LVSV9Q5
- Git push：✅ 已推（9893005，程式碼修正見 da73d3a）