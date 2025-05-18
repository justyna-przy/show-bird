const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ShowBird Ticket Sale end-to-end", function () {
  let deployer, venue, doorman, alice, bob;
  let token, sale;

  // constructor params
  const REFUND_PCT = 80;
  const PRICE = ethers.parseEther("0.005");
  const CAP = 200n; 

  beforeEach(async () => {
    [deployer, venue, doorman, alice, bob] = await ethers.getSigners();

    // 1) Deploy the token
    const Token = await ethers.getContractFactory("TicketToken");
    token = await Token.deploy("ShowBird Ticket", "SBT", CAP);
    await token.waitForDeployment();

    // 2) Deploy the sale
    const Sale = await ethers.getContractFactory("TicketSale");
    sale = await Sale.deploy(token.target, PRICE, REFUND_PCT);
    await sale.waitForDeployment();

    // 3) Wire up roles
    await token.setSalesContract(sale.target, true);
    await token.setDoorman(doorman.address, true);
  });

  it("lets Alice buy 2 tickets", async () => {
    await sale.connect(alice).buyTickets(2, { value: PRICE * 2n });
    expect(await token.balanceOf(alice.address)).to.equal(2n);
    expect(await sale.totalPurchasedTickets()).to.equal(2n);
    expect(await sale.totalSoldOutstanding()).to.equal(2n);
  });

  it("processes a refund correctly and updates counters", async () => {
    await sale.connect(alice).buyTickets(1, { value: PRICE });
    const refundWei = (PRICE * BigInt(REFUND_PCT)) / 100n;

    // call refund
    await sale.connect(alice).refundTickets(1);

    // ticket/accounting state checks
    expect(await sale.totalRefundedTickets()).to.equal(1n);
    expect(await sale.totalSoldOutstanding()).to.equal(0n);

    // revenueWei has decreased by refundWei
    const revAfter = await sale.totalRevenueWei();
    expect(revAfter).to.equal(PRICE - refundWei);
  });

  it("allows a doorman to redeem tickets", async () => {
    await sale.connect(alice).buyTickets(1, { value: PRICE });
    await sale.connect(doorman).redeemTickets(alice.address, 1);
    expect(await token.balanceOf(alice.address)).to.equal(0n);
    expect(await sale.totalRedeemed()).to.equal(1n);
  });

  it("lets an attendee self-redeem", async () => {
    await sale.connect(bob).buyTickets(1, { value: PRICE });
    await sale.connect(bob).selfRedeem(1);
    expect(await token.balanceOf(bob.address)).to.equal(0n);
    expect(await sale.totalRedeemed()).to.equal(1n);
  });

  it("caps venue withdraws to redeemed revenue", async () => {
    await sale.connect(alice).buyTickets(1, { value: PRICE });
    await sale.connect(doorman).redeemTickets(alice.address, 1);

    // venue withdraws
    await expect(() =>
      sale.connect(deployer).withdrawFunds(deployer.address)
    ).to.changeEtherBalance(deployer, PRICE);

    // second attempt reverts
    await expect(
      sale.connect(deployer).withdrawFunds(deployer.address)
    ).to.be.revertedWith("TicketSale: nothing yet");
  });

  it("blocks non-doorman redeems", async () => {
    await sale.connect(alice).buyTickets(1, { value: PRICE });
    await expect(
      sale.connect(bob).redeemTickets(alice.address, 1)
    ).to.be.revertedWith("TicketSale: !doorman");
  });

  it("blocks unauthorized refunds", async () => {
    await sale.connect(alice).buyTickets(1, { value: PRICE });
    await expect(sale.connect(bob).refundTickets(1)).to.be.revertedWith(
      "TicketSale: not owned"
    );
  });
});
