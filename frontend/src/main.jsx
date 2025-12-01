// src/main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";          
import { RoleProvider } from "./context/RoleContext.jsx"; 
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RoleProvider>         
      <BrowserRouter>      
        <App />            
      </BrowserRouter>
    </RoleProvider>
  </StrictMode>
);