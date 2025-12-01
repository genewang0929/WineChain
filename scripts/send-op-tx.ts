import hre from "hardhat";

async function main() {
  const WineChain = await hre.ethers.getContractFactory("WineChain");
  const wineChain = await WineChain.deploy();
  await wineChain.waitForDeployment();

  console.log("WineChain deployed at:", await wineChain.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
