const { google } = require('googleapis');
const creds = JSON.parse(process.env.GOOGLE_DRIVE_BACKUP_SERVICE_ACCOUNT_JSON);
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: creds.client_email,
    private_key: creds.private_key,
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

async function run() {
  try {
    const res = await drive.files.get({
      fileId: process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID,
      fields: 'id, name, mimeType'
    });
    console.log("Folder found:", res.data);
  } catch (e) {
    console.log("Error:", e.message);
  }
}
run();
