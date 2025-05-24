import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t py-6 text-center text-sm text-gray-600">
      <p>
        &copy; {new Date().getFullYear()} Iron Industry. All rights reserved.
      </p>
    </footer>
  );
};

export default Footer;
