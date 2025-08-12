// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Address.sol";

/**
 * @title BeatChainMarketplace
 * @dev Marketplace contract for trading music NFTs with royalty support
 */
contract BeatChainMarketplace is ReentrancyGuard, Ownable, IERC721Receiver {
    using Address for address payable;

    // Platform fee (in basis points, 250 = 2.5%)
    uint256 public platformFee = 250;
    address payable public platformFeeRecipient;

    // Marketplace fee for sellers (in basis points, 100 = 1%)
    uint256 public marketplaceFee = 100;

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool isActive;
        uint256 listedAt;
    }

    struct Auction {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 startingPrice;
        uint256 currentBid;
        address currentBidder;
        uint256 endTime;
        bool isActive;
        uint256 createdAt;
    }

    // Mapping from listing ID to Listing
    mapping(uint256 => Listing) public listings;
    uint256 public listingCounter;

    // Mapping from auction ID to Auction
    mapping(uint256 => Auction) public auctions;
    uint256 public auctionCounter;

    // Mapping to track user's failed withdrawal amounts
    mapping(address => uint256) public failedTransferCredits;

    event ItemListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event ItemSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );

    event ListingCancelled(uint256 indexed listingId);

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    constructor(address payable _platformFeeRecipient) Ownable(msg.sender) {
        platformFeeRecipient = _platformFeeRecipient;
    }

    /**
     * @dev List an NFT for sale
     */
    function listItem(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");
        require(
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) ||
            IERC721(nftContract).getApproved(tokenId) == address(this),
            "Contract not approved"
        );

        uint256 listingId = listingCounter++;

        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            isActive: true,
            listedAt: block.timestamp
        });

        // Transfer NFT to marketplace
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        emit ItemListed(listingId, msg.sender, nftContract, tokenId, price);
        return listingId;
    }

    /**
     * @dev Buy a listed NFT
     */
    function buyItem(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "Listing not active");
        require(msg.value >= listing.price, "Insufficient payment");

        listing.isActive = false;

        // Calculate fees and royalties
        (uint256 sellerAmount, uint256 platformFeeAmount, uint256 royaltyAmount, address royaltyRecipient) =
            _calculatePaymentDistribution(listing.nftContract, listing.tokenId, listing.price);

        // Transfer NFT to buyer
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        // Distribute payments
        _distributePayment(
            listing.seller,
            sellerAmount,
            platformFeeAmount,
            royaltyAmount,
            royaltyRecipient
        );

        // Refund excess payment
        if (msg.value > listing.price) {
            _transferETHWithFallback(payable(msg.sender), msg.value - listing.price);
        }

        emit ItemSold(listingId, msg.sender, listing.seller, listing.price);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.seller == msg.sender, "Not the seller");
        require(listing.isActive, "Listing not active");

        listing.isActive = false;

        // Return NFT to seller
        IERC721(listing.nftContract).safeTransferFrom(address(this), msg.sender, listing.tokenId);

        emit ListingCancelled(listingId);
    }

    /**
     * @dev Create an auction
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 duration
    ) external nonReentrant returns (uint256) {
        require(startingPrice > 0, "Starting price must be greater than 0");
        require(duration >= 3600, "Duration must be at least 1 hour"); // Minimum 1 hour
        require(duration <= 7 days, "Duration cannot exceed 7 days");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not the owner");

        uint256 auctionId = auctionCounter++;
        uint256 endTime = block.timestamp + duration;

        auctions[auctionId] = Auction({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            startingPrice: startingPrice,
            currentBid: 0,
            currentBidder: address(0),
            endTime: endTime,
            isActive: true,
            createdAt: block.timestamp
        });

        // Transfer NFT to marketplace
        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        emit AuctionCreated(auctionId, msg.sender, nftContract, tokenId, startingPrice, endTime);
        return auctionId;
    }

    /**
     * @dev Place a bid on an auction
     */
    function placeBid(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");

        uint256 minBid = auction.currentBid == 0 ? auction.startingPrice : auction.currentBid + (auction.currentBid * 5 / 100); // 5% increment
        require(msg.value >= minBid, "Bid too low");

        // Refund previous bidder
        if (auction.currentBidder != address(0)) {
            _transferETHWithFallback(payable(auction.currentBidder), auction.currentBid);
        }

        auction.currentBid = msg.value;
        auction.currentBidder = msg.sender;

        emit BidPlaced(auctionId, msg.sender, msg.value);
    }

    /**
     * @dev End an auction
     */
    function endAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.isActive, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still ongoing");

        auction.isActive = false;

        if (auction.currentBidder == address(0)) {
            // No bids, return NFT to seller
            IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenId);
        } else {
            // Transfer NFT to winner
            IERC721(auction.nftContract).safeTransferFrom(address(this), auction.currentBidder, auction.tokenId);

            // Calculate and distribute payments
            (uint256 sellerAmount, uint256 platformFeeAmount, uint256 royaltyAmount, address royaltyRecipient) =
                _calculatePaymentDistribution(auction.nftContract, auction.tokenId, auction.currentBid);

            _distributePayment(
                auction.seller,
                sellerAmount,
                platformFeeAmount,
                royaltyAmount,
                royaltyRecipient
            );

            emit AuctionEnded(auctionId, auction.currentBidder, auction.currentBid);
        }
    }

    /**
     * @dev Calculate payment distribution including royalties
     */
    function _calculatePaymentDistribution(
        address nftContract,
        uint256 tokenId,
        uint256 salePrice
    ) internal view returns (
        uint256 sellerAmount,
        uint256 platformFeeAmount,
        uint256 royaltyAmount,
        address royaltyRecipient
    ) {
        platformFeeAmount = (salePrice * platformFee) / 10000;

        // Check for EIP-2981 royalty standard
        if (IERC165(nftContract).supportsInterface(type(IERC2981).interfaceId)) {
            (royaltyRecipient, royaltyAmount) = IERC2981(nftContract).royaltyInfo(tokenId, salePrice);
        }

        sellerAmount = salePrice - platformFeeAmount - royaltyAmount;
    }

    /**
     * @dev Distribute payment to all parties
     */
    function _distributePayment(
        address seller,
        uint256 sellerAmount,
        uint256 platformFeeAmount,
        uint256 royaltyAmount,
        address royaltyRecipient
    ) internal {
        // Pay platform fee
        if (platformFeeAmount > 0) {
            _transferETHWithFallback(platformFeeRecipient, platformFeeAmount);
        }

        // Pay royalty
        if (royaltyAmount > 0 && royaltyRecipient != address(0)) {
            _transferETHWithFallback(payable(royaltyRecipient), royaltyAmount);
        }

        // Pay seller
        if (sellerAmount > 0) {
            _transferETHWithFallback(payable(seller), sellerAmount);
        }
    }

    /**
     * @dev Transfer ETH with fallback to credit system
     */
    function _transferETHWithFallback(address payable to, uint256 amount) internal {
        (bool success, ) = to.call{value: amount}("");
        if (!success) {
            failedTransferCredits[to] += amount;
        }
    }

    /**
     * @dev Withdraw failed transfer credits
     */
    function withdrawCredits() external nonReentrant {
        uint256 amount = failedTransferCredits[msg.sender];
        require(amount > 0, "No credits to withdraw");

        failedTransferCredits[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function setPlatformFee(uint256 _platformFee) external onlyOwner {
        require(_platformFee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = _platformFee;
    }

    /**
     * @dev Get active listings
     */
    function getActiveListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    /**
     * @dev Get active auction
     */
    function getActiveAuction(uint256 auctionId) external view returns (Auction memory) {
        return auctions[auctionId];
    }

    function onERC721Received(address, address, uint256, bytes calldata) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
