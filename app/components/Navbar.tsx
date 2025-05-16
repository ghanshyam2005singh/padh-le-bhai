'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle } from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();

  const isActive = (path: string) =>
    pathname === path ? 'text-blue-600 font-semibold' : 'text-gray-700';

  return (
    <nav className="bg-white border-b shadow-sm px-4 md:px-8 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold text-blue-700">
          Padh-le-Bhai
        </Link>

        {/* Links */}
        <div className="flex gap-4 md:gap-6 text-sm md:text-base items-center flex-wrap justify-end">
          <Link href="/resources" className={isActive('/resources')}>
            Explore
          </Link>
          <Link href="/upload" className={isActive('/upload')}>
            Upload
          </Link>
          <Link href="/login" className={isActive('/login')}>
            Login
          </Link>
          <Link href="/signup">
            <button className="bg-blue-600 text-white px-4 py-1.5 rounded hover:bg-blue-700 text-sm">
              Sign Up
            </button>
          </Link>

          {/* Updated Contact Us Button */}
          <Link href="https://iron-industry.tech/" target="_blank">
            <button
              className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-600 text-white px-4 py-1.5 rounded hover:from-pink-600 hover:to-red-700 text-sm shadow-md transition-all"
            >
              <MessageCircle size={16} />
              Contact Us
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
