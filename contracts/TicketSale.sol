// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketToken.sol";

/**
 * @title TicketSale
 * @dev ETH-based sale and refund of TicketToken tickets.
 *      Funds stay locked until a ticket is **redeemed** or **refunded**.
 */
contract TicketSale is Ownable {
    TicketToken public immutable token;
    uint256 public priceWei;
    uint256 public refundPercentage;

    mapping(address => uint256) public purchases; // still used for refunds
    uint256 public totalSold; // outstanding tickets

    /* 🔐  NEW ACCOUNTING  ----------------------------------- */
    uint256 public totalRedeemed; // tickets checked-in
    uint256 public totalWithdrawn; // wei already pulled out

    /* ─── events ──────────────────────────────────────────── */
    event TicketsPurchased(
        address indexed buyer,
        uint256 qty,
        uint256 totalPrice
    );
    event TicketsRefunded(
        address indexed buyer,
        uint256 qty,
        uint256 refundWei
    );
    event TicketsRedeemed(address indexed attendee, uint256 qty);
    event PriceUpdated(uint256 newPriceWei);
    event FundsWithdrawn(address indexed to, uint256 weiAmount);

    /* ─── constructor ─────────────────────────────────────── */
    constructor(
        address tokenAddress,
        uint256 priceWei_,
        uint256 refundPct
    ) Ownable(msg.sender) {
        require(tokenAddress != address(0), "TicketSale: token zero address");
        require(priceWei_ > 0, "TicketSale: price > 0");
        require(
            refundPct > 0 && refundPct <= 100,
            "TicketSale: invalid refund pct"
        );

        token = TicketToken(tokenAddress);
        priceWei = priceWei_;
        refundPercentage = refundPct;
    }

    /* ─── buy / refund (unchanged except notes) ───────────── */
    function buyTickets(uint256 qty) external payable {
        require(qty > 0, "TicketSale: qty > 0");
        uint256 totalCost = priceWei * qty;
        require(msg.value == totalCost, "TicketSale: wrong ETH amount");

        token.mint(msg.sender, qty);
        purchases[msg.sender] += qty;
        totalSold += qty;

        emit TicketsPurchased(msg.sender, qty, totalCost);
    }

    function refundTickets(uint256 qty) external {
        require(qty > 0, "TicketSale: qty > 0");
        require(purchases[msg.sender] >= qty, "TicketSale: exceed purchased");

        uint256 refundWei = (priceWei * qty * refundPercentage) / 100;
        require(
            address(this).balance >= refundWei,
            "TicketSale: insufficient funds"
        );

        token.redeem(msg.sender, qty); // burns / transfers tickets back
        purchases[msg.sender] -= qty;
        totalSold -= qty;

        (bool ok, ) = msg.sender.call{value: refundWei}("");
        require(ok, "TicketSale: refund failed");

        emit TicketsRefunded(msg.sender, qty, refundWei);
    }

    /* ─── NEW: redeem at the door ─────────────────────────── */
    function redeemTickets(address attendee, uint256 qty) external {
        require(qty > 0, "TicketSale: qty > 0");
        require(token.isDoorman(msg.sender), "TicketSale: caller not doorman");
        require(purchases[attendee] >= qty, "TicketSale: exceed purchased");

        token.redeem(attendee, qty); // move tickets to Venue
        purchases[attendee] -= qty;
        totalSold -= qty;
        totalRedeemed += qty;

        emit TicketsRedeemed(attendee, qty);
    }

    /// @notice Attendee redeems their own tickets (no refund)
    function selfRedeem(uint256 qty) external {
        require(qty > 0, "TicketSale: qty > 0");
        require(purchases[msg.sender] >= qty, "TicketSale: exceed purchased");

        token.redeem(msg.sender, qty); // move to Venue
        purchases[msg.sender] -= qty;
        totalSold -= qty;
        totalRedeemed += qty;

        emit TicketsRedeemed(msg.sender, qty);
    }

    /* ─── owner actions ───────────────────────────────────── */
    function updatePrice(uint256 newPriceWei) external onlyOwner {
        require(newPriceWei > 0, "TicketSale: price > 0");
        priceWei = newPriceWei;
        emit PriceUpdated(newPriceWei);
    }

    /// 🏧 Withdraw only the ETH tied to redeemed tickets
    function withdrawFunds(address payable to) external onlyOwner {
        uint256 maxOwed = priceWei * totalRedeemed; // wei unlocked so far
        require(maxOwed > totalWithdrawn, "TicketSale: nothing to withdraw");

        uint256 amount = maxOwed - totalWithdrawn;
        totalWithdrawn += amount;

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "TicketSale: withdraw failed");

        emit FundsWithdrawn(to, amount);
    }

    /// Optional helper – how many tickets remain unsold
    function availableTickets() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
