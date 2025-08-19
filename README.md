# AI-Powered Lead Generation System

A complete Next.js application that automates lead generation, AI-powered personalization, and email outreach using Azure OpenAI, Gmail API, and Airtable.

## 🚀 Features

- **Automated Lead Sourcing**: Scrape leads from Google Maps using Apify
- **AI Personalization**: Generate personalized outreach messages using Azure OpenAI
- **Email Automation**: Send emails via Gmail API with rate limiting
- **CRM Integration**: Track all leads and responses in Airtable
- **Admin Dashboard**: Manage campaigns and monitor performance
- **Modular Architecture**: Easy to extend and customize

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **AI**: Azure OpenAI Service (GPT-3.5/4)
- **Email**: Gmail API with OAuth2
- **Database**: Airtable for CRM
- **Scraping**: Apify for Google Maps data
- **Icons**: Lucide React

## 📋 Prerequisites

Before setting up this project, you'll need:

1. **Azure OpenAI Service** - For AI message generation
2. **Gmail API** - For sending emails
3. **Airtable Account** - For CRM functionality
4. **Apify Account** - For Google Maps scraping
5. **Node.js 18+** - For running the application

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd ai-lead-generation-system
npm install
```

### 2. Environment Setup

Copy the example environment file and configure your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your actual API keys:

```env
# API Keys
APIFY_TOKEN=your_apify_token
AZURE_OPENAI_KEY=your_azure_key
AZURE_OPENAI_DEPLOYMENT=leadgen-gpt35
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Email Configuration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_FROM_EMAIL=your-email@gmail.com
GMAIL_FROM_NAME=Your Name

# Airtable Configuration
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id

# Rate Limiting
DAILY_EMAIL_LIMIT=50
HOURLY_EMAIL_LIMIT=10
```

### 3. Apify Setup

1. Go to [Apify](https://apify.com/) and create an account
2. Navigate to your account settings
3. Go to "Integrations" → "API tokens"
4. Create a new API token
5. Copy the token and add it to your `.env.local` file

### 4. Airtable Setup

1. **Create a new base** in your Airtable account
2. **Create a table called "Leads"** with the following fields:
   - **Name** (Single line text) - Required
   - **Phone** (Single line text)
   - **Website** (Single line text)
   - **Address** (Single line text)
   - **Email** (Single line text)
   - **City** (Single line text)
   - **State** (Single line text)
   - **Status** (Single select) - Options: `sourced`, `message_generated`, `contacted`, `replied`, `converted`, `deleted`, `failed`, `bounced`
   - **Message** (Long text)

3. **Get your Base ID**:
   - Open your base in Airtable
   - Go to Help → API Documentation
   - Copy the "Base ID" (starts with `app...`)

4. **Get your Personal Access Token**:
   - Go to your [Airtable account](https://airtable.com/account)
   - Navigate to "Personal access tokens"
   - Create a new token with the name "HelixSwarmAirtableToken"
   - Copy the token (starts with `pat...`)

### 5. Gmail API Setup

1. **Create a Google Cloud Project**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable the Gmail API

2. **Create OAuth 2.0 credentials**:
   - Go to APIs & Services → Credentials
   - Create OAuth 2.0 Client ID
   - Set application type to "Desktop application"
   - Download the credentials JSON file

3. **Get refresh token**:
   - Use the [Gmail API OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
   - Set OAuth 2.0 configuration
   - Authorize and get refresh token

### 6. Environment Variables

Create a `.env.local` file in your project root with:

```env
# API Keys
APIFY_TOKEN=your_apify_token
AZURE_OPENAI_KEY=your_azure_key
AZURE_OPENAI_DEPLOYMENT=leadgen-gpt35
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/

# Email Configuration
GMAIL_CLIENT_ID=your_gmail_client_id
GMAIL_CLIENT_SECRET=your_gmail_client_secret
GMAIL_REFRESH_TOKEN=your_gmail_refresh_token
GMAIL_FROM_EMAIL=your-email@gmail.com
GMAIL_FROM_NAME=Your Name

# Airtable Configuration
AIRTABLE_PERSONAL_ACCESS_TOKEN=your_airtable_personal_access_token
AIRTABLE_BASE_ID=your_airtable_base_id

# Rate Limiting
DAILY_EMAIL_LIMIT=50
HOURLY_EMAIL_LIMIT=10
```

### 7. Azure OpenAI Setup

1. Create an Azure OpenAI resource in Azure Portal
2. Deploy a GPT model (gpt-35-turbo or gpt-4)
3. Get your API key and endpoint URL
4. Note your deployment name

### 8. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access the application.

## 📁 Project Structure

```
/app
├── /api                    # API routes
│   ├── /scrape            # Lead scraping endpoint
│   ├── /generate-message  # AI message generation
│   ├── /send-email        # Email sending
│   ├── /crm               # CRM operations
│   └── /run-flow          # End-to-end pipeline
├── /dashboard             # Admin dashboard
├── /lib                   # Utility functions
│   ├── types.ts           # TypeScript types
│   ├── airtable.ts        # Airtable integration
│   └── ai.ts              # Azure OpenAI integration
└── globals.css            # Global styles
```

## 🔧 API Endpoints

### `/api/scrape`
- **POST**: Scrape leads from Google Maps
- **Body**: `{ searchQuery: string, maxResults?: number }`

### `/api/generate-message`
- **POST**: Generate personalized message for a lead
- **PUT**: Generate messages for multiple leads
- **Body**: `{ lead: Lead, promptTemplate?: string }`

### `/api/send-email`
- **POST**: Send email to a single lead
- **PUT**: Send emails to multiple leads
- **Body**: `{ lead: Lead, message: string, subject?: string }`

### `/api/crm`
- **GET**: Fetch leads with optional status filter
- **POST**: Create new lead
- **PUT**: Update lead
- **DELETE**: Mark lead as deleted

### `/api/run-flow`
- **POST**: Run complete lead generation pipeline
- **GET**: Get campaign statistics
- **Body**: `{ searchQuery: string, aiPromptTemplate?: string, dailyEmailLimit?: number }`

## 🎯 Usage

### 1. Access the Dashboard

Navigate to `/dashboard` to access the admin interface.

### 2. Run a Campaign

1. Enter a search query (e.g., "plumbers in austin tx")
2. Optionally customize the AI prompt template
3. Set daily email limits
4. Click "Run Campaign"

### 3. Monitor Progress

The dashboard shows:
- Real-time statistics
- Recent leads table
- Campaign status

### 4. Track Results

All leads and their status are stored in Airtable for easy tracking and follow-up.

## 🔒 Security Considerations

- Store API keys securely in environment variables
- Implement proper rate limiting for email sending
- Use OAuth2 for Gmail API authentication
- Validate all user inputs
- Implement proper error handling

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Customization

### Adding New Lead Sources

1. Create a new scraping function in `/app/api/scrape/route.ts`
2. Add the source to the scraping logic
3. Update the data processing to match your new source

### Customizing AI Prompts

1. Modify the default prompt in `/lib/ai.ts`
2. Add new placeholder variables as needed
3. Update the placeholder replacement logic

### Adding Email Providers

1. Create a new email service class
2. Implement the email sending interface
3. Update the email sending logic in `/app/api/send-email/route.ts`

## 📊 Monitoring and Analytics

- All API calls are logged for debugging
- Airtable provides built-in analytics
- Consider adding Google Analytics for user behavior tracking
- Implement error tracking with Sentry or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔄 Updates and Maintenance

- Regularly update dependencies
- Monitor API rate limits
- Review and update AI prompts
- Backup Airtable data regularly
- Monitor email deliverability rates 