// app/page.tsx
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CollegeForm from "./components/CollegeForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow p-4">
        <h2 className="text-2xl text-center font-semibold mt-6">Find Notes & Assignments</h2>
        <CollegeForm />
      </div>
      <Footer />
    </main>
  );
}
