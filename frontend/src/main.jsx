// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";          // ← 新增：路由
import { RoleProvider } from "./context/RoleContext.jsx"; // ← 新增：全域角色狀態
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RoleProvider>          {/* 1. 最外層包全域狀態 */}
      <BrowserRouter>       {/* 2. 再包路由系統 */}
        <App />             {/* 3. App 只負責顯示頁面 */}
      </BrowserRouter>
    </RoleProvider>
  </StrictMode>
);