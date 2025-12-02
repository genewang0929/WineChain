// src/App.jsx
import { Routes, Route } from "react-router-dom";
import RoleSelect from "./pages/RoleSelect.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Winery from "./pages/Winery.jsx";
import Distributor from "./pages/Distributor.jsx";
import Retailer from "./pages/Retailer.jsx";
import Regulator from "./pages/Regulator.jsx";
import Consumer from "./pages/Consumer.jsx";
import { RoleProvider } from "./context/RoleContext";

function App() {
  return (
    <RoleProvider>
      <Routes>
        <Route path="/" element={<RoleSelect />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/winery" element={<Winery />} />
        <Route path="/winery/create" element={<Winery />} />
        <Route path="/winery/transfer" element={<Winery />} />
        <Route path="/winery/update" element={<Winery />} />
        <Route path="/winery/mywines" element={<Winery />} />

        <Route path="/distributor" element={<Distributor />} />
        <Route path="/distributor/receive" element={<Distributor />} />
        <Route path="/distributor/transfer" element={<Distributor />} />
        <Route path="/distributor/update" element={<Distributor />} />
        <Route path="/distributor/mywines" element={<Distributor />} />

        <Route path="/retailer" element={<Retailer />} />
        <Route path="/retailer/receive" element={<Retailer />} />
        <Route path="/retailer/deliver" element={<Retailer />} />
        <Route path="/retailer/update" element={<Retailer />} />
        <Route path="/retailer/mywines" element={<Retailer />} />

        <Route path="/regulator" element={<Regulator />} />
        <Route path="/regulator/approve" element={<Regulator />} />
        <Route path="/regulator/mywines" element={<Regulator />} />

        <Route path="/consumer" element={<Consumer />} />
        <Route path="/consumer/mywines" element={<Consumer />} />
        <Route path="/consumer/history" element={<Consumer />} />
        <Route path="/consumer/check" element={<Consumer />} />
      </Routes>
    </RoleProvider>
  );
}

export default App;
