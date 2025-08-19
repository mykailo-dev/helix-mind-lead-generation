import { NextRequest, NextResponse } from 'next/server';
import { SendEmailRequest, SendEmailResponse } from '@/lib/types';
import { AirtableService } from '@/lib/airtable';
import { google } from 'googleapis';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const body: SendEmailRequest = await request.json();
    const { lead, message, subject = 'Quick question about your business' } = body;

    if (!lead || !lead.emails || lead.emails.length === 0 || !message) {
      return NextResponse.json(
        { success: false, error: 'Lead email and message are required' },
        { status: 400 }
      );
    }

    // Use the first email from the emails array
    const email = lead.emails[0];

    // Check rate limits
    const rateLimitResult = await checkRateLimits();
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { success: false, error: rateLimitResult.error },
        { status: 429 }
      );
    }

    // Send email using Gmail API
    const emailResult = await sendEmailViaGmail({
      to: email,
      subject,
      message,
      leadName: lead.name,
    });

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, error: emailResult.error || 'Failed to send email' },
        { status: 500 }
      );
    }

    // Update lead status in Airtable
    const airtableService = AirtableService.getInstance();
    if (lead.id) {
      await airtableService.updateLead(lead.id, {
        status: 'contacted',
        sentAt: new Date(),
      });
    }

    const response: SendEmailResponse = {
      success: true,
      messageId: emailResult.messageId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error in send-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendEmailViaGmail({
  to,
  subject,
  message,
  leadName,
}: {
  to: string;
  subject: string;
  message: string;
  leadName: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const emailContent = `
From: ${process.env.GMAIL_FROM_NAME || 'Lead Generation System'} <${process.env.GMAIL_FROM_EMAIL}>
To: ${to}
Subject: ${subject}
Content-Type: text/html; charset=utf-8

${message}
    `.trim();

    const encodedMessage = Buffer.from(emailContent).toString('base64').replace(/\+/g, '-').replace(/\//g, '_');

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: res.data.id || undefined,
    };
  } catch (error) {
    console.error('Error sending email via Gmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkRateLimits(): Promise<{ success: boolean; retryAfter?: number; error?: string }> {
  // Simple rate limiting - in production, use Redis or database
  const dailyLimit = parseInt(process.env.DAILY_EMAIL_LIMIT || '50');
  const hourlyLimit = parseInt(process.env.HOURLY_EMAIL_LIMIT || '10');

  // For now, return allowed - implement proper rate limiting in production
  return { success: true };
}

export async function PUT(request: NextRequest) {
  try {
    const body: { leadIds: string[]; subject?: string } = await request.json();
    const { leadIds, subject = 'Quick question about your business' } = body;

    if (!leadIds || leadIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead IDs are required' },
        { status: 400 }
      );
    }

    const airtableService = AirtableService.getInstance();
    const leads = await airtableService.getLeads();
    const targetLeads = leads.filter(lead => lead.id && leadIds.includes(lead.id));

    const results: { [leadId: string]: { success: boolean; messageId?: string; error?: string } } = {};

    for (const lead of targetLeads) {
      if (!lead.emails || lead.emails.length === 0 || !lead.message) {
        results[lead.id!] = { success: false, error: 'Missing email or message' };
        continue;
      }

      try {
        const emailResult = await sendEmailViaGmail({
          to: lead.emails[0],
          subject,
          message: lead.message,
          leadName: lead.name,
        });

        results[lead.id!] = emailResult;

        if (emailResult.success && lead.id) {
          await airtableService.updateLead(lead.id, {
            status: 'contacted',
            sentAt: new Date(),
          });
        }
      } catch (error) {
        results[lead.id!] = { success: false, error: 'Failed to send email' };
      }
    }

    const successfulSends = Object.values(results).filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      results,
      totalSent: successfulSends,
      totalAttempted: targetLeads.length,
    });
  } catch (error) {
    console.error('Error in bulk send-email API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 