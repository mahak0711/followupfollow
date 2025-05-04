'use client';
import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signup = async (e) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={signup} className="p-6 max-w-md mx-auto mt-10 bg-white shadow rounded">
      <h1 className="text-xl font-bold mb-4">Sign Up</h1>
      <input type="email" placeholder="Email" className="border p-2 w-full mb-2" onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" className="border p-2 w-full mb-4" onChange={(e) => setPassword(e.target.value)} required />
      <button className="bg-blue-500 text-white px-4 py-2 rounded">Create Account</button>
    </form>
  );
}
