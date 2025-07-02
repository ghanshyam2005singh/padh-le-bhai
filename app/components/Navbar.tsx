'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Menu, X, UserCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signOut, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Fetch user name from Firestore users collection
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData?.name || user.displayName || user.email?.split('@')[0] || 'Account');
          } else {
            // Fallback to displayName or email username if no Firestore document exists
            setUserName(user.displayName || user.email?.split('@')[0] || 'Account');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Fallback to displayName or email username on error
          setUserName(user.displayName || user.email?.split('@')[0] || 'Account');
        }
      } else {
        setUserName('');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserName('');
  };

  const isActive = (path: string) =>
    pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return (
    <nav className="bg-white border-b shadow-sm px-4 md:px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-700">
          Padh-le-Bhai
        </Link>

        {/* Hamburger for mobile */}
        <button
          className="md:hidden ml-auto p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle Menu"
        >
          {isOpen
            ? <X size={28} className="text-blue-700" />
            : <Menu size={28} className="text-blue-700" />}
        </button>

        {/* Desktop Links */}
        <div className="hidden md:flex flex-row gap-6 text-base items-center flex-wrap justify-end">
          <Link href="/resources" className={isActive('/resources')}>
            Resources
          </Link>
          <Link href="/upload" className={isActive('/upload')}>
            Upload
          </Link>
          {!user && !loading && (
            <>
              <Link href="/login" className={isActive('/login')}>
                Login
              </Link>
              <Link href="/signup">
                <button className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm">
                  Sign Up
                </button>
              </Link>
            </>
          )}
          {user && !loading && (
            <>
              <Link href="/account" className="flex items-center gap-2">
                <UserCircle size={28} className="text-blue-600" />
                <span className="hidden md:inline text-gray-700 text-sm">{userName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 text-sm"
              >
                Logout
              </button>
            </>
          )}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="animate-pulse">
                <div className="h-7 w-16 bg-gray-300 rounded"></div>
              </div>
            </div>
          )}
          <Link href="https://iron-industry.tech/" target="_blank">
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 text-white px-4 py-1.5 rounded hover:from-pink-600 hover:to-red-700 text-sm shadow-md transition-all"
            >
              <MessageCircle size={16} />
              Contact Us
            </button>
          </Link>
        </div>

        {/* Mobile Dropdown Menu */}
        {isOpen && (
          <div className="md:hidden absolute left-0 top-full bg-white shadow-lg rounded-b-lg flex flex-col gap-4 py-4 px-6 z-50 animate-fade-in">
            <Link
              href="/resources"
              className={isActive('/resources')}
              onClick={() => setOpen(false)}
            >
              Resources
            </Link>
            <Link
              href="/upload"
              className={isActive('/upload')}
              onClick={() => setOpen(false)}
            >
              Upload
            </Link>
            {!user && !loading && (
              <>
                <Link
                  href="/login"
                  className={isActive('/login')}
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <button className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm w-full text-left">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
            {user && !loading && (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="flex items-center gap-2">
                  <UserCircle size={28} className="text-blue-600" />
                  <span className="text-gray-700 text-sm">{userName}</span>
                </Link>
                <button
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="mt-2 bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 text-sm w-full text-left"
                >
                  Logout
                </button>
              </>
            )}
            {loading && (
              <div className="animate-pulse">
                <div className="h-7 w-20 bg-gray-300 rounded"></div>
              </div>
            )}
            <Link href="https://iron-industry.tech/" target="_blank" onClick={() => setOpen(false)}>
              <button
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 text-white px-4 py-1.5 rounded hover:from-pink-600 hover:to-red-700 text-sm shadow-md transition-all w-full text-left"
              >
                <MessageCircle size={16} />
                Contact Us
              </button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;