// scripts/deploy.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { ethers, run } = require("hardhat");

async function main() {
  // 1) Compile (redundant if already done)
  await run("compile");

  // 2) Deploy
  const [deployer] = await ethers.getSigners();
  console.log("Deploying from", deployer.address);

  const cap        = 200;                      // your max tickets
  const priceWei   = ethers.parseEther("0.05"); // ticket cost
  const Factory    = await ethers.getContractFactory("TicketToken");
  const token      = await Factory.deploy(cap, priceWei);

  await token.waitForDeployment();
  console.log("TicketToken deployed to", token.target);

  // 3) Extract ABI + address
  const artifact = await artifacts.readArtifact("TicketToken");
  const outDir   = path.join(__dirname, "../src/abi");
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    `${outDir}/TicketToken.json`,
    JSON.stringify(
      { address: token.target, abi: artifact.abi },
      null,
      2
    )
  );
  console.log("ABI written to src/abi/TicketToken.json");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
