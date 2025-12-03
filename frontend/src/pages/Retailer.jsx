import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useContext} from "react";
import "./Retailer.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js";

import { RoleContext } from "../context/RoleContext";




export default function Retailer() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;  
  const { accountsInfo } = useContext(RoleContext);
  const retailerAddress = accountsInfo?.retailer;

  // const for View My Wines
  const [myWines, setMyWines] = useState([]);
  const [loadingMyWines, setLoadingMyWines] = useState(false);

  
  const [wineID, setWineID] = useState("");
  const [wineLocation, setWineLocation] = useState("");
  const [wineTemp, setWineTemp] = useState("");
  const [isConditionGood, setIsConditionGood] = useState();

  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [txHash, setTxHash] = useState("");
  const [loadingAction, setLoadingAction] = useState(false);

  const RETAILER_ROLE = ethers.id("RETAILER_ROLE");


  const handleReciveWine = async () => {
    if (!wineID || !wineLocation || !wineTemp ) {
      alert("Please fill in all the information!");
      return;
    }
    const tokenIdNum = Number(wineID);
    if (Number.isNaN(tokenIdNum) || tokenIdNum <= 0) {
      alert("Invalid tokenId");
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
      if (!res.ok) {
      alert("Failed to upload metadata."); 
      setLoading(false);
      return;
      }

      const data = await res.json();
      const cid = data.cid;
      setCid(data.cid);
      alert("Metadata uploaded!");

      // 3. call smart contract here
      // == MetaMask ==
      if (!window.ethereum) {
      alert("Please install MetaMask first!");
      setLoading(false);
      return;
      }
      // == provider ==
      const provider = new ethers.BrowserProvider(window.ethereum);
      //?
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 確認有 RETAILER_ROLE
      const signerAddress = await signer.getAddress();
      const retailerRoleOnChain = await contract.RETAILER_ROLE();
      const hasRole = await contract.hasRole(retailerRoleOnChain, signerAddress);
      if (!hasRole) {
        alert("目前 MetaMask 帳號沒有 RETAILER_ROLE，請切到 Retailer 帳號或在合約那邊先 grantRole。");
        setLoading(false);
        return;
      }
      
      //Call disributewine function 
      const tokenUri = `ipfs://${cid}`;
      const tx = await contract.receiveWine(tokenIdNum);

      console.log("tx sent:", tx.hash);
      setTxHash(tx.hash);

      const receipt = await tx.wait();
      console.log("tx mined:", receipt);

      //
      

      alert(`Wine received! TokenID = ${tokenIdNum}`);
    } catch (err) {
      console.error(err);
      alert("Failed to receive wine: " + err.message);
    }

    setLoading(false);
  };
  
  const loadMyWines = async () => {
    try {
      setLoadingMyWines(true);

      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      // const signer = await provider.getSigner();
      // const userAddress = await signer.getAddress();
      // const targetOwner = retailerAddress;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  
      const RETAILER_ROLE = await contract.RETAILER_ROLE();
    


      // 1. ask contract how many tokens minted so far
      const total = await contract.totalMinted();

      const wines = [];

      // 2. check each token's owner
      for (let i = 1; i <= Number(total); i++) {
        let owner;
        try {
          owner = await contract.ownerOf(i);
        } catch (e) {
          // token not exist
          continue;
        }

        // if not mine(retailer), skip
        // if (owner.toLowerCase() !== retailerAddr.toLowerCase()) continue;

        // key: check whether the owner has Retailer_ROLE
        const hasRole = await contract.hasRole(RETAILER_ROLE, owner);

        if (!hasRole) continue; // if not retailer hold it, skip

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
    if (path === "/retailer/mywines") {
      loadMyWines();
    }
  }, [path]);

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/retailer");




  // function
  const renderContent = () => {
    if (path === "/retailer/receive") {
      return (
        <div className="retailer-box">
          <h2>Receive Wine Info</h2>
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

            <button onClick={handleReciveWine}>Receive Wine</button>

            {loading && <p>Uploading to IPFS...</p>}
            {cid && <p>Metadata CID: {cid}</p>}
            {txHash && <p>Transaction: {txHash}</p>}
            
          </div>
        </div>
      );
    }


    /*if (path === "/retailer/deliver") {
      return (
        <div className="retailer-box">
          <h2>Deliver to Retailer</h2>

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
          <h2 className="mywines-title">🍷 My Wines (Retailer)</h2>

          {loadingMyWines && <p>Loading...</p>}

          {!loadingMyWines && myWines.length === 0 && (
            <p>You don’t have any wines yet.</p>
          )}

          {!loadingMyWines && myWines.length > 0 && (
            <div className="wine-list">
              {myWines.map((w) => (
                <div key={w.tokenId} className="wine-card">
                  <p><b>🏷️ Token ID:</b> {w.tokenId}</p>

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
              ))}
            </div>
          )}
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
          <button onClick={() => navigate("/retailer/deliver")}>Deliver to Retailer</button>
          <button onClick={() => navigate("/retailer/update")}>Update Condition</button>
          */}
          <button onClick={() => navigate("/retailer/mywines")}>View My Wines</button>
        </div>
      </>
    );
  };

  return (
    <div className="retailer-wrapper">

      {/* Show which account should be used */}
      <p style={{ color: "#7b1f23", fontWeight: 600, marginTop: "10px" }}>
        Please switch MetaMask to Retailer account: <b>{retailerAddress}</b>
      </p>
      
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
