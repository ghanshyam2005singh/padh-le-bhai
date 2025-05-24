import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-800 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 px-6 text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Padh-le-Bhai 📚</h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto">
          Access notes, assignments, and resources organized by college, course, semester, and subject — for free. No login needed to explore!
        </p>
        <div className="mt-6 flex justify-center gap-4 flex-wrap">
          <Link href="/resources">
            <button className="bg-white text-blue-700 font-semibold px-6 py-3 rounded shadow hover:scale-105 transition">
              Explore Resources
            </button>
          </Link>
          <Link href="/upload">
            <button className="bg-transparent border border-white text-white px-6 py-3 rounded hover:bg-white hover:text-blue-600 transition">
              Start Uploading
            </button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-2">1. Explore</h3>
            <p>Browse and read notes freely, no account required.</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-2">2. Download or Upload</h3>
            <p>Login or sign up to download files or share your own content.</p>
          </div>
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-xl font-bold mb-2">3. Earn from Downloads</h3>
            <p>Track your content’s performance and earn based on unique downloads.</p>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-semibold mb-10">Why Padh-le-Bhai?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 border rounded">
            <h3 className="font-bold mb-2">🎯 Targeted Content</h3>
            <p>Filtered by college, course, semester, and subject — no mess.</p>
          </div>
          <div className="p-6 border rounded">
            <h3 className="font-bold mb-2">🔐 Verified Uploads</h3>
            <p>Only verified users can upload. Content stays clean and reliable.</p>
          </div>
          <div className="p-6 border rounded">
            <h3 className="font-bold mb-2">💸 Transparent Payouts</h3>
            <p>Uploaders are rewarded based on real engagement from downloads.</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Want to Earn by Helping Others Study?</h2>
        <p className="mb-6">Join Padh-le-Bhai today and start uploading resources you already have.</p>
        <Link href="/upload">
          <button className="bg-white text-indigo-600 font-bold px-6 py-3 rounded shadow hover:scale-105 transition">
            Upload & Earn
          </button>
        </Link>
      </section>

      <Footer />
    </main>
  );
}