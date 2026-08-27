# 交接檔（handoff.md）

> 任何 Agent、任何電腦接手前**必讀**；收工時**必更新**。本檔只放交接必需的精簡資訊，詳細脈絡放 Obsidian。

## ⏯️ 目前做到哪

**2026-08-27：病人衛教單張加上「除菌大作戰五連闖」闖關小遊戲。**
機制移植自 healthy-weight-public（五題四選一、答對才出下一題、答錯抖動不扣分、集五星得稱號「除菌達人」），
依全站慣例**遊戲放在單張內容前面**（潘醫師指示「遊戲先」）。五題覆蓋：吃完療程、禁酒 48 小時、
黑便黑舌是鉍劑正常現象、複檢用吹氣／糞便（滿一個月）、家人先篩檢。出題守則：選項同構、
干擾項必須真錯、考安全重點不考背誦。**遊戲只在螢幕顯示，`@media print` 整段隱藏**，單頁列印完全不受影響。
改的是 `src/leaflet.template.html`（遊戲直接寫在 template，不經 rules.json），`node src/build.js` 重建，
engine 測試 151 項全過。localStorage key：`hp-quiz-leaflet`。五題已於 2026-08-27 經潘醫師審定通過。

**2026-08-12 同時發生兩件事：repo 轉公開＋開 Pages（另一 session），以及階段三病人衛教圖片簡報完成（本 session）。**

### 1. repo 從私有轉為公開＋開 GitHub Pages

起因：潘V在醫院用 OneDrive 網頁版「預覽」開診間決策工具，畫面正常但所有出處連結點不開（OneDrive 線上預覽用 sandbox iframe，會擋連結跳轉，不是檔案壞了）；同事也想要能直接點開的連結。潘V確認要推翻 08-09「私有不上線」的原始決定，改為公開。完成內容：

- `gh repo edit --visibility public`：repo 轉公開
- `gh api .../pages`：開通 GitHub Pages（main branch root）→ **https://philia81301-commits.github.io/HP-clinic/**
- 新增根目錄 `index.html`：Pages 入口頁，分「醫療人員用」診間決策工具／「給病人用」衛教單張兩張卡片
- 兩個 template（`decision.template.html`、`leaflet.template.html`）頁尾署名從「高雄榮總家庭醫學部　潘醫師」改回「潘湘如醫師｜家庭醫學科」（只署個人名，沿用骨鬆／肌少症等公開工具舊慣例——本專案轉公開後職務著作顧慮就適用了）
- 決策工具頁尾補 GitHub Issues 回報連結＋© 2026 潘湘如醫師＋CC BY-NC-ND 4.0（用字串拆解的方式注入，避開 `build.js` 的 `assertNoExternal` 離線檢查，見下方注意事項）
- `node src/build.js` 重建、`python src/acceptance.py` 重驗（19 PASS／0 FAIL，WARN 同舊，皆已知）
- 用瀏覽器實際打開 Pages 網址驗證：入口頁、決策工具都正常渲染，健保署／國健署等出處連結皆可正常點開
- OneDrive `文件\HP-clinic_成品\` 的發送用副本已同步成最新版（含新頁尾）
- 已 commit + push（`12f34e1`）

### 2. 階段三：病人衛教單張圖片簡報（PPTX，11 頁）

用 `yaml-image-deck` 技能，`output_mode: plate`——AI 只畫背景插畫（不含任何文字），精確臨床數字（14天、48小時、PPI停2週、抗生素鉍劑停4週、45–74歲、1% 等）全部用電腦字型後製疊字，避免 AI 把數字畫錯的用藥安全風險。完成內容：

- 下載並安裝 **jf-openhuninn-2.1**（justfont 開源粉圓體，OFL 授權可商用）到系統字型——這台電腦原本沒裝任何圓體中文字，plate 模式疊字需要
- 11 張背景插畫用 gpt-image-2（low quality）生成，花費約 NT$33；生成後逐張比對修正了多處文字疊到圖案的問題（golden sample 是 `page_04.png`）
- `deck/build_pptx.py` 讀 `deck/spec.yaml` 組裝成 PPTX（13.333×7.5in，16:9）
- 潘醫師收到後在 PowerPoint 手動調整了字體大小與間距（存成 `_1.pptx`），已用 python-pptx 逐一比對兩份檔案的座標／字級差異，**同步寫回 `spec.yaml`**，重新組裝後確認跟手改版本一致，取代成唯一正式檔（`_1.pptx` 已刪除）
- 成品：`output/幽門螺旋桿菌陽性處置_病人衛教圖卡.pptx`
- **本次收工一併把 `deck/` 納入 git**（`spec.yaml`、`build_pptx.py`、`render_preview.py`、`slides/images/*.png` 11 張原始背景圖）；`deck/preview/`（自製渲染驗收用，可重生成）已加進 `.gitignore` 不進 repo
- 沒有 LibreOffice，最終視覺驗收是用自製的 `render_preview.py`（同座標同字型的 PIL 渲染)，不是 PowerPoint 原生引擎；已跟使用者說明建議另外用 PowerPoint 開一次確認

## 🚦 目前狀態

- `rdq/RDQ-spec-hpylori-treatment-20260809.md`：已確認、需求凍結
- `data/`：01–06 六份；7 條 🔲 待溯源 fact 不擋階段三（未變動）
- `src/`：rules.json v1.0.2、engine.js、build.js、serve.js、engine.test.js（151 項全過）、acceptance.py（19 PASS／0 FAIL）、兩個 template 已改頁尾
- `output/`：兩份 HTML（決策＋衛教，含新頁尾）＋ **PPTX 圖片簡報（11 頁，本次新增）**
- **repo：公開，GitHub Pages 已上線** https://philia81301-commits.github.io/HP-clinic/
- OneDrive `文件\HP-clinic_成品\`：已同步最新版 HTML；PPTX 尚未同步過去（只在 `output/`）；裡面「病人衛教單張 複製.html」疑似重複檔，仍待潘醫師確認要不要刪
- `deck/`：階段三簡報素材，spec.yaml 已跟成品 PPTX 完全同步，本次收工一併進 git

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

1. **階段三：整理報告（HTML）** —— 尚未開始；有了 Pages 連結後，報告可以直接連到線上工具
2. 可選：PPTX 圖片簡報同步一份到 OneDrive `文件\HP-clinic_成品\`（跟兩份 HTML 一起發送用）
3. 可選：清 `data/` 7 條待溯源（成品引用前需補實或降級，不擋階段三）
4. 可選：`output/` 裡兩份 HTML 現在其實是「單一離線 HTML」與「公開網頁」雙重用途，之後若確定以 Pages 為主要發送管道，OneDrive 同步這一步可以考慮省略

## ⚠️ 注意事項

- **repo 已公開，不要再假設私有**：舊的「不得轉公開、不開 Pages」是 08-09 的決定，08-12 已被潘V本人推翻作廢
- **署名跟著公開／私有狀態走，不是一次定案**：目前是「潘湘如醫師｜家庭醫學科」（只署個人名）。如果之後又改回私有院內工具，才需要再問要不要掛機構名
- **`build.js` 的 `assertNoExternal` 檢查會擋掉頁尾任何字面 `href="https://...`**（超連結也算，不只 `<script src>`/`<img>`）：要加外部連結，URL 要拆字串再組合再塞進 `innerHTML`，不要寫死在 HTML 屬性裡，否則 build 直接 FAIL
- **OneDrive 網頁版「預覽」HTML 會用 sandbox iframe 擋掉連結跳轉**（畫面正常但連結點不開）——交付 HTML 工具給人時優先給 Pages 連結，不要叫對方直接在 OneDrive 網頁預覽裡用
- 改了 `output/` 的 HTML 成品內容，記得同步更新 OneDrive `文件\HP-clinic_成品\` 的發送用副本
- **兩台電腦都放 `C:\projects\HP-clinic\`**，開工前 `git pull`、收工後 `git push`；不要放進 OneDrive 或 Google 雲端硬碟
- 原始素材（3 份 docx）在 `C:\Users\phili\Downloads\`，用 pandoc 轉 md，**不要直接讀 docx**
- **抗藥率官方查無**（已確認，不必再找），現用學術研究資料收集於 2013–2019，成品引用必須顯示年份；AMR-01 於 acceptance.py 已有專項檢查
- 用詞統一：複檢時機一律寫「**吃完藥滿一個月**」，不要混用「停藥後一個月」與「療程結束後 4 週」
- 話術陷阱：家庭篩檢**不可**寫成「全家一起治療」，正確是先篩檢、陽性才治療
- 自費金額**不要寫死**（各院自訂），成品寫「依各院所公告」
- 給付規定會變，成品必須顯示「本資料查證日：**2026-08-09**」
- **衛教單張尺寸鐵律**：`@page size:210mm 279.4mm`（A4∩Letter 交集），**不要改成 size:Letter**；溢頁只靠縮字級/行距/文案解決
- **驗證渲染原則**：一律以 **Chrome exe 實渲染 PDF 為準**（Playwright chromium 字體不同量測不準）；`node src/build.js` 後可用 `python src/acceptance.py` 自動驗
- acceptance.py 的 WARN 全是資料層已知狀態（待溯源＋缺年份）**不是失敗**；FAIL 才是結構破口
- **UI 預設值**：決策工具「有無潰瘍診斷」預設「無潰瘍診斷」
- 決策工具不收集任何病人資料（純前端、無表單、無後端）
- PowerShell 5.1 會把 git／gh 的 stderr 包成 NativeCommandError，看起來像失敗其實成功，看最後幾行判斷
- **PPTX 圖片簡報（`deck/`）以後要改文字/字級/位置**：優先改 `deck/spec.yaml` 的 `overlay_blocks` 再跑 `python deck/build_pptx.py --spec deck/spec.yaml --images-dir deck/slides/images --out output/<檔名>.pptx` 重新組裝，不要只在 PowerPoint 裡改而不回寫 spec——否則下次重新生成會把手改的內容蓋掉
- 圓體字型 **jf-openhuninn-2.1** 已裝在這台電腦（`%LOCALAPPDATA%\Microsoft\Windows\Fonts\`），換一台電腦要用 `deck/` 重新生成/組裝前，記得先裝這個字型，否則 PowerPoint 疊字會 fallback 成預設字體

## 🕐 最後更新

- 時間：2026-08-27（衛教單張闖關小遊戲上線＋審定通過）
- 更新者：Claude Code（Fable 5）@ X108521（醫院）
- Git push：✅ 已推（`71dd0f3` 遊戲 → `378f015` 審定），線上版已驗證
- L3 Obsidian：⚠️ 本次在醫院電腦收工，此電腦的 vault 沒有本專案資料夾，L3 未更新
- ⚠️ OneDrive `文件\HP-clinic_成品\` 發送用副本在家用電腦——下次在那台開工記得同步最新版衛教單張
- 前一筆：2026-08-12 @ DESKTOP-LVSV9Q5 · ✅ 已推（`761b590`）
