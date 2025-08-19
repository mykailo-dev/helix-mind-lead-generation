import Link from 'next/link'
import { ArrowRight, Users, Mail, Brain, BarChart3 } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            AI-Powered Lead Generation System - Verdant AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Automate your lead generation process with AI-powered scraping, 
            personalized messaging, and automated outreach.
          </p>
          <Link 
            href="/dashboard" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Lead Sourcing</h3>
            <p className="text-gray-600">
              Automatically scrape leads from Google Maps
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Brain className="h-12 w-12 text-green-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">AI Personalization</h3>
            <p className="text-gray-600">
              Generate personalized outreach messages using Azure OpenAI
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <Mail className="h-12 w-12 text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Automated Outreach</h3>
            <p className="text-gray-600">
              Send personalized emails via Gmail or Outlook APIs
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <BarChart3 className="h-12 w-12 text-orange-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">CRM Integration</h3>
            <p className="text-gray-600">
              Track all leads and responses in Airtable
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Search & Scrape</h3>
              <p className="text-gray-600">
                Enter your search query and let our system find relevant businesses
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Personalization</h3>
              <p className="text-gray-600">
                Generate unique, personalized messages for each lead
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Automated Outreach</h3>
              <p className="text-gray-600">
                Send emails automatically and track responses
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 