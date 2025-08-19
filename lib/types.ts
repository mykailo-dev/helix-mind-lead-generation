export interface Lead {
  id: string;
  name: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  countryCode?: string;
  categoryName?: string;
  neighborhood?: string;
  street?: string;
  claimThisBusiness?: boolean;
  latitude?: number;
  longitude?: number;
  totalScore?: number;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
  placeId?: string;
  reviewsCount?: number;
  imagesCount?: number;
  scrapedAt?: Date;
  rank?: number;
  isAdvertisement?: boolean;
  imageUrl?: string;
  domain?: string;
  emails?: string[];
  linkedIns?: string[];
  twitters?: string[];
  instagrams?: string[];
  facebooks?: string[];
  youtubes?: string[];
  tiktoks?: string[];
  pinterests?: string[];
  discords?: string[];
  status: 'sourced' | 'message_generated' | 'contacted' | 'replied' | 'converted' | 'deleted' | 'failed' | 'bounced';
  message?: string;
  sentAt?: Date;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface LeadInput {
  name: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  state?: string;
  countryCode?: string;
  categoryName?: string;
  neighborhood?: string;
  street?: string;
  claimThisBusiness?: boolean;
  latitude?: number;
  longitude?: number;
  totalScore?: number;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
  placeId?: string;
  reviewsCount?: number;
  imagesCount?: number;
  scrapedAt?: Date;
  rank?: number;
  isAdvertisement?: boolean;
  imageUrl?: string;
  domain?: string;
  emails?: string[];
  linkedIns?: string[];
  twitters?: string[];
  instagrams?: string[];
  facebooks?: string[];
  youtubes?: string[];
  tiktoks?: string[];
  pinterests?: string[];
  discords?: string[];
  status: 'sourced' | 'message_generated' | 'contacted' | 'replied' | 'converted' | 'deleted' | 'failed' | 'bounced';
  message?: string;
  sentAt?: Date;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Apify Google Maps scraper response types
export interface ApifyGoogleMapsResult {
  title: string;
  address: string;
  phone?: string;
  phoneUnformatted?: string;
  website?: string;
  emails?: string[];
  city?: string;
  state?: string;
  postalCode?: string;
  countryCode?: string;
  categoryName?: string;
  neighborhood?: string;
  street?: string;
  claimThisBusiness?: boolean;
  location?: {
    lat: number;
    lng: number;
  };
  totalScore?: number;
  permanentlyClosed?: boolean;
  temporarilyClosed?: boolean;
  placeId?: string;
  reviewsCount?: number;
  imagesCount?: number;
  scrapedAt?: string;
  rank?: number;
  isAdvertisement?: boolean;
  imageUrl?: string;
  domain?: string;
  linkedIns?: string[];
  twitters?: string[];
  instagrams?: string[];
  facebooks?: string[];
  youtubes?: string[];
  tiktoks?: string[];
  pinterests?: string[];
  discords?: string[];
}

export interface ApifyRunResponse {
  id: string;
  status: string;
  results?: ApifyGoogleMapsResult[];
}

export interface Campaign {
  id?: string;
  name: string;
  searchQuery: string;
  aiPromptTemplate: string;
  dailyEmailLimit: number;
  status: 'active' | 'paused' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ScrapeRequest {
  searchQuery: string;
  maxResults?: number;
}

export interface ScrapeResponse {
  leads: Lead[];
  totalFound: number;
  success: boolean;
  error?: string;
}

export interface GenerateMessageRequest {
  lead: Lead;
  promptTemplate?: string;
}

export interface GenerateMessageResponse {
  message: string;
  success: boolean;
  error?: string;
}

export interface BulkGenerateMessageResponse {
  success: boolean;
  results: { [leadId: string]: string };
  messagesGenerated: number;
  leads: Lead[];
  error?: string;
}

export interface SendEmailRequest {
  lead: Lead;
  message: string;
  subject?: string;
}

export interface SendEmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface RunFlowRequest {
  searchQuery: string;
  aiPromptTemplate?: string;
  dailyEmailLimit?: number;
  campaignName?: string;
}

export interface RunFlowResponse {
  success: boolean;
  leadsFound: number;
  messagesGenerated: number;
  emailsSent: number;
  errors: string[];
}

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
  createdTime: string;
}

export interface EmailConfig {
  provider: 'gmail' | 'outlook';
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  fromEmail: string;
  fromName: string;
} 