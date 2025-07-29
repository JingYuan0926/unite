const fs = require("fs");

// Load the compiled artifact
const artifact = require("./artifacts/ethereum/contracts/ethereum/EscrowFactory.sol/EscrowFactory.json");

// Extract just the ABI
const abi = artifact.abi;

// Save to a JSON file
fs.writeFileSync("correct-ethereum-abi.json", JSON.stringify(abi, null, 2));

console.log("✅ ABI extracted to correct-ethereum-abi.json");
console.log(`📊 Found ${abi.length} ABI entries`);

// Show some key functions
const functions = abi
  .filter((item) => item.type === "function")
  .map((f) => f.name);
console.log(
  "🔧 Functions found:",
  functions.slice(0, 10).join(", ") + (functions.length > 10 ? "..." : "")
);
