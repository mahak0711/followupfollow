"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);  // Loading state
  const router = useRouter();

  const handleAuth = async () => {
    setLoading(true); // Start loading
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      router.push("/dashboard");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-amber-950 text-center mb-4">
          {isSignUp ? "Sign Up" : "Login"}
        </h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full text-black mb-2 px-4 py-2 border rounded border-blue-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-4 text-black border-blue-300 px-4 py-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleAuth}
          className="w-full bg-black text-white py-2 rounded hover:opacity-90"
          disabled={loading}  // Disable button while loading
        >
          {loading ? "Processing..." : isSignUp ? "Create Account" : "Login"}
        </button>
        <p
          className="text-center text-sm mt-4 cursor-pointer text-blue-500"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
        </p>
      </div>
    </div>
  );
}
