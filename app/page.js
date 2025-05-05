'use client';
import ErrorBoundary from '../components/ErrorBoundary';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming you're using Firebase for auth
import LoadingSpinner from '@/components/LoadingSpinner';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Real auth check logic, e.g., checking Firebase auth state
        const currentUser = auth.currentUser; // For Firebase
        setUser(currentUser);
        setLoading(false);
      } catch (err) {
        setError('Error checking authentication.');
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = () => {
    // Log the user out and redirect to login
    auth.signOut(); // Assuming you're using Firebase auth
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Welcome to the Home Page!</h1>

        {error && (
          <div className="bg-red-100 text-red-600 p-4 rounded-md mb-6">
            <p>{error}</p>
          </div>
        )}

        {user ? (
          <div className="flex flex-col items-center">
            <p className="text-lg text-gray-700 mb-4">Hello, {user.displayName || user.email}!</p>
            <button
              onClick={handleLogout}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="text-lg text-gray-700 mb-4">Please log in to continue.</p>
            <button
              onClick={() => router.push('/login')}
              className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200"
            >
              Go to Login
            </button>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Home;
