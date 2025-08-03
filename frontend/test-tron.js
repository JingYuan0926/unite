const axios = require('axios');

async function testTronFunction() {
  try {
    console.log('🚀 Testing Tron Function Integration...\n');

    // Test the chat endpoint with ETH to TRON swap request
    const response = await axios.post('http://localhost:3000/api/agent', {
      action: 'chat',
      message: 'I want to swap 0.001 ETH to TRON',
      walletAddress: '0x147151a144fEb00E1e173469B5f90C3B78ae210c'
    });

    console.log('✅ Response received:');
    console.log('📋 Content:', response.data.content);
    
    if (response.data.functionCalls && response.data.functionCalls.length > 0) {
      console.log('\n🔧 Function calls made:');
      response.data.functionCalls.forEach((call, index) => {
        console.log(`${index + 1}. Function: ${call.name}`);
        console.log(`   Parameters:`, call.arguments);
        console.log(`   Result:`, call.result);
      });
      
      // Check if tron function was called
      const tronCall = response.data.functionCalls.find(call => call.name === 'tron');
      if (tronCall) {
        console.log('\n🎉 SUCCESS: Tron function was called!');
        console.log('✅ ETH Amount:', tronCall.arguments.ethAmount);
        console.log('✅ Action:', tronCall.arguments.action || 'swap');
      } else {
        console.log('\n❌ FAILURE: Tron function was NOT called');
        console.log('Functions called:', response.data.functionCalls.map(c => c.name));
      }
    } else {
      console.log('\n❌ FAILURE: No function calls were made');
      console.log('The LLM should have called the tron function for ETH to TRON swap');
    }

  } catch (error) {
    console.error('❌ Error testing tron function:', error.response?.data || error.message);
  }
}

// Run the test
testTronFunction(); 