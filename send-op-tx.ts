import hre from "hardhat";

async function main() {
  const [sender] = await hre.ethers.getSigners();

  console.log("Sending 1 wei from", sender.address, "to itself");

  const tx = await sender.sendTransaction({
    to: sender.address,
    value: 1n,
  });

  await tx.wait();
  console.log("Transaction sent successfully");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
