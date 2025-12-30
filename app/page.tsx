import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '../lib/auth/authOptions';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    // Redirect based on user role
    switch (session.user.role) {
      case 'admin':
        redirect('/admin/dashboard');
      case 'instructor':
        redirect('/instructor/dashboard');
      case 'student':
        redirect('/student/dashboard');
      default:
        redirect('/auth/login');
    }
  } else {
    redirect('/auth/login');
  }
}