'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { db } from '@/firebase'; // Import Firebase Firestore
import { collection, query, where, getDocs } from 'firebase/firestore';

type Note = {
  id: string;
  title: string;
  type: 'note' | 'assignment';
  url: string;
};

export default function NotesPage() {
  const searchParams = useSearchParams();
  const college = searchParams.get('college');
  const course = searchParams.get('course');
  const semester = searchParams.get('semester');
  const subject = searchParams.get('subject');

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (college && course && semester && subject) {
        try {
          // Query Firestore to get notes matching the selected parameters
          const notesRef = collection(db, 'notes'); // Assuming the collection name is "notes"
          const q = query(
            notesRef,
            where('college', '==', college),
            where('course', '==', course),
            where('semester', '==', semester),
            where('subject', '==', subject)
          );

          const querySnapshot = await getDocs(q);
          const fetchedNotes: Note[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          setNotes(fetchedNotes);
        } catch (err) {
          setError('Failed to fetch notes. Please try again later.');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNotes();
  }, [college, course, semester, subject]);

  if (loading) {
    return <div className="p-6 text-center">Loading notes...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }

  if (!college || !course || !semester || !subject) {
    return <div className="p-6 text-center text-red-500">Invalid access. Please go back and select all fields.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">
        {subject} - {semester} ({course}, {college})
      </h2>

      {notes.length === 0 ? (
        <p className="text-gray-500">No notes or assignments uploaded yet.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="border p-4 rounded shadow-sm bg-white">
              <p className="font-semibold text-lg">{note.title}</p>
              <p className="text-sm text-gray-600 capitalize">{note.type}</p>
              <a
                href={note.url}
                target="_blank"
                className="inline-block mt-2 text-blue-600 hover:underline"
                rel="noopener noreferrer"
              >
                View / Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
