import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, getDocs, collection, query, where, orderBy } from 'firebase/firestore';
import type { Query, DocumentData } from 'firebase/firestore';

// Initialize Firebase only once (for hot reloads in dev)
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(firebaseApp);

// GET handler to fetch resources
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const college = searchParams.get('college');
    const category = searchParams.get('category');
    const course = searchParams.get('course');
    const semester = searchParams.get('semester');
    const subject = searchParams.get('subject');

    // Build Firestore query dynamically
    let q: Query<DocumentData> = collection(db, 'resources');
    const filters: import('firebase/firestore').QueryConstraint[] = [];

    if (college) filters.push(where('college', '==', college));
    if (category) filters.push(where('category', '==', category));
    if (course) filters.push(where('course', '==', course));
    if (semester) filters.push(where('semester', '==', semester));
    if (subject) filters.push(where('subject', '==', subject));

    if (filters.length > 0) {
      q = query(q, ...filters, orderBy('created_at', 'desc'));
    } else {
      q = query(q, orderBy('created_at', 'desc'));
    }

    const snapshot = await getDocs(q);
    const resources = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    // If no resources found, return a flag
    if (resources.length === 0) {
      return NextResponse.json({ success: true, data: [], message: 'No resources found' });
    }

    return NextResponse.json({ success: true, data: resources });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch resources' }, { status: 500 });
  }
}