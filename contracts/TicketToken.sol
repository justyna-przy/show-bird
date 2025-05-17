// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TicketToken
 * @dev ERC-20 token where each token = 1 ticket (0 decimals), capped total supply.
 *      Minting only by authorized sale contracts; redemption by sale contracts or Doormen.
 *      Role management: Venue (owner), Doormen, Attendees.
 */
contract TicketToken is ERC20Capped, Ownable {
    uint8 private constant DECIMALS = 0; 
    
    mapping(address => bool) public salesContracts;
    mapping(address => bool) public isDoorman;

    event SalesContractChanged(address indexed contractAddr, bool enabled);
    event DoormanStatusChanged(address indexed account, bool enabled);

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 cap_
    ) ERC20(name_, symbol_) ERC20Capped(cap_) Ownable(msg.sender) {}

    /// @notice 0 decimals so each token is exactly one ticket
    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /// @notice Only sales contracts can mint tickets
    modifier onlySalesContract() {
        require(salesContracts[msg.sender], "TicketToken: caller not a sales contract");
        _;
    }

    /// @notice Only sales contracts or Doormen can redeem tickets
    modifier onlyRedemptionAgent() {
        require(
            salesContracts[msg.sender] || isDoorman[msg.sender],
            "TicketToken: caller cannot redeem"
        );
        _;
    }

    /// @notice Owner can authorize or revoke a sales contract
    function setSalesContract(address contractAddr, bool enabled) external onlyOwner {
        salesContracts[contractAddr] = enabled;
        emit SalesContractChanged(contractAddr, enabled);
    }

    /// @notice Owner can grant or revoke the Doorman role
    function setDoorman(address account, bool enabled) external onlyOwner {
        isDoorman[account] = enabled;
        emit DoormanStatusChanged(account, enabled);
    }

    /// @notice Mint `amount` tickets to address `to`
    function mint(address to, uint256 amount) external onlySalesContract {
        require(totalSupply() + amount <= cap(), "TicketToken: cap exceeded");
        _mint(to, amount);
    }

    /// @notice Redeem `amount` tickets from `from` back to Venue
    function redeem(address from, uint256 amount) external onlyRedemptionAgent {
        require(balanceOf(from) >= amount, "TicketToken: insufficient balance");
        _transfer(from, owner(), amount);
    }

    /// @notice Return a human-readable role for front-end
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
