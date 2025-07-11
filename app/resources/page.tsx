'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getFirestore, query, where, getDocs, orderBy, doc, updateDoc, increment } from 'firebase/firestore';
import { auth } from '@/lib/firebase';
import collegeList from "@/public/collegeList";
import categoriesWithCourses from "@/public/courseList";
import toast from 'react-hot-toast';
import Navbar from '@/app/components/Navbar';

interface Resource {
  id: string;
  title: string;
  uploader?: string;
  uploaderEmail?: string;
  uploaderId?: string;
  fileType?: string;
  drive_link: string;
  created_at: Date | { seconds: number; nanoseconds: number };
  college?: string;
  category?: string;
  course?: string;
  semester?: string;
  subject?: string;
  read_count?: number;
  download_count?: number;
}

const ResourcesPage = () => {
  const router = useRouter();
  // Move uniqueCollegeList outside to avoid dependency issues
  const uniqueCollegeList = Array.from(new Set(collegeList));
  
  const [college, setCollege] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [semester, setSemester] = useState('');
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [readingResource, setReadingResource] = useState<Resource | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // College search state
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const [filteredColleges, setFilteredColleges] = useState<string[]>([]);
  const collegeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const found = categoriesWithCourses.find(
      (cat) => cat.category === selectedCategory
    );
    setFilteredCourses(found ? found.courses : []);
    setSelectedCourse('');
  }, [selectedCategory]);

  // Filter colleges based on search - FIXED: Removed uniqueCollegeList from dependencies
  useEffect(() => {
    if (collegeSearch.trim() === '') {
      setFilteredColleges(uniqueCollegeList);
    } else {
      const filtered = uniqueCollegeList.filter(col =>
        col.toLowerCase().includes(collegeSearch.toLowerCase())
      );
      setFilteredColleges(filtered);
    }
  }, [collegeSearch]); // Removed uniqueCollegeList from dependencies to prevent infinite loop

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (collegeDropdownRef.current && !collegeDropdownRef.current.contains(event.target as Node)) {
        setShowCollegeDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCollegeSelect = (selectedCollege: string) => {
    setCollege(selectedCollege);
    setCollegeSearch(selectedCollege);
    setShowCollegeDropdown(false);
  };

  const handleCollegeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCollegeSearch(value);
    setCollege(value);
    setShowCollegeDropdown(true);
  };

  const handleCollegeInputFocus = () => {
    setShowCollegeDropdown(true);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResources([]);
    setSearched(false);

    if (!college || !selectedCategory || !selectedCourse || !semester) {
      toast.error('Please select all fields before searching.');
      return;
    }

    try {
      setLoading(true);
      const db = getFirestore();
      const q = query(
        collection(db, 'resources'),
        where('college', '==', college),
        where('category', '==', selectedCategory),
        where('course', '==', selectedCourse),
        where('semester', '==', semester),
        orderBy('created_at', 'desc')
      );
      const snap = await getDocs(q);
      const data: Resource[] = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];

      setResources(data);
      setSearched(true);
    } catch {
      setError('Failed to load resources');
      toast.error('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (isLoggedIn) {
      router.push('/upload');
    } else {
      router.push('/login?redirect=' + encodeURIComponent('/upload'));
    }
  };

  // Unique read/download tracking using localStorage
  const hasReadResource = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem('read_resources') || '[]');
    return readIds.includes(id);
  };
  const markReadResource = (id: string) => {
    const readIds = JSON.parse(localStorage.getItem('read_resources') || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem('read_resources', JSON.stringify(readIds));
    }
  };
  const hasDownloadedResource = (id: string) => {
    const downloadIds = JSON.parse(localStorage.getItem('downloaded_resources') || '[]');
    return downloadIds.includes(id);
  };
  const markDownloadedResource = (id: string) => {
    const downloadIds = JSON.parse(localStorage.getItem('downloaded_resources') || '[]');
    if (!downloadIds.includes(id)) {
      downloadIds.push(id);
      localStorage.setItem('downloaded_resources', JSON.stringify(downloadIds));
    }
  };

  // Read (view) handler
  const handleRead = async (resource: Resource) => {
    setReadingResource(resource);
    setPreviewLoading(true);
    if (!hasReadResource(resource.id)) {
      try {
        const db = getFirestore();
        await updateDoc(doc(db, 'resources', resource.id), {
          read_count: increment(1)
        });
        markReadResource(resource.id);
        setResources(prev =>
          prev.map(r =>
            r.id === resource.id
              ? { ...r, read_count: (r.read_count || 0) + 1 }
              : r
          )
        );
      } catch {
        // ignore error for now
      }
    }
  };

  // Download handler
  const handleDownload = async (resource: Resource) => {
    if (!isLoggedIn) {
      router.push('/login?redirect=' + encodeURIComponent(window.location.pathname + window.location.search));
      return;
    }
    if (!hasDownloadedResource(resource.id)) {
      try {
        const db = getFirestore();
        await updateDoc(doc(db, 'resources', resource.id), {
          download_count: increment(1)
        });
        markDownloadedResource(resource.id);
        setResources(prev =>
          prev.map(r =>
            r.id === resource.id
              ? { ...r, download_count: (r.download_count || 0) + 1 }
              : r
          )
        );
      } catch {
        // ignore error for now
      }
    }
    window.open(resource.drive_link, '_blank', 'noopener');
  };

  // Close reader
  const handleCloseReader = () => {
    setReadingResource(null);
    setPreviewLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-xl">
          <div className="p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8 flex-col md:flex-row gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-700">Find Study Resources</h1>
              <button
                onClick={handleUploadClick}
                className={`py-3 px-6 text-white rounded-lg shadow-md transition-all text-sm sm:text-base ${
                  isLoggedIn ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              >
                {isLoggedIn ? 'Upload Resource' : 'Login to Upload'}
              </button>
            </div>

            <form onSubmit={handleSearch} className="space-y-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* College Searchable Dropdown */}
                <div className="relative" ref={collegeDropdownRef}>
                  <input
                    type="text"
                    placeholder="Search and select college..."
                    value={collegeSearch}
                    onChange={handleCollegeInputChange}
                    onFocus={handleCollegeInputFocus}
                    className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                  />
                  {showCollegeDropdown && (
                    <div className="absolute z-[50000] w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                      {filteredColleges.length > 0 ? (
                        filteredColleges.map((col: string) => (
                          <div
                            key={col}
                            onClick={() => handleCollegeSelect(col)}
                            className="px-4 py-3 hover:bg-indigo-100 hover:text-indigo-800 border-b border-gray-200 last:border-b-0 transition-colors cursor-pointer text-gray-800 font-medium"
                          >
                            <div className="break-words whitespace-normal leading-relaxed text-sm">
                              {col}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-600 text-center font-medium text-sm">
                          No colleges found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                >
                  <option value="">Select Category</option>
                  {categoriesWithCourses.map(cat => (
                    <option key={cat.category} value={cat.category}>
                      {cat.category}
                    </option>
                  ))}
                </select>

                {/* Course Dropdown */}
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  disabled={!selectedCategory}
                  className={`w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none transition-all ${
                    !selectedCategory
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-600'
                  }`}
                  title={!selectedCategory ? 'Select a category first' : ''}
                >
                  <option value="">Select Course</option>
                  {filteredCourses.map(course => (
                    <option key={course} value={course}>
                      {course}
                    </option>
                  ))}
                </select>

                {/* Semester Dropdown */}
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
                >
                  <option value="">Select Semester</option>
                  {[...Array(8)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>Semester {i + 1}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all text-sm sm:text-base"
              >
                Search Resources
              </button>
            </form>

            {loading && <p className="text-center text-indigo-700 py-4">Loading resources...</p>}
            {error && <p className="text-center text-red-600 py-4">{error}</p>}

            {searched && resources.length === 0 && !loading && !error && (
              <div className="text-center mt-10 py-8">
                <p className="text-gray-700 text-lg mb-4">
                  No resources found for your selection.<br />
                  <span className="font-semibold">Be the first one to upload!</span>
                </p>
                <button
                  onClick={handleUploadClick}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition text-sm sm:text-base"
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
                      <h3 className="font-semibold text-xl text-indigo-700 mb-2 break-words">{res.subject || res.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">College: {res.college || '-'}</p>
                      <p className="text-sm text-gray-600 mb-1">Category: {res.category || '-'}</p>
                      <p className="text-sm text-gray-600 mb-1">Course: {res.course || '-'}</p>
                      <p className="text-sm text-gray-600 mb-1">Semester: {res.semester || '-'}</p>
                      <p className="text-sm text-gray-500 break-words">Uploaded by: {res.uploader || res.uploaderEmail?.split('@')[0] || 'Anonymous'}</p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-xs text-gray-500">Reads: {res.read_count || 0}</span>
                        <span className="text-xs text-gray-500">Downloads: {res.download_count || 0}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">
                        Uploaded on: {
                          res.created_at
                            ? typeof res.created_at === 'object' && 'seconds' in res.created_at
                              ? new Date((res.created_at as { seconds: number }).seconds * 1000).toLocaleDateString()
                              : new Date(res.created_at as Date).toLocaleDateString()
                            : '-'
                        }
                      </p>
                    </div>
                    <div className="mt-4 flex flex-col gap-2">
                      <button
                        className="w-full bg-indigo-600 text-white py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-all text-sm"
                        onClick={() => handleRead(res)}
                      >
                        Read (Preview)
                      </button>
                      {isLoggedIn ? (
                        <button
                          className="w-full bg-green-600 text-white py-2 rounded-lg shadow-lg hover:bg-green-700 transition-all text-sm"
                          onClick={() => handleDownload(res)}
                        >
                          Download
                        </button>
                      ) : (
                        <Link href="/login">
                          <button className="w-full bg-green-600 text-white py-2 rounded-lg shadow-lg hover:bg-green-700 transition-all text-sm">
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
              <div className="text-center mt-10 py-8">
                <p className="text-gray-700 text-lg mb-4">
                  Want to contribute? Upload your notes or assignments!
                </p>
                <button
                  onClick={handleUploadClick}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition text-sm sm:text-base"
                >
                  Upload Resource
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* File Reader Modal */}
      {readingResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred background */}
          <div
            className="absolute inset-0 backdrop-blur-md bg-white/30"
            style={{ zIndex: 10 }}
            onClick={handleCloseReader}
          />
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] p-6 relative flex flex-col z-20">
            <button
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 text-2xl z-30"
              onClick={handleCloseReader}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-indigo-700 pr-8 break-words">{readingResource.subject || readingResource.title}</h2>
            <div className="flex-1 min-h-[400px] flex items-center justify-center relative">
              {previewLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-30">
                  <div className="flex flex-col items-center">
                    <svg className="animate-spin h-8 w-8 text-indigo-600 mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    <span className="text-indigo-700 font-semibold">Loading preview...</span>
                  </div>
                </div>
              )}
              <iframe
                src={`https://drive.google.com/file/d/${extractDriveId(readingResource.drive_link)}/preview`}
                width="100%"
                height="500"
                allow="autoplay"
                className="rounded border relative z-10"
                onLoad={() => setPreviewLoading(false)}
                style={{ background: "#f3f4f6" }}
              ></iframe>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper to extract Google Drive file ID from link
function extractDriveId(link: string) {
  const match = link.match(/\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : '';
}

export default ResourcesPage;