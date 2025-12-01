import { useNavigate, useLocation } from "react-router-dom";
import "./Retailer.css";
import { useState } from "react";

export default function Retailer() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/retailer");


  const [wineID, setWineID] = useState("");
  const [wineLocation, setWineLocation] = useState("");
  const [wineTemp, setWineTemp] = useState("");
  const [isConditionGood, setIsConditionGood] = useState();
  
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleReciveWine = async () => {
    if (!wineID || !wineLocation || !wineTemp ) {
      alert("Please fill in all the information!");
      return;
    }

    setLoading(true);

    try {
      // 1. Build JSON metadata
      const metadata = {
        ID: wineID,
        Location: wineLocation,
        Temp: wineTemp,
      };

      // 2. Upload to Pinata (your backend)
      const res = await fetch("http://localhost:5001/uploadMetadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(metadata),
      });

      const data = await res.json();
      setCid(data.cid);

      // 3. TODO: call your smart contract here
      // const tx = await contract.methods.createWine(data.cid).send({ from: userAddress });
      // setTxHash(tx.transactionHash);

      alert("Metadata uploaded!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload metadata.");
    }

    setLoading(false);
  };

  // function
  const renderContent = () => {
    if (path === "/retailer/receive") {
      return (
        <div className="retailer-box">
          <h2>Retailor Recive Wine Info</h2>
          <div className="create-form"> 
            <label>Wine ID:</label>
            <input
              type="number"
              value={wineID}
              onChange={(e) => setWineID(e.target.value)}
              placeholder="e.g. 1"
            />

            <label>Location for Now:</label>
            <input
              type="text"
              value={wineLocation}
              onChange={(e) => setWineLocation(e.target.value)}
              placeholder="e.g. Tempe, AZ"
            />

            <label>Temperature:</label>
            <input
              type="text"
              value={wineTemp}
              onChange={(e) => setWineTemp(e.target.value)}
              placeholder="e.g. 75F"
            />

            <label>Condition Good?</label>
            <input
              type="checkbox"
              checked={isConditionGood}
              onChange={(e) => setIsConditionGood(e.target.checked)}
            />

            <button onClick={handleReciveWine}>Recive Wine</button>

            {loading && <p>Uploading to IPFS...</p>}
            {cid && <p>Metadata CID: {cid}</p>}
            {txHash && <p>Transaction: {txHash}</p>}

          </div>
        </div>
      );
    }
    /*
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
    */
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
          {/* 
          <button onClick={() => navigate("/retailer/deliver")}>Deliver to Consumer</button>
          <button onClick={() => navigate("/retailer/update")}>Update Condition</button>
          */}
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
