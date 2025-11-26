import { useNavigate, useLocation } from "react-router-dom";
import "./Winery.css";

export default function Winery() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/winery");

  // function
  const renderContent = () => {
    if (path === "/winery/create") {
      return (
        <div className="winery-box">
          <h2>Create Wine NFT</h2>
          <p>Create Wine</p>
        </div>
      );
    }

    if (path === "/winery/transfer") {
      return (
        <div className="winery-box">
          <h2>Transfer to Distributor</h2>
          <p>Transfer UI</p>
        </div>
      );
    }

    if (path === "/winery/update") {
      return (
        <div className="winery-box">
          <h2>Update Condition</h2>
          <p>Update UI</p>
        </div>
      );
    }

    if (path === "/winery/mywines") {
      return (
        <div className="winery-box">
          <h2>My Wines</h2>
          <p>NFT list</p>
        </div>
      );
    }

    return (
      <>
        <h1 className="title">Welcome, Winery</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="winery-buttons">
          <button onClick={() => navigate("/winery/create")}>Create Wine NFT</button>
          <button onClick={() => navigate("/winery/transfer")}>Transfer to Distributor</button>
          <button onClick={() => navigate("/winery/update")}>Update Condition</button>
          <button onClick={() => navigate("/winery/mywines")}>View My Wines</button>
        </div>
      </>
    );
  };

  return (
    <div className="winery-wrapper">
      
      <button className="winery-back-btn" onClick={goHome}>
        Home
      </button>

      {path !== "/winery" && (
        <button className="winery-back-btn" style={{ left: "150px" }} onClick={goMenu}>
          Back 
        </button>
      )}

      <div className="winery-content">{renderContent()}</div>
    </div>
  );
}
