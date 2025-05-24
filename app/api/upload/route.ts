import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import formidable, { File } from 'formidable';
import fs from 'fs/promises';
import { Readable } from 'stream';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

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
  req: NextRequest
): Promise<{ fields: Record<string, string>; file: File }> {
  // Get the underlying Node.js IncomingMessage (req) from NextRequest
  const nodeReq: IncomingMessage = req as unknown as IncomingMessage;

  const form = formidable({ multiples: false });

  return new Promise((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) return reject(err);
      const file = (Array.isArray(files.file) ? files.file[0] : files.file) as File;
      // Convert formidable fields to Record<string, string>
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

// POST: Handle file upload and Firestore metadata save
export async function POST(req: NextRequest) {
  try {
    const { fields, file } = await parseFormData(req);
    const { title, college, course, semester, subject, uploaderId } = fields;

    // Authenticate with Google Drive
    const authClient = await googleAuth.getClient() as import('google-auth-library').OAuth2Client;
    const drive = google.drive({ version: 'v3', auth: authClient });

    // Create folder structure: College > Course > Sem_X > Subject
    const collegeFolder = await getOrCreateFolder(drive, college);
    const courseFolder = await getOrCreateFolder(drive, course, collegeFolder);
    const semesterFolder = await getOrCreateFolder(drive, `Sem_${semester}`, courseFolder);
    const subjectFolder = await getOrCreateFolder(drive, subject, semesterFolder);

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
      course,
      semester,
      subject,
      drive_link: uploaded.data.webViewLink,
      created_at: new Date().toISOString(),
      uploaderId: uploaderId || null,
      download_count: 0, // For payout logic
    });

    return NextResponse.json({ success: true, link: uploaded.data.webViewLink });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ success: false, error: 'Upload failed' }, { status: 500 });
  }
}