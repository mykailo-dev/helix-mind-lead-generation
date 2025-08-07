import { NextRequest, NextResponse } from 'next/server';
import { ScrapeRequest, ScrapeResponse, Lead } from '@/lib/types';
import { AirtableService } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const body: ScrapeRequest = await request.json();
    const { searchQuery, maxResults = 20 } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use SerpAPI to scrape Google Maps
    const leads = await scrapeGoogleMaps(searchQuery, maxResults);
    
    // Store leads in Airtable
    const airtableService = AirtableService.getInstance();
    const storedLeads: Lead[] = [];

    for (const lead of leads) {
      try {
        const leadId = await airtableService.createLead({
          ...lead,
          status: 'sourced',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        storedLeads.push({
          ...lead,
          id: leadId,
          status: 'sourced',
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } catch (error) {
        console.error('Error storing lead:', error);
      }
    }

    const response: ScrapeResponse = {
      leads: storedLeads,
      totalFound: storedLeads.length,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in scrape API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function scrapeGoogleMaps(query: string, maxResults: number): Promise<Lead[]> {
  const serpApiKey = process.env.SERP_API_KEY;
  
  if (!serpApiKey) {
    throw new Error('SERP_API_KEY not configured');
  }

  try {
    // Use SerpAPI to search Google Maps
    const searchUrl = `https://serpapi.com/search.json?engine=google_maps&q=${encodeURIComponent(query)}&api_key=${serpApiKey}&type=search`;
    
    const response = await fetch(searchUrl);
    
    if (!response.ok) {
      throw new Error(`SerpAPI request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();

    if (!data.local_results) {
      return [];
    }

    const leads: Lead[] = [];
    const results = data.local_results.slice(0, maxResults);

    for (const result of results) {
      const lead: Lead = {
        name: result.title || '',
        address: result.address || '',
        phone: result.phone || '',
        website: result.website || '',
        city: extractCity(result.address || ''),
        state: extractState(result.address || ''),
        status: 'sourced',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only add if we have at least a name
      if (lead.name.trim()) {
        leads.push(lead);
      }
    }

    return leads;
  } catch (error) {
    console.error('Error scraping Google Maps:', error);
    throw new Error('Failed to scrape Google Maps');
  }
}

function extractCity(address: string): string {
  const parts = address.split(',').map(part => part.trim());
  if (parts.length >= 2) {
    return parts[parts.length - 2]; // Usually city is second to last
  }
  return '';
}

function extractState(address: string): string {
  const parts = address.split(',').map(part => part.trim());
  if (parts.length >= 1) {
    const lastPart = parts[parts.length - 1];
    // Extract state from last part (e.g., "TX 75001" -> "TX")
    const stateMatch = lastPart.match(/^([A-Z]{2})\s*\d{5}/);
    return stateMatch ? stateMatch[1] : lastPart;
  }
  return '';
} 