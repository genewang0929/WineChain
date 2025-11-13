import hre from "hardhat";

async function main() {
  const { ethers } = hre as any;   // <- cast avoids TS noise

  const [admin] = await ethers.getSigners();
  const WineChain = await ethers.getContractFactory("WineChain");
  const c = await WineChain.deploy();
  await c.waitForDeployment();

  console.log("WineChain deployed to:", await c.getAddress());
  console.log("Admin:", admin.address);
}

main().catch((e) => { console.error(e); process.exit(1); });
