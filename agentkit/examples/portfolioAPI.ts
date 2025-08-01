import { portfolioAPI, SupportedChainResponse, SupportedProtocolGroupResponse } from '../src/functions/portfolioAPI';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Testing 1inch Portfolio API v5.0\n');

    // Example 1: Check portfolio service status
    console.log('1️⃣ Testing checkPortfolioStatus...');
    try {
      const status = await portfolioAPI({
        endpoint: 'checkPortfolioStatus'
      });
      console.log(`✅ Portfolio service status: ${status.result.is_available ? 'Available' : 'Not Available'}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 2: Get supported chains
    console.log('2️⃣ Testing getSupportedChains...');
    try {
      const chains = await portfolioAPI({
        endpoint: 'getSupportedChains'
      });
      console.log(`✅ Supported chains retrieved successfully`);
      console.log(`   Number of supported chains: ${chains.length}`);
      chains.slice(0, 3).forEach((chain: SupportedChainResponse, index: number) => {
        console.log(`   Chain ${index + 1}: ${chain.chain_name} (ID: ${chain.chain_id})`);
      });
      if (chains.length > 3) {
        console.log(`   ... and ${chains.length - 3} more chains`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 3: Get supported protocols
    console.log('3️⃣ Testing getSupportedProtocols...');
    try {
      const protocols = await portfolioAPI({
        endpoint: 'getSupportedProtocols'
      });
      console.log(`✅ Supported protocols retrieved successfully`);
      console.log(`   Number of protocol groups: ${protocols.result.length}`);
      protocols.result.slice(0, 3).forEach((protocol: SupportedProtocolGroupResponse, index: number) => {
        console.log(`   Protocol ${index + 1}: ${protocol.protocol_group_name} (ID: ${protocol.protocol_group_id})`);
      });
      if (protocols.result.length > 3) {
        console.log(`   ... and ${protocols.result.length - 3} more protocol groups`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 4: Check addresses compliance
    console.log('4️⃣ Testing checkAddressesCompliance...');
    try {
      const compliance = await portfolioAPI({
        endpoint: 'checkAddressesCompliance',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75', '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6'],
        chain_id: 1
      });
      console.log(`✅ Addresses compliance check completed`);
      console.log(`   Response: ${JSON.stringify(compliance, null, 2).substring(0, 200)}...`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 5: Get current portfolio value
    console.log('5️⃣ Testing getCurrentPortfolioValue...');
    try {
      const portfolioValue = await portfolioAPI({
        endpoint: 'getCurrentPortfolioValue',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1
      });
      console.log(`✅ Current portfolio value retrieved successfully`);
      console.log(`   Total value: $${portfolioValue.result.total.toFixed(2)}`);
      console.log(`   Number of addresses: ${portfolioValue.result.by_address.length}`);
      console.log(`   Number of categories: ${portfolioValue.result.by_category.length}`);
      console.log(`   Number of protocol groups: ${portfolioValue.result.by_protocol_group.length}`);
      console.log(`   Number of chains: ${portfolioValue.result.by_chain.length}`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 6: Get general value chart
    console.log('6️⃣ Testing getGeneralValueChart...');
    try {
      const valueChart = await portfolioAPI({
        endpoint: 'getGeneralValueChart',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1,
        timerange: '1year'
      });
      console.log(`✅ General value chart retrieved successfully`);
      console.log(`   Number of data points: ${valueChart.result.length}`);
      if (valueChart.result.length > 0) {
        const latest = valueChart.result[valueChart.result.length - 1];
        console.log(`   Latest value: $${latest.value_usd.toFixed(2)} at timestamp ${latest.timestamp}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 7: Get overview report
    console.log('7️⃣ Testing getOverviewReport...');
    try {
      const report = await portfolioAPI({
        endpoint: 'getOverviewReport',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1
      });
      console.log(`✅ Overview report retrieved successfully`);
      console.log(`   Report type: ${typeof report}`);
      console.log(`   Report content length: ${JSON.stringify(report).length} characters`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 8: Get protocols snapshot
    console.log('8️⃣ Testing getProtocolsSnapshot...');
    try {
      const protocolsSnapshot = await portfolioAPI({
        endpoint: 'getProtocolsSnapshot',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1
      });
      console.log(`✅ Protocols snapshot retrieved successfully`);
      console.log(`   Number of protocol positions: ${protocolsSnapshot.result.length}`);
      if (protocolsSnapshot.result.length > 0) {
        const firstProtocol = protocolsSnapshot.result[0];
        console.log(`   First protocol: ${firstProtocol.protocol_group_name} (${firstProtocol.contract_symbol})`);
        console.log(`   Value: $${firstProtocol.value_usd.toFixed(2)}`);
        console.log(`   Underlying tokens: ${firstProtocol.underlying_tokens.length}`);
        console.log(`   Reward tokens: ${firstProtocol.reward_tokens.length}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 9: Get protocols metrics
    console.log('9️⃣ Testing getProtocolsMetrics...');
    try {
      const protocolsMetrics = await portfolioAPI({
        endpoint: 'getProtocolsMetrics',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1
      });
      console.log(`✅ Protocols metrics retrieved successfully`);
      console.log(`   Number of protocol metrics: ${protocolsMetrics.result.length}`);
      if (protocolsMetrics.result.length > 0) {
        const firstMetric = protocolsMetrics.result[0];
        console.log(`   First protocol metrics:`);
        console.log(`     Profit/Loss: $${firstMetric.profit_abs_usd?.toFixed(2) || 'N/A'}`);
        console.log(`     ROI: ${firstMetric.roi?.toFixed(2) || 'N/A'}%`);
        console.log(`     Weighted APR: ${firstMetric.weighted_apr?.toFixed(2) || 'N/A'}%`);
        console.log(`     Holding time: ${firstMetric.holding_time_days || 'N/A'} days`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 10: Get tokens snapshot
    console.log('🔟 Testing getTokensSnapshot...');
    try {
      const tokensSnapshot = await portfolioAPI({
        endpoint: 'getTokensSnapshot',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1
      });
      console.log(`✅ Tokens snapshot retrieved successfully`);
      console.log(`   Number of token positions: ${tokensSnapshot.length}`);
      if (tokensSnapshot.length > 0) {
        const firstToken = tokensSnapshot[0];
        console.log(`   First token: ${firstToken.contract_name} (${firstToken.contract_symbol})`);
        console.log(`   Value: $${firstToken.value_usd.toFixed(2)}`);
        console.log(`   Protocol: ${firstToken.protocol_group_name}`);
        console.log(`   Underlying tokens: ${firstToken.underlying_tokens.length}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 11: Get tokens metrics
    console.log('1️⃣1️⃣ Testing getTokensMetrics...');
    try {
      const tokensMetrics = await portfolioAPI({
        endpoint: 'getTokensMetrics',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1,
        timerange: '1year'
      });
      console.log(`✅ Tokens metrics retrieved successfully`);
      console.log(`   Number of token metrics: ${tokensMetrics.result.length}`);
      if (tokensMetrics.result.length > 0) {
        const firstMetric = tokensMetrics.result[0];
        console.log(`   First token metrics:`);
        console.log(`     Profit/Loss: $${firstMetric.profit_abs_usd?.toFixed(2) || 'N/A'}`);
        console.log(`     ROI: ${firstMetric.roi?.toFixed(2) || 'N/A'}%`);
        console.log(`     Weighted APR: ${firstMetric.weighted_apr?.toFixed(2) || 'N/A'}%`);
        console.log(`     Holding time: ${firstMetric.holding_time_days || 'N/A'} days`);
        console.log(`     Rewards USD: $${firstMetric.rewards_usd?.toFixed(2) || 'N/A'}`);
        console.log(`     Claimed fees USD: $${firstMetric.claimed_fees_usd?.toFixed(2) || 'N/A'}`);
        console.log(`     Unclaimed fees USD: $${firstMetric.unclaimed_fees_usd?.toFixed(2) || 'N/A'}`);
        console.log(`     Impermanent loss USD: $${firstMetric.impermanent_loss_usd?.toFixed(2) || 'N/A'}`);
      }
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Example 12: Get current portfolio value with cache
    console.log('1️⃣2️⃣ Testing getCurrentPortfolioValue with cache...');
    try {
      const portfolioValueCached = await portfolioAPI({
        endpoint: 'getCurrentPortfolioValue',
        addresses: ['0xd470055c6189b921c4d44b3d277ad868f79c0f75'],
        chain_id: 1,
        use_cache: true
      });
      console.log(`✅ Current portfolio value (cached) retrieved successfully`);
      console.log(`   Total value: $${portfolioValueCached.result.total.toFixed(2)}`);
      console.log(`   Cache used: true`);
    } catch (error) {
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    console.log('\n🎉 All Portfolio API tests completed!');
    console.log('\nNote: The Portfolio API provides comprehensive portfolio analytics across multiple wallets and chains, including profit/loss tracking, protocol metrics, and investment insights.');

  } catch (error) {
    console.error('❌ Error running Portfolio API examples:', error);
  }
}

main(); 