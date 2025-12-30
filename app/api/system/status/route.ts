import { NextResponse } from 'next/server';
import { checkSystemSetup } from '../../../../lib/utils/systemCheck';

export async function GET() {
  try {
    const systemStatus = await checkSystemSetup();
    
    return NextResponse.json({
      status: 'success',
      data: systemStatus,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}