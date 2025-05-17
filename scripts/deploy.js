require("dotenv").config();
const fs   = require("fs");
const path = require("path");
const { ethers, run, artifacts } = require("hardhat");

async function main() {
  await run("compile");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying from", deployer.address);

  // Deploy TicketToken
  const cap    = 200;
  const name   = "ShowBird Ticket";
  const symbol = "SBT";
  const TokenFactory = await ethers.getContractFactory("TicketToken");
  const token        = await TokenFactory.deploy(name, symbol, cap);
  await token.waitForDeployment();
  console.log("TicketToken deployed to", token.target);

  // Deploy TicketSale with a price and refund %
  const priceWei   = ethers.parseEther("0.005"); 
  const refundPct  = 80;                        
  const SaleFactory = await ethers.getContractFactory("TicketSale");
  const sale        = await SaleFactory.deploy(
    token.target,
    priceWei,
    refundPct
  );
  await sale.waitForDeployment();
  console.log("TicketSale deployed to", sale.target);
  const tx = await token.setSalesContract(sale.target, true);
  await tx.wait();
  console.log("Sale contract authorized");

  // Write ABIs + addresses
  const outDir = path.join(__dirname, "../src/abi");
  fs.mkdirSync(outDir, { recursive: true });

  const tokenArtifact = await artifacts.readArtifact("TicketToken");
  const saleArtifact  = await artifacts.readArtifact("TicketSale");

  fs.writeFileSync(
    `${outDir}/TicketToken.json`,
    JSON.stringify({ address: token.target, abi: tokenArtifact.abi }, null, 2)
  );
  fs.writeFileSync(
    `${outDir}/TicketSale.json`,
    JSON.stringify({ address: sale.target, abi: saleArtifact.abi }, null, 2)
  );

  console.log("ABIs written to src/abi/");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
