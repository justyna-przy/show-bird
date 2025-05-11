// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketToken
 * @dev 0 decimals (1 token = 1 ticket), capped supply, payable mint, owner withdraw,
 *      role management: venue (owner), doormen, attendees.
 */
contract TicketToken is ERC20Capped, Ownable {
    uint256 public priceWei;
    mapping(address => bool) public isDoorman;

    event DoormanStatusChanged(address indexed account, bool isDoorman);

    /**
     * @param cap_      max tickets
     * @param priceWei_ cost per ticket in wei
     */
    constructor(uint256 cap_, uint256 priceWei_)
        ERC20("ShowBird Ticket", "SBT")
        ERC20Capped(cap_)
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

    /// Owner can grant or revoke Doorman role to an address
    function setDoorman(address account, bool status) external onlyOwner {
        isDoorman[account] = status;
        emit DoormanStatusChanged(account, status);
    }

    /**
     * @dev Returns role of an account as a string:
     *  - "Venue" if owner
     *  - "Doorman" if granted
     *  - "Attendee" otherwise
     */
    function roleOf(address account) external view returns (string memory) {
        if (account == owner()) {
            return "Venue";
        } else if (isDoorman[account]) {
            return "Doorman";
        } else {
            return "Attendee";
        }
    }
}