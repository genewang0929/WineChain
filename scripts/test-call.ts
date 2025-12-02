import hre from "hardhat";

async function main() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const wineChain = await hre.ethers.getContractAt(
    "WineChain",
    contractAddress
  );

  const tx = await wineChain.createWine(
    "ipfs://yourMetadataHere"
  );

  await tx.wait();

  console.log("Wine produced!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
