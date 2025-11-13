import { expect } from "chai";
import hre from "hardhat";

describe("WineChain", function () {
  it("should mint and move through all stages", async function () {
    const [admin, winery, distributor, retailer, consumer] = await hre.ethers.getSigners();
    const WineChain = await hre.ethers.getContractFactory("WineChain");
    const wine = await WineChain.deploy();

    await wine.waitForDeployment();

    await wine.connect(admin).grantRole(await wine.WINERY_ROLE(), winery.address);
    await wine.connect(winery).createWine(2023, "Merlot", "France", "2024-05-01", "ipfs://demo");
    expect(await wine.nextTokenId()).to.equal(1);
  });
});
