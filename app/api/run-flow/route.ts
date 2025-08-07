import { NextRequest, NextResponse } from 'next/server';
import { RunFlowRequest, RunFlowResponse } from '@/lib/types';
import { AirtableService } from '@/lib/airtable';
import { AIService } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body: RunFlowRequest = await request.json();
    const { 
      searchQuery, 
      aiPromptTemplate, 
      dailyEmailLimit = 50,
      campaignName = 'Auto Campaign'
    } = body;

    if (!searchQuery) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }

    const errors: string[] = [];
    let leadsFound = 0;
    let messagesGenerated = 0;
    let emailsSent = 0;

    // Step 1: Scrape leads
    console.log('Step 1: Scraping leads for query:', searchQuery);
    try {
      const scrapeResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchQuery, maxResults: dailyEmailLimit }),
      });

      const scrapeResult = await scrapeResponse.json();
      
      if (scrapeResult.success) {
        leadsFound = scrapeResult.totalFound;
        console.log(`Found ${leadsFound} leads`);
      } else {
        errors.push(`Scraping failed: ${scrapeResult.error}`);
      }
    } catch (error) {
      errors.push(`Scraping error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Step 2: Generate messages for leads
    if (leadsFound > 0) {
      console.log('Step 2: Generating personalized messages');
      try {
        const airtableService = AirtableService.getInstance();
        const leads = await airtableService.getLeadsByStatus('sourced');
        
        const aiService = AIService.getInstance();
        const messageResults = await aiService.generateMultipleMessages(leads, aiPromptTemplate);
        
        messagesGenerated = Object.keys(messageResults).length;
        console.log(`Generated ${messagesGenerated} messages`);

        // Update leads with generated messages
        for (const [leadId, message] of Object.entries(messageResults)) {
          await airtableService.updateLead(leadId, {
            message,
            status: 'message_generated',
          });
        }
      } catch (error) {
        errors.push(`Message generation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    // Step 3: Send emails
    if (messagesGenerated > 0) {
      console.log('Step 3: Sending emails');
      try {
        const airtableService = AirtableService.getInstance();
        const leadsWithMessages = await airtableService.getLeadsByStatus('message_generated');
        
        // Limit emails based on daily limit
        const leadsToEmail = leadsWithMessages.slice(0, dailyEmailLimit);
        const leadIds = leadsToEmail.map(lead => lead.id!).filter(Boolean);

        if (leadIds.length > 0) {
          const emailResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-email`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ leadIds }),
          });

          const emailResult = await emailResponse.json();
          
          if (emailResult.success) {
            emailsSent = emailResult.totalSent;
            console.log(`Sent ${emailsSent} emails`);
          } else {
            errors.push(`Email sending failed: ${emailResult.error}`);
          }
        }
      } catch (error) {
        errors.push(`Email sending error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const response: RunFlowResponse = {
      success: errors.length === 0,
      leadsFound,
      messagesGenerated,
      emailsSent,
      errors,
    };

    console.log('Flow completed:', response);
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in run-flow API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        leadsFound: 0,
        messagesGenerated: 0,
        emailsSent: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const airtableService = AirtableService.getInstance();
    
    // Get statistics
    const allLeads = await airtableService.getLeads();
    const sourcedLeads = await airtableService.getLeadsByStatus('sourced');
    const messageGeneratedLeads = await airtableService.getLeadsByStatus('message_generated');
    const contactedLeads = await airtableService.getLeadsByStatus('contacted');
    const repliedLeads = await airtableService.getLeadsByStatus('replied');

    return NextResponse.json({
      success: true,
      stats: {
        total: allLeads.length,
        sourced: sourcedLeads.length,
        messageGenerated: messageGeneratedLeads.length,
        contacted: contactedLeads.length,
        replied: repliedLeads.length,
      },
    });
  } catch (error) {
    console.error('Error in run-flow GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 