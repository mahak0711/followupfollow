'use client';

import { useRouter } from 'next/navigation'; 
import { useEffect, useState } from 'react';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate a logged-in user
    const dummyUser = { name: "Mahak" };
    setUser(dummyUser);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]); 

  if (loading) return <p>Loading...</p>;

  return <div>Welcome to the Home page, {user?.name}!</div>;
};

export default Home;
