// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract WineChain is ERC721, ERC721URIStorage, AccessControl {
    // === Roles ===
    bytes32 public constant WINERY_ROLE     = keccak256("WINERY_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE    = keccak256("RETAILER_ROLE");
    bytes32 public constant REGULATOR_ROLE   = keccak256("REGULATOR_ROLE");
    bytes32 public constant CONSUMER_ROLE    = keccak256("CONSUMER_ROLE");

    // === Product Journey ===
    enum State { 
        Produced, 
        Distributed, 
        Received, 
        Inspected, 
        Sold 
        }

    // wine information
    struct Wine {
        uint256 tokenId;
        State state;
        address winery;
        address distributor;
        address retailer;
        address regulator;
        address consumer;
        string inspectionUri;
    }

    // tokenId tracker
    uint256 private _nextTokenId;

    // tokenId -> WineInfo
    mapping(uint256 => Wine) public wines;

    // === Events ===
    event WineCreated(uint256 indexed tokenId, address indexed winery, string tokenURI);
    event WineDistributed(uint256 indexed tokenId, address indexed distributor);
    event WineReceived(uint256 indexed tokenId, address indexed retailer);
    event WineInspected(uint256 indexed tokenId, address indexed regulator, string reportUri);
    event WineSold(uint256 indexed tokenId, address indexed consumer);

    constructor() ERC721("WineChain", "WINE") {
        //  admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // admin =  Winery（can be changed later）
        _grantRole(WINERY_ROLE, msg.sender);
    }

    // -------- Role management helpers --------
    function grantDistributor(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(DISTRIBUTOR_ROLE, account);
    }
    function grantRetailer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(RETAILER_ROLE, account);
    }
    function grantRegulator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(REGULATOR_ROLE, account);
    }
    function grantConsumer(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(CONSUMER_ROLE, account);
    }

    // === Winery: create wine ===
    function createWine(
        string memory tokenUri
    ) external onlyRole(WINERY_ROLE) returns (uint256) {
        uint256 tokenId = ++_nextTokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);

        wines[tokenId] = Wine({
            tokenId: tokenId,
            state: State.Produced,
            winery: msg.sender,
            distributor: address(0),
            retailer: address(0),
            regulator: address(0),
            consumer: address(0),
            inspectionUri: ""
        });

        emit WineCreated(tokenId, msg.sender, tokenUri);
        return tokenId;
    }
    /// @notice How many wines have been minted so far
    function totalMinted() external view returns (uint256) {
        return _nextTokenId;
    }


    /// @notice Distributor holds token to mark distribution (must be called by distributor)
    function distributeWine(uint256 tokenId) external onlyRole(DISTRIBUTOR_ROLE) {
        Wine storage w = wines[tokenId];
        require(ownerOf(tokenId) == w.winery, "Not owner");
        require(w.state == State.Produced, "Wrong state");
        // transfer token to distributor to reflect custody change (optional)
        safeTransferFrom(ownerOf(tokenId), msg.sender, tokenId);

        w.distributor = msg.sender;
        w.state = State.Distributed;
        emit WineDistributed(tokenId, msg.sender);
    }

    /// @notice Retailer receives wine
    function receiveWine(uint256 tokenId) external onlyRole(RETAILER_ROLE) {
        Wine storage w = wines[tokenId];
        require(ownerOf(tokenId) == w.distributor, "Not owner");
        require(w.state == State.Distributed, "Wrong state");
        // transfer custody to retailer
        safeTransferFrom(ownerOf(tokenId), msg.sender, tokenId);

        w.retailer = msg.sender;
        w.state = State.Received;
        emit WineReceived(tokenId, msg.sender);
    }

    /// @notice Regulator inspects and attaches a report URI (IPFS)
    function inspectWine(uint256 tokenId, bool passed, string calldata reportUri) external onlyRole(REGULATOR_ROLE) {
        Wine storage w = wines[tokenId];
        require(ownerOf(tokenId) == w.retailer, "Not owner");
        require(w.state == State.Received, "Wrong state");
        require(passed, "Inspection failed");

        w.regulator = msg.sender;
        w.inspectionUri = reportUri;
        w.state = State.Inspected;
        emit WineInspected(tokenId, msg.sender, reportUri);
    }

    /// @notice Consumer buys wine -- transfer occurs to consumer and state set to Sold
    function buyWine(uint256 tokenId) external onlyRole(CONSUMER_ROLE) payable {
        Wine storage w = wines[tokenId];
        require(ownerOf(tokenId) == w.retailer, "Not owner");
        require(w.state == State.Inspected, "Must be inspected before sale");
        // transfer token to consumer (should be called by current owner or approved)
        address currentOwner = ownerOf(tokenId);
        safeTransferFrom(currentOwner, msg.sender, tokenId);

        w.consumer = msg.sender;
        w.state = State.Sold;
        emit WineSold(tokenId, msg.sender);
    }

    /// @notice Convenience getter
    function getWine(uint256 tokenId) external view returns (Wine memory) {
        return wines[tokenId];
    }
    
    // v5 ： ERC721 and  supportsInterface of AccessControl
    function supportsInterface(bytes4 interfaceId) public view override(AccessControl, ERC721, ERC721URIStorage)returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

}