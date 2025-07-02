'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Navbar from '../components/Navbar';

// Separate component for the login form that uses useSearchParams
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get('redirect') || '/upload';
  
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

      // Redirect to the intended page
      router.push(redirectTo);
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
    <div className="flex items-center justify-center pt-20">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 mx-4">
        <h1 className="text-3xl font-bold text-center text-indigo-700 mb-6">
          Welcome Back
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 bg-white"
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-gray-900 bg-white"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {resetSent && (
            <p className="text-green-600 text-sm">
              Password reset email sent! Please check your inbox.
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
            Don&#39;t have an account?{' '}
            <a href={`/signup?redirect=${encodeURIComponent(redirectTo)}`} className="text-indigo-700 font-semibold hover:underline">
              Signup
            </a>
          </span>
        </div>
      </div>
    </div>
  );
};

// Loading fallback component
const LoginFormFallback = () => (
  <div className="flex items-center justify-center pt-20">
    <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 mx-4">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-300 rounded mb-6 mx-auto w-48"></div>
        <div className="space-y-4">
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

// Main component
const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Navbar />
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
};

export default LoginPage;