// src/App.jsx 
// Only route
import { Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect.jsx";
import Dashboard from "./pages/Dashboard.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<RoleSelect />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* 以後所有頁面都加在這裡就好 */}
    </Routes>
  );
}

export default App;