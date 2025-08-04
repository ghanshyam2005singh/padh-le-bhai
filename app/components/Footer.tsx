import React from "react";

const Footer = () => {
  return (
    <footer className="bg-[#f4f6fb] border-t border-[#e0e0e0] py-8 text-center text-sm text-gray-500">
      <p className="mb-1 font-semibold text-[#2e3192]">
        &copy; {new Date().getFullYear()} Iron Industry. All rights reserved.
      </p>
      <p>
        <a
          href="https://iron-industry.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-[#e94f37] hover:text-[#2e3192] transition"
        >
          iron-industry.tech
        </a>
      </p>
    </footer>
  );
};

export default Footer;