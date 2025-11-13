// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * === Stakeholders ===
 * - Winery: Creates wine
 * - Distributor: Ships wine
 * - Retailer: Stores & sells
 * - Consumer: Verifies authenticity
 */
contract WineChain is ERC721, AccessControl {
    bytes32 public constant WINERY_ROLE = keccak256("WINERY");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR");
    bytes32 public constant RETAILER_ROLE = keccak256("RETAILER");
    bytes32 public constant REGULATOR_ROLE = keccak256("REGULATOR");

    /**
     * === Product Journey (4 Stages) ===
     * 1. Creation    → Winery mints NFT
     * 2. Shipment    → Transfer to distributor
     * 3. Storage     → Retailer receives and logs conditions
     * 4. Delivery    → Final sale to consumer
     */
    enum Stage { Created, Shipped, Stored, Delivered }

    struct Wine {
        uint256 vintage;
        string grapeVarietal;
        string region;
        string bottlingDate;
        string ipfsHash;
        Stage currentStage;
        address currentOwner;
    }

    mapping(uint256 => Wine) public wines;
    uint256 public nextTokenId;

    // === Events for transparency & off-chain indexing ===
    event WineCreated(uint256 indexed tokenId, address winery, string ipfsHash);
    event CustodyTransferred(uint256 indexed tokenId, address from, address to, Stage newStage);
    event ConditionUpdated(uint256 indexed tokenId, string condition, uint256 timestamp);

    constructor() ERC721("WineChain", "WINE") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ---- Required by multiple inheritance (ERC721 + AccessControl)
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // Winery creates a new wine (mints to the winery)
    function createWine(
        uint256 vintage,
        string memory grapeVarietal,
        string memory region,
        string memory bottlingDate,
        string memory ipfsHash
    ) external onlyRole(WINERY_ROLE) returns (uint256 tokenId) {
        require(bytes(ipfsHash).length != 0, "ipfsHash required");

        tokenId = ++nextTokenId;
        _safeMint(msg.sender, tokenId);

        wines[tokenId] = Wine({
            vintage: vintage,
            grapeVarietal: grapeVarietal,
            region: region,
            bottlingDate: bottlingDate,
            ipfsHash: ipfsHash,
            currentStage: Stage.Created,
            currentOwner: msg.sender
        });

        emit WineCreated(tokenId, msg.sender, ipfsHash);
    }

    // Winery transfers custody to distributor (Shipment stage)
    function transferToDistributor(
    uint256 tokenId,
    address distributor,
    string memory transportCondition
) external onlyRole(WINERY_ROLE) {
    require(_ownerOf(tokenId) != address(0), "Invalid token");
    require(ownerOf(tokenId) == msg.sender, "Not token owner");
    require(hasRole(DISTRIBUTOR_ROLE, distributor), "Not distributor");
    require(wines[tokenId].currentStage == Stage.Created, "Stage !Created");

    _transferCustody(tokenId, distributor, Stage.Shipped);

    if (bytes(transportCondition).length != 0) {
        emit ConditionUpdated(tokenId, transportCondition, block.timestamp);
    }
}

    // Distributor confirms receipt at retailer (Storage stage)
    function distributorToRetailer(
    uint256 tokenId,
    address retailer,
    string memory storageCondition
) external onlyRole(DISTRIBUTOR_ROLE) {
    require(_ownerOf(tokenId) != address(0), "Invalid token");
    require(ownerOf(tokenId) == msg.sender, "Not token owner");
    require(hasRole(RETAILER_ROLE, retailer), "Not retailer");
    require(wines[tokenId].currentStage == Stage.Shipped, "Stage !Shipped");

    _transferCustody(tokenId, retailer, Stage.Stored);

    if (bytes(storageCondition).length != 0) {
        emit ConditionUpdated(tokenId, storageCondition, block.timestamp);
    }
}

    // Retailer delivers to final consumer (Delivery stage)
   function deliverToConsumer(uint256 tokenId, address consumer)
    external
    onlyRole(RETAILER_ROLE)
{
    require(_ownerOf(tokenId) != address(0), "Invalid token");
    require(ownerOf(tokenId) == msg.sender, "Not token owner");
    require(consumer != address(0) && consumer != msg.sender, "Bad consumer");
    require(wines[tokenId].currentStage == Stage.Stored, "Stage !Stored");

    _transferCustody(tokenId, consumer, Stage.Delivered);
}

    // Internal function to handle ownership transfers and stage updates
    function _transferCustody(uint256 tokenId, address to, Stage newStage) internal {
        safeTransferFrom(ownerOf(tokenId), to, tokenId);
        wines[tokenId].currentStage = newStage;
        wines[tokenId].currentOwner = to;
        emit CustodyTransferred(tokenId, _msgSender(), to, newStage);
    }

    // Consumer or regulator queries full provenance snapshot
    function getWineJourney(uint256 tokenId) external view returns (Wine memory) {
        require(_ownerOf(tokenId) != address(0), "Invalid token");
        return wines[tokenId];
    }

    // Regulator verifies authenticity via IPFS hash
    function verifyCertificate(uint256 tokenId, string memory expectedHash)
        external
        view
        returns (bool)
    {
        require(_ownerOf(tokenId) != address(0), "Invalid token");
        return keccak256(bytes(wines[tokenId].ipfsHash)) == keccak256(bytes(expectedHash));
    }
}
