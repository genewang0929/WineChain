import hre from "hardhat";

async function main() {
  const [admin, winery, distributor, retailer, consumer] = await hre.ethers.getSigners();
  const address = "PASTE_DEPLOYED_CONTRACT_ADDRESS";
  const wine = await hre.ethers.getContractAt("WineChain", address);

  // Grant roles
  await (await wine.connect(admin).grantRole(await wine.WINERY_ROLE(), winery.address)).wait();
  await (await wine.connect(admin).grantRole(await wine.DISTRIBUTOR_ROLE(), distributor.address)).wait();
  await (await wine.connect(admin).grantRole(await wine.RETAILER_ROLE(), retailer.address)).wait();

  // Winery mints
  const tx = await wine.connect(winery).createWine(
    2022,
    "Cabernet Sauvignon",
    "Napa Valley",
    "2023-06-01",
    "ipfs://yourCID"
  );
  await tx.wait();
  console.log("✅ Wine minted");

  // Winery -> Distributor
  await (await wine.connect(winery)
    .transferToDistributor(1, distributor.address, "Transport condition: 12°C")).wait();

  // Distributor -> Retailer
  await (await wine.connect(distributor)
    .distributorToRetailer(1, retailer.address, "Stored at 10°C")).wait();

  // Retailer -> Consumer
  await (await wine.connect(retailer)
    .deliverToConsumer(1, consumer.address)).wait();

  console.log("🎉 Full supply chain cycle complete!");
}

main().catch(console.error);
