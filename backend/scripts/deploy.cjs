const hre = require("hardhat");

async function main() {
  const ForensicEvidence = await hre.ethers.deployContract("ForensicEvidence");
  await ForensicEvidence.waitForDeployment();

  console.log(
    `ForensicEvidence deployed to: ${await ForensicEvidence.getAddress()}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
