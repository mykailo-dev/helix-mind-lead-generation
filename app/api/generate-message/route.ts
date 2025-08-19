import { NextRequest, NextResponse } from 'next/server';
import { GenerateMessageRequest, GenerateMessageResponse } from '@/lib/types';
import { AIService } from '@/lib/ai';
import { AirtableService } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateMessageRequest = await request.json();
    const { lead, promptTemplate } = body;

    if (!lead || !lead.id) {
      return NextResponse.json(
        { success: false, error: 'Lead with ID is required' },
        { status: 400 }
      );
    }

    const aiService = AIService.getInstance();
    const result = await aiService.generatePersonalizedMessage({
      lead,
      promptTemplate,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to generate message' },
        { status: 500 }
      );
    }

    // Validate the generated message
    const validation = await aiService.validateMessage(result.message);
    if (!validation.isValid) {
      console.warn('Generated message has issues:', validation.issues);
    }

    // Update the lead in Airtable with the generated message
    const airtableService = AirtableService.getInstance();
    await airtableService.updateLead(lead.id, {
      message: result.message,
      status: 'message_generated',
    });

    const response: GenerateMessageResponse = {
      message: result.message,
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in generate-message API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: { leadIds?: string[]; leads?: any[]; promptTemplate?: string } = await request.json();
    const { leadIds, leads, promptTemplate } = body;

    // Handle both formats: leadIds array or leads array
    let targetLeads: any[] = [];
    
    if (leads && leads.length > 0) {
      // Dashboard sends leads array
      targetLeads = leads;
    } else if (leadIds && leadIds.length > 0) {
      // API expects leadIds array
      const airtableService = AirtableService.getInstance();
      const allLeads = await airtableService.getLeads();
      targetLeads = allLeads.filter(lead => lead.id && leadIds.includes(lead.id));
    } else {
      return NextResponse.json(
        { success: false, error: 'Either leadIds or leads array is required' },
        { status: 400 }
      );
    }

    const airtableService = AirtableService.getInstance();
    const aiService = AIService.getInstance();
    const results: { [leadId: string]: string } = {};

    // Generate messages for all leads
    for (const lead of targetLeads) {
      try {
        const result = await aiService.generatePersonalizedMessage({
          lead,
          promptTemplate,
        });

        if (result.success && lead.id) {
          results[lead.id] = result.message;
          
          // Update the lead in Airtable
          await airtableService.updateLead(lead.id, {
            message: result.message,
            status: 'message_generated',
          });
        }
      } catch (error) {
        console.error(`Error generating message for lead ${lead.id}:`, error);
      }
    }

    const successfulGenerations = Object.values(results).filter(message => message).length;

    // Return updated leads for dashboard refresh
    const updatedLeads = targetLeads.map(lead => ({
      ...lead,
      message: results[lead.id] || lead.message,
      status: results[lead.id] ? 'message_generated' : lead.status
    }));

    return NextResponse.json({
      success: true,
      results,
      messagesGenerated: successfulGenerations,
      leads: updatedLeads
    });
  } catch (error) {
    console.error('Error in bulk generate-message API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 