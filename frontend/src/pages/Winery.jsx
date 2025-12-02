import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect} from "react";
import "./Winery.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js"; 


export default function Winery() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  const [wineName, setWineName] = useState("");
  const [origin, setOrigin] = useState("");
  const [year, setYear] = useState("");
  const [tempature, setTemp] = useState("");
  const [isConditionGood, setIsConditionGood] = useState();
  
  const [loading, setLoading] = useState(false);
  const [cid, setCid] = useState("");
  const [txHash, setTxHash] = useState("");

  // const for View My Wines
  const [myWines, setMyWines] = useState([]);
  const [loadingMyWines, setLoadingMyWines] = useState(false);

  const handleCreateWine = async () => {
    if (!wineName || !origin || !year || !tempature ) {
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
        tempature: Number(tempature),
        isConditionGood: isConditionGood,
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
      //await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      //await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Call createWine function and get tokenId
      const tokenUri = `ipfs://${cid}`;
      const tx = await contract.createWine(tokenUri);

      console.log("tx sent:", tx.hash);
      setTxHash(tx.hash);

      const receipt = await tx.wait();
      console.log("tx mined:", receipt);

      // Get the tokenId from the Transfer event
      let tokenId = null;
      const eventSignature = ethers.id("WineCreated(uint256,address,string)");

      for (const log of receipt.logs) {
        if (log.topics[0] === eventSignature) {
          tokenId = ethers.getBigInt(log.topics[1]).toString();
          break;
        }
      }

      if (tokenId) {
        alert(`Wine Created! TokenID = ${tokenId}`);
        console.log("Parsed tokenID:", tokenId);
      } else {
        alert("Wine created, but tokenId could not be parsed.");
      }

    } catch (err) {
      console.error(err);
      alert("Failed to create wine: " + err.message);
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
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // 1. ask total minted wines 
      const total = await contract.totalMinted();

      const wines = [];

      // 2. check each tokenId's owner
      for (let i = 1; i <= Number(total); i++) {
        let owner;
        try {
          owner = await contract.ownerOf(i);
        } catch (e) {
          // token not exist
          continue;
        }

        // use ownerOf check if it's mine wine now
        if (owner.toLowerCase() !== userAddress.toLowerCase()) continue;

        // 3. get tokenURI (ipfs://CID)
        const tokenUri = await contract.tokenURI(i);

        // 4. transfer to  HTTP URL to get metadata JSON
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
    if (path === "/winery/mywines") {
      loadMyWines();
    }
  }, [path]);



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

            <label>Region:</label>
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

            <label>Temperature:</label>
            <input
              type="number"
              value={tempature}
              onChange={(e) => setTemp(e.target.value)}
              placeholder="75F"
            />

            <label>Condition Good?</label>
            <input
              type="checkbox"
              checked={isConditionGood}
              onChange={(e) => setIsConditionGood(e.target.checked)}
            />


            <button onClick={handleCreateWine}>Create Wine</button>

            {loading && <p>Uploading to IPFS...</p>}
            {cid && <p>Metadata CID: {cid}</p>}
            {txHash && <p>Transaction: {txHash}</p>}
          </div>
        </div>
      );
    }

    /*if (path === "/winery/transfer") {
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
    */
    if (path === "/winery/mywines") {
      return (
        <div className="winery-box">
          <h2>My Wines</h2>

          {loadingMyWines && <p>Loading...</p>}

          {!loadingMyWines && myWines.length === 0 && (
            <p>You don’t have any wines yet.</p>
          )}

          {!loadingMyWines && myWines.length > 0 && (
            <div className="wine-list">
              {myWines.map((w) => (
                <div key={w.tokenId} className="wine-card">
                  <p><b>Token ID:</b> {w.tokenId}</p>

                  <p>
                    <b>IPFS URI:</b>{" "}
                    <a href={w.tokenUri} target="_blank" rel="noreferrer">
                      {w.tokenUri}
                    </a>
                  </p>

                  {/* 這裡是你當初丟給 Pinata 的 metadata 欄位 */}
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


    return (
      <>
        <h1 className="title">Welcome, Winery</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="winery-buttons">
          <button onClick={() => navigate("/winery/create")}>Create Wine NFT</button>
          {/* 
          <button onClick={() => navigate("/winery/transfer")}>Transfer to Distributor</button>
          <button onClick={() => navigate("/winery/update")}>Update Condition</button>
          */}
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
