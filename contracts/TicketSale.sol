// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TicketToken.sol";

/**
 * @title TicketSale
 * @dev ETH-based sale and refund of TicketToken tickets.
 *      Batch buy, refund % logic, price updates, owner withdrawal.
 */
contract TicketSale is Ownable {
    TicketToken public immutable token;
    uint256 public priceWei;
    uint256 public refundPercentage;

    mapping(address => uint256) public purchases;
    uint256 public totalSold;

    event TicketsPurchased(
        address indexed buyer,
        uint256 qty,
        uint256 totalPrice
    );
    event TicketsRefunded(
        address indexed buyer,
        uint256 qty,
        uint256 refundAmount
    );
    event PriceUpdated(uint256 newPriceWei);

    /**
     * @param tokenAddress  Address of your deployed TicketToken
     * @param priceWei_     Cost per ticket in wei
     * @param refundPct     Percent of ETH refunded (1–100)
     */
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

    /// @notice Buy `qty` tickets in one tx
    function buyTickets(uint256 qty) external payable {
        require(qty > 0, "TicketSale: qty > 0");
        uint256 totalCost = priceWei * qty;
        require(msg.value == totalCost, "TicketSale: wrong ETH amount");

        token.mint(msg.sender, qty);
        purchases[msg.sender] += qty;
        totalSold += qty;

        emit TicketsPurchased(msg.sender, qty, totalCost);
    }

    /// @notice Refund `qty` tickets, returns refundPercentage% of paid ETH
    function refundTickets(uint256 qty) external {
        require(qty > 0, "TicketSale: qty > 0");
        require(purchases[msg.sender] >= qty, "TicketSale: exceed purchased");

        uint256 refundAmount = (priceWei * qty * refundPercentage) / 100;
        require(
            address(this).balance >= refundAmount,
            "TicketSale: insufficient funds"
        );

        token.redeem(msg.sender, qty);
        purchases[msg.sender] -= qty;
        totalSold -= qty;

        (bool ok, ) = msg.sender.call{value: refundAmount}("");
        require(ok, "TicketSale: refund failed");

        emit TicketsRefunded(msg.sender, qty, refundAmount);
    }

    /// @notice Owner can change the ticket price (in wei)
    function updatePrice(uint256 newPriceWei) external onlyOwner {
        require(newPriceWei > 0, "TicketSale: price > 0");
        priceWei = newPriceWei;
        emit PriceUpdated(newPriceWei);
    }

    /// @notice Owner can withdraw all ETH at any time
    function withdrawFunds(address payable to) external onlyOwner {
        uint256 bal = address(this).balance;
        require(bal > 0, "TicketSale: no funds");
        (bool ok, ) = to.call{value: bal}("");
        require(ok, "TicketSale: withdraw failed");
    }

    /// @notice How many tickets this contract has left (unsold supply)
    function availableTickets() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
}
