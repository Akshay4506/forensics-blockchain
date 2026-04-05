// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract ForensicEvidence is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    event EvidenceMinted(uint256 indexed tokenId, string title, string fileHash, address indexed creator);
    event CustodyTransferred(uint256 indexed tokenId, address indexed from, address indexed to);

    constructor() ERC721("ForensicEvidence", "EVID") {}

    function mintEvidence(address to, string memory title, string memory fileHash) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();

        _mint(to, newItemId);
        _setTokenURI(newItemId, fileHash); // Using fileHash as URI for simplicity

        emit EvidenceMinted(newItemId, title, fileHash, msg.sender);
        return newItemId;
    }

    function transferEvidence(address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized to transfer this evidence");
        address from = ownerOf(tokenId);
        _transfer(from, to, tokenId);

        emit CustodyTransferred(tokenId, from, to);
    }
}
