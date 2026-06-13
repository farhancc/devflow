const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Read MONGODB_URI from .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let mongodbUri = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const match = envContent.match(/MONGODB_URI=(.*)/);
  if (match && match[1]) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error('Error: MONGODB_URI not found in .env.local');
  process.exit(1);
}

async function run() {
  const client = new MongoClient(mongodbUri);
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db();
    console.log('Connected to database:', db.databaseName);

    // Collections to clear
    const collections = ['clients', 'projects', 'payments', 'expenses', 'goals'];
    for (const name of collections) {
      const col = db.collection(name);
      const deleteResult = await col.deleteMany({});
      console.log(`Cleared ${deleteResult.deletedCount} documents from '${name}' collection.`);
    }

    console.log('Successfully cleared all transactional data!');
  } catch (err) {
    console.error('An error occurred during database clear:', err);
  } finally {
    await client.close();
  }
}

run();
