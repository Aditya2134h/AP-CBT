import { NextResponse } from 'next/server';
import connectToDatabase from '../../../lib/database/connection';
import User from '../../../lib/models/User';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Create a test user if none exists
    const existingUser = await User.findOne({ email: 'admin@example.com' });
    
    if (!existingUser) {
      const testUser = new User({
        email: 'admin@example.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'admin',
        status: 'active',
      });
      
      await testUser.save();
    }

    return NextResponse.json({
      message: 'CBT System API is working!',
      status: 'success',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('API test error:', error);
    return NextResponse.json({
      message: 'API test failed',
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}