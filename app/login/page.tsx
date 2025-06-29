'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both email and password.');
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);

      // Check if email is verified
      if (!auth.currentUser?.emailVerified) {
        setError('Please verify your email before logging in.');
        setLoading(false);
        return;
      }

      router.push('/resources');
    } catch (err: unknown) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setResetSent(false);

    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch {
      setError('Failed to send reset email. Please check your email address.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 ">
      <Navbar />
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 mx-auto mt-10">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {resetSent && (
            <p className="text-green-600 text-sm">
              Password reset email sent! Please check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-indigo-600 hover:underline text-sm font-semibold"
          >
            Forgot Password?
          </button>
          <span className="text-sm text-gray-600">
            Don’t have an account?{' '}
            <a href="/signup" className="text-indigo-700 font-semibold hover:underline">
              Sign up here
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;