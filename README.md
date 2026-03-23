簡易專案-內容導向之筆記Web app
===
# 專案簡介

這是一個基於 React 與 Vite 構建的全端 Web 應用程式，專注於提供優質的 Markdown 內容閱讀體驗，以及完整的站內信箱交流系統，讓創作者與讀者能進行深度的文字互動。

# 核心功能
1. **站內信箱系統 (Mailbox System)**：
    * **信件緒對話設計**：採用類似 Gmail 的 **信件串流(Thread)** 排版，將同一主題的來回訊息自動收束，閱讀體驗清晰流暢。

    * **即時通知與未讀管理**：整合 **Socket.io** 達到新訊息即時推播，並具備完善的已讀/未讀狀態管理與批次標記已讀功能。

    * **共用回覆模組**：模組化回覆訊息功能，支援在文章頁面直接發送訊息，或在信箱頁面進行回覆。

2. **文章閱讀器 (Article Viewer)**：
    * **Markdown 渲染**：整合 react-markdown 與 remark-gfm，支援標準 Markdown 語法與 GitHub 擴充語法。

    * **自適應排版**：獨立的閱讀器樣式設定，確保最大化視窗時維持舒適的固定寬度，縮小時亦不跑版。

    * **使用者互動**：提供文章書籤（收藏）功能與關聯標籤（Tags）展示。

3. **全域導覽與狀態管理 (Header & Search)**：
    * 狀態同步：動態顯示使用者大頭貼、未讀訊息計數器，並即時反映帳號驗證狀態。

    * 搜尋整合：內建全域搜尋框，支援文章標題與關鍵字查詢。

4. **創作者與使用者系統**：
    * 個人頁面：整合個人作品集（Portfolio）與使用者設定頁面。

    * 編輯器：專屬的 Markdown 文章編輯與發布介面。

# 核心技術

* **核心框架**：React 18  
* **建置工具**：Vite  
* **路由管理**：React Router DOM  
* **API 串接**：Axios (透過自定義 Service 統一管理與攔截)  
* **WebSocket**：Socket.io-client (用於即時訊息推播)  
* **UI/UX 輔助**：React-Toastify (系統提示)  
* **內容解析**：React-Markdown, Remark-GFM  

# 目錄
```
src/
├─assets/          # 靜態資源 (圖片、Logo 等)  
├─components/      # 共用元件  
│  ├─Header.jsx         # 全域頂部導覽列  
│  └─messageModule.jsx  # 共用發信/回覆彈窗模組  
├─hooks/           # 自定義 Hook  
├─pages/           # 頁面級元件  
│  ├─article.jsx        # 文章閱讀頁  
│  ├─editor.jsx         # Markdown 編輯器頁  
│  ├─mailbox.jsx        # 站內信箱頁 (信件緒列表與詳細內容)  
│  ├─portfolio.jsx      # 個人作品集頁  
│  └─search.jsx         # 搜尋結果頁  
└─service/         # API 請求封裝  
   ├─articleService.js  # 文章相關 API  
   ├─messageService.js  # 信件相關 API  
   └─accountService.js  # 帳號權限相關 API
   ```