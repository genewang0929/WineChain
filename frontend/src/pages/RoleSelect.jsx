import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../context/RoleContext";
import "./RoleSelect.css";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);

  const handleSelect = (role) => {
    setRole(role);        // store the role that the user choose
    navigate("/dashboard"); 
  };

  return (
    <div className="role-container">
      <h1 className="title">WineChain</h1>
      <h2 className="subtitle">I am...</h2>

      <div className="roles">
        <button onClick={() => handleSelect("WINERY")}>Winery</button>
        <button onClick={() => handleSelect("DISTRIBUTOR")}>Distributor</button>
        <button onClick={() => handleSelect("RETAILER")}>Retailer</button>
        <button onClick={() => handleSelect("REGULATOR")}>Regulator</button>
        <button onClick={() => handleSelect("CONSUMER")}>Consumer</button>
      </div>

      <button className="connect-btn">
        Connect Wallet
      </button>

      <footer className="footer">
        WineChain v1.0 — MIT License
      </footer>
    </div>
  );
}
