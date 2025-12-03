import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../context/RoleContext";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js";
import "./RoleSelect.css";

export default function RoleSelect() {
  const navigate = useNavigate();

  // This is the useContext's correct location（In the component）
  const { setRole, setAccountsInfo } = useContext(RoleContext);

  const [account, setAccount] = useState(null);

  const handleSelect = (role) => {
    setRole(role);
    navigate("/dashboard");
  };

  const checkMetamaskInstallation = () => {
    if (typeof window.ethereum === "undefined") {
      alert("MetaMask is not installed.");
      return false;
    }
    return true;
  };

  const connectWallet = async () => {
    if (!checkMetamaskInstallation()) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);

      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Approved accounts:", accounts);

      setAccount(accounts[0]);

      const winery = accounts[0];
      const distributor = accounts[1];
      const retailer = accounts[2];
      const regulator = accounts[3];
      const consumer = accounts[4];

      // Store therole into the Context
      setAccountsInfo({
        winery,
        distributor,
        retailer,
        regulator,
        consumer,
      });

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      // Grant Roles
      await (await contract.grantDistributor(distributor)).wait();
      await (await contract.grantRetailer(retailer)).wait();
      await (await contract.grantRegulator(regulator)).wait();
      await (await contract.grantConsumer(consumer)).wait();

      alert("Roles granted successfully!");
    } catch (err) {
      console.error(err);
      alert("Error connecting wallet");
    }
  };

  return (
    <div className="role-container">
      <h1 className="title">WineChain</h1>
      <h2 className="subtitle">I am...</h2>

      <div className="roles">
        <button onClick={() => handleSelect("WINERY")}>Winery</button>
        <button onClick={() => handleSelect("DISTRIBUTOR")}>Distributor</button>
        <button onClick={() => handleSelect("RETAILER")}>Retailer</button>
        <button onClick={() => handleSelect("REGULATOR")}>Regulator</button>
        <button onClick={() => handleSelect("CONSUMER")}>Consumer</button>
      </div>

      <button className="connect-btn" onClick={connectWallet}>
        Connect Wallet
      </button>

      <footer className="footer">WineChain v1.0 — MIT License</footer>
    </div>
  );
}
