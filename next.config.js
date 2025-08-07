/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    // SerpAPI for Google Maps scraping
    SERP_API_KEY: process.env.SERP_API_KEY,
    
    // Azure OpenAI for AI message generation
    AZURE_OPENAI_KEY: process.env.AZURE_OPENAI_KEY,
    AZURE_OPENAI_DEPLOYMENT: process.env.AZURE_OPENAI_DEPLOYMENT,
    AZURE_OPENAI_ENDPOINT: process.env.AZURE_OPENAI_ENDPOINT,
    
    // Gmail API for email sending
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET,
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN,
    GMAIL_FROM_EMAIL: process.env.GMAIL_FROM_EMAIL,
    GMAIL_FROM_NAME: process.env.GMAIL_FROM_NAME,
    
    // Airtable for CRM/lead tracking
    AIRTABLE_PERSONAL_ACCESS_TOKEN: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
    AIRTABLE_BASE_ID: process.env.AIRTABLE_BASE_ID,
    
    // Rate limiting
    DAILY_EMAIL_LIMIT: process.env.DAILY_EMAIL_LIMIT,
    HOURLY_EMAIL_LIMIT: process.env.HOURLY_EMAIL_LIMIT,
  },
}

module.exports = nextConfig 