import { useNavigate, useLocation } from "react-router-dom";
import "./Consumer.css";
import { useState, useEffect} from "react";
import "./Consumer.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js"; 

export default function Consumer() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;  
  // const for Buy Wine
  const [wineID, setWineID] = useState("");
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [txHash, setTxHash] = useState("");
  // const for View My Wines
  const [myWines, setMyWines] = useState([]);
  const [loadingMyWines, setLoadingMyWines] = useState(false);



  const handleBuyWine = async () => {
    if (!wineID) {
      alert("Please fill in WineID!");
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
        ID: wineID
      };

      // 2. Upload to Pinata (backend)
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
      // Create a provider
      const provider = new ethers.BrowserProvider(window.ethereum);
      //?
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call buyWine function and get tokenId
      const tokenUri = `ipfs://${cid}`;
      const tx = await contract.buyWine(tokenIdNum);

      console.log("tx sent:", tx.hash);
      setTxHash(tx.hash);

      const receipt = await tx.wait();
      console.log("tx mined:", receipt);

      

      alert(`Wine Purchased! TokenID = ${tokenIdNum}`);
    } catch (err) {
      console.error(err);
      alert("Failed to buy wine: " + err.message);
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
      // const targetOwner = distributorAddress;
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  
      const CONSUMER_ROLE = await contract.CONSUMER_ROLE();
    


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

        // if not mine(distributor), skip
        // if (owner.toLowerCase() !== distributorAddr.toLowerCase()) continue;

        // key: check whether the owner has CONSUMER_ROLE
        const hasRole = await contract.hasRole(CONSUMER_ROLE, owner);

        if (!hasRole) continue; // if not distributor hold it, skip

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
    if (path === "/consumer/history") {
      loadMyWines();
    }
  }, [path]);

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/consumer");







  // function
  const renderContent = () => {
    if (path === "/consumer/mywines") {
      return (
        <div className="consumer-box">
          <h2>Receive Wine Info</h2>
          <div className="create-form"> 
            <label>Wine ID:</label>
            <input
              type="number"
              value={wineID}
              onChange={(e) => setWineID(e.target.value)}
              placeholder="e.g. 1"
            />
            <button onClick={handleBuyWine}>Receive Wine</button>

            {loading && <p>Uploading to IPFS...</p>}
            {cid && <p>Metadata CID: {cid}</p>}
            {txHash && <p>Transaction: {txHash}</p>}
          </div>
        </div>
      );
    }


    
    if (path === "/consumer/history") {
      return (
        <div className="consumer-box">
          <h2 className="mywines-title">🍷 My Wines (Consumer)</h2>


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
        <h1 className="title">Welcome, Consumer</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="consumer-buttons">
          <button onClick={() => navigate("/consumer/mywines")}>Buy wine</button>
          <button onClick={() => navigate("/consumer/history")}>View my wine</button>
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
