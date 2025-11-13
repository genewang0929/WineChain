// Deploy using plain ethers v6 (no Hardhat plugin)
import { JsonRpcProvider, ContractFactory } from "ethers";
// IMPORTANT: path is from the scripts/ folder to the artifacts file
import artifact from "../artifacts/contracts/WineChain.sol/WineChain.json" assert { type: "json" };

async function main() {
  // Connect to your running Hardhat node
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");

  // Use the first unlocked account from the Hardhat node
  const signer = await provider.getSigner(0);

  const factory = new ContractFactory(artifact.abi, artifact.bytecode, signer);
  const contract = await factory.deploy(); // your constructor has no params
  const receipt = await contract.deploymentTransaction()?.wait();

  console.log("✅ WineChain deployed to:", await contract.getAddress());
  console.log("   Deployer:", await signer.getAddress());
  console.log("   Tx hash :", receipt?.hash);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
