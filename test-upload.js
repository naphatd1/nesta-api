const fs = require('fs');
const path = require('path');

// Test script to check upload functionality
async function testUpload() {
  console.log('Testing upload directories...');
  
  const directories = [
    'uploads/images',
    'uploads/documents', 
    'uploads/videos',
    'uploads/audio',
    'uploads/thumbnails',
    'uploads/temp'
  ];
  
  for (const dir of directories) {
    try {
      await fs.promises.access(dir);
      console.log(`✅ ${dir} exists`);
      
      // Test write permission
      const testFile = path.join(dir, 'test.txt');
      await fs.promises.writeFile(testFile, 'test');
      await fs.promises.unlink(testFile);
      console.log(`✅ ${dir} is writable`);
    } catch (error) {
      console.log(`❌ ${dir} error:`, error.message);
    }
  }
  
  console.log('Upload test completed!');
}

testUpload().catch(console.error);