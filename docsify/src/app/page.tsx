'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthForm from '@/components/AuthForm';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div>
      <div className="absolute top-0 left-0 right-0 p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Docsify
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mt-2">
          Create beautiful documentation
        </p>
      </div>
      <AuthForm />
    </div>
  );
}
