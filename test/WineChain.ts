import { expect } from "chai";
import { network } from "hardhat";


const { ethers } = await network.connect();

describe("wineChain", function () {
  let wineChain: Promise<ethers.Contract>;
  let winery: ethers.Signer;
  let distributor: ethers.Signer;
  let retailer: ethers.Signer;
  let regulator: ethers.Signer;
  let consumer: ethers.Signer;

  const tokenId = 1;

  beforeEach(async function () {
    [winery, distributor, retailer, regulator, consumer] = await ethers.getSigners();

    const WineChain = await ethers.getContractFactory("WineChain");
    wineChain = await WineChain.deploy();

    // grant roles
    await wineChain.connect(winery).grantDistributor(distributor.getAddress());
    await wineChain.connect(winery).grantRetailer(retailer.getAddress());
    await wineChain.connect(winery).grantRegulator(regulator.getAddress());
    await wineChain.connect(winery).grantConsumer(consumer.getAddress());
  });

  describe("Supply Chain movement", function () {
    it("winery creates wine and lifecycle flows end-to-end", async function () {
      const tx = await wineChain.connect(winery).createWine("ipfs://QmProducerWineMeta1");
      const receipt = await tx.wait();

      // Confirm attributes
      const wineStruct = await wineChain.getWine(tokenId);
      expect(wineStruct.winery).to.equal(winery.address);
      expect(wineStruct.state).to.equal(0); // Produced
      
      // Distributor distributes: distributor must own or be approved for transfer -> transfer from producer to distributor
      // For safeTransferFrom to succeed, producer (current owner) must approve distributor OR distributor can call function that triggers transfer from owner
      // In our contract distributeWine calls safeTransferFrom(ownerOf(tokenId), msg.sender, tokenId)
      // This will revert unless the current owner (producer) approves the distributor. So approve first:
      await wineChain.connect(winery).approve(distributor.address, tokenId);
      await wineChain.connect(distributor).distributeWine(tokenId);
      const afterDist = await wineChain.getWine(tokenId);
      expect(afterDist.state).to.equal(1); // Distributed
      expect(afterDist.distributor).to.equal(distributor.address);

      // Retailer: similarly, distributor must approve retailer (owner is distributor)
      await wineChain.connect(distributor).approve(retailer.address, tokenId);
      await wineChain.connect(retailer).receiveWine(tokenId);
      const afterRec = await wineChain.getWine(tokenId);
      expect(afterRec.state).to.equal(2); // Received
      expect(afterRec.retailer).to.equal(retailer.address);

      // Regulator inspects: regulator calls inspectWine and sets report URI
      await wineChain.connect(regulator).inspectWine(tokenId, true, "ipfs://QmInspectionReport1");
      const afterInspect = await wineChain.getWine(tokenId);
      expect(afterInspect.state).to.equal(3); // Inspected
      expect(afterInspect.inspectionUri).to.equal("ipfs://QmInspectionReport1");

      // Consumer buys: retailer must approve consumer
      await wineChain.connect(retailer).approve(consumer.address, tokenId);
      await wineChain.connect(consumer).buyWine(tokenId);
      const afterSold = await wineChain.getWine(tokenId);
      expect(afterSold.state).to.equal(4); // Sold
      expect(afterSold.consumer).to.equal(consumer.address);
      expect(await wineChain.ownerOf(tokenId)).to.equal(consumer.address);
    });
  });
});
