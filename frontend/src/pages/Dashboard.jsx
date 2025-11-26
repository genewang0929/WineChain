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

  const goToRolePage = () => {
    if (!role) return;
    const lower = role.toLowerCase();   // "Winery" → "winery"
    navigate(`/${lower}`);              // 導向 /winery
  };

  return (
    <div className="dashboard-wrapper">
      <button onClick={handleBack} className="back-to-role-btn">
      Back
      </button>

      {/* Main */}
      <div className="dashboard-content">
        <h1>
          You are <strong className="role-text">{role}</strong> ?
        </h1>

        <div style={{ marginTop: "100px" }}>
          <button className="enter-btn" onClick={goToRolePage}>
            Enter {role} Dashboard
          </button>
        </div>
          
      </div>
    </div>
  );
}