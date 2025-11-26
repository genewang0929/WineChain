import { useNavigate, useLocation } from "react-router-dom";
import "./Distributor.css";

export default function Distributor() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/distributor");

  // function
  const renderContent = () => {
    if (path === "/distributor/receive") {
      return (
        <div className="distributor-box">
          <h2>Create Wine NFT</h2>
          <p></p>
        </div>
      );
    }

    if (path === "/distributor/transfer") {
      return (
        <div className="distributor-box">
          <h2>Transfer to Retailer</h2>
          <p>Transfer UI</p>
        </div>
      );
    }

    if (path === "/distributor/update") {
      return (
        <div className="distributor-box">
          <h2>Update Condition</h2>
          <p>Update UI</p>
        </div>
      );
    }

    if (path === "/distributor/mywines") {
      return (
        <div className="distributor-box">
          <h2>My Wines</h2>
          <p>NFT list</p>
        </div>
      );
    }

    // main menu
    return (
      <>
        <h1 className="title">Welcome, Distributor</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="distributor-buttons">
          <button onClick={() => navigate("/distributor/receive")}>Receive from Winery</button>
          <button onClick={() => navigate("/distributor/transfer")}>Transfer to Retailer</button>
          <button onClick={() => navigate("/distributor/update")}>Update Condition</button>
          <button onClick={() => navigate("/distributor/mywines")}>View My Wines</button>
        </div>
      </>
    );
  };

  return (
    <div className="distributor-wrapper">
      
      {/* back to home */}
      <button className="distributor-back-btn" onClick={goHome}>
        Home
      </button>

      {path !== "/distributor" && (
        <button className="distributor-back-btn" style={{ left: "150px" }} onClick={goMenu}>
          Back
        </button>
      )}

      <div className="distributor-content">{renderContent()}</div>
    </div>
  );
}
