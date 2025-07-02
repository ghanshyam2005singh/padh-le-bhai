'use client';

import { useState, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import collegeList from "@/public/collegeList";
import categoriesWithCourses from "@/public/courseList";
import toast from 'react-hot-toast';
import Navbar from '@/app/components/Navbar';

const UploadPage = () => {
  const [college, setCollege] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<string[]>([]);
  const [semester, setSemester] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');
  const uniqueCollegeList = Array.from(new Set(collegeList));
  const [uploaderId, setUploaderId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Legal disclaimer modal state
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [agreed, setAgreed] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        window.location.href = '/login';
      } else {
        setUploaderId(user.uid);
      }
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

  const isFormValid =
    title &&
    college &&
    selectedCategory &&
    selectedCourse &&
    semester &&
    file &&
    !loading &&
    agreed;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setShowDisclaimer(true);
      return;
    }
    
    if (!title || !college || !selectedCategory || !selectedCourse || !semester || !file) {
      setError('Please fill in all fields');
      toast.error('Please fill in all fields');
      return;
    }

    // Get Firebase ID token for authentication
    const user = auth.currentUser;
    if (!user) {
      setError('Please log in to upload');
      toast.error('Please log in to upload');
      return;
    }

    setError('');
    setLoading(true);
    setUploadProgress(0);
    setUploadStatus('uploading');

    try {
      // Get ID token for authentication
      const idToken = await user.getIdToken();
      
      const formData = new FormData();
      formData.append('title', title);
      formData.append('college', college);
      formData.append('category', selectedCategory);
      formData.append('course', selectedCourse);
      formData.append('semester', semester);
      formData.append('subject', title); // Use title as subject since they are the same
      formData.append('file', file!);
      if (uploaderId) formData.append('uploaderId', uploaderId);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/upload');
      
      // Add Authorization header
      xhr.setRequestHeader('Authorization', `Bearer ${idToken}`);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      
      xhr.onload = () => {
        setUploadStatus('processing');
        setTimeout(() => {
          setLoading(false);
          setUploadStatus('done');
          setUploadProgress(100);
          
          if (xhr.status === 200) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.success) {
                toast.success('Upload successful!');
                // Reset form
                setTitle('');
                setCollege('');
                setSelectedCategory('');
                setSelectedCourse('');
                setSemester('');
                setFile(null);
                setAgreed(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
                setTimeout(() => setUploadStatus('idle'), 1500);
              } else {
                setError(data.error || 'Upload failed');
                toast.error(data.error || 'Upload failed');
                setUploadStatus('idle');
              }
            } catch {
              setError('Upload failed - Invalid response');
              toast.error('Upload failed');
              setUploadStatus('idle');
            }
          } else {
            setError(`Upload failed - Status: ${xhr.status}`);
            toast.error('Upload failed');
            setUploadStatus('idle');
          }
        }, 1200);
      };
      
      xhr.onerror = () => {
        setLoading(false);
        setError('Network error - Upload failed');
        toast.error('Network error');
        setUploadStatus('idle');
      };
      
      xhr.send(formData);
    } catch (err) {
      setLoading(false);
      setError('Upload failed');
      toast.error('Upload failed');
      setUploadStatus('idle');
      console.error('Upload error:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Modal for legal disclaimer
  const DisclaimerModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Blurred background */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-white/30"
        style={{ zIndex: 10 }}
        onClick={() => setShowDisclaimer(false)}
      />
      {/* Modal */}
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 relative z-20">
        <h2 className="text-xl font-bold mb-4 text-red-600">Legal Disclaimer</h2>
        <p className="text-gray-700 mb-4">
          By uploading, you agree that your file does not contain any copyrighted, illegal, harmful, or inappropriate content.
          You are solely responsible for the content you upload. Violations may result in account suspension and legal action.
        </p>
        <div className="flex items-center mb-4">
          <input
            id="agree-modal"
            type="checkbox"
            checked={agreed}
            onChange={e => setAgreed(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="agree-modal" className="text-gray-700 text-sm">
            I have read and agree to the above disclaimer.
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            onClick={() => setShowDisclaimer(false)}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 rounded ${agreed ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
            disabled={!agreed}
            onClick={() => setShowDisclaimer(false)}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex flex-col">
      <Navbar />
      <div className="flex justify-center items-start flex-1 mt-8">
        <div className="max-w-2xl w-full bg-white p-8 rounded-lg shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-center text-indigo-700 mb-8">
            Upload Study Resource
          </h1>

          <form onSubmit={handleUpload} className="space-y-6">
            {/* Subject Name Input */}
            <input
              type="text"
              placeholder="Enter subject name (e.g. Database Management System)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            />

            {/* College Dropdown */}
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            >
              <option value="">Select College</option>
              {uniqueCollegeList.map((col: string) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>

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
              className={`w-full px-4 py-3 rounded-lg shadow-sm focus:outline-none transition-all
                ${!selectedCategory 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 focus:ring-2 focus:ring-indigo-600'}
              `}
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

            {/* File upload */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Upload File</label>
              {!file ? (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center px-4 py-3 bg-indigo-50 border-2 border-dashed border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-all"
                >
                  Choose File
                </button>
              ) : (
                <div className="flex items-center justify-between bg-indigo-50 px-4 py-3 rounded-lg border border-indigo-200">
                  <span className="truncate text-indigo-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="ml-4 px-2 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {/* Legal Disclaimer Checkbox */}
            <div className="flex items-center">
              <input
                id="agree"
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="agree" className="text-gray-700 text-sm">
                I agree that my upload does not contain any copyrighted, illegal, or inappropriate content.
              </label>
              <button
                type="button"
                className="ml-2 text-xs text-blue-600 underline"
                onClick={() => setShowDisclaimer(true)}
              >
                Read Disclaimer
              </button>
            </div>

            {/* Upload Progress & Status */}
            {(loading || uploadStatus === 'processing') && (
              <div className="w-full">
                <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                  <div
                    className={`h-4 rounded-full transition-all ${uploadStatus === 'processing' ? 'bg-green-400 animate-pulse' : 'bg-indigo-600'}`}
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <span className="block text-center text-sm text-gray-700 mt-1">
                  {uploadStatus === 'processing'
                    ? 'Processing file...'
                    : `Uploading: ${uploadProgress}%`}
                </span>
              </div>
            )}

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-3 rounded-lg shadow-lg transition-all ${
                isFormValid
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading || uploadStatus === 'processing' ? 'Uploading...' : 'Upload Resource'}
            </button>
          </form>
        </div>
      </div>
      {showDisclaimer && <DisclaimerModal />}
    </div>
  );
};

export default UploadPage;