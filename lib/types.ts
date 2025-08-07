export interface Lead {
  id?: string;
  name: string;
  phone?: string;
  website?: string;
  address?: string;
  email?: string;
  city?: string;
  state?: string;
  status: 'sourced' | 'message_generated' | 'contacted' | 'replied' | 'converted';
  message?: string;
  sentAt?: Date;
  repliedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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