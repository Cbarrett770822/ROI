const fs = require('fs').promises;
const path = require('path');

// The correct MongoDB connection string
const NEW_CONNECTION_STRING = 'mongodb+srv://CB770822:goOX1mZbVY41Qkir@cluster0.eslgbjq.mongodb.net/roi-app-db?retryWrites=true&w=majority&appName=Cluster0';

// Files to update
const files = [
  'netlify/functions/auth-login.js',
  'netlify/functions/companies.js',
  'netlify/functions/questionnaire.js',
  'netlify/functions/users.js'
];

async function updateConnectionString() {
  console.log('Updating MongoDB connection string in Netlify function files...');
  
  for (const file of files) {
    const filePath = path.join(__dirname, file);
    console.log(`Processing ${filePath}...`);
    
    try {
      // Read the file
      let content = await fs.readFile(filePath, 'utf8');
      
      // Find and replace the MongoDB connection string
      const oldConnectionRegex = /const MONGODB_URI = ['"]mongodb\+srv:\/\/.*?['"]/;
      
      if (oldConnectionRegex.test(content)) {
        content = content.replace(oldConnectionRegex, `const MONGODB_URI = '${NEW_CONNECTION_STRING}'`);
        
        // Write the updated content back to the file
        await fs.writeFile(filePath, content, 'utf8');
        console.log(`✅ Updated ${file} successfully`);
      } else {
        console.log(`⚠️ Could not find MongoDB connection string in ${file}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${file}:`, error);
    }
  }
  
  console.log('Done updating MongoDB connection strings.');
}

// Run the update
updateConnectionString();
