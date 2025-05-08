// components/Navbar.tsx
import React from "react";

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-800 text-white p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Padh-le-bhai</h1>
      <a
        href="https://www.iron-industry.tech/"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-300"
      >
        Contact Us
      </a>
    </nav>
  );
}
