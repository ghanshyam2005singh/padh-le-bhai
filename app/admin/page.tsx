'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import Navbar from '@/app/components/Navbar';
import toast from 'react-hot-toast';

type User = {
  id: string;
  name?: string;
  displayName?: string;
  email: string;
  userType?: string;
  isVerified?: boolean;
  isSuspicious?: boolean;
  createdAt?: Date | { seconds: number } | string;
};

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL as string;
const firestore = getFirestore();

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  type Resource = {
    id: string;
    title?: string;
    uploaderId?: string;
    college?: string;
    course?: string;
    semester?: string;
    subject?: string;
    download_count?: number;
    unique_downloads?: number;
    read_count?: number;
    unique_reads?: number;
    created_at?: Date | { seconds: number } | string;
    drive_link?: string;
  };
  
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const totalReads = resources.reduce((sum, r) => sum + (r.read_count || 0), 0);
  const totalUniqueReads = resources.reduce((sum, r) => sum + (r.unique_reads || 0), 0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u || u.email !== ADMIN_EMAIL) {
        toast.error('Access denied. Admins only.');
        window.location.replace('/');
        return;
      }
      try {
        const usersSnap = await getDocs(collection(firestore, 'users'));
        setUsers(
          usersSnap.docs
            .map(doc => {
              const data = doc.data();
              // Ensure email is present, fallback to empty string if missing
              return { id: doc.id, ...data, email: data.email ?? '' } as User;
            })
            .filter(u => u.email) // Optionally filter out users without email
        );
        const resSnap = await getDocs(collection(firestore, 'resources'));
        setResources(resSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch {
        toast.error('Failed to load admin data.');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const totalDownloads = resources.reduce((sum, r) => sum + (r.download_count || 0), 0);
  const totalUniqueDownloads = resources.reduce((sum, r) => sum + (r.unique_downloads || 0), 0);

  const handleDeleteUser = async (userId: string) => {
    toast(
      (t) => (
        <span>
          Are you sure you want to delete this user? This cannot be undone.
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-500 text-white text-xs"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteDoc(doc(firestore, 'users', userId));
                  setUsers(users.filter(u => u.id !== userId));
                  toast.success('User deleted.');
                } catch {
                  toast.error('Failed to delete user.');
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

  const handleBanUser = async (userId: string) => {
    try {
      await updateDoc(doc(firestore, 'users', userId), { isSuspicious: true });
      setUsers(users.map(u => u.id === userId ? { ...u, isSuspicious: true } : u));
      toast.success('User banned.');
    } catch {
      toast.error('Failed to ban user.');
    }
  };

  const handleUnbanUser = async (userId: string) => {
    try {
      await updateDoc(doc(firestore, 'users', userId), { isSuspicious: false });
      setUsers(users.map(u => u.id === userId ? { ...u, isSuspicious: false } : u));
      toast.success('User unbanned.');
    } catch {
      toast.error('Failed to unban user.');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    toast(
      (t) => (
        <span>
          Delete this resource?
          <div className="mt-2 flex gap-2">
            <button
              className="px-3 py-1 rounded bg-red-500 text-white text-xs"
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await deleteDoc(doc(firestore, 'resources', resourceId));
                  setResources(resources.filter(r => r.id !== resourceId));
                  toast.success('Resource deleted.');
                } catch {
                  toast.error('Failed to delete resource.');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-pink-50">
        <span className="text-lg text-gray-600 animate-pulse">Loading admin dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      <Navbar />
      <div className="max-w-7xl mx-auto py-8 px-2">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">Admin Dashboard</h1>
        {/* Analytics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-indigo-100 rounded-xl shadow p-4 text-center font-semibold">
            <div className="text-2xl font-bold text-indigo-700">{users.length}</div>
            <div className="text-gray-700 text-sm">Total Users</div>
          </div>
          <div className="bg-indigo-100 rounded-xl shadow p-4 text-center font-semibold">
            <div className="text-2xl font-bold text-indigo-700">{resources.length}</div>
            <div className="text-gray-700 text-sm">Total Uploads</div>
          </div>
          <div className="bg-indigo-100 rounded-xl shadow p-4 text-center font-semibold">
            <div className="text-2xl font-bold text-indigo-700">{totalDownloads}</div>
            <div className="text-gray-700 text-sm">Total Downloads</div>
          </div>
          <div className="bg-indigo-100 rounded-xl shadow p-4 text-center font-semibold">
            <div className="text-2xl font-bold text-indigo-700">{totalUniqueDownloads}</div>
            <div className="text-gray-700 text-sm">Unique Downloads</div>
          </div>
          <div className="bg-indigo-100 rounded-xl shadow p-4 text-center font-semibold">
            <div className="text-2xl font-bold text-indigo-700">{totalReads}</div>
            <div className="text-gray-700 text-sm">Total Views</div>
          </div>
          <div className="bg-indigo-100 rounded-xl shadow p-4 text-center font-semibold">
            <div className="text-2xl font-bold text-indigo-700">{totalUniqueReads}</div>
            <div className="text-gray-700 text-sm">Unique Views</div>
          </div>
        </div>
        {/* Users Table */}
        <h2 className="text-xl font-bold mb-2 text-indigo-700">Users</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full bg-white rounded-xl shadow text-xs md:text-sm">
            <thead>
              <tr className="bg-indigo-50 font-semibold text-gray-900">
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">Verified</th>
                <th className="p-2 text-left">Uploads</th>
                <th className="p-2 text-left">Downloads</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Joined</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-indigo-50 font-medium text-gray-800">
                  <td className="p-2">{u.name || u.displayName || '-'}</td>
                  <td className="p-2 break-all">{u.email}</td>
                  <td className="p-2 capitalize">{u.userType || '-'}</td>
                  <td className="p-2">{u.isVerified ? '✅' : '❌'}</td>
                  <td className="p-2">{resources.filter(r => r.uploaderId === u.id || r.uploaderId === u.email).length}</td>
                  <td className="p-2">
                    {resources
                      .filter(r => r.uploaderId === u.id || r.uploaderId === u.email)
                      .reduce((sum, r) => sum + (r.download_count || 0), 0)}
                  </td>
                  <td className="p-2">
                    {u.isSuspicious ? (
                      <span className="text-red-600 font-semibold">Banned</span>
                    ) : (
                      <span className="text-green-600 font-semibold">Active</span>
                    )}
                  </td>
                  <td className="p-2 text-xs">
                    {u.createdAt
                      ? (typeof u.createdAt === 'object' && u.createdAt !== null && 'seconds' in u.createdAt)
                        ? new Date((u.createdAt as { seconds: number }).seconds * 1000).toLocaleDateString()
                        : new Date(u.createdAt as string | Date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="p-2 flex flex-col gap-1 md:flex-row md:gap-2">
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                    {u.isSuspicious ? (
                      <button
                        onClick={() => handleUnbanUser(u.id)}
                        className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBanUser(u.id)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs"
                      >
                        Ban
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Resources Table */}
       <h2 className="text-xl font-bold mb-2 text-indigo-700">Resources</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow text-xs md:text-sm">
            <thead>
              <tr className="bg-indigo-50 font-semibold text-gray-900">
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Uploader</th>
                <th className="p-2 text-left">College</th>
                <th className="p-2 text-left">Course</th>
                <th className="p-2 text-left">Semester</th>
                <th className="p-2 text-left">Subject</th>
                <th className="p-2 text-left">Downloads</th>
                <th className="p-2 text-left">Unique</th>
                <th className="p-2 text-left">Views</th>
                <th className="p-2 text-left">Unique</th>
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r.id} className="border-t hover:bg-indigo-50 font-medium text-gray-800">
                  <td className="p-2">{r.title}</td>
                  <td className="p-2 break-all">{r.uploaderId}</td>
                  <td className="p-2">{r.college || '-'}</td>
                  <td className="p-2">{r.course || '-'}</td>
                  <td className="p-2">{r.semester || '-'}</td>
                  <td className="p-2">{r.subject || '-'}</td>
                  <td className="p-2">{r.download_count || 0}</td>
                  <td className="p-2">{r.unique_downloads || 0}</td>
                  <td className="p-2">{r.read_count || 0}</td>
                  <td className="p-2">{r.unique_reads || 0}</td>
                  <td className="p-2 text-xs">
                    {r.created_at
                      ? (typeof r.created_at === 'object' && r.created_at !== null && 'seconds' in r.created_at)
                        ? new Date((r.created_at as { seconds: number }).seconds * 1000).toLocaleDateString()
                        : new Date(r.created_at as string | Date).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="p-2 flex gap-2">
                    <a href={r.drive_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">View</a>
                    <button
                      onClick={() => handleDeleteResource(r.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Abuse Prevention Note */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-xl text-yellow-800 text-xs md:text-sm">
          <strong>Abuse Prevention:</strong> Admins can ban/unban users, delete users/resources, and monitor all activity. Please review suspicious activity regularly.
        </div>
      </div>
    </div>
  );
}