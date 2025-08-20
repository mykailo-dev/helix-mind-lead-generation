const fs = require('fs');
const path = require('path');

// Simple function to read .env file
function readEnvFile() {
  try {
    // Try .env.local first, then .env
    let envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) {
      envPath = path.join(process.cwd(), '.env');
    }
    
    if (!fs.existsSync(envPath)) {
      console.log('❌ Neither .env.local nor .env file found');
      return {};
    }
    
    console.log(`📁 Reading environment from: ${path.basename(envPath)}`);
    const envContent = fs.readFileSync(envPath, 'utf8');
    const env = {};
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
    
    return env;
  } catch (error) {
    console.log('❌ Error reading environment file:', error.message);
    return {};
  }
}

function testAzureOpenAI(env) {
  console.log('\n🔍 AZURE OPENAI CONFIGURATION TEST\n');
  
  const requiredVars = [
    'AZURE_OPENAI_KEY',
    'AZURE_OPENAI_DEPLOYMENT', 
    'AZURE_OPENAI_ENDPOINT'
  ];
  
  let allGood = true;
  
  requiredVars.forEach(varName => {
    const value = env[varName];
    if (value) {
      console.log(`✅ ${varName}: Found`);
      if (varName === 'AZURE_OPENAI_DEPLOYMENT') {
        console.log(`   Value: ${value}`);
        if (value.includes('gpt-35') || value.includes('gpt-3.5-turbo')) {
          console.log(`   ✅ Correct model for GPT-3.5 Turbo`);
        } else {
          console.log(`   ⚠️  Make sure this matches your Azure deployment name`);
        }
      }
      if (varName === 'AZURE_OPENAI_ENDPOINT') {
        console.log(`   Value: ${value}`);
        if (value.includes('openai.azure.com') && value.includes('/deployments/')) {
          console.log(`   ✅ Valid Azure OpenAI endpoint with deployment`);
        } else if (value.includes('openai.azure.com')) {
          console.log(`   ⚠️  Should include deployment path: /deployments/your-deployment-name`);
        } else {
          console.log(`   ❌ Should contain 'openai.azure.com'`);
          allGood = false;
        }
      }
    } else {
      console.log(`❌ ${varName}: Missing`);
      allGood = false;
    }
  });
  
  if (allGood) {
    console.log('\n🎯 Azure OpenAI Configuration: READY');
    console.log('   Your GPT-3.5 Turbo should work correctly!');
  } else {
    console.log('\n❌ Azure OpenAI Configuration: INCOMPLETE');
    console.log('   Please add missing environment variables');
  }
  
  return allGood;
}

function testAirtable(env) {
  console.log('\n🔍 AIRTABLE CONFIGURATION TEST\n');
  
  const requiredVars = [
    'AIRTABLE_PERSONAL_ACCESS_TOKEN',
    'AIRTABLE_BASE_ID'
  ];
  
  let allGood = true;
  
  requiredVars.forEach(varName => {
    const value = env[varName];
    if (value) {
      console.log(`✅ ${varName}: Found`);
      if (varName === 'AIRTABLE_BASE_ID') {
        console.log(`   Value: ${value}`);
        if (value.startsWith('app')) {
          console.log(`   ✅ Valid Airtable base ID format`);
        } else {
          console.log(`   ⚠️  Should start with 'app'`);
        }
      }
    } else {
      console.log(`❌ ${varName}: Missing`);
      allGood = false;
    }
  });
  
  if (allGood) {
    console.log('\n🎯 Airtable Configuration: READY');
    console.log('   Your Airtable integration should work!');
  } else {
    console.log('\n❌ Airtable Configuration: INCOMPLETE');
    console.log('   Please add missing environment variables');
  }
  
  return allGood;
}

function showTroubleshooting() {
  console.log('\n🔧 TROUBLESHOOTING TIPS\n');
  
  console.log('📋 For Airtable PostalCode Error:');
  console.log('   1. Make sure your Airtable table has a "PostalCode" field');
  console.log('   2. Field type should be "Single line text"');
  console.log('   3. Field name must be exactly "PostalCode" (case-sensitive)');
  console.log('   4. Run: npm run create-airtable-table');
  
  console.log('\n📋 For Azure OpenAI:');
  console.log('   1. Check your deployment name in Azure portal');
  console.log('   2. Ensure endpoint URL is correct');
  console.log('   3. Verify API key has proper permissions');
  
  console.log('\n📋 For Port Issues:');
  console.log('   1. Current dev port: 3005');
  console.log('   2. Use: npm run dev (will auto-find available port)');
}

function main() {
  console.log('🚀 Helix Mind - Configuration Test\n');
  
  // Check environment
  const env = readEnvFile();
  
  if (Object.keys(env).length === 0) {
    console.log('❌ No environment variables found');
    return;
  }
  
  // Test configurations
  const azureGood = testAzureOpenAI(env);
  const airtableGood = testAirtable(env);
  
  // Show overall status
  console.log('\n📊 OVERALL STATUS\n');
  if (azureGood && airtableGood) {
    console.log('🎉 All configurations are ready!');
    console.log('   Your system should work correctly.');
  } else {
    console.log('⚠️  Some configurations need attention.');
    console.log('   Check the details above and fix any issues.');
  }
  
  // Show troubleshooting
  showTroubleshooting();
}

// Run the test
main(); 