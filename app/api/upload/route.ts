// app/api/upload/route.ts
import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs/promises';

export const config = {
  api: {
    bodyParser: false, // Required for file uploads
  },
};

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!),
  scopes: ['https://www.googleapis.com/auth/drive'],
});

async function getOrCreateFolder(drive: any, name: string, parentId?: string) {
  const res = await drive.files.list({
    q: `'${parentId || 'root'}' in parents and name = '${name}' and mimeType = 'application/vnd.google-apps.folder'`,
    fields: 'files(id, name)',
  });

  if (res.data.files.length > 0) return res.data.files[0].id;

  const folder = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId || 'root'],
    },
    fields: 'id',
  });

  return folder.data.id;
}

export async function POST(req: NextRequest) {
  const form = formidable({ multiples: false });

  const { fields, files }: any = await new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { title, college, course, semester, subject } = fields;
  const file = files.file[0];

  const authClient = await auth.getClient();
  const drive = google.drive({ version: 'v3', auth: authClient });

  // Dynamic folder structure
  const collegeFolder = await getOrCreateFolder(drive, college);
  const courseFolder = await getOrCreateFolder(drive, course, collegeFolder);
  const semesterFolder = await getOrCreateFolder(drive, `Sem_${semester}`, courseFolder);
  const subjectFolder = await getOrCreateFolder(drive, subject, semesterFolder);

  const fileMetadata = {
    name: file.originalFilename,
    parents: [subjectFolder],
  };

  const media = {
    mimeType: file.mimetype,
    body: await fs.readFile(file.filepath),
  };

  const uploaded = await drive.files.create({
    requestBody: fileMetadata,
    media,
    fields: 'id, webViewLink',
  });

  await supabase.from('resources').insert({
    title,
    college,
    course,
    semester,
    subject,
    drive_link: uploaded.data.webViewLink,
  });

  return NextResponse.json({ success: true, link: uploaded.data.webViewLink });
}
