import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleContext } from "../context/RoleContext";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "./contractCall.js"; 
import "./RoleSelect.css";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { setRole } = useContext(RoleContext);

  const handleSelect = (role) => {
    setRole(role);        // store the role that the user choose
    navigate("/dashboard"); 
  };

  const checkMetamaskInstallation = () => {
    if (typeof window.ethereum === 'undefined') {
      alert("MetaMask is not installed. Please install MetaMask to use this application.");
      return false;
    }
    return true;
  };

  const [account, setAccount] = useState(null);

  const connectWallet = async () => {
    if (!checkMetamaskInstallation()) {
      return;
    }

    try {
      // Create a Web3Provider instance using window.ethereum
      const provider = new ethers.BrowserProvider(window.ethereum);

      // Request account access from MetaMask
      
      const accounts = await provider.send("eth_requestAccounts", []);
      console.log("Approved accounts:", accounts);
      
      
      setAccount(accounts[0]); // Set the first connected account
      console.log("Connected account:", accounts[0]);

      const winery = accounts[0];
      const distributor = accounts[1];
      const retailer = accounts[2];
      const regulator = accounts[3];
      const consumer = accounts[4];

      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

      const txDistributor = await contract.grantDistributor(distributor);
      console.log("tx sent:", txDistributor.hash);
      const receiptDistributor = await txDistributor.wait();
      console.log("tx mined:", receiptDistributor);

      const txRetailer = await contract.grantRetailer(retailer);
      console.log("tx sent:", txRetailer.hash);
      const receiptRetailer = await txRetailer.wait();
      console.log("tx mined:", receiptRetailer);

      const txRegulator = await contract.grantRegulator(regulator);
      console.log("tx sent:", txRegulator.hash);
      const receiptRegulator = await txRegulator.wait();
      console.log("tx mined:", receiptRegulator);

      const txConsumer = await contract.grantConsumer(consumer);
      console.log("tx sent:", txConsumer.hash);
      const receiptConsumer = await txConsumer.wait();
      console.log("tx mined:", receiptConsumer);
      

      

    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
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

      <footer className="footer">
        WineChain v1.0 — MIT License
      </footer>
    </div>
  );
}
