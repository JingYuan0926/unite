#!/usr/bin/env node

/**
 * 🌐 Fusion+ Tron Bridge - Network Connectivity Test
 * Tests connection to Ethereum Sepolia and Tron Nile testnets
 */

const https = require("https");
const http = require("http");

console.log("🌐 Fusion+ Tron Bridge - Network Connectivity Test\n");

const networks = [
  {
    name: "Ethereum Sepolia",
    urls: [
      "https://eth-sepolia.g.alchemy.com/public",
      "https://sepolia.gateway.tenderly.co",
      "https://endpoints.omniatech.io/v1/eth/sepolia/public",
    ],
  },
  {
    name: "Tron Nile",
    urls: ["https://api.nileex.io", "https://nile.trongrid.io"],
  },
];

function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith("https") ? https : http;

    const req = protocol.get(url, (res) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: true,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
      res.resume(); // Consume response to free up memory
    });

    req.on("error", (error) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        success: false,
        error: error.message,
        duration: `${duration}ms`,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        success: false,
        error: "Timeout (10s)",
        duration: "10000ms+",
      });
    });
  });
}

async function testNetworks() {
  for (const network of networks) {
    console.log(`Testing ${network.name}:`);
    console.log("-".repeat(40));

    for (const url of network.urls) {
      const result = await testUrl(url);

      if (result.success) {
        console.log(`✅ ${url}`);
        console.log(
          `   Status: ${result.status} | Duration: ${result.duration}`
        );
      } else {
        console.log(`❌ ${url}`);
        console.log(`   Error: ${result.error} | Duration: ${result.duration}`);
      }
    }
    console.log("");
  }

  console.log("🔧 Recommendations:");
  console.log("- Use working URLs in your .env configuration");
  console.log("- Consider multiple backup RPC endpoints");
  console.log("- Check firewall settings if all tests fail");
  console.log("- Some providers may block direct browser requests");
  console.log("\n✅ Network connectivity test complete!");
}

// Run the test
testNetworks().catch(console.error);
