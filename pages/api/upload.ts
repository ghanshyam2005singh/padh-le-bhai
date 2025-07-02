import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import { Readable } from 'stream';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Disable body parsing so we can use formidable
export const config = {
  api: {
    bodyParser: false,
  },
};

// Initialize Firebase Admin only once
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY!)),
  });
}
const db = getFirestore();

// Google Drive auth
const googleAuth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

// Helper: create nested folder if not exists
async function getOrCreateFolder(
  drive: import('googleapis').drive_v3.Drive,
  name: string,
  parentId?: string
): Promise<string> {
  const res = await drive.files.list({
    q: `'${parentId || 'root'}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
    fields: 'files(id, name)',
  });

  if (res.data.files && res.data.files.length > 0) return res.data.files[0].id as string;

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || 'root'],
    },
    fields: 'id',
  });

  return folder.data.id as string;
}

// Helper: Parse multipart/form-data request
import type { IncomingMessage } from 'http';

async function parseFormData(
  req: NextApiRequest
): Promise<{ fields: Record<string, string>; file: File }> {
  const nodeReq: IncomingMessage = req as unknown as IncomingMessage;
  const form = formidable({ multiples: false });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      const file = (Array.isArray(files.file) ? files.file[0] : files.file) as File;
      const normalizedFields: Record<string, string> = {};
      for (const key in fields) {
        const value = fields[key];
        if (Array.isArray(value)) {
          normalizedFields[key] = value[0];
        } else if (typeof value === 'string') {
          normalizedFields[key] = value;
        }
      }
      resolve({ fields: normalizedFields, file });
    });
  });
}

// Helper: Get user name from Firestore
async function getUserName(userId: string): Promise<string> {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      return userData?.name || 'Anonymous';
    }
    return 'Anonymous';
  } catch (error) {
    console.error('Error fetching user name:', error);
    return 'Anonymous';
  }
}

// POST: Handle file upload and Firestore metadata save
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // --- SECURITY: Verify Firebase ID token ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized: No token' });
  }
  const idToken = authHeader.split('Bearer ')[1];
  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
  // ------------------------------------------

  try {
    const { fields, file } = await parseFormData(req);
    const { title, college, category, course, semester } = fields;

    // Get user information from Firestore users collection
    const userEmail = decodedToken.email || 'Anonymous';
    const userName = await getUserName(decodedToken.uid);

    console.log('User Info:', { 
      userId: decodedToken.uid,
      email: userEmail,
      fetchedName: userName 
    });

    // Authenticate with Google Drive
    const authClient = await googleAuth.getClient() as import('google-auth-library').OAuth2Client;
    const drive = google.drive({ version: 'v3', auth: authClient });

    // Create folder structure: College > Course > Sem_X > Subject
    const collegeFolder = await getOrCreateFolder(drive, college);
    const courseFolder = await getOrCreateFolder(drive, course, collegeFolder);
    const semesterFolder = await getOrCreateFolder(drive, `Sem_${semester}`, courseFolder);
    const subjectFolder = await getOrCreateFolder(drive, title, semesterFolder); // Use title as subject name

    // Upload file to Drive
    const fileMetadata = {
      name: file.originalFilename,
      parents: [subjectFolder],
    };

    const fileBuffer = await fs.readFile(file.filepath);
    const media = {
      mimeType: file.mimetype || undefined,
      body: Readable.from(fileBuffer),
    };

    const uploaded = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: 'id, webViewLink',
    });

    // Make file shareable (publicly viewable)
    if (!uploaded.data.id) {
      throw new Error('Failed to upload file to Google Drive.');
    }
    await drive.permissions.create({
      fileId: uploaded.data.id as string,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    // Save metadata in Firestore
    await db.collection('resources').add({
      title,
      college,
      category,
      course,
      semester,
      subject: title, // Use title as subject name for consistency
      drive_link: uploaded.data.webViewLink,
      created_at: new Date().toISOString(),
      uploaderId: decodedToken.uid,
      uploader: userName, // This will now be fetched from users collection
      uploaderEmail: userEmail,
      download_count: 0,
      read_count: 0,
    });

    res.status(200).json({ success: true, link: uploaded.data.webViewLink });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: 'Upload failed' });
  }
}