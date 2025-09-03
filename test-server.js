// Test script for the data editor server
import fetch from 'node-fetch';

const testServer = async () => {
  try {
    console.log('🧪 Testing server connection...');
    
    // Test if server is running
    const response = await fetch('http://localhost:3001/api/save-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ test: 'data' })
    });
    
    console.log('✅ Server is responding!');
    console.log('Status:', response.status);
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
    console.log('Make sure the server is running on port 3001');
  }
};

testServer();
