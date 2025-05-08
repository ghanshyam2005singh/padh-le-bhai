'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collegeData } from '@/constant/collegeList';
import { auth } from '@/component/auth'; // Ensure you import Firebase auth
import { sendLoginEmailLink } from '../pages/finishSignUp'; // Make sure this function is implemented to send login email link
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export default function CollegeForm() {
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [user, setUser] = useState(null); // Track the user state

  const router = useRouter();

  const college = collegeData.find((c) => c.name === selectedCollege);
  const course = college?.courses.find((c) => c.name === selectedCourse);
  const semester = course?.semesters.find((s) => s.name === selectedSemester);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleContinue = async () => {
    if (selectedCollege && selectedCourse && selectedSemester && selectedSubject) {
      if (!user) {
        // User is not authenticated, send email link to log in
        const email = prompt('Please enter your email for authentication');
        if (email) {
          await sendLoginEmailLink(email); // Function that sends the email link
          alert('Check your email for the login link!');
        }
      } else {
        // If user is authenticated, proceed to the notes page
        const query = new URLSearchParams({
          college: selectedCollege,
          course: selectedCourse,
          semester: selectedSemester,
          subject: selectedSubject,
        }).toString();
        router.push(`/notes?${query}`);
      }
    }
  };

  return (
    <form className="space-y-4 p-4 max-w-xl mx-auto mt-10">
      {/* College Dropdown */}
      <select
        className="w-full p-2 border rounded text-black bg-white"
        value={selectedCollege}
        onChange={(e) => {
          setSelectedCollege(e.target.value);
          setSelectedCourse('');
          setSelectedSemester('');
          setSelectedSubject('');
        }}
      >
        <option value="">Select College</option>
        {collegeData.map((c) => (
          <option key={c.name} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Course Dropdown */}
      {college && (
        <select
          className="w-full p-2 border rounded text-black bg-white"
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setSelectedSemester('');
            setSelectedSubject('');
          }}
        >
          <option value="">Select Course</option>
          {college.courses.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      )}

      {/* Semester Dropdown */}
      {course && (
        <select
          className="w-full p-2 border rounded text-black bg-white"
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setSelectedSubject('');
          }}
        >
          <option value="">Select Semester</option>
          {course.semesters.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
      )}

      {/* Subject Dropdown */}
      {semester && (
        <select
          className="w-full p-2 border rounded text-black bg-white"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">Select Subject</option>
          {semester.subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {/* Continue Button */}
      <button
        type="button"
        onClick={handleContinue}
        disabled={!selectedCollege || !selectedCourse || !selectedSemester || !selectedSubject}
        className={`w-full p-2 rounded text-white ${
          selectedCollege && selectedCourse && selectedSemester && selectedSubject
            ? 'bg-green-600 hover:bg-green-700'
            : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Continue
      </button>
    </form>
  );
}
