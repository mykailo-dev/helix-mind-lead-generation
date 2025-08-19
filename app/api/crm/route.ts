import { NextRequest, NextResponse } from 'next/server';
import { AirtableService } from '@/lib/airtable';
import { Lead, LeadInput } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const airtableService = AirtableService.getInstance();
    let leads: Lead[];

    if (status) {
      leads = await airtableService.getLeadsByStatus(status);
    } else {
      leads = await airtableService.getRecentLeads(limit);
    }

    return NextResponse.json({
      success: true,
      leads,
      total: leads.length,
    });
  } catch (error) {
    console.error('Error in CRM GET API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: Partial<LeadInput> = await request.json();
    const { name, phone, website, address, city, state } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const airtableService = AirtableService.getInstance();
    const leadId = await airtableService.createLead({
      name,
      phone,
      website,
      address,
      city,
      state,
      status: 'sourced',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as LeadInput);

    return NextResponse.json({
      success: true,
      leadId,
      message: 'Lead created successfully',
    });
  } catch (error) {
    console.error('Error in CRM POST API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body: { leadId: string; updates: Partial<Lead> } = await request.json();
    const { leadId, updates } = body;

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    const airtableService = AirtableService.getInstance();
    await airtableService.updateLead(leadId, updates);

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
    });
  } catch (error) {
    console.error('Error in CRM PUT API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('id');

    if (!leadId) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Note: Airtable doesn't support soft deletes by default
    // You might want to update the status to 'deleted' instead
    const airtableService = AirtableService.getInstance();
    await airtableService.updateLead(leadId, { status: 'deleted' });

    return NextResponse.json({
      success: true,
      message: 'Lead marked as deleted',
    });
  } catch (error) {
    console.error('Error in CRM DELETE API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 