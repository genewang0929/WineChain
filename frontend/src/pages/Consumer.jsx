import { useNavigate, useLocation } from "react-router-dom";
import "./Consumer.css";

export default function Consumer() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/consumer");

  // function
  const renderContent = () => {
    if (path === "/consumer/mywines") {
      return (
        <div className="consumer-box">
          <h2>View wine </h2>
          <p></p>
        </div>
      );
    }


    if (path === "/consumer/history") {
      return (
        <div className="consumer-box">
          <h2>My Wines</h2>
          <p>NFT list</p>
        </div>
      );
    }

    if (path === "/consumer/check") {
        return (
          <div className="consumer-box">
            <h2>My Wines</h2>
            <p>NFT list</p>
          </div>
        );
      }
  

    // main menu
    return (
      <>
        <h1 className="title">Welcome, Consumer</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="consumer-buttons">
          <button onClick={() => navigate("/consumer/mywines")}>View my wine</button>
          <button onClick={() => navigate("/consumer/history")}>View Transaction History</button>
          <button onClick={() => navigate("/consumer/check")}>Check authenticity</button>
        </div>
      </>
    );
  };

  return (
    <div className="consumer-wrapper">
      
      {/* back to home */}
      <button className="consumer-back-btn" onClick={goHome}>
        Home
      </button>

      {path !== "/consumer" && (
        <button className="consumer-back-btn" style={{ left: "150px" }} onClick={goMenu}>
          Back 
        </button>
      )}

      <div className="consumer-content">{renderContent()}</div>
    </div>
  );
}
