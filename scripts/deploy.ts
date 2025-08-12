import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.provider.getBalance(deployer.address)).toString());

  // Platform fee recipient (can be changed later)
  const platformFeeRecipient = deployer.address;

  // Deploy BeatChainFactory
  console.log("\nDeploying BeatChainFactory...");
  const BeatChainFactory = await ethers.getContractFactory("BeatChainFactory");
  const factory = await BeatChainFactory.deploy(platformFeeRecipient);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("BeatChainFactory deployed to:", factoryAddress);

  // Deploy BeatChainMarketplace
  console.log("\nDeploying BeatChainMarketplace...");
  const BeatChainMarketplace = await ethers.getContractFactory("BeatChainMarketplace");
  const marketplace = await BeatChainMarketplace.deploy(platformFeeRecipient);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("BeatChainMarketplace deployed to:", marketplaceAddress);

  // Create a sample collection
  console.log("\nCreating sample collection...");
  const createTx = await factory.createCollection("BeatChain Genesis", "BEATGEN");
  const receipt = await createTx.wait();
  
  // Get the collection address from the event
  const collectionCreatedEvent = receipt?.logs.find(
    (log: any) => log.fragment?.name === 'CollectionCreated'
  );
  
  if (collectionCreatedEvent) {
    const collectionAddress = collectionCreatedEvent.args[0];
    console.log("Sample collection created at:", collectionAddress);
  }

  console.log("\n=== Deployment Summary ===");
  console.log("Factory Address:", factoryAddress);
  console.log("Marketplace Address:", marketplaceAddress);
  console.log("Platform Fee Recipient:", platformFeeRecipient);
  console.log("Network:", await ethers.provider.getNetwork());

  // Instructions for frontend integration
  console.log("\n=== Frontend Integration ===");
  console.log("Add these addresses to your frontend configuration:");
  console.log(`FACTORY_ADDRESS="${factoryAddress}"`);
  console.log(`MARKETPLACE_ADDRESS="${marketplaceAddress}"`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });