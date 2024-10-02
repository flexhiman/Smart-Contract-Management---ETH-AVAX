const { ethers } = require("hardhat");

async function main() {
  try {
    // Fetch the contract factory for SharedOfficeBookingSystem
    const SharedOfficeBookingSystemFactory = await ethers.getContractFactory("SharedOfficeBookingSystem");

    // Deploy the contract
    const sharedOfficeBookingSystem = await SharedOfficeBookingSystemFactory.deploy();
    
    // Wait until the contract is deployed
    await sharedOfficeBookingSystem.deployed();

    // Log the address of the deployed contract
    console.log(SharedOfficeBookingSystem deployed to: ${sharedOfficeBookingSystem.address});
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

// Run the deployment script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
