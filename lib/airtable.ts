import Airtable from 'airtable';
import { Lead, LeadInput, AirtableRecord } from './types';

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

  async createLead(lead: LeadInput): Promise<string> {
    try {
      const record = await this.leadsTable.create([
        {
          fields: {
            'Name': lead.name,
            'Phone': lead.phone || '',
            'Website': lead.website || '',
            'Address': lead.address || '',
            'City': lead.city || '',
            'PostalCode': lead.postalCode ? String(lead.postalCode) : '',
            'State': lead.state || '',
            'CountryCode': lead.countryCode || '',
            'CategoryName': lead.categoryName || '',
            'Neighborhood': lead.neighborhood || '',
            'Street': lead.street || '',
            'Latitude': lead.latitude || undefined,
            'Longitude': lead.longitude || undefined,
            'TotalScore': lead.totalScore || undefined,
            'PlaceId': lead.placeId || '',
            'ReviewsCount': lead.reviewsCount || undefined,
            'ImagesCount': lead.imagesCount || undefined,
            'ImageUrl': lead.imageUrl || '',
            'Domain': lead.domain || '',
            'Emails': lead.emails ? lead.emails.join(', ') : '',
            'LinkedIns': lead.linkedIns ? lead.linkedIns.join(', ') : '',
            'Twitters': lead.twitters ? lead.twitters.join(', ') : '',
            'Instagrams': lead.instagrams ? lead.instagrams.join(', ') : '',
            'Facebooks': lead.facebooks ? lead.facebooks.join(', ') : '',
            'Youtubes': lead.youtubes ? lead.youtubes.join(', ') : '',
            'Tiktoks': lead.tiktoks ? lead.tiktoks.join(', ') : '',
            'Pinterests': lead.pinterests ? lead.pinterests.join(', ') : '',
            'Discords': lead.discords ? lead.discords.join(', ') : '',
            'Status': lead.status,
            'Message': lead.message || '',
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
      const fields: Record<string, any> = {};

      if (updates.status) fields['Status'] = updates.status;
      if (typeof updates.message !== 'undefined') fields['Message'] = updates.message;

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
      const records = await this.leadsTable
        .select({
          filterByFormula: filter,
        })
        .all();

      return records.map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        phone: record.get('Phone') as string,
        website: record.get('Website') as string,
        address: record.get('Address') as string,
        city: record.get('City') as string,
        postalCode: record.get('PostalCode') as string,
        state: record.get('State') as string,
        countryCode: record.get('CountryCode') as string,
        categoryName: record.get('CategoryName') as string,
        neighborhood: record.get('Neighborhood') as string,
        street: record.get('Street') as string,
        latitude: record.get('Latitude') as number,
        longitude: record.get('Longitude') as number,
        totalScore: record.get('TotalScore') as number,
        placeId: record.get('PlaceId') as string,
        reviewsCount: record.get('ReviewsCount') as number,
        imagesCount: record.get('ImagesCount') as number,
        imageUrl: record.get('ImageUrl') as string,
        domain: record.get('Domain') as string,
        emails: record.get('Emails') ? (record.get('Emails') as string).split(', ').filter(e => e) : [],
        linkedIns: record.get('LinkedIns') ? (record.get('LinkedIns') as string).split(', ').filter(e => e) : [],
        twitters: record.get('Twitters') ? (record.get('Twitters') as string).split(', ').filter(e => e) : [],
        instagrams: record.get('Instagrams') ? (record.get('Instagrams') as string).split(', ').filter(e => e) : [],
        facebooks: record.get('Facebooks') ? (record.get('Facebooks') as string).split(', ').filter(e => e) : [],
        youtubes: record.get('Youtubes') ? (record.get('Youtubes') as string).split(', ').filter(e => e) : [],
        tiktoks: record.get('Tiktoks') ? (record.get('Tiktoks') as string).split(', ').filter(e => e) : [],
        pinterests: record.get('Pinterests') ? (record.get('Pinterests') as string).split(', ').filter(e => e) : [],
        discords: record.get('Discords') ? (record.get('Discords') as string).split(', ').filter(e => e) : [],
        status: record.get('Status') as Lead['status'],
        message: record.get('Message') as string,
        sentAt: undefined,
        repliedAt: undefined,
        createdAt: (record as any)._rawJson?.createdTime
          ? new Date((record as any)._rawJson.createdTime)
          : new Date(),
        updatedAt: (record as any)._rawJson?.createdTime
          ? new Date((record as any)._rawJson.createdTime)
          : new Date(),
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
        city: record.get('City') as string,
        postalCode: record.get('PostalCode') as string,
        state: record.get('State') as string,
        countryCode: record.get('CountryCode') as string,
        categoryName: record.get('CategoryName') as string,
        neighborhood: record.get('Neighborhood') as string,
        street: record.get('Street') as string,
        latitude: record.get('Latitude') as number,
        longitude: record.get('Longitude') as number,
        totalScore: record.get('TotalScore') as number,
        placeId: record.get('PlaceId') as string,
        reviewsCount: record.get('ReviewsCount') as number,
        imagesCount: record.get('ImagesCount') as number,
        imageUrl: record.get('ImageUrl') as string,
        domain: record.get('Domain') as string,
        emails: record.get('Emails') ? (record.get('Emails') as string).split(', ').filter(e => e) : [],
        linkedIns: record.get('LinkedIns') ? (record.get('LinkedIns') as string).split(', ').filter(e => e) : [],
        twitters: record.get('Twitters') ? (record.get('Twitters') as string).split(', ').filter(e => e) : [],
        instagrams: record.get('Instagrams') ? (record.get('Instagrams') as string).split(', ').filter(e => e) : [],
        facebooks: record.get('Facebooks') ? (record.get('Facebooks') as string).split(', ').filter(e => e) : [],
        youtubes: record.get('Youtubes') ? (record.get('Youtubes') as string).split(', ').filter(e => e) : [],
        tiktoks: record.get('Tiktoks') ? (record.get('Tiktoks') as string).split(', ').filter(e => e) : [],
        pinterests: record.get('Pinterests') ? (record.get('Pinterests') as string).split(', ').filter(e => e) : [],
        discords: record.get('Discords') ? (record.get('Discords') as string).split(', ').filter(e => e) : [],
        status: record.get('Status') as Lead['status'],
        message: record.get('Message') as string,
        sentAt: undefined,
        repliedAt: undefined,
        createdAt: (record as any)._rawJson?.createdTime
          ? new Date((record as any)._rawJson.createdTime)
          : new Date(),
        updatedAt: (record as any)._rawJson.createdTime
          ? new Date((record as any)._rawJson.createdTime)
          : new Date(),
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
      const records = await this.leadsTable
        .select({
          maxRecords: limit,
        })
        .all();

      return records.map(record => ({
        id: record.id,
        name: record.get('Name') as string,
        phone: record.get('Phone') as string,
        website: record.get('Website') as string,
        address: record.get('Address') as string,
        city: record.get('City') as string,
        postalCode: record.get('PostalCode') as string,
        state: record.get('State') as string,
        countryCode: record.get('CountryCode') as string,
        categoryName: record.get('CategoryName') as string,
        neighborhood: record.get('Neighborhood') as string,
        street: record.get('Street') as string,
        latitude: record.get('Latitude') as number,
        longitude: record.get('Longitude') as number,
        totalScore: record.get('TotalScore') as number,
        placeId: record.get('PlaceId') as string,
        reviewsCount: record.get('ReviewsCount') as number,
        imagesCount: record.get('ImagesCount') as number,
        imageUrl: record.get('ImageUrl') as string,
        domain: record.get('Domain') as string,
        emails: record.get('Emails') ? (record.get('Emails') as string).split(', ').filter(e => e) : [],
        linkedIns: record.get('LinkedIns') ? (record.get('LinkedIns') as string).split(', ').filter(e => e) : [],
        twitters: record.get('Twitters') ? (record.get('Twitters') as string).split(', ').filter(e => e) : [],
        instagrams: record.get('Instagrams') ? (record.get('Instagrams') as string).split(', ').filter(e => e) : [],
        facebooks: record.get('Facebooks') ? (record.get('Facebooks') as string).split(', ').filter(e => e) : [],
        youtubes: record.get('Youtubes') ? (record.get('Youtubes') as string).split(', ').filter(e => e) : [],
        tiktoks: record.get('Tiktoks') ? (record.get('Tiktoks') as string).split(', ').filter(e => e) : [],
        pinterests: record.get('Pinterests') ? (record.get('Pinterests') as string).split(', ').filter(e => e) : [],
        discords: record.get('Discords') ? (record.get('Discords') as string).split(', ').filter(e => e) : [],
        status: record.get('Status') as Lead['status'],
        message: record.get('Message') as string,
        sentAt: undefined,
        repliedAt: undefined,
        createdAt: (record as any)._rawJson?.createdTime
          ? new Date((record as any)._rawJson.createdTime)
          : new Date(),
        updatedAt: (record as any)._rawJson.createdTime
          ? new Date((record as any)._rawJson.createdTime)
          : new Date(),
      }));
    } catch (error) {
      console.error('Error fetching recent leads from Airtable:', error);
      throw new Error('Failed to fetch recent leads from Airtable');
    }
  }
} 