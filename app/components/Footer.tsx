// components/Footer.tsx
import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 text-center py-4 text-sm mt-10">

        <p className="text-sm">&copy; {new Date().getFullYear()} Iron Industry. All rights reserved.</p>

    </footer>
  );
}
