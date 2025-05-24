'use client';

import { useState } from 'react';

const UploadPage = () => {
  const [college, setCollege] = useState('');
  const [course, setCourse] = useState('');
  const [semester, setSemester] = useState('');
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!college || !course || !semester || !subject || !file || !title) {
      setError('Please fill all fields and select a file.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('college', college);
      formData.append('course', course);
      formData.append('semester', semester);
      formData.append('subject', subject);
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        alert('Uploaded! View: ' + data.link);
        // Optionally reset form
        setTitle('');
        setCollege('');
        setCourse('');
        setSemester('');
        setSubject('');
        setFile(null);
      } else {
        setError('Upload failed');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex justify-center items-center">
      <div className="max-w-2xl w-full p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-4xl font-extrabold text-center text-indigo-700 mb-8">
          Upload Study Resource
        </h1>

        <form
          onSubmit={handleUpload}
          className="space-y-6"
        >
          {/* Title Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Enter title (e.g. DBMS Notes)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            />
          </div>

          {/* Dropdowns */}
          <div className="relative">
            <select
              value={college}
              onChange={(e) => setCollege(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            >
              <option value="">Select College</option>
              <option value="iitd">IIT Delhi</option>
              <option value="nits">NIT Surat</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            >
              <option value="">Select Course</option>
              <option value="btech">B.Tech</option>
              <option value="mca">MCA</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            >
              <option value="">Select Semester</option>
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
            </select>
          </div>

          <div className="relative">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            >
              <option value="">Select Subject</option>
              <option value="math">Math</option>
              <option value="dbms">DBMS</option>
            </select>
          </div>

          {/* File upload */}
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-600 focus:outline-none transition-all"
            />
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all"
            >
              {loading ? 'Uploading...' : 'Upload Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadPage;