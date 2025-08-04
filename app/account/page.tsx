'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getFirestore, collection, query, where, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import toast from 'react-hot-toast';
import Navbar from '@/app/components/Navbar';
import Image from 'next/image';

const firestore = getFirestore();

interface Upload {
  id: string;
  title: string;
  college: string;
  course: string;
  semester: string;
  subject: string;
  drive_link: string;
  download_count: number;
  read_count?: number;
  created_at: string;
}

interface UserProfile {
  name: string;
  email: string;
  isVerified: boolean;
  isSuspicious: boolean;
  userType: string;
  createdAt: { seconds: number; nanoseconds: number } | string;
}

const AccountPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loadingUploads, setLoadingUploads] = useState(true);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = '/login';
      } else {
        setUser(user);
        setLoadingUser(false);

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(firestore, 'users', user.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          }
        } catch {
          toast.error('Could not load profile. Please try again later.');
          setProfile(null);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoadingUploads(true);
    const fetchUploads = async () => {
      try {
        let q = query(
          collection(firestore, 'resources'),
          where('uploaderId', '==', user.uid)
        );
        let querySnapshot = await getDocs(q);
        let uploadsArr = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<Upload, 'id'>),
        }));

        if (uploadsArr.length === 0) {
          q = query(
            collection(firestore, 'resources'),
            where('uploaderId', '==', user.email)
          );
          querySnapshot = await getDocs(q);
          uploadsArr = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Upload, 'id'>),
          }));
        }

        setUploads(uploadsArr);
      } catch (err: unknown) {
        if (typeof err === 'object' && err !== null && 'code' in err) {
          const errorWithCode = err as { code?: string };
          if (errorWithCode.code === 'permission-denied') {
            toast.error('You do not have permission to view uploads.');
          } else if (errorWithCode.code === 'unavailable') {
            toast.error('Network error. Please check your connection.');
          } else {
            toast.error('Something went wrong while loading uploads.');
          }
        } else {
          toast.error('Something went wrong while loading uploads.');
        }
      }
      setLoadingUploads(false);
    };
    fetchUploads();
  }, [user]);

  const handleDelete = async (id: string) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this upload?
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-500 text-white text-xs"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteDoc(doc(firestore, 'resources', id));
                  setUploads(uploads.filter(u => u.id !== id));
                  toast.success('Upload deleted.');
                } catch (err: unknown) {
                  if (typeof err === 'object' && err !== null && 'code' in err) {
                    const errorWithCode = err as { code?: string };
                    if (errorWithCode.code === 'permission-denied') {
                      toast.error('You do not have permission to delete this upload.');
                    } else if (errorWithCode.code === 'unavailable') {
                      toast.error('Network error. Please try again.');
                    } else {
                      toast.error('Failed to delete upload. Please try again.');
                    }
                  } else {
                    toast.error('Failed to delete upload. Please try again.');
                  }
                }
              }}
            >
              Yes, Delete
            </button>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 text-xs"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
          </div>
        </span>
      ),
      { duration: 8000 }
    );
  };

  function formatDate(val: string | { seconds: number; nanoseconds: number } | undefined | null) {
    if (!val) return '';
    if (typeof val === 'string') return new Date(val).toLocaleString();
    if (typeof val === 'object' && val.seconds)
      return new Date(val.seconds * 1000).toLocaleString();
    return '';
  }

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-[#f7f8fa] flex justify-center items-center">
        <span className="text-lg text-gray-600 animate-pulse">Loading profile...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <Navbar />
      <div className="max-w-3xl mx-auto py-8 px-2">
        {/* Profile Card */}
        <div className="mb-10 bg-white rounded-2xl shadow-xl p-8 border border-[#e0e0e0]">
          <div className="flex flex-col sm:flex-row items-center gap-6 mb-6">
            <div className="w-20 h-20 rounded-full bg-[#e0e7ff] flex items-center justify-center text-4xl text-[#2e3192] overflow-hidden shadow">
              {user?.photoURL ? (
                <Image src={user.photoURL} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
              ) : (
                (profile?.name?.[0] || user?.displayName?.[0] || user?.email?.[0] || 'U').toUpperCase()
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="font-bold text-2xl text-[#2e3192]">
                {profile?.name || user?.displayName || user?.email || 'No Name'}
              </div>
              <div className="text-gray-600 text-sm">{profile?.email || user?.email}</div>
              <div className="flex gap-2 mt-2 flex-wrap justify-center sm:justify-start">
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${profile?.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {profile?.isVerified ? 'Verified' : 'Not Verified'}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${profile?.isSuspicious ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>
                  {profile?.isSuspicious ? 'Suspicious' : 'Safe'}
                </span>
                {profile?.userType && (
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                    {profile.userType}
                  </span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Joined: {formatDate(profile?.createdAt)}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 bg-[#f4f6fb] rounded-xl p-4 text-center border border-[#e0e0e0]">
              <div className="font-semibold text-gray-700">Earnings</div>
              <div className="text-green-600 font-bold text-lg">Coming soon</div>
            </div>
            <div className="flex-1 bg-[#f4f6fb] rounded-xl p-4 text-center border border-[#e0e0e0]">
              <div className="font-semibold text-gray-700">Payment Method</div>
              <div className="text-gray-500 font-bold text-lg">Coming soon</div>
            </div>
          </div>
        </div>
        {/* Uploads */}
        <h2 className="text-xl font-bold mb-4 text-[#2e3192]">Your Uploads</h2>
        <div className="space-y-4">
          {loadingUploads ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border rounded-2xl p-4 bg-white shadow-lg animate-pulse h-20" />
            ))
          ) : uploads.length === 0 ? (
            <div className="text-gray-500 bg-white rounded-xl p-4 shadow text-center border border-[#e0e0e0]">No uploads yet.</div>
          ) : (
            uploads.map(upload => (
              <div
                key={upload.id}
                className="border border-[#e0e0e0] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white shadow-lg"
              >
                <div>
                  <div className="font-bold text-[#2e3192] text-base">{upload.title}</div>
                  <div className="text-xs text-gray-600 mb-1">
                    {upload.college} | {upload.course} | Sem {upload.semester} | {upload.subject}
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    Uploaded: {formatDate(upload.created_at)}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <a
                      href={upload.drive_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline text-xs font-medium"
                    >
                      View File
                    </a>
                    <span className="text-xs text-gray-700 font-semibold">
                      Downloads: {upload.download_count || 0}
                    </span>
                    <span className="text-xs text-gray-700 font-semibold">
                      Views: {upload.read_count || 0}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(upload.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-xs font-semibold mt-2 sm:mt-0 shadow"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;