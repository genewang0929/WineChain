import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./Winery.css";

export default function Winery() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [wineName, setWineName] = useState("");
  const [origin, setOrigin] = useState("");
  const [year, setYear] = useState("");

  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [txHash, setTxHash] = useState("");

  const handleCreateWine = async () => {
    if (!wineName || !origin || !year) {
      alert("Please fill in all the information!");
      return;
    }

    setLoading(true);

    try {
      // 1. Build JSON metadata
      const metadata = {
        name: wineName,
        origin: origin,
        year: Number(year),
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

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/winery");

  // UI Renderer
  const renderContent = () => {
    if (path === "/winery/create") {
      return (
        <div className="winery-box">
          <h2>Create Wine</h2>

          <div className="create-form">
            <label>Wine Name:</label>
            <input
              type="text"
              value={wineName}
              onChange={(e) => setWineName(e.target.value)}
              placeholder="e.g. Chateau Margaux"
            />

            <label>Origin:</label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="e.g. France"
            />

            <label>Year:</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2020"
            />

            <button onClick={handleCreateWine}>Create Wine</button>

            {loading && <p>Uploading to IPFS...</p>}
            {cid && <p>Metadata CID: {cid}</p>}
            {txHash && <p>Transaction: {txHash}</p>}
          </div>
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
