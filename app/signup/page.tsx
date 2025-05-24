'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const SignupPage = () => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name || !email || !password) {
      setError('Please fill all fields.');
      setLoading(false);
      return;
    }

    try {
      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        userType,
        isVerified: false,
        isSuspicious: false,
        createdAt: serverTimestamp()
      });

      // Send email verification
      await sendEmailVerification(user);

      // Sign out the user so they can't use the app until verified
      await signOut(auth);

      setVerificationSent(true);
      setName('');
      setEmail('');
      setPassword('');
      setUserType('student');
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message || 'Signup failed. Try again.');
      } else {
        setError('Signup failed. Try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center">
      <div className="max-w-lg w-full p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">Create Your Account</h1>

        {verificationSent ? (
          <div className="text-center">
            <p className="text-green-600 text-lg font-semibold mb-4">
              Verification email sent! Please check your inbox and verify your email before logging in.
            </p>
            <button
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition"
              onClick={() => router.push('/login')}
            >
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Input */}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            />

            {/* Email Input */}
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            />

            {/* User Type Selector */}
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            >
              <option value="student">Student</option>
              <option value="uploader">Uploader</option>
            </select>

            {/* Error */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-xl hover:bg-indigo-700 transition-all"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            {/* Already have account? */}
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => router.push('/login')}
                  className="text-indigo-600 hover:underline font-semibold"
                >
                  Login
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SignupPage;