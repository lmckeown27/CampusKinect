import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NEXT_PUBLIC_ENVIRONMENT || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      checks: {
        api: await checkApiHealth(),
        database: 'ok', // Add actual database check if needed
      }
    };

    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('Health check failed:', error);
    
    const healthError = {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };

    return NextResponse.json(healthError, { status: 503 });
  }
}

async function checkApiHealth(): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return 'no-api-url';
    }

    // In a real implementation, you might ping your backend API
    // const response = await fetch(`${apiUrl}/health`, { method: 'GET' });
    // return response.ok ? 'ok' : 'error';
    
    return 'ok';
  } catch (error) {
    return 'error';
  }
} 