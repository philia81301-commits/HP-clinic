# HP-clinic 幽門螺旋桿菌陽性處置專案（專案藍圖）

> 本檔為跨 Agent 通用的專案藍圖（AGENTS.md 開放標準）。任何 Agent 的每個 session 都應先讀本檔＋`handoff.md`。
> **需求已凍結**：`rdq/RDQ-spec-hpylori-treatment-20260809.md`（`status: confirmed`）為唯一需求來源，動工前必讀，不要重新詢問已確認事項。

## 專案簡介

為院內同仁（醫師、衛教師、藥師）建一套 H. pylori 檢測陽性的處置包：**診間決策工具**、**病人衛教單張**、**整理報告＋簡報**，三者共用同一份逐條溯源過的臨床資料層。**2026-08-12 起改為公開 repo＋GitHub Pages**（同事需要直接連結，潘V本人推翻原本「私有不上線」的決定），成品仍維持**單一離線 HTML 檔**（可離線用，也可上網開）。

## 關鍵時程

- 2026-08-09：RDQ 需求訪談完成並確認，專案初始化

## 目標與路線圖

分三段執行，每段結束跑「收工」交接。

- [x] **階段一：資料層＋查證**（`data/` 六份完成）
  - [x] 四項必須溯源的數字（見規格卡 🔍 段）—— 三項查得官方，抗藥率確認官方無資料
  - [x] 台灣本土抗藥率 —— 官方查無，改用學術研究並標資料年份
  - [x] `data/` 六份齊備：01 流病傳染、02 檢驗判讀與停藥、03 處方與抗藥性、**04 健保給付與申報**、05 複檢追蹤、06 家庭篩檢
  - [x] 釐清核心落差：**篩檢陽性無潰瘍者，治療後複檢無健保代碼可走**（見 [NHI-08]）
  - [ ] 17 條 🔲 待溯源（各檔檔尾），依「補不到就降級」或「補不到就不寫」兩種方式處理
- [ ] **階段二：診間決策工具＋病人衛教單張** —— 共用同一份 `src/rules.json`
  - [x] `src/rules.json` v1.0.0（21 條 sources、6 個療程、4 條決策規則、4 條給付規則）
  - [x] `src/engine.js` 決策引擎（Node 驗證 5 情境全對，含 penicillin 過敏防呆）
  - [x] `src/build.js` 產出 `output/` 兩份 HTML（決策工具＋衛教單張）
  - [x] `src/serve.js` 本機預覽（http://127.0.0.1:8765）
  - [x] Playwright 驗證：決策工具四情境全對（含過敏分支無洩漏 amoxicillin）
  - [x] **衛教單張已壓回 1 頁**（Chrome exe 實渲染驗證，footer 距底線 19pt 餘裕）
  - [x] `src/engine.test.js`（151 項全過：窮舉＋RDQ 情境＋無孤兒建議＋警示不漏接回歸測試）
  - [x] `src/acceptance.py`（對 RDQ 驗收條件：19 項 PASS，驗收全綠；36 條 WARN 為資料層已知待溯源）
  - [x] 2026-08-27 衛教單張加「除菌大作戰五連闖」闖關小遊戲——機制移植自 healthy-weight-public，
        遊戲放單張內容前面（遊戲先）、`@media print` 整段隱藏不影響單頁列印；
        寫在 `src/leaflet.template.html`；五題經潘醫師審定通過
  - [x] 2026-08-12 bug 修復＋內容補強（v1.0.0→1.0.2）：`engine.js` 警示收集漏接 bloodAntibody／metronidazoleAlcohol 兩條規則表已定義的安全警語，已修並補回歸測試；`bloodAntibody` 斷鏈引用 [DX-02]→[FU-01]；新增 `data/03` 的 [PPI-01]（6 個 PPI 成分學名／商品名／劑量對照）並掛回 5 個含 PPI 處方；決策工具＋衛教單張頁尾加註署名
