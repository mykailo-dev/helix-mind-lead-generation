import OpenAI from 'openai';
import { Lead, GenerateMessageRequest, GenerateMessageResponse } from './types';

// Construct the base endpoint URL (without chat/completions)
const getAzureOpenAIBaseEndpoint = () => {
  const baseEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'nucleus-gpt-35';
  
  // If endpoint already includes deployment path, extract the base
  if (baseEndpoint && baseEndpoint.includes('/deployments/')) {
    // Extract everything up to /deployments/{deployment}
    const match = baseEndpoint.match(/^(.*\/deployments\/[^\/]+)/);
    if (match) {
      return match[1];
    }
  }
  
  // Otherwise, construct the base endpoint
  if (baseEndpoint) {
    const cleanBase = baseEndpoint.replace(/\/$/, '');
    return `${cleanBase}/openai/deployments/${deployment}`;
  }
  
  // Fallback to default construction
  return `https://openai-nucleus.openai.azure.com/openai/deployments/${deployment}`;
};

const openai = new OpenAI({
  apiKey: process.env.AZURE_OPENAI_KEY,
  baseURL: getAzureOpenAIBaseEndpoint(),
  defaultQuery: { 'api-version': '2024-02-15-preview' },
  defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_KEY },
});

export class AIService {
  private static instance: AIService;
  private deploymentName: string;

  constructor() {
    // Use the deployment name from environment, defaulting to the user's working deployment
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT || 'nucleus-gpt-35';
  }

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  async generatePersonalizedMessage(
    request: GenerateMessageRequest
  ): Promise<GenerateMessageResponse> {
    try {
      const { lead, promptTemplate } = request;
      
      const defaultPrompt = `Write a friendly and brief cold outreach email to a company named {{BusinessName}} located in {{City}}. The email should introduce a lead generation tool for service businesses and suggest a quick call. Keep it under 150 words and make it personal and professional.`;

      const finalPrompt = promptTemplate || defaultPrompt;
      
      const personalizedPrompt = this.replacePlaceholders(finalPrompt, lead);

      // console.log('🔍 Azure OpenAI Request:', {
      //   deployment: this.deploymentName,
      //   baseEndpoint: getAzureOpenAIBaseEndpoint(),
      //   fullEndpoint: `${getAzureOpenAIBaseEndpoint()}/chat/completions`,
      //   apiVersion: '2024-02-15-preview'
      // });

      const completion = await openai.chat.completions.create({
        model: this.deploymentName,
        messages: [
          {
            role: 'system',
            content: 'You are a professional business development specialist. Write compelling, personalized cold outreach emails that are friendly, brief, and professional. Avoid generic language and make each message feel personal to the recipient.',
          },
          {
            role: 'user',
            content: personalizedPrompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const message = completion.choices[0]?.message?.content || '';

      return {
        message: message.trim(),
        success: true,
      };
    } catch (error) {
      console.error('Error generating AI message:', error);
      return {
        message: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private replacePlaceholders(prompt: string, lead: Lead): string {
    return prompt
      .replace(/{{BusinessName}}/g, lead.name || 'this business')
      .replace(/{{City}}/g, lead.city || 'your area')
      .replace(/{{State}}/g, lead.state || 'your state')
      .replace(/{{Address}}/g, lead.address || 'your location')
      .replace(/{{Website}}/g, lead.website || 'your website')
      .replace(/{{Phone}}/g, lead.phone || 'your phone number');
  }

  async generateMultipleMessages(leads: Lead[], promptTemplate?: string): Promise<{
    [leadId: string]: string;
  }> {
    const results: { [leadId: string]: string } = {};
    
    for (const lead of leads) {
      const result = await this.generatePersonalizedMessage({
        lead,
        promptTemplate,
      });
      
      if (result.success && lead.id) {
        results[lead.id] = result.message;
      }
    }
    
    return results;
  }

  async validateMessage(message: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check for common spam indicators
    const spamWords = ['urgent', 'limited time', 'act now', 'exclusive offer', 'free trial'];
    const foundSpamWords = spamWords.filter(word => 
      message.toLowerCase().includes(word.toLowerCase())
    );
    
    if (foundSpamWords.length > 0) {
      issues.push(`Contains spam-like words: ${foundSpamWords.join(', ')}`);
    }
    
    // Check length
    if (message.length < 50) {
      issues.push('Message is too short');
    }
    
    if (message.length > 500) {
      issues.push('Message is too long');
    }
    
    // Check for personalization
    if (!message.includes('you') && !message.includes('your')) {
      issues.push('Message lacks personalization');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
    };
  }
} 