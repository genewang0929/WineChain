import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Distributor.css";

export default function Distributor() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/distributor");
  
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
    //   // 1. Build JSON metadata
    //   const metadata = {
    //     ID: wineID,
    //     Location: wineLocation,
    //     Temp: wineTemp,
    //   };

    //   // 2. Upload to Pinata (your backend)
    //   const res = await fetch("http://localhost:5001/uploadMetadata", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(metadata),
    //   });

    //   const data = await res.json();
    //   setCid(data.cid);

      // 3. TODO: call your smart contract here
      const tx = await contract.methods.distr(data.cid).send({ from: userAddress });
      setTxHash(tx.transactionHash);

    //   alert("Metadata uploaded!");
    } catch (err) {
      console.error(err);
      alert("Failed to upload metadata.");
    }

    setLoading(false);
  };
  // function
  const renderContent = () => {
    if (path === "/distributor/receive") {
      return (
        <div className="distributor-box">
          <h2>Recive Wine Info</h2>
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


    /*if (path === "/distributor/transfer") {
      return (
        <div className="distributor-box">
          <h2>Transfer to Retailer</h2>

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
    */

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
          {/* 
          <button onClick={() => navigate("/distributor/transfer")}>Transfer to Retailer</button>
          <button onClick={() => navigate("/distributor/update")}>Update Condition</button>
          */}
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
