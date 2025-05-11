// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketToken
 * @dev 0 decimals (1 token = 1 ticket), capped supply, payable mint, owner withdraw
 */
contract TicketToken is ERC20Capped, Ownable {
    uint256 public priceWei;

    /// @param cap_      max tickets
    /// @param priceWei_ cost per ticket in wei
    constructor(uint256 cap_, uint256 priceWei_)
        // pass name + symbol to ERC20
        ERC20("ShowBird Ticket", "SBT")
        // pass cap to ERC20Capped
        ERC20Capped(cap_)
        // pass deployer as owner to Ownable
        Ownable(msg.sender)
    {
        priceWei = priceWei_;
    }

    /// Each token is one indivisible ticket
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    /// Buy exactly one ticket by sending `priceWei` ETH
    function buyTicket() external payable {
        require(msg.value == priceWei, "TicketToken: wrong ETH amount");
        _mint(msg.sender, 1);
    }

    /// Owner can sweep all collected ETH
    function withdraw(address payable to) external onlyOwner {
        (bool ok, ) = to.call{ value: address(this).balance }("");
        require(ok, "TicketToken: withdraw failed");
    }

    /// (Optional) Owner can adjust ticket price
    function setPrice(uint256 newPriceWei) external onlyOwner {
        priceWei = newPriceWei;
    }
}
