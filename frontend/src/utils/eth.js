import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contractCall.js";

export async function getBlockchain() {
  if (!window.ethereum) {
    alert("Please install MetaMask.");
    throw new Error("MetaMask missing");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  const userAddress = await signer.getAddress();
  const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);

  return { provider, signer, userAddress, contract };
}
