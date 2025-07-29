const http = require('http');

async function checkServer(url = 'http://localhost:4000/api', timeout = 5000) {
  return new Promise((resolve) => {
    const request = http.get(url, { timeout }, (res) => {
      resolve({
        status: res.statusCode,
        success: res.statusCode < 400,
        message: `Server responded with status ${res.statusCode}`
      });
    });

    request.on('error', (err) => {
      resolve({
        success: false,
        error: err.code,
        message: `Cannot connect to server: ${err.message}`
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({
        success: false,
        error: 'TIMEOUT',
        message: 'Server connection timeout'
      });
    });
  });
}

async function waitForServer(url = 'http://localhost:4000/api/health', maxAttempts = 30, interval = 2000) {
  console.log('🔍 Checking server availability...');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const result = await checkServer(url);
    
    if (result.success) {
      console.log(`✅ Server is ready! (attempt ${attempt}/${maxAttempts})`);
      return true;
    }
    
    console.log(`⏳ Attempt ${attempt}/${maxAttempts}: ${result.message}`);
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  console.log('❌ Server is not available after maximum attempts');
  return false;
}

module.exports = { checkServer, waitForServer };

// If run directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'wait') {
    waitForServer().then(success => {
      process.exit(success ? 0 : 1);
    });
  } else {
    checkServer().then(result => {
      console.log(result.success ? '✅ Server is running' : '❌ Server is not running');
      console.log(result.message);
      process.exit(result.success ? 0 : 1);
    });
  }
}