import Airtable from 'airtable';
import { Lead, AirtableRecord } from './types';

const airtable = new Airtable({
  apiKey: process.env.AIRTABLE_PERSONAL_ACCESS_TOKEN,
});

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

export class AirtableService {
  private static instance: AirtableService;
  private leadsTable = base('Leads');
  private campaignsTable = base('Campaigns');

  static getInstance(): AirtableService {
    if (!AirtableService.instance) {
      AirtableService.instance = new AirtableService();
    }
    return AirtableService.instance;
  }

  async createLead(lead: Lead): Promise<string> {
    try {
      const record = await this.leadsTable.create([
        {
          fields: {
            'Name': lead.name,
            'Phone': lead.phone || '',
            'Website': lead.website || '',
            'Address': lead.address || '',
            'Email': lead.email || '',
            'City': lead.city || '',
            'State': lead.state || '',
            'Status': lead.status,
            'Message': lead.message || '',
            'Sent At': lead.sentAt ? lead.sentAt.toISOString() : '',
            'Replied At': lead.repliedAt ? lead.repliedAt.toISOString() : '',
            'Created At': new Date().toISOString(),
            'Updated At': new Date().toISOString(),
          },
        },
      ]);

      return record[0].id;
    } catch (error) {
      console.error('Error creating lead in Airtable:', error);
      throw new Error('Failed to create lead in Airtable');
    }
  }

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<void> {
    try {
      const fields: Record<string, any> = {
        'Updated At': new Date().toISOString(),
      };

      if (updates.status) fields['Status'] = updates.status;
      if (updates.message) fields['Message'] = updates.message;
      if (updates.sentAt) fields['Sent At'] = updates.sentAt.toISOString();
      if (updates.repliedAt) fields['Replied At'] = updates.repliedAt.toISOString();

      await this.leadsTable.update([
        {
          id: leadId,
          fields,
        },
      ]);
    } catch (error) {
      console.error('Error updating lead in Airtable:', error);
      throw new Error('Failed to update lead in Airtable');
    }
  }

  async getLeads(status?: string): Promise<Lead[]> {
    try {
      const filter = status ? `{Status} = '${status}'` : '';
      const records = await this.leadsTable.select({
        filterByFormula: filter,
        sort: [{ field: 'Created At', direction: 'desc' }],
      }).all();

      return records.map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        phone: record.get('Phone') as string,
        website: record.get('Website') as string,
        address: record.get('Address') as string,
        email: record.get('Email') as string,
        city: record.get('City') as string,
        state: record.get('State') as string,
        status: record.get('Status') as string,
        message: record.get('Message') as string,
        sentAt: record.get('Sent At') ? new Date(record.get('Sent At') as string) : undefined,
        repliedAt: record.get('Replied At') ? new Date(record.get('Replied At') as string) : undefined,
        createdAt: new Date(record.get('Created At') as string),
        updatedAt: new Date(record.get('Updated At') as string),
      }));
    } catch (error) {
      console.error('Error fetching leads from Airtable:', error);
      throw new Error('Failed to fetch leads from Airtable');
    }
  }

  async getLeadById(leadId: string): Promise<Lead | null> {
    try {
      const record = await this.leadsTable.find(leadId);
      
      return {
        id: record.id,
        name: record.get('Name') as string,
        phone: record.get('Phone') as string,
        website: record.get('Website') as string,
        address: record.get('Address') as string,
        email: record.get('Email') as string,
        city: record.get('City') as string,
        state: record.get('State') as string,
        status: record.get('Status') as string,
        message: record.get('Message') as string,
        sentAt: record.get('Sent At') ? new Date(record.get('Sent At') as string) : undefined,
        repliedAt: record.get('Replied At') ? new Date(record.get('Replied At') as string) : undefined,
        createdAt: new Date(record.get('Created At') as string),
        updatedAt: new Date(record.get('Updated At') as string),
      };
    } catch (error) {
      console.error('Error fetching lead from Airtable:', error);
      return null;
    }
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return this.getLeads(status);
  }

  async getRecentLeads(limit: number = 50): Promise<Lead[]> {
    try {
      const records = await this.leadsTable.select({
        maxRecords: limit,
        sort: [{ field: 'Created At', direction: 'desc' }],
      }).all();

      return records.map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        phone: record.get('Phone') as string,
        website: record.get('Website') as string,
        address: record.get('Address') as string,
        email: record.get('Email') as string,
        city: record.get('City') as string,
        state: record.get('State') as string,
        status: record.get('Status') as string,
        message: record.get('Message') as string,
        sentAt: record.get('Sent At') ? new Date(record.get('Sent At') as string) : undefined,
        repliedAt: record.get('Replied At') ? new Date(record.get('Replied At') as string) : undefined,
        createdAt: new Date(record.get('Created At') as string),
        updatedAt: new Date(record.get('Updated At') as string),
      }));
    } catch (error) {
      console.error('Error fetching recent leads from Airtable:', error);
      throw new Error('Failed to fetch recent leads from Airtable');
    }
  }
} 