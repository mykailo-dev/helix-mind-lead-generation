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
    const body: { leadIds: string[]; promptTemplate?: string } = await request.json();
    const { leadIds, promptTemplate } = body;

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead IDs are required' },
        { status: 400 }
      );
    }

    const airtableService = AirtableService.getInstance();
    const aiService = AIService.getInstance();
    const results: { [leadId: string]: string } = {};

    // Get all leads from Airtable
    const leads = await airtableService.getLeads();
    const targetLeads = leads.filter(lead => lead.id && leadIds.includes(lead.id));

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

    return NextResponse.json({
      success: true,
      messages: results,
      totalGenerated: Object.keys(results).length,
    });
  } catch (error) {
    console.error('Error in bulk generate-message API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 