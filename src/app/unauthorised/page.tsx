'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig';

export default function UnauthorisedPage() {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
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
