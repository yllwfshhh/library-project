<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 📚 線上圖書借閱系統 (Library Management System)

這是一個符合三層式架構設計 (Three-Tier Architecture) 的線上圖書借閱系統，作為技術徵選與實作展示之用。

## 🎯 系統功能與特色
1. **註冊與登入**：使用者可透過手機號碼進行註冊與登入。
2. **借閱與歸還**：
   - 使用者可以借閱多本書籍（每書限藉一本）。
   - 借閱狀態會即時更新為「可借閱」或「已借閱」。
   - 每筆借閱皆會動態計算並提醒 **14天內的預計歸還日期**。
   - 資料隔離：每位登入使用者只能看到自己的借閱紀錄。
3. **資料庫交易安全性 (Transaction)**：所有借還書邏輯皆透過 MySQL **Stored Procedure** 實作，並使用 Pessimistic Locking (`FOR UPDATE`) 與 `ROLLBACK` 確保高併發下的資料完整性。
4. **資訊安全**：前端 Vue.js 實作 XSS 防禦，後端 Spring JDBC 實作 Parameterized Query (`?`) 完全阻絕 SQL Injection。

## 🛠️ 技術堆疊
- **前端 (Front-End)**: Vue.js 3 + Vite + TailwindCSS
- **後端 (Back-End)**: Java 17 + Spring Boot + Spring Web + Spring JDBC + Maven
- **資料庫 (Database)**: MySQL 8.0
- **基礎設施 (DevOps)**: Docker, Docker Compose, GitHub Actions (CI)

---

## 🚀 快速啟動指南 (一鍵啟動)

為了方便審查與測試，本專案已全面 Docker 化。請確保您的電腦已安裝 [Docker Desktop](https://www.docker.com/products/docker-desktop)。

在終端機中，切換到本專案的根目錄，並執行以下指令：

```bash
# 給予腳本執行權限 (Mac/Linux)
chmod +x start.sh

# 一鍵啟動所有服務 (資料庫 + 後端 API + 前端 UI)
./start.sh
```

**啟動後，請靜待約 30 秒讓資料庫完成初始化與 Java 後端編譯。**
系統就緒後，請使用瀏覽器開啟：
👉 **http://localhost:5173**

> **💡 預設測試帳號**
> - **手機號碼 (Phone)**: `0912345678`
> - **密碼 (Password)**: `test1234`
> 
> *您也可以直接點擊畫面上的 "Register" 自行註冊一組新帳號測試資料隔離機制。*

### 停止服務
當您測試完畢，可輸入以下指令關閉並清除環境：
```bash
docker compose down
```

---

## 📂 專案結構說明
- `LibraryProject/src/main/java/` : 後端 Spring Boot 原始碼 (Controller, Repository，符合展示/業務/資料層劃分)。
- `LibraryProject/frontend/` : 前端 Vue.js 原始碼。
- `LibraryProject/DB/` : 存放 `DDL.sql` (資料表建置、約束與 Stored Procedure) 以及 `DML.sql` (測試資料)。
- `.github/workflows/` : GitHub Actions CI 自動化編譯與測試腳本。

---
*Developed for Interview Assessment validation.*
