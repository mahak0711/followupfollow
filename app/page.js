'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import LoadingSpinner from '@/components/LoadingSpinner';
export const metadata = {
  title: "FollowUpFollow",
  description: "A lightweight, PWA-ready CRM designed for solo founders and small teams.",
};
const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setIsLoggedIn(true);
        router.push('/dashboard');
      } else {
        setIsLoggedIn(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          FollowUpFlow
        </h1>
        <p className="text-lg md:text-xl text-gray-300 mb-6">
          A lightweight, PWA-ready CRM designed for solo founders and small teams.
        </p>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.push('/login')}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
          >
            Log In
          </button>
          <button
            onClick={() => router.push('/signup')}
            className="bg-white text-black px-6 py-2 rounded-lg hover:bg-gray-200 transition"
          >
            Get Started Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
