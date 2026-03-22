const fs   = require('fs');
const path = require('path');

module.exports = async function uploader(id, meta = {}) {
  const file = path.resolve(`output/${id}.mp4`);
  if (!fs.existsSync(file)) { console.warn(`[uploader] Missing: ${file}`); return; }

  const mb = (fs.statSync(file).size / 1024 / 1024).toFixed(2);
  console.log(`[uploader] Ready: ${file} (${mb} MB)`);

  // ── YouTube Upload ─────────────────────────────────────────────────
  // Uncomment + add YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN in .env:
  //
  // const { google } = require('googleapis');
  // const auth = new google.auth.OAuth2(process.env.YT_CLIENT_ID, process.env.YT_CLIENT_SECRET);
  // auth.setCredentials({ refresh_token: process.env.YT_REFRESH_TOKEN });
  // const yt = google.youtube({ version: 'v3', auth });
  // const r = await yt.videos.insert({
  //   part: ['snippet','status'],
  //   requestBody: {
  //     snippet: { title: meta.title?.slice(0,70)||'AI Shorts', categoryId:'22', tags:['ai','shorts','viral'] },
  //     status: { privacyStatus:'public' }
  //   },
  //   media: { body: fs.createReadStream(file) }
  // });
  // console.log('[uploader] YouTube ID:', r.data.id);
};
