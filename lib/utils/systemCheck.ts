import connectToDatabase from '../database/connection';
import User from '../models/User';

export async function checkSystemSetup() {
  try {
    // Check database connection
    await connectToDatabase();

    // Check if admin user exists
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Check if any tests exist
    // Note: Test model would need to be imported for this to work
    // const testCount = await Test.countDocuments();

    return {
      status: 'success',
      databaseConnected: true,
      adminUsers: adminCount,
      // tests: testCount,
      message: 'System is properly configured',
    };
  } catch (error) {
    console.error('System check error:', error);
    return {
      status: 'error',
      databaseConnected: false,
      adminUsers: 0,
      // tests: 0,
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}