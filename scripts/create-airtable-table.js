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

function createCSVTemplate() {
  const csvContent = `Name,Phone,Website,Address,City,PostalCode,State,CountryCode,CategoryName,Neighborhood,Street,Latitude,Longitude,TotalScore,PlaceId,ReviewsCount,ImagesCount,ImageUrl,Domain,Emails,LinkedIns,Twitters,Instagrams,Facebooks,Youtubes,Tiktoks,Pinterests,Discords,Status,Message
"Austin's Best Lawn and Landscape","(512) 673-3138","http://www.austinsbestlawns.com/","7310 Menchaca Rd, Austin, TX 78745","Austin","78745","Texas","US","Landscaper","Cherry Creek","7310 Menchaca Rd",30.1992288,-97.8089004,5,"ChIJNxe-kfFNW4YR8JWIWLBPWsM",11,17,"https://lh3.googleusercontent.com/p/AF1QipMruM_8QCl0qpkrJSCZJNTKhysvk6b1G9lZbbf3=w408-h304-k-no","austinsbestlawns.com","","https://www.linkedin.com/in/austin-shuler-b12a8639/","","","","","","","","sourced",""
"Green Thumb Landscaping","(555) 123-4567","https://greenthumb.com","123 Main St, Dallas, TX 75001","Dallas","75001","Texas","US","Landscaper","Downtown","123 Main St",32.7767,-96.7970,4,"ChIJw0rXGx_2RIYRmGxqJbwwzQY",8,12,"https://example.com/image1.jpg","greenthumb.com","contact@greenthumb.com","","","","","","","","sourced",""
"Perfect Lawn Care","(555) 987-6543","https://perfectlawn.com","456 Oak Ave, Houston, TX 77001","Houston","77001","Texas","US","Landscaper","Midtown","456 Oak Ave",29.7604,-95.3698,4,"ChIJjRmdzQ2ZQIYR7AZ67x9noDs",6,9,"https://example.com/image2.jpg","perfectlawn.com","info@perfectlawn.com","","","","","","","","sourced",""`;
  
  const csvPath = path.join(process.cwd(), 'airtable-complete-template.csv');
  fs.writeFileSync(csvPath, csvContent);
  console.log(`✅ Complete CSV template created: ${csvPath}`);
  return csvPath;
}

function showQuickSetup() {
  console.log('\n🚀 COMPLETE AIRTABLE SETUP (All Apify Fields)\n');
  console.log('📋 Method 1: Import CSV (Fastest)');
  console.log('1. Download the complete CSV template above');
  console.log('2. Go to Airtable.com → Create new base');
  console.log('3. Click "Import a spreadsheet"');
  console.log('4. Upload the CSV file');
  console.log('5. Rename table to "Leads"');
  console.log('6. Change Status field type to "Single select"');
  console.log('7. Add these options: sourced, message_generated, contacted, replied, converted, deleted, failed, bounced');
  
  console.log('\n📋 Method 2: Manual Creation (All Fields)');
  console.log('1. Go to Airtable.com → Create new base');
  console.log('2. Rename table to "Leads"');
  console.log('3. Add these fields with EXACT names:');
  
  const fields = [
    { name: 'Name', type: 'Single line text', required: true },
    { name: 'Phone', type: 'Single line text', required: false },
    { name: 'Website', type: 'Single line text', required: false },
    { name: 'Address', type: 'Single line text', required: false },
    { name: 'City', type: 'Single line text', required: false },
    { name: 'PostalCode', type: 'Single line text', required: false },
    { name: 'State', type: 'Single line text', required: false },
    { name: 'CountryCode', type: 'Single line text', required: false },
    { name: 'CategoryName', type: 'Single line text', required: false },
    { name: 'Neighborhood', type: 'Single line text', required: false },
    { name: 'Street', type: 'Single line text', required: false },
    { name: 'Latitude', type: 'Number', required: false },
    { name: 'Longitude', type: 'Number', required: false },
    { name: 'TotalScore', type: 'Number', required: false },
    { name: 'PlaceId', type: 'Single line text', required: false },
    { name: 'ReviewsCount', type: 'Number', required: false },
    { name: 'ImagesCount', type: 'Number', required: false },
    { name: 'ImageUrl', type: 'Single line text', required: false },
    { name: 'Domain', type: 'Single line text', required: false },
    { name: 'Emails', type: 'Long text', required: false },
    { name: 'LinkedIns', type: 'Long text', required: false },
    { name: 'Twitters', type: 'Long text', required: false },
    { name: 'Instagrams', type: 'Long text', required: false },
    { name: 'Facebooks', type: 'Long text', required: false },
    { name: 'Youtubes', type: 'Long text', required: false },
    { name: 'Tiktoks', type: 'Long text', required: false },
    { name: 'Pinterests', type: 'Long text', required: false },
    { name: 'Discords', type: 'Long text', required: false },
    { name: 'Status', type: 'Single select', required: false, options: ['sourced', 'message_generated', 'contacted', 'replied', 'converted', 'deleted', 'failed', 'bounced'] },
    { name: 'Message', type: 'Long text', required: false }
  ];
  
  fields.forEach(field => {
    const required = field.required ? ' (Required)' : '';
    console.log(`   ${field.name} - ${field.type}${required}`);
    if (field.options) {
      console.log(`     Options: ${field.options.join(', ')}`);
    }
  });
}

function showFieldValidation() {
  console.log('\n🔍 FIELD VALIDATION CHECKLIST\n');
  console.log('✅ Make sure these field names are EXACT (case-sensitive):');
  console.log('   - "Name" (not "Business Name" or "Company")');
  console.log('   - "Phone" (not "Phone Number")');
  console.log('   - "Website" (not "Web Site")');
  console.log('   - "Address" (not "Business Address")');
  console.log('   - "Email" (not "Email Address")');
  console.log('   - "City" (not "City Name")');
  console.log('   - "State" (not "State Name")');
  console.log('   - "Status" (not "Lead Status")');
  console.log('   - "Message" (not "AI Message")');
  
  console.log('\n⚠️  Common mistakes that cause errors:');
  console.log('   - Extra spaces in field names');
  console.log('   - Different capitalization');
  console.log('   - Missing quotes around field names');
  console.log('   - Wrong field types');
}

function main() {
  // console.log('🚀 Helix Mind - Airtable Table Creator\n');
  
  // Check environment
  const env = readEnvFile();
  
  if (Object.keys(env).length === 0) {
    console.log('❌ No environment variables found');
    return;
  }
  
  // Check for required variables
  const token = env.AIRTABLE_PERSONAL_ACCESS_TOKEN;
  const baseId = env.AIRTABLE_BASE_ID;
  
  console.log('📊 Environment Check:');
  console.log(`   ✅ AIRTABLE_PERSONAL_ACCESS_TOKEN: ${token ? 'Found' : 'Missing'}`);
  console.log(`   ✅ AIRTABLE_BASE_ID: ${baseId ? 'Found' : 'Missing'}`);
  
  if (!token || !baseId) {
    console.log('\n❌ Missing required environment variables');
    console.log('Please add them to your .env or .env.local file');
    return;
  }
  
  console.log('\n✅ Environment variables are configured!');
  console.log(`📋 Base ID: ${baseId}`);
  
  // Create CSV template
  console.log('\n📁 Creating CSV import template...');
  const csvPath = createCSVTemplate();
  
  // Show setup instructions
  showQuickSetup();
  showFieldValidation();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Use the CSV template above to create your table');
  console.log('2. Make sure field names match EXACTLY');
  console.log('3. Set Status field to "Single select" with correct options');
  console.log('4. Try scraping again from the dashboard');
  
  console.log('\n💡 TIP: The CSV method is fastest - just import and rename the table to "Leads"');
  console.log(`📁 CSV file location: ${csvPath}`);
}

// Run the table creator
main(); 