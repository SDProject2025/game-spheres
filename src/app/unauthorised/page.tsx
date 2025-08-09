'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig'; // your Firebase client config

export default function UnauthorisedPage() {
  const router = useRouter();

  useEffect(() => {
    // Subscribe to token changes
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        // Always refresh user info from Firebase without polling
        await user.reload();
        if (user.emailVerified) {
          router.push('/home');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Verify Your Email</h1>
      <p className="text-gray-600 mt-2 text-center">
        We’ve sent a verification link to your email. Once verified, you’ll be redirected automatically.
      </p>
    </main>
  );
}
