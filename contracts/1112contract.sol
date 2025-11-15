// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// OpenZeppelin 
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract WineChain is ERC721, AccessControl {
    // === Roles ===
    bytes32 public constant WINERY_ROLE     = keccak256("WINERY_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant RETAILER_ROLE    = keccak256("RETAILER_ROLE");
    bytes32 public constant REGULATOR_ROLE   = keccak256("REGULATOR_ROLE");

    // === Product Journey ===
    enum Stage {
        Created,     //at winery
        InShipment,  //with distributor
        InStorage,   //at retailer
        Delivered    //to customer
    }

    // wine information
    struct WineInfo {
        uint256 vintage;        //year 
        string grapeVarietal;   
        string region;          
        string bottlingDate;    
        string ipfsHash;        // metadata / certificates stored by IPFS
        Stage stage;            
        address currentCustodian; 
        address winery;         
        bool approvedByRegulator; 
    }

    // comdition log 
    struct ConditionLog {
        string condition;   // e.g. "Temp: 16C, humidity 70%"
        uint256 timestamp;
        address updatedBy;
    }

    // tokenId tracker
    uint256 private _nextTokenId;

    // tokenId -> WineInfo
    mapping(uint256 => WineInfo) public wines;

    // tokenId -> condition logs
    mapping(uint256 => ConditionLog[]) public conditionHistory;

    // === Events ===
    event WineCreated(uint256 indexed tokenId, address indexed winery, string ipfsHash);
    event CustodyTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        Stage newStage
    );
    event ConditionUpdated(uint256 indexed tokenId, string condition, uint256 timestamp);
    event WineApproved(uint256 indexed tokenId, address indexed regulator);

    constructor() ERC721("WineChain", "WINE") {
        //  admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // admin =  Winery（can be changed later）
        _grantRole(WINERY_ROLE, msg.sender);
    }

    // === Winery: creat wine ===
    function createWine(
        uint256 vintage,
        string memory grapeVarietal,
        string memory region,
        string memory bottlingDate,
        string memory ipfsHash
    ) external onlyRole(WINERY_ROLE) returns (uint256) {
        uint256 tokenId = ++_nextTokenId;

        _safeMint(msg.sender, tokenId);

        wines[tokenId] = WineInfo({
            vintage: vintage,
            grapeVarietal: grapeVarietal,
            region: region,
            bottlingDate: bottlingDate,
            ipfsHash: ipfsHash,
            stage: Stage.Created,
            currentCustodian: msg.sender,
            winery: msg.sender,
            approvedByRegulator: false
        });

        emit WineCreated(tokenId, msg.sender, ipfsHash);
        return tokenId;
    }

    // === Winery: transfer to  Distributor（Shipment stage）===
    function transferToDistributor(
        uint256 tokenId,
        address distributor,
        string memory transportCondition
    ) external onlyRole(WINERY_ROLE) {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(hasRole(DISTRIBUTOR_ROLE, distributor), "Not distributor");

        _transfer(msg.sender, distributor, tokenId);

        wines[tokenId].stage = Stage.InShipment;
        wines[tokenId].currentCustodian = distributor;

        _addCondition(tokenId, transportCondition);
        emit CustodyTransferred(tokenId, msg.sender, distributor, Stage.InShipment);
    }

    // === Distributor: transfer to Retailer（Storage stage）===
    function receiveAtRetailer(
        uint256 tokenId,
        address retailer,
        string memory storageCondition
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(hasRole(RETAILER_ROLE, retailer), "Not retailer");

        _transfer(msg.sender, retailer, tokenId);

        wines[tokenId].stage = Stage.InStorage;
        wines[tokenId].currentCustodian = retailer;

        _addCondition(tokenId, storageCondition);
        emit CustodyTransferred(tokenId, msg.sender, retailer, Stage.InStorage);
    }

    // === Retailer: transfer to Consumer（Delivery stage）===
    function deliverToConsumer(
        uint256 tokenId,
        address consumer,
        string memory deliveryNote
    ) external onlyRole(RETAILER_ROLE) {
        require(ownerOf(tokenId) == msg.sender, "Not owner");

        _transfer(msg.sender, consumer, tokenId);

        wines[tokenId].stage = Stage.Delivered;
        wines[tokenId].currentCustodian = consumer;

        _addCondition(tokenId, deliveryNote);
        emit CustodyTransferred(tokenId, msg.sender, consumer, Stage.Delivered);
    }

    // === update condition===
    function updateCondition(uint256 tokenId, string memory condition) external {
        ownerOf(tokenId);       

        // here we allow winery, distributor, retailer to update 
        require(
            hasRole(WINERY_ROLE, msg.sender) ||
            hasRole(DISTRIBUTOR_ROLE, msg.sender) ||
            hasRole(RETAILER_ROLE, msg.sender),
            "Not allowed"
        );

        _addCondition(tokenId, condition);
    }

    // === Regulator ===
    function approveWine(uint256 tokenId) external onlyRole(REGULATOR_ROLE) {
        ownerOf(tokenId);       
        wines[tokenId].approvedByRegulator = true;
        emit WineApproved(tokenId, msg.sender);
    }

    // === condition history===
    function getConditionHistory(uint256 tokenId)
        external
        view
        returns (ConditionLog[] memory)
    {
        return conditionHistory[tokenId];
    }
    

    // Internal: add condition log + emit event
    function _addCondition(uint256 tokenId, string memory condition) internal {
        ConditionLog memory logEntry = ConditionLog({
            condition: condition,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });
        conditionHistory[tokenId].push(logEntry);

        emit ConditionUpdated(tokenId, condition, block.timestamp);
    }
    // v5 ： ERC721 and  supportsInterface of AccessControl
function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControl)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}

}
