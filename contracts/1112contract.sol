// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 需要在 Hardhat/Remix 裡安裝 OpenZeppelin 套件
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
        Created,     // 剛從酒莊出來
        InShipment,  // 運送中/在供應鏈之間流動
        InStorage,   // 到零售商倉庫/酒窖
        Delivered    // 到消費者手上
    }

    // 每一瓶酒的基本資訊
    struct WineInfo {
        uint256 vintage;        // 年份
        string grapeVarietal;   // 葡萄品種
        string region;          // 產區
        string bottlingDate;    // 裝瓶日期（簡單先用 string）
        string ipfsHash;        // metadata / certificates 存在 IPFS
        Stage stage;            // 目前階段
        address currentCustodian; // 目前誰在持有（酒莊/經銷/零售/消費者）
        address winery;         // 原始酒莊
        bool approvedByRegulator; // 是否被核可
    }

    // 條件紀錄（運送/儲存狀況）
    struct ConditionLog {
        string condition;   // e.g. "Temp: 16C, humidity 70%"
        uint256 timestamp;
        address updatedBy;
    }

    // tokenId 自動累加
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
        // 部署者是 admin
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        // 讓部署者同時是 Winery（方便測試）
        _grantRole(WINERY_ROLE, msg.sender);
    }

    // === Winery: 建立新酒 ===
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

    // === Winery: 交給 Distributor（Shipment stage）===
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

    // === Distributor: 送到 Retailer（Storage stage）===
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

    // === Retailer: 交給 Consumer（Delivery stage）===
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

    // === 過程中更新條件（運送/儲存狀態）===
    function updateCondition(uint256 tokenId, string memory condition) external {
        ownerOf(tokenId);       

        // 這裡可以調整權限：目前簡單限制三種角色可以更新
        require(
            hasRole(WINERY_ROLE, msg.sender) ||
            hasRole(DISTRIBUTOR_ROLE, msg.sender) ||
            hasRole(RETAILER_ROLE, msg.sender),
            "Not allowed"
        );

        _addCondition(tokenId, condition);
    }

    // === Regulator: 核可這瓶酒 ===
    function approveWine(uint256 tokenId) external onlyRole(REGULATOR_ROLE) {
        ownerOf(tokenId);       
        wines[tokenId].approvedByRegulator = true;
        emit WineApproved(tokenId, msg.sender);
    }

    // === 讀取條件歷史（給前端/消費者查詢）===
    function getConditionHistory(uint256 tokenId)
        external
        view
        returns (ConditionLog[] memory)
    {
        return conditionHistory[tokenId];
    }
    

    // Internal: 加一筆 condition log + emit event
    function _addCondition(uint256 tokenId, string memory condition) internal {
        ConditionLog memory logEntry = ConditionLog({
            condition: condition,
            timestamp: block.timestamp,
            updatedBy: msg.sender
        });
        conditionHistory[tokenId].push(logEntry);

        emit ConditionUpdated(tokenId, condition, block.timestamp);
    }
    // v5 的寫法：同時覆寫 ERC721 與 AccessControl 的 supportsInterface
function supportsInterface(bytes4 interfaceId)
    public
    view
    override(ERC721, AccessControl)
    returns (bool)
{
    return super.supportsInterface(interfaceId);
}

}
