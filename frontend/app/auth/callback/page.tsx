'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const token = searchParams.get('token');
    
    // Set a timeout to redirect if something goes wrong
    const timeoutId = setTimeout(() => {
      setStatus('Taking longer than expected...');
      setTimeout(() => {
        router.push('/');
      }, 3000);
    }, 10000); // 10 seconds timeout

    if (token) {
      setStatus('Authentication successful! Redirecting...');
      // Store the JWT token
      localStorage.setItem('linkedin_token', token);
      // Clear timeout
      clearTimeout(timeoutId);
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);
    } else {
      setStatus('No token received. Redirecting...');
      clearTimeout(timeoutId);
      // No token, redirect to home
      setTimeout(() => {
        router.push('/');
      }, 2000);
    }

    return () => clearTimeout(timeoutId);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg font-medium">{status}</p>
        <p className="text-gray-500 text-sm mt-2">Please wait...</p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
