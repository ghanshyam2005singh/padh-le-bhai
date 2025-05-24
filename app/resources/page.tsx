'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface Resource {
  id: string;
  title: string;
  uploader?: string;
  subject: string;
  fileType?: string;
  drive_link: string;
  created_at: string;
}

const ResourcesPage = () => {
  const router = useRouter();
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResources([]);
    setSearched(false);

    if (!college || !course || !semester || !subject) {
      alert('Please select all fields before searching.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `/api/resources?college=${college}&course=${course}&semester=${semester}&subject=${subject}`
      );
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'Failed to load resources');

      setResources(data.data);
      setSearched(true);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    router.push(isLoggedIn ? '/upload' : '/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 flex justify-center items-start">
      <div className="max-w-6xl w-full bg-white p-8 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-indigo-700">Find Study Resources</h1>
          <button
            onClick={handleUploadClick}
            className={`mt-8 py-3 px-6 text-white rounded-lg shadow-md transition-all ${
              isLoggedIn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
            }`}
          >
            {isLoggedIn ? 'Upload Resource' : 'Login to Upload'}
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <select value={college} onChange={(e) => setCollege(e.target.value)} className="select-field">
            <option value="">Select College</option>
            <option value="iitd">IIT Delhi</option>
            <option value="nits">NIT Surat</option>
          </select>

          <select value={course} onChange={(e) => setCourse(e.target.value)} className="select-field">
            <option value="">Select Course</option>
            <option value="btech">B.Tech</option>
            <option value="mca">MCA</option>
          </select>

          <select value={semester} onChange={(e) => setSemester(e.target.value)} className="select-field">
            <option value="">Select Semester</option>
            <option value="1">Semester 1</option>
            <option value="2">Semester 2</option>
          </select>

          <select value={subject} onChange={(e) => setSubject(e.target.value)} className="select-field">
            <option value="">Select Subject</option>
            <option value="math">Math</option>
            <option value="dbms">DBMS</option>
          </select>

          <div className="md:col-span-4 mt-4">
            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all"
            >
              Search Resources
            </button>
          </div>
        </form>

        {loading && <p className="text-center text-indigo-700">Loading resources...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}

        {/* Show "Be the first to upload" if searched and no resources */}
        {searched && resources.length === 0 && !loading && !error && (
          <div className="text-center mt-10">
            <p className="text-gray-700 text-lg mb-4">
              No resources found for your selection.<br />
              <span className="font-semibold">Be the first one to upload!</span>
            </p>
            <button
              onClick={handleUploadClick}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition"
            >
              Upload Resource
            </button>
          </div>
        )}

        {resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {resources.map((res) => (
              <div
                key={res.id}
                className="border rounded-lg p-6 bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-xl text-indigo-700 mb-2">{res.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">Subject: {res.subject}</p>
                  <p className="text-sm text-gray-500">Uploaded by: {res.uploader || 'Anonymous'}</p>
                </div>
                <div className="mt-4">
                  {isLoggedIn ? (
                    <a
                      href={res.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center bg-indigo-600 text-white py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all"
                    >
                      Download
                    </a>
                  ) : (
                    <Link href="/login">
                      <button className="w-full bg-indigo-600 text-white py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition-all">
                        Login to Download
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoggedIn && (
          <div className="text-center mt-10">
            <p className="text-gray-700 text-lg mb-4">
              Want to contribute? Upload your notes or assignments!
            </p>
            <button
              onClick={handleUploadClick}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition"
            >
              Upload Resource
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResourcesPage;