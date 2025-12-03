import { useNavigate, useLocation } from "react-router-dom";
import "./Regulator.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js";
import { useState, useEffect } from "react";

export default function Regulator() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;  

  // 準備要被檢查的酒（在 retailer 手上的）
  const [pendingWines, setPendingWines] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // 我已經 inspect 過的酒（state = Inspected）
  const [myWines, setMyWines] = useState([]);
  const [loadingMyWines, setLoadingMyWines] = useState(false);

  // 上傳 & 交易狀態
  const [loadingInspect, setLoadingInspect] = useState(false);
  const [cid, setCid] = useState("");
  const [txHash, setTxHash] = useState("");
/*
  const approveWine = async (action, wine = null) => {
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
*/
  // load pending wines
  const loadPendingWines = async () => {
    try {
      setLoadingPending(true);

      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const RETAILER_ROLE = await contract.RETAILER_ROLE();

      const total = await contract.totalMinted();
      const wines = [];

      for (let i = 1; i <= Number(total); i++) {
        let owner;
        try {
          owner = await contract.ownerOf(i);
        } catch (e) {
          continue; // token 不存在
        }

        const hasRole = await contract.hasRole(RETAILER_ROLE, owner);
        if (!hasRole) continue; // 不在 retailer 手上就跳過

        // 只抓 state = Received 的（還沒 inspect）
        const wineInfo = await contract.getWine(i);
        // enum: 0 Produced, 1 Distributed, 2 Received, 3 Inspected, 4 Sold
        if (Number(wineInfo.state) !== 2) continue;

        const tokenUri = await contract.tokenURI(i);

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

      setPendingWines(wines);
    } catch (err) {
      console.error(err);
      alert("Failed to load wines: " + err.message);
    } finally {
      setLoadingPending(false);
    }
  };

  //inspect wine
  const approveWine = async (wine) => {
    if (wine.metadata.isConditionGood === undefined) {
      alert(`Wine ID ${wine.tokenId}'s condition data is missing!`);
      return;
    }
    if (wine.metadata.isConditionGood === false) {
      alert(`Wine ID ${wine.tokenId} is marked as bad condition. Cannot approve.`);
      return;
    }

    try {
      setLoadingInspect(true);
      setCid("");
      setTxHash("");

      // 1. 準備 inspection 的 metadata
      const inspectionMetadata = {
        tokenId: wine.tokenId,
        passed: true,
        inspectedAt: new Date().toISOString(),
        originalTokenUri: wine.tokenUri,
        tempature: wine.metadata.tempature,
        isConditionGood: wine.metadata.isConditionGood,
      };

      // 2. 上傳到 Pinata（沿用你 distributor 的 /uploadMetadata API）
      const res = await fetch("http://localhost:5001/uploadMetadata", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inspectionMetadata),
      });

      if (!res.ok) {
        alert("Failed to upload inspection report to IPFS.");
        setLoadingInspect(false);
        return;
      }

      const data = await res.json();
      const Cid = data.cid;
      setCid(Cid);
      const reportUri = `ipfs://${Cid}`;
      alert("Metadata uploaded!");

      // 3. call smart contract here
      // == MetaMask ==
      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        setLoadingInspect(false);
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      //const signerAddress = await signer.getAddress();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      /*
      // 確認有 REGULATOR_ROLE
      const REGULATOR_ROLE = await contract.REGULATOR_ROLE();
      const hasRole = await contract.hasRole(REGULATOR_ROLE, signerAddress);
      if (!hasRole) {
        alert("Current MetaMask account does NOT have REGULATOR_ROLE.");
        setLoadingInspect(false);
        return;
      }
      */
      //call inspectWine function
      const tx = await contract.inspectWine(
        Number(wine.tokenId),
        true,
        reportUri
      );
      console.log("tx sent:", tx.hash);
      setTxHash(tx.hash);

      const receipt = await tx.wait();
      console.log("tx mined:", receipt);

      alert(
        `Wine ID ${wine.tokenId} inspected successfully! Tx Hash: ${tx.hash}`
      );

      // 檢查完重新載入清單
      await loadPendingWines();
    } catch (err) {
      console.error(err);
      alert("Failed to inspect wine: " + err.message);
    } finally {
      setLoadingInspect(false);
    }
  };



  // load my wines (inspected)
  const loadMyWines = async () => {
    try {
      setLoadingMyWines(true);

      if (!window.ethereum) {
        alert("Please install MetaMask first!");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      //const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
      const RETAILER_ROLE = await contract.RETAILER_ROLE();

      // 1. ask contract how many tokens minted so far
      const total = await contract.totalMinted();
      //console.log(total);
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

        // if owner not retailer, skip
        //if (owner.toLowerCase() !== retailerAddress.toLowerCase()) continue;
        // key: check whether the owner has retailer_role
        const hasRole = await contract.hasRole(RETAILER_ROLE, owner);
        if (!hasRole) continue; // if not distributor hold it, skip

        const wineInfo = await contract.getWine(i);
        if (Number(wineInfo.state) !== 3) continue;

        
        //if (Number(owner.state) !== 3) continue; // only approved wines

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
      alert("Failed to load inspected wines: " + err.message);
    } finally {
      setLoadingMyWines(false);
    }
  };
  useEffect(() => {
    if (path === "/regulator/approve") {

      loadPendingWines();
    }
    if (path === "/regulator/mywines") {
      loadMyWines();
    }
    if (path === "/regulator/approve") {

      approveWine();
    }
  }, [path]);

  const goHome = () => navigate("/");
  const goMenu = () => navigate("/regulator");

  // function
  const renderContent = () => {
    if (path === "/regulator/approve") {
      return (
        <div className="regulator-box">
          <h2>Approve wines</h2>

          {loadingPending && <p>Loading...</p>}

          {!loadingPending && pendingWines.length === 0 && (
            <p>No wines on retailer yet.</p>
          )}

          {!loadingPending && pendingWines.length > 0 && (
            <div className="wine-list">
              {pendingWines.map((w) => (
                <div key={w.tokenId} className="wine-card">
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
                  {/* Inspect 按鈕之後再接 approveWine */}
                  {/* <button onClick={() => approveWine("inspect", w)}>Inspect</button> */}
                  <button onClick={() => approveWine(w)}>Inspect</button>
                  {/*<button onClick={handleReciveWine}>Recive Wine</button>*/}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

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
                    <button onClick={approveWine}>Inspect</button>
                  </div>

                  
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    if (path === "/regulator/mywines") {
      return (
        <div className="regulator-box">
          <h2 className="mywines-title">Approved Wines</h2>

          {loadingMyWines && <p>Loading...</p>}

          {!loadingMyWines && myWines.length === 0 && (
            <p>You don’t have any approved wines yet.</p>
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
        <h1 className="title">Welcome, Regulator</h1>
        <h2 className="subtitle">I want to ...</h2>

        <div className="regulator-buttons">
          <button onClick={() => navigate("/regulator/approve")}>Approve Wines</button>
          <button onClick={() => navigate("/regulator/mywines")}>View Inspected Wines</button>

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
