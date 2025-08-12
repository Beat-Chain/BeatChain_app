// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./BeatChainNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BeatChainFactory
 * @dev Factory contract for creating and managing BeatChain music NFT collections
 */
contract BeatChainFactory is Ownable, ReentrancyGuard {
    
    // Platform fee for minting (in basis points, 100 = 1%)
    uint256 public mintingFee = 100;
    address payable public platformFeeRecipient;
    
    // Minimum mint price to prevent spam
    uint256 public minimumMintPrice = 0.001 ether;
    
    // Array of all created collections
    address[] public collections;
    
    // Mapping from creator to their collections
    mapping(address => address[]) public creatorCollections;
    
    // Mapping to check if an address is a valid BeatChain collection
    mapping(address => bool) public isValidCollection;
    
    // Collection metadata
    mapping(address => CollectionInfo) public collectionInfo;
    
    struct CollectionInfo {
        string name;
        string symbol;
        address creator;
        uint256 createdAt;
        uint256 totalMinted;
        bool isActive;
    }
    
    event CollectionCreated(
        address indexed collection,
        address indexed creator,
        string name,
        string symbol
    );
    
    event MusicNFTMinted(
        address indexed collection,
        uint256 indexed tokenId,
        address indexed creator,
        string title,
        uint256 mintPrice
    );
    
    event CollectionStatusChanged(address indexed collection, bool isActive);
    
    constructor(address payable _platformFeeRecipient) Ownable(msg.sender) {
        platformFeeRecipient = _platformFeeRecipient;
    }
    
    /**
     * @dev Create a new music NFT collection
     * @param name Name of the collection
     * @param symbol Symbol of the collection
     */
    function createCollection(
        string memory name,
        string memory symbol
    ) external returns (address) {
        // Deploy new BeatChainNFT contract
        BeatChainNFT newCollection = new BeatChainNFT(
            name,
            symbol,
            platformFeeRecipient
        );
        
        address collectionAddress = address(newCollection);
        
        // Store factory as initial minter, then transfer ownership
        // This allows the factory to mint during the mintWithFee call
        newCollection.transferOwnership(msg.sender);
        
        // Store collection info
        collections.push(collectionAddress);
        creatorCollections[msg.sender].push(collectionAddress);
        isValidCollection[collectionAddress] = true;
        
        collectionInfo[collectionAddress] = CollectionInfo({
            name: name,
            symbol: symbol,
            creator: msg.sender,
            createdAt: block.timestamp,
            totalMinted: 0,
            isActive: true
        });
        
        emit CollectionCreated(collectionAddress, msg.sender, name, symbol);
        
        return collectionAddress;
    }
    
    /**
     * @dev Mint music NFT with platform fee
     * @param collection Address of the collection contract
     * @param to Address to mint the NFT to
     * @param uri Metadata URI for the NFT
     * @param metadata Music-specific metadata
     * @param royaltyFee Royalty fee for the creator
     */
    function mintWithFee(
        address collection,
        address to,
        string memory uri,
        BeatChainNFT.MusicMetadata memory metadata,
        uint96 royaltyFee
    ) external payable nonReentrant returns (uint256) {
        require(isValidCollection[collection], "Invalid collection");
        require(collectionInfo[collection].isActive, "Collection not active");
        require(msg.value >= minimumMintPrice, "Insufficient mint fee");
        
        // Calculate platform fee
        uint256 platformFeeAmount = (msg.value * mintingFee) / 10000;
        uint256 creatorAmount = msg.value - platformFeeAmount;
        
        // Only collection creator can mint through factory
        require(
            msg.sender == collectionInfo[collection].creator,
            "Only collection creator can mint"
        );
        
        // Mint the NFT
        BeatChainNFT nftCollection = BeatChainNFT(collection);
        uint256 tokenId = nftCollection.mintMusicNFT(to, uri, metadata, royaltyFee);
        
        // Update collection stats
        collectionInfo[collection].totalMinted++;
        
        // Distribute payments
        if (platformFeeAmount > 0) {
            platformFeeRecipient.transfer(platformFeeAmount);
        }
        
        if (creatorAmount > 0) {
            payable(collectionInfo[collection].creator).transfer(creatorAmount);
        }
        
        emit MusicNFTMinted(collection, tokenId, to, metadata.title, msg.value);
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint music NFTs with platform fee
     */
    function batchMintWithFee(
        address collection,
        address to,
        string[] memory uris,
        BeatChainNFT.MusicMetadata[] memory metadataArray,
        uint96[] memory royaltyFees
    ) external payable nonReentrant returns (uint256[] memory) {
        require(isValidCollection[collection], "Invalid collection");
        require(collectionInfo[collection].isActive, "Collection not active");
        require(
            uris.length == metadataArray.length && 
            uris.length == royaltyFees.length,
            "Array length mismatch"
        );
        
        uint256 totalMintPrice = minimumMintPrice * uris.length;
        require(msg.value >= totalMintPrice, "Insufficient mint fee");
        
        // Calculate fees
        uint256 platformFeeAmount = (msg.value * mintingFee) / 10000;
        uint256 creatorAmount = msg.value - platformFeeAmount;
        
        // Mint NFTs
        BeatChainNFT nftCollection = BeatChainNFT(collection);
        uint256[] memory tokenIds = nftCollection.batchMintMusicNFT(
            to, 
            uris, 
            metadataArray, 
            royaltyFees
        );
        
        // Update collection stats
        collectionInfo[collection].totalMinted += uris.length;
        
        // Distribute payments
        if (platformFeeAmount > 0) {
            platformFeeRecipient.transfer(platformFeeAmount);
        }
        
        if (creatorAmount > 0) {
            payable(collectionInfo[collection].creator).transfer(creatorAmount);
        }
        
        // Emit events for each minted NFT
        for (uint256 i = 0; i < tokenIds.length; i++) {
            emit MusicNFTMinted(
                collection, 
                tokenIds[i], 
                to, 
                metadataArray[i].title, 
                msg.value / uris.length
            );
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Get collections created by a specific creator
     */
    function getCreatorCollections(address creator) external view returns (address[] memory) {
        return creatorCollections[creator];
    }
    
    /**
     * @dev Get all collections
     */
    function getAllCollections() external view returns (address[] memory) {
        return collections;
    }
    
    /**
     * @dev Get collection information
     */
    function getCollectionInfo(address collection) external view returns (CollectionInfo memory) {
        return collectionInfo[collection];
    }
    
    /**
     * @dev Get total number of collections
     */
    function getTotalCollections() external view returns (uint256) {
        return collections.length;
    }
    
    /**
     * @dev Toggle collection status (only collection owner or factory owner)
     */
    function toggleCollectionStatus(address collection) external {
        require(
            msg.sender == collectionInfo[collection].creator || msg.sender == owner(),
            "Not authorized"
        );
        require(isValidCollection[collection], "Invalid collection");
        
        collectionInfo[collection].isActive = !collectionInfo[collection].isActive;
        
        emit CollectionStatusChanged(collection, collectionInfo[collection].isActive);
    }
    
    /**
     * @dev Update platform fee (only owner)
     */
    function setMintingFee(uint256 _mintingFee) external onlyOwner {
        require(_mintingFee <= 1000, "Fee too high"); // Max 10%
        mintingFee = _mintingFee;
    }
    
    /**
     * @dev Update minimum mint price (only owner)
     */
    function setMinimumMintPrice(uint256 _minimumMintPrice) external onlyOwner {
        minimumMintPrice = _minimumMintPrice;
    }
    
    /**
     * @dev Update platform fee recipient (only owner)
     */
    function setPlatformFeeRecipient(address payable _platformFeeRecipient) external onlyOwner {
        platformFeeRecipient = _platformFeeRecipient;
    }
    
    /**
     * @dev Emergency withdrawal (only owner)
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