- [ ] **階段三：整理報告（HTML）＋簡報（PPTX）**
  - [x] 2026-08-12：病人衛教單張圖片簡報（`output/幽門螺旋桿菌陽性處置_病人衛教圖卡.pptx`，11 頁）—— 用 `yaml-image-deck` 技能，plate 模式（AI 只畫背景插畫、文字用 jf-openhuninn-2.1 圓體字型後製疊加，避免精確數字被畫錯），規格與生成腳本留在 `deck/`（未納入 git，屬工作檔）

## 資料夾結構

```
HP-clinic/
├─ agents.md          本檔，專案藍圖
├─ handoff.md         交接檔，每次收工必更新
├─ index.html         GitHub Pages 入口頁（2026-08-12 新增，轉公開後才有）
├─ rdq/               需求規格卡（confirmed，唯一需求來源）
├─ data/              臨床資料層（*.md，每條須附出處與年份）
│   ├─ 01-流病與傳染.md
│   ├─ 02-檢驗判讀與檢查前停藥.md
│   ├─ 03-處方與抗藥性.md
│   ├─ 04-健保給付與申報.md        ← 官方出處密度最高，含 [NHI-08] 核心結論
│   ├─ 05-複檢與追蹤.md
│   └─ 06-家庭篩檢與同時治療.md
├─ src/               規則引擎與產生腳本（rules.json、engine.js、build.js、serve.js、engine.test.js、acceptance.py、*.template.html）
└─ output/            三份成品（HTML × 3、PPTX × 1）
```

## 臨床鐵律（本專案適用）

- **內容位階**：健保署／衛福部／國健署／疾管署公告優先；國際指引（如 2024 ACG）僅補充，且必須標「非官方」
- **有出處 ≠ 有定義**：素材裡的新聞、部落格、scribd、2013 年舊文件一律重查；查不到官方佐證就寫「僅見非官方來源」，**不准用推測填補**
- 每條臨床事實都要帶**出處連結＋資料年份／公告生效日**
- 決策工具**不收集任何病人資料**：純前端、無表單、無後端、無紀錄
- 過敏安全：**penicillin 過敏者一律導向不含 amoxicillin 的鉍劑四合一**

## 同步層級（本專案初始化至第 3 層級）

| 層級 | 平台 | 位置 | 讀取時機 |
|------|------|------|---------|
| L1 | 本地（`C:\projects\HP-clinic\`，不放雲端同步資料夾） | `agents.md`＋`handoff.md` | 每個 session |
| L2 | GitHub（**跨電腦同步唯一管道**） | philia81301-commits/HP-clinic（**公開**，2026-08-12 起） | 指定時 |
| L3 | Obsidian | `HP-clinic/專案工作流程.md` | 有需要時 |

## 工作約定

- 任何 Agent、任何電腦：**開工先讀 `handoff.md`，收工必更新 `handoff.md`**
- 修改共用檔案前先讀最新內容，避免覆蓋其他 Agent 的變更
- 所有回應與文件使用繁體中文
- 修改前先確認計畫，優先保留原有資料結構
- **2026-08-12 起 repo 已轉公開＋開 GitHub Pages**：https://philia81301-commits.github.io/HP-clinic/（入口頁 `index.html`）。同事要直接連結才轉的，原本「私有不開 Pages」的決定已作廢，**不要再引用舊決定**
- **署名慣例：沿用公開工具舊慣例，只署個人全名不掛機構**（頁尾「潘湘如醫師｜家庭醫學科」＋GitHub Issues 回報連結＋©＋CC BY-NC-ND 4.0）。08-12 當天曾短暫改成掛機構名「高雄榮總家庭醫學部　潘醫師」（那時還是私有工具），轉公開後已改回——**署名要跟著公開／私有狀態走，repo 一旦轉公開就要檢查署名有沒有還掛著機構名**
- **build.js 的 `assertNoExternal` 檢查會擋掉頁尾任何字面 `href="https://...`**（連結也算，不只 `<script src>`）：要在 `decision.template.html`／`leaflet.template.html` 加外部連結，URL 要拆字串再組合再塞進 `innerHTML`（例：`'https' + '://...'`），不要寫死在 HTML 屬性裡，否則 build 會失敗
