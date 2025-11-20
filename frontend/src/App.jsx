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
      
    </Routes>
  );
}

export default App;