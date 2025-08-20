import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Environment Variables Test',
    azureOpenAIKey: process.env.AZURE_OPENAI_KEY ? 'Found' : 'Not Found',
    azureOpenAIDeployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'Not Set',
    azureOpenAIEndpoint: process.env.AZURE_OPENAI_ENDPOINT || 'Not Set',
    nodeEnv: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('AZURE') || key.includes('OPENAI'))
  });
} 