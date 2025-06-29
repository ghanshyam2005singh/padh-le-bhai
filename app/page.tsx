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

      {/* Benefits Section */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-10">Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="p-6 border rounded">
            <h3 className="font-bold mb-2">🌟 Free & Open</h3>
            <p>Access a wide range of study materials for free, anytime.</p>
          </div>
          <div className="p-6 border rounded">
            <h3 className="font-bold mb-2">🤝 Community Driven</h3>
            <p>Help your peers and juniors by sharing your own notes and assignments.</p>
          </div>
          <div className="p-6 border rounded">
            <h3 className="font-bold mb-2">⚡ Easy & Fast</h3>
            <p>Instant upload and download. No complicated steps.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-gray-100 text-center">
        <h2 className="text-3xl font-semibold mb-6">About Padh-le-Bhai</h2>
        <p className="max-w-3xl mx-auto text-lg text-gray-700 mb-6">
          <strong>Padh-le-Bhai</strong> is a student-driven platform to make study resources accessible for everyone. Our mission is to empower students to learn, share, and succeed together. Whether you need notes for your next exam or want to help others by uploading your own, this is the place for you!
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/resources">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded shadow hover:bg-indigo-700 transition">
              Browse Notes
            </button>
          </Link>
          <Link href="/upload">
            <button className="bg-green-600 text-white px-6 py-3 rounded shadow hover:bg-green-700 transition">
              Upload Now
            </button>
          </Link>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-white text-center">
        <h2 className="text-3xl font-semibold mb-8">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto text-left space-y-6">
          <div>
            <h4 className="font-bold mb-1">Is it really free?</h4>
            <p>Yes! You can browse and read resources without any cost or login. Downloading and uploading require a free account.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">How do I earn?</h4>
            <p>You earn based on unique downloads of your uploaded resources. Track your stats in your account dashboard.</p>
          </div>
          <div>
            <h4 className="font-bold mb-1">What can I upload?</h4>
            <p>Notes, assignments, presentations, and any study material that helps others. Please avoid copyrighted or inappropriate content.</p>
          </div>
        </div>
      </section>

      {/* Contact & Feedback */}
      <section className="py-16 bg-indigo-600 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">Contact & Feedback</h2>
        <p className="mb-6">Have questions or suggestions? <a href="mailto:outlercodie.com@gmail.com" className="underline">Email us</a> or connect on our <a href="https://www.linkedin.com/company/iron-industry-tech/" className="underline">LinkedIn</a><a href="https://x.com/iron_industry" className="underline"> or Twitter</a>.</p>
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