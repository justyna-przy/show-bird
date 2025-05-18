// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketToken.sol";


/**
 * @title TicketSale
 * @dev This contract manages the sale of tickets, including purchasing,
 * refunding, and redeeming tickets. It also handles the pricing and
 * withdrawal of funds.
 * The venue can **only** withdraw ETH that corresponds to redeemed
 * tickets; ETH needed for possible future refunds always stays locked.
 */
contract TicketSale is Ownable {
    TicketToken public immutable token;
    uint256 public priceWei;
    uint256 public refundPercentage; 

    uint256 public totalPurchasedTickets;
    uint256 public totalRefundedTickets;
    uint256 public totalRedeemed; // checked-in
    uint256 public totalRevenueWei; // buys − refunds   (↔ lifetime gross)

    // Running state
    mapping(address => uint256) public purchases; 
    uint256 public totalSoldOutstanding; // = purchased – refunded – redeemed
    uint256 public totalWithdrawn; 

    // Events
    event TicketsPurchased(address indexed buyer, uint256 qty, uint256 weiPaid);
    event TicketsRefunded(address indexed buyer, uint256 qty, uint256 weiBack);
    event TicketsRedeemed(address indexed attendee, uint256 qty);
    event PriceUpdated(uint256 newPriceWei);
    event FundsWithdrawn(address indexed to, uint256 weiAmount);

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

    /// @notice Purchase tickets of `qty` amount
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

    /// @notice Refund tickets of `qty` amount
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

    /// @notice Doorman can redeem tickets for attendees
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

    /// @notice Attendee can redeem their own tickets
    function selfRedeem(uint256 qty) external {
        require(qty > 0, "TicketSale: qty 0");
        require(purchases[msg.sender] >= qty, "TicketSale: not owned");

        token.redeem(msg.sender, qty);

        totalRedeemed += qty;
        totalSoldOutstanding -= qty;
        purchases[msg.sender] -= qty;

        emit TicketsRedeemed(msg.sender, qty);
    }

    /// @notice Owner can update the ticket price
    function updatePrice(uint256 newWei) external onlyOwner {
        require(newWei > 0, "TicketSale: price 0");
        priceWei = newWei;
        emit PriceUpdated(newWei);
    }

    //// @notice Owner can withdraw ETH from the contract
    /// @dev Only withdraws ETH that corresponds to redeemed tickets
    function withdrawFunds(address payable to) external onlyOwner {
        uint256 unlocked = priceWei * totalRedeemed;
        require(unlocked > totalWithdrawn, "TicketSale: nothing yet");

        uint256 amount = unlocked - totalWithdrawn;
        totalWithdrawn += amount;

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "TicketSale: withdraw fail");

        emit FundsWithdrawn(to, amount);
    }

    /// @notice returns the current contract balance
    function contractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice returns the total amount of ETH that can be withdrawn
    function withdrawableWei() external view returns (uint256) {
        uint256 unlocked = priceWei * totalRedeemed;
        return unlocked > totalWithdrawn ? unlocked - totalWithdrawn : 0;
    }
}
