'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { Button } from '../common/Button';
import { StudentSidebar } from './StudentSidebar';
import { StudentHeader } from './StudentHeader';

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <StudentSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <StudentHeader 
          onMenuClick={() => setSidebarOpen(true)} 
          user={session?.user}
          onSignOut={() => signOut()}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}