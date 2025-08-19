import { NextRequest, NextResponse } from 'next/server';
import { ScrapeRequest, ScrapeResponse, Lead, LeadInput, ApifyGoogleMapsResult } from '@/lib/types';
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

async function scrapeGoogleMaps(query: string, maxResults: number): Promise<LeadInput[]> {
  const apifyToken = process.env.APIFY_TOKEN;
  
  if (!apifyToken) {
    throw new Error('APIFY_TOKEN not configured');
  }

  try {
    // Dynamically import Apify client to avoid SSR issues
    const { ApifyClient } = await import('apify-client');
    
    // Initialize Apify client
    const client = new ApifyClient({
      token: apifyToken,
    });

    // Run the Google Maps scraper with correct input format
    const run = await client.actor('lukaskrivka/google-maps-with-contact-details').call({
      language: "en",
      maxCrawledPlacesPerSearch: maxResults,
      searchStringsArray: [query],
      skipClosedPlaces: false,
      placeMinimumStars: "",
      website: "allPlaces",
      searchMatching: "all"
    });

    // Wait for the run to complete and get results
    const { items } = await client.dataset(run.defaultDatasetId).listItems();
    
    if (!items || items.length === 0) {
      return [];
    }

    const leads: LeadInput[] = [];
    const results = items.slice(0, maxResults).map((item: any) => item as ApifyGoogleMapsResult);

    for (const result of results) {
      const lead: LeadInput = {
        name: result.title || '',
        phone: result.phone || '',
        website: result.website || '',
        address: result.address || '',
        city: result.city || extractCity(result.address || ''),
        postalCode: result.postalCode || '',
        state: result.state || extractState(result.address || ''),
        countryCode: result.countryCode || '',
        categoryName: result.categoryName || '',
        neighborhood: result.neighborhood || '',
        street: result.street || '',
        latitude: result.location?.lat || undefined,
        longitude: result.location?.lng || undefined,
        totalScore: result.totalScore || undefined,
        placeId: result.placeId || '',
        reviewsCount: result.reviewsCount || undefined,
        imagesCount: result.imagesCount || undefined,
        imageUrl: result.imageUrl || '',
        domain: result.domain || '',
        emails: result.emails || [],
        linkedIns: result.linkedIns || [],
        twitters: result.twitters || [],
        instagrams: result.instagrams || [],
        facebooks: result.facebooks || [],
        youtubes: result.youtubes || [],
        tiktoks: result.tiktoks || [],
        pinterests: result.pinterests || [],
        discords: result.discords || [],
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
    console.error('Error scraping Google Maps with Apify:', error);
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