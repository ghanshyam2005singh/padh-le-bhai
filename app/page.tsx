import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { BookOpen, UploadCloud, Star } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f7f8fa] text-gray-900 font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center flex-1 py-24 px-6 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-[#2e3192] drop-shadow-lg">
          Padh-le-Bhai 📚
        </h1>
        <p className="text-lg md:text-2xl max-w-2xl mx-auto mb-10 text-gray-700">
          Discover, share, and earn from study resources. Built for students, by students.
        </p>
        <div className="flex flex-wrap justify-center gap-6 mb-6">
          <Link href="/resources">
            <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2e3192] text-white font-bold shadow-lg hover:scale-105 hover:shadow-xl transition-all duration-200 border-none outline-none">
              <BookOpen size={20} /> Explore Resources
            </button>
          </Link>
          <Link href="/upload">
            <button className="flex items-center gap-2 px-8 py-3 rounded-xl bg-white text-[#2e3192] font-bold shadow-lg border border-[#e0e0e0] hover:bg-[#f0f0f0] hover:text-[#1b1f5e] hover:scale-105 transition-all duration-200">
              <UploadCloud size={20} /> Upload & Earn
            </button>
          </Link>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          <Star className="inline-block text-yellow-400 mr-1" size={16} />
          Trusted by 1000+ students
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#e0e0e0] my-8" />

      {/* How It Works */}
      <section className="relative z-10 py-16 px-6 bg-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-[#2e3192]">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-[#f4f6fb] rounded-2xl p-8 shadow-md border border-[#e0e0e0] flex flex-col items-center">
            <BookOpen className="mb-4 text-[#2e3192]" size={36} />
            <h3 className="text-xl font-bold mb-2 text-[#2e3192]">1. Discover</h3>
            <p className="text-center">Browse and preview notes and assignments for free.</p>
          </div>
          <div className="bg-[#f4f6fb] rounded-2xl p-8 shadow-md border border-[#e0e0e0] flex flex-col items-center">
            <UploadCloud className="mb-4 text-[#e94f37]" size={36} />
            <h3 className="text-xl font-bold mb-2 text-[#e94f37]">2. Upload</h3>
            <p className="text-center">Login to upload your resources and help others.</p>
          </div>
          <div className="bg-[#f4f6fb] rounded-2xl p-8 shadow-md border border-[#e0e0e0] flex flex-col items-center">
            <Star className="mb-4 text-[#7b2ff2]" size={36} />
            <h3 className="text-xl font-bold mb-2 text-[#7b2ff2]">3. Earn</h3>
            <p className="text-center">Track your uploads and earn from unique downloads.</p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="w-full h-px bg-[#e0e0e0] my-8" />

      {/* About Section */}
      <section className="relative z-10 py-16 px-6 bg-[#f7f8fa]">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center text-[#2e3192]">
          About Padh-le-Bhai
        </h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-700 mb-8 text-center">
          <strong>Padh-le-Bhai</strong> is a platform by <a href="https://iron-industry.tech" target="_blank" className="underline text-[#e94f37]">Iron-Industry</a> to make study resources accessible for everyone. Join our community and help students succeed together.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/resources">
            <button className="bg-[#2e3192] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#1b1f5e] hover:scale-105 transition">
              Browse Notes
            </button>
          </Link>
          <Link href="/upload">
            <button className="bg-white text-[#2e3192] px-8 py-3 rounded-xl font-bold shadow-lg border border-[#e0e0e0] hover:bg-[#f0f0f0] hover:text-[#1b1f5e] hover:scale-105 transition">
              Upload Now
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}