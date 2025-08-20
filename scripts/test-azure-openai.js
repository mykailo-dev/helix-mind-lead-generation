const fs = require('fs');
const path = require('path');

// Simple function to read .env file
function readEnvFile() {
  try {
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

async function testAzureOpenAI() {
  console.log('🚀 Testing Azure OpenAI Connection...\n');
  
  const env = readEnvFile();
  
  // Check required variables
  const requiredVars = ['AZURE_OPENAI_KEY', 'AZURE_OPENAI_DEPLOYMENT', 'AZURE_OPENAI_ENDPOINT'];
  const missingVars = requiredVars.filter(varName => !env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('Please add them to your .env file');
    return;
  }
  
  console.log('📋 Configuration:');
  console.log(`   Deployment: ${env.AZURE_OPENAI_DEPLOYMENT}`);
  console.log(`   Base Endpoint: ${env.AZURE_OPENAI_ENDPOINT}`);
  console.log(`   API Key: ${env.AZURE_OPENAI_KEY ? 'Found' : 'Missing'}`);
  
  // Construct the base endpoint URL (without chat/completions)
  const getBaseEndpoint = () => {
    const baseEndpoint = env.AZURE_OPENAI_ENDPOINT;
    const deployment = env.AZURE_OPENAI_DEPLOYMENT;
    
    // If endpoint already includes deployment path, extract the base
    if (baseEndpoint && baseEndpoint.includes('/deployments/')) {
      const match = baseEndpoint.match(/^(.*\/deployments\/[^\/]+)/);
      if (match) {
        return match[1];
      }
    }
    
    // Otherwise, construct the base endpoint
    if (baseEndpoint) {
      const cleanBase = baseEndpoint.replace(/\/$/, '');
      return `${cleanBase}/openai/deployments/${deployment}`;
    }
    
    return `https://openai-nucleus.openai.azure.com/openai/deployments/${deployment}`;
  };
  
  const baseEndpoint = getBaseEndpoint();
  const fullEndpoint = `${baseEndpoint}/chat/completions`;
  
  console.log(`   Base Endpoint: ${baseEndpoint}`);
  console.log(`   Full Endpoint: ${fullEndpoint}`);
  
  // Test the connection using fetch (Node.js 18+)
  try {
    const url = `${fullEndpoint}?api-version=2024-02-15-preview`;
    
    const requestBody = {
      messages: [
        { role: "user", content: "Hello, this is a test message. Please respond with 'Test successful!' only." }
      ],
      max_tokens: 10,
      temperature: 0
    };
    
    console.log('\n🔍 Testing API call...');
    console.log(`   URL: ${url}`);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': env.AZURE_OPENAI_KEY
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`   Status: ${response.status}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Azure OpenAI connection successful!');
      console.log('   Response:', JSON.stringify(data, null, 2));
    } else {
      const errorText = await response.text();
      console.log('❌ Azure OpenAI connection failed');
      console.log('   Error:', errorText);
      
      if (response.status === 404) {
        console.log('\n🔧 Troubleshooting for 404 error:');
        console.log('   1. Check your deployment name is correct');
        console.log('   2. Verify the endpoint URL includes the deployment path');
        console.log('   3. Ensure your API key has access to this deployment');
        console.log('   4. Your .env should have:');
        console.log(`      AZURE_OPENAI_ENDPOINT=https://openai-nucleus.openai.azure.com`);
        console.log(`      AZURE_OPENAI_DEPLOYMENT=nucleus-gpt-35`);
      }
    }
    
  } catch (error) {
    console.log('❌ Error testing Azure OpenAI:', error.message);
  }
}

// Run the test
testAzureOpenAI(); 