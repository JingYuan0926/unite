const TronEscrowFactory = artifacts.require("TronEscrowFactory");

module.exports = function (deployer, network, accounts) {
  console.log(`🚀 Deploying TronEscrowFactory to ${network}...`);
  console.log(`Deployer account: ${accounts[0]}`);

  deployer.deploy(TronEscrowFactory).then(() => {
    console.log(
      `✅ TronEscrowFactory deployed at: ${TronEscrowFactory.address}`
    );
  });
};
