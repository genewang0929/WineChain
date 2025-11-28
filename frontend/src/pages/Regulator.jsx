import { useNavigate, useLocation } from "react-router-dom";
import "./Regulator.css";

export default function Regulator() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/regulator");

  // function
  const renderContent = () => {
    if (path === "/regulator/approve") {
      return (
        <div className="regulator-box">
          <h2>Approve wine </h2>
          
        </div>
      );
    }


    // main menu
    return (
      <>
        <h1 className="title">Welcome, Regulator</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="regulator-buttons">
          <button onClick={() => navigate("/regulator/approve")}>Approve wine</button>
        </div>
      </>
    );
  };

  return (
    <div className="regulator-wrapper">
      
      {/* back to home */}
      <button className="regulator-back-btn" onClick={goHome}>
        Home
      </button>

      {path !== "/regulator" && (
        <button className="regulator-back-btn" style={{ left: "150px" }} onClick={goMenu}>
          Back 
        </button>
      )}

      <div className="regulator-content">{renderContent()}</div>
    </div>
  );
}
