// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketToken.sol";

/**
 * TicketSale v2
 *
 * ── public counters ─────────────────────────────────────────────
 * • priceWei                     – current ticket price
 * • totalPurchasedTickets        – lifetime tickets sold
 * • totalSoldOutstanding         – tickets still in circulation
 * • totalRedeemed                – tickets checked-in by doormen
 * • totalRefundedTickets         – tickets given back for a refund
 * • totalRevenueWei              – lifetime revenue (buys − refunds)
 * • contractBalance()            – ETH currently held by this contract
 * • withdrawableWei()            – ETH the venue may withdraw right now
 *
 * The venue can **only** withdraw ETH that corresponds to redeemed
 * tickets; ETH needed for possible future refunds always stays locked.
 */
contract TicketSale is Ownable {
    TicketToken public immutable token;
    uint256 public priceWei; // current price
    uint256 public refundPercentage; // e.g. 80 = 80 %

    /* ── lifetime accounting ─────────────────────────── */
    uint256 public totalPurchasedTickets;
    uint256 public totalRefundedTickets;
    uint256 public totalRedeemed; // checked-in
    uint256 public totalRevenueWei; // buys − refunds   (↔ lifetime gross)

    /* ── running state ──────────────────────────────── */
    mapping(address => uint256) public purchases; // assists refunds
    uint256 public totalSoldOutstanding; // = purchased – refunded – redeemed
    uint256 public totalWithdrawn; // wei already pulled out

    /* ── events ─────────────────────────────────────── */
    event TicketsPurchased(address indexed buyer, uint256 qty, uint256 weiPaid);
    event TicketsRefunded(address indexed buyer, uint256 qty, uint256 weiBack);
    event TicketsRedeemed(address indexed attendee, uint256 qty);
    event PriceUpdated(uint256 newPriceWei);
    event FundsWithdrawn(address indexed to, uint256 weiAmount);

    /* ── constructor ───────────────────────────────── */
    constructor(
        address tokenAddress,
        uint256 priceWei_,
        uint256 refundPct
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "TicketSale: zero token addr");
        require(priceWei_ > 0, "TicketSale: price 0");
        require(
            refundPct > 0 && refundPct <= 100,
            "TicketSale: bad refund pct"
        );

        token = TicketToken(tokenAddress);
        priceWei = priceWei_;
        refundPercentage = refundPct;
    }

    /* ── buy ────────────────────────────────────────── */
    function buyTickets(uint256 qty) external payable {
        require(qty > 0, "TicketSale: qty 0");
        uint256 cost = priceWei * qty;
        require(msg.value == cost, "TicketSale: wrong ETH");

        token.mint(msg.sender, qty);

        totalPurchasedTickets += qty;
        totalSoldOutstanding += qty;
        totalRevenueWei += cost;
        purchases[msg.sender] += qty;

        emit TicketsPurchased(msg.sender, qty, cost);
    }

    /* ── refund (user-initiated) ────────────────────── */
    function refundTickets(uint256 qty) external {
        require(qty > 0, "TicketSale: qty 0");
        require(purchases[msg.sender] >= qty, "TicketSale: not owned");

        uint256 refundWei = (priceWei * qty * refundPercentage) / 100;
        require(address(this).balance >= refundWei, "TicketSale: no ETH");

        token.redeem(msg.sender, qty); // burn / pull back

        totalRefundedTickets += qty;
        totalSoldOutstanding -= qty;
        totalRevenueWei -= refundWei;
        purchases[msg.sender] -= qty;

        (bool ok, ) = msg.sender.call{value: refundWei}("");
        require(ok, "TicketSale: refund fail");

        emit TicketsRefunded(msg.sender, qty, refundWei);
    }

    /* ── redeem at the door (doorman) ───────────────── */
    function redeemTickets(address attendee, uint256 qty) external {
        require(token.isDoorman(msg.sender), "TicketSale: !doorman");
        require(qty > 0, "TicketSale: qty 0");
        require(purchases[attendee] >= qty, "TicketSale: not owned");

        token.redeem(attendee, qty);

        totalRedeemed += qty;
        totalSoldOutstanding -= qty;
        purchases[attendee] -= qty;

        emit TicketsRedeemed(attendee, qty);
    }

    /* ── self-redeem (attendee) ─────────────────────── */
    function selfRedeem(uint256 qty) external {
        require(qty > 0, "TicketSale: qty 0");
        require(purchases[msg.sender] >= qty, "TicketSale: not owned");

        token.redeem(msg.sender, qty);

        totalRedeemed += qty;
        totalSoldOutstanding -= qty;
        purchases[msg.sender] -= qty;

        emit TicketsRedeemed(msg.sender, qty);
    }

    /* ── owner ops ──────────────────────────────────── */
    function updatePrice(uint256 newWei) external onlyOwner {
        require(newWei > 0, "TicketSale: price 0");
        priceWei = newWei;
        emit PriceUpdated(newWei);
    }

    /** Withdraw **only** the ETH that corresponds to redeemed tickets.
     * Locked formula:  price × totalRedeemed  – alreadyWithdrawn */
    function withdrawFunds(address payable to) external onlyOwner {
        uint256 unlocked = priceWei * totalRedeemed;
        require(unlocked > totalWithdrawn, "TicketSale: nothing yet");

        uint256 amount = unlocked - totalWithdrawn;
        totalWithdrawn += amount;

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "TicketSale: withdraw fail");

        emit FundsWithdrawn(to, amount);
    }

    /* ── helpers / views ────────────────────────────── */
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdrawableWei() external view returns (uint256) {
        uint256 unlocked = priceWei * totalRedeemed;
        return unlocked > totalWithdrawn ? unlocked - totalWithdrawn : 0;
    }
}
