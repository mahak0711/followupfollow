'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Home = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      {user ? (
        <h1>Welcome back, {user.name}!</h1>
      ) : (
        <>
          <h1>Welcome to FollowUpFlow</h1>
          <p>Please log in to continue.</p>
          <button
            onClick={handleLoginClick}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem',
            }}
          >
            Go to Login
          </button>
        </>
      )}
    </div>
  );
};

export default Home;
