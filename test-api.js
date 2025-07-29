const newman = require("newman");
const path = require("path");
const { checkServer, waitForServer } = require("./check-server");

// API Test Runner using Newman
async function runApiTests() {
  console.log("🧪 Starting API Tests...\n");

  // Check if server is running
  const serverCheck = await checkServer();
  if (!serverCheck.success) {
    console.log("❌ Server is not running!");
    console.log("💡 Please start the server first:");
    console.log("   npm run start:dev");
    console.log("   or");
    console.log("   npm run start:prod");
    process.exit(1);
  }

  console.log("✅ Server is running, proceeding with tests...\n");

  const options = {
    collection: path.join(__dirname, "postman-collection-fixed.json"),
    environment: path.join(__dirname, "postman-environment.json"),
    reporters: ["cli", "json"],
    reporter: {
      json: {
        export: "./test-results.json",
      },
    },
    insecure: true, // Allow self-signed certificates
    timeout: 30000, // 30 seconds timeout
    delayRequest: 500, // 500ms delay between requests
  };

  try {
    const summary = await new Promise((resolve, reject) => {
      newman.run(options, (err, summary) => {
        if (err) {
          reject(err);
        } else {
          resolve(summary);
        }
      });
    });

    console.log("\n📊 Test Summary:");
    console.log(`Total Requests: ${summary.run.stats.requests.total}`);
    console.log(
      `Passed: ${summary.run.stats.requests.total - summary.run.failures.length}`
    );
    console.log(`Failed: ${summary.run.failures.length}`);
    console.log(
      `Average Response Time: ${summary.run.timings.responseAverage}ms`
    );

    if (summary.run.failures.length > 0) {
      console.log("\n❌ Failed Tests:");
      summary.run.failures.forEach((failure, index) => {
        console.log(
          `${index + 1}. ${failure.source.name}: ${failure.error.message}`
        );
      });
      process.exit(1);
    } else {
      console.log("\n✅ All tests passed!");
      process.exit(0);
    }
  } catch (error) {
    console.error("❌ Test execution failed:", error.message);
    process.exit(1);
  }
}

// Run specific test folder
async function runSpecificTests(folderName) {
  console.log(`🧪 Running tests for: ${folderName}\n`);

  // Check if server is running
  const serverCheck = await checkServer();
  if (!serverCheck.success) {
    console.log("❌ Server is not running!");
    console.log("💡 Please start the server first: npm run start:dev");
    process.exit(1);
  }

  const options = {
    collection: path.join(__dirname, "postman-collection-fixed.json"),
    environment: path.join(__dirname, "postman-environment.json"),
    folder: folderName,
    reporters: ["cli"],
    insecure: true,
    timeout: 30000,
  };

  try {
    await new Promise((resolve, reject) => {
      newman.run(options, (err, summary) => {
        if (err) {
          reject(err);
        } else {
          console.log(`\n✅ ${folderName} tests completed!`);
          resolve(summary);
        }
      });
    });
  } catch (error) {
    console.error(`❌ ${folderName} tests failed:`, error.message);
    process.exit(1);
  }
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case "auth":
    runSpecificTests("Authentication");
    break;
  case "upload":
    runSpecificTests("File Upload");
    break;
  case "monitoring":
    runSpecificTests("Monitoring");
    break;
  case "health":
    runSpecificTests("Health");
    break;
  case "all":
  default:
    runApiTests();
    break;
}
