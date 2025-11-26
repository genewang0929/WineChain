import { useNavigate, useLocation } from "react-router-dom";
import "./Retailer.css";

export default function Retailer() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/retailer");

  // function
  const renderContent = () => {
    if (path === "/retailer/receive") {
      return (
        <div className="retailer-box">
          <h2>Create Wine NFT</h2>
          <p></p>
        </div>
      );
    }

    if (path === "/retailer/deliver") {
      return (
        <div className="retailer-box">
          <h2>Deliver to Consumer</h2>
          <p>Transfer UI</p>
        </div>
      );
    }

    if (path === "/retailer/update") {
      return (
        <div className="retailer-box">
          <h2>Update Condition</h2>
          <p>Update UI</p>
        </div>
      );
    }

    if (path === "/retailer/mywines") {
      return (
        <div className="retailer-box">
          <h2>My Wines</h2>
          <p>NFT list</p>
        </div>
      );
    }

    // main menu
    return (
      <>
        <h1 className="title">Welcome, Retailer</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="retailer-buttons">
          <button onClick={() => navigate("/retailer/receive")}>Receive from Distributor</button>
          <button onClick={() => navigate("/retailer/deliver")}>Deliver to Consumer</button>
          <button onClick={() => navigate("/retailer/update")}>Update Condition</button>
          <button onClick={() => navigate("/retailer/mywines")}>View My Wines</button>
        </div>
      </>
    );
  };

  return (
    <div className="retailer-wrapper">
      
      {/* back to home */}
      <button className="retailer-back-btn" onClick={goHome}>
        Home
      </button>

      {path !== "/retailer" && (
        <button className="retailer-back-btn" style={{ left: "150px" }} onClick={goMenu}>
          Back 
        </button>
      )}

      <div className="retailer-content">{renderContent()}</div>
    </div>
  );
}
