const creds = process.env.GOOGLE_DRIVE_BACKUP_SERVICE_ACCOUNT_JSON;
if (!creds) {
  console.log("NO CREDENTIALS FOUND");
} else {
  try {
    const parsed = JSON.parse(creds);
    console.log("JSON is valid. Keys:", Object.keys(parsed));
  } catch(e) {
    console.log("JSON IS INVALID:", e.message);
  }
}
const folderId = process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID;
console.log("Folder ID:", folderId ? folderId.substring(0, 5) + "..." : "NOT SET");
