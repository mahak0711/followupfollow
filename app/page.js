'use client';

import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase'; // Assuming you're using Firebase for auth

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

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Home page!</h1>
      {error && <p className="text-red-500">{error}</p>}
      {user ? (
        <>
          <p>Hello, {user.displayName || user.email}!</p> {/* Displaying user name or email */}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
};

export default Home;
