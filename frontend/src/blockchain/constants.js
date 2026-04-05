export const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
export const CONTRACT_ABI = [
  "function mintEvidence(address to, string memory title, string memory fileHash) public returns (uint256)",
  "function transferEvidence(address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event EvidenceMinted(uint256 indexed tokenId, string title, string fileHash, address creator)",
  "event CustodyTransferred(uint256 indexed tokenId, address indexed from, address indexed to)"
];
