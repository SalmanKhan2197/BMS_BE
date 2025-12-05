const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n=== MongoDB Connection String Updater ===\n');

rl.question('Enter your MongoDB connection string:\n', (connectionString) => {
  if (!connectionString || connectionString.trim() === '') {
    console.error('❌ Connection string cannot be empty');
    rl.close();
    process.exit(1);
  }

  const envPath = path.join(__dirname, '..', '.env');
  
  try {
    let envContent = '';
    
    // Read existing .env file if it exists
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    } else {
      // Create from .env.example if it exists
      const examplePath = path.join(__dirname, '..', '.env.example');
      if (fs.existsSync(examplePath)) {
        envContent = fs.readFileSync(examplePath, 'utf8');
      }
    }

    // Update or add MONGODB_URI
    const lines = envContent.split('\n');
    let found = false;
    
    const updatedLines = lines.map(line => {
      if (line.startsWith('MONGODB_URI=')) {
        found = true;
        return `MONGODB_URI=${connectionString.trim()}`;
      }
      return line;
    });

    if (!found) {
      updatedLines.push(`MONGODB_URI=${connectionString.trim()}`);
    }

    // Write back to .env
    fs.writeFileSync(envPath, updatedLines.join('\n'), 'utf8');
    
    console.log('\n✅ .env file updated successfully!');
    console.log(`\nMONGODB_URI=${connectionString.trim()}`);
    console.log('\n💡 Restart your Node.js server to apply changes.\n');
    
  } catch (error) {
    console.error('❌ Error updating .env file:', error.message);
    process.exit(1);
  }

  rl.close();
});

