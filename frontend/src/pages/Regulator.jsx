import { useNavigate, useLocation } from "react-router-dom";
import "./Regulator.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js";
import { useState, useEffect } from "react";

export default function Regulator() {
  const navigate = useNavigate();
  const location = useLocation();

  const path = location.pathname;  

  // const for View My Wines
  const [myWines, setMyWines] = useState([]);
  const [loadingMyWines, setLoadingMyWines] = useState(false);
  const [txHash, setTxHash] = useState("");

  const approveWine = async (wine) => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    if (w.metadata.isConditionGood === undefined) {
      alert(`Wine ID ${wine.tokenId}'s condition data is missing!`);
      return;
    }
    else if (wine.metadata.isConditionGood === false) {
      alert(`Wine ID ${wine.tokenId} is marked as bad condition. Cannot approve.`);
      return;
    }
    try {
      const tx = await contract.inspectWine(wine.tokenId, true, wine.tokenUri)
      console.log("tx sent:", tx.hash);
      setTxHash(tx.hash);
      const receipt = await tx.wait();
      console.log("tx mined:", receipt);
      alert(`Wine ID ${wine.tokenId} approved successfully! Tx Hash: ${receipt.transactionHash}`);
    } catch (err) {
      console.error(err);
      alert("Failed to approve wine: " + err.message);
    }
  }

  const loadMyWines = async () => {
    try {
      setLoadingMyWines(true);

      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 1. ask contract how many tokens minted so far
      const total = await contract.totalMinted();
      console.log(total);
      

      const wines = [];

      // 2. check each token's owner
      for (let i = 1; i <= Number(total); i++) {
        let owner;
        let retailerAddress;
        try {
          owner = await contract.ownerOf(i);
          retailerAddress = await contract.getWine(i)[4];
          
        } catch (e) {
          // token not exist
          continue;
        }

        // if owner not retailer, skip
        if (owner.toLowerCase() !== retailerAddress.toLowerCase()) continue;

        // 3. get tokenURI (ipfs://CID)
        const tokenUri = await contract.tokenURI(i);

        // 4. use HTTP URL to get metadata 
        let httpURL = tokenUri;
        if (tokenUri.startsWith("ipfs://")) {
          const cid = tokenUri.replace("ipfs://", "");
          httpURL = `https://gateway.pinata.cloud/ipfs/${cid}`;
        }

        let metadata = {};
        try {
          const res = await fetch(httpURL);
          if (res.ok) {
            metadata = await res.json();
          }
        } catch (err) {
          console.error("Failed to fetch metadata for token", i, err);
        }

        wines.push({
          tokenId: i.toString(),
          tokenUri,
          metadata,
        });
      }

      setMyWines(wines);
    } catch (err) {
      console.error(err);
      alert("Failed to load wines: " + err.message);
    } finally {
      setLoadingMyWines(false);
    }
  };
  useEffect(() => {
    if (path === "/regulator/approve") {
      loadMyWines();
    }
  }, [path]);

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/regulator");

  // function
  const renderContent = () => {
    if (path === "/regulator/approve") {
      return (
        <div className="regulator-box">
          <h2>Approve wines </h2>
          {loadingMyWines && <p>Loading...</p>}

          {!loadingMyWines && myWines.length === 0 && (
            <p>You don’t have any wines yet.</p>
          )}

          {!loadingMyWines && myWines.length > 0 && (
            <div className="wine-list">
              {myWines.map((w) => (
                <div key={w.tokenId} className="wine-card">
                  <div>
                    <p><b>Token ID:</b> {w.tokenId}</p>

                    <p>
                      <b>IPFS URI:</b>{" "}
                      <a href={w.tokenUri} target="_blank" rel="noreferrer">
                        {w.tokenUri}
                      </a>
                    </p>

                    <p><b>Name:</b> {w.metadata.name}</p>
                    <p><b>Region:</b> {w.metadata.origin}</p>
                    <p><b>Year:</b> {w.metadata.year}</p>
                    <p><b>Temperature:</b> {w.metadata.tempature}</p>
                    <p><b>Condition Good:</b> {String(w.metadata.isConditionGood)}</p>
                  </div>
                  <button className="wine-inspect" onClick={approveWine(w)}>Inspect</button>
                </div>
              ))}
            </div>
          )}
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
