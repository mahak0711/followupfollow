'use client';  

import { useRouter } from 'next/navigation'; 
import { useEffect,useState } from 'react';

const Home = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]); 

  if (loading) return <p>Loading...</p>;

  return <div>Welcome to the Home page!</div>;
};

export default Home;
