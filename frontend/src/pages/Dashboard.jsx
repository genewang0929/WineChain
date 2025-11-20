import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../context/RoleContext.jsx";
import "./Dashboard.css";   

export default function Dashboard() {
  const { role, setRole } = useContext(RoleContext);  
  const navigate = useNavigate();

  const handleBack = () => {
    setRole(null);   
    navigate("/");   
  };

  return (
    <div className="dashboard-wrapper">
      <button onClick={handleBack} className="back-to-role-btn">
      Back
      </button>

      {/* Main */}
      <div className="dashboard-content">
        <h1>
          You are <strong className="role-text">{role}</strong>
        </h1>

        {/* Role Function */}
        <div className="coming-soon">
          
        </div>
      </div>
    </div>
  );
}