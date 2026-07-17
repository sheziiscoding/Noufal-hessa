# 📋 Pre-Hosting Checklist & Audit Report

Before deploying your Champagne Luxury wedding invitation to Vercel, please complete the following steps to ensure all features (music, photos, RSVPs, guestbook) are fully operational and optimized.

---

## 🎵 1. Music Asset Configuration (CRITICAL)
- **Status**: 🟢 **Completed**
- **Details**: In `index.html`, the audio player is configured to load `audio/background.mp3`.
- **Status Update**: You have successfully placed `background.mp3` inside your `audio/` directory. It is committed and ready!

---

## 📸 2. Image Optimization for Mobile Users
- **Status**: ⚠️ **Recommended Optimization**
- **Details**: Your `images/` folder contains three photos:
  - `pic1.jpg` (112 KB) — *Good size*
  - `pic2.jpg` (1.1 MB) — 🔴 **Too Large!**
  - `pic3.jpg` (473 KB) — *Okay size*
- **Issue**: A 1.1 MB image takes a long time to load on mobile networks. This will cause the middle gallery slide to load slowly or lag when guests swipe.
- **Fix**: Compress `pic2.jpg` to a size under **300–400 KB** (using free tools like [TinyJPG](https://tinyjpg.com/) or Photoshop) before pushing to GitHub.

---

## 📊 3. Database Persistence Setup (CRITICAL)
- **Status**: 🔴 **Action Required on Vercel**
- **Details**: Vercel runs your Express backend in an ephemeral, serverless environment. This means any local writes to `rsvps.json` and `wishes.json` will be **wiped out** whenever the Vercel server restarts (which happens frequently).
- **Fix**:
  1. Open a Google Sheet and name your tabs `RSVPs` and `Wishes`.
  2. Paste the script from `google_sheets_setup.md` into the Google Apps Script editor.
  3. Deploy it as a **Web App** (Access: **Anyone**).
  4. Save the generated Web App URL.
  5. Go to your **Vercel Dashboard ➔ Settings ➔ Environment Variables**, and add:
     - **Key**: `GOOGLE_SCRIPT_URL`
     - **Value**: `[Your Google Web App URL]`
  6. Redeploy the project on Vercel to activate database syncing.

---

## 🚀 4. Verification Check
- **Status**: 🟢 **Passed**
- **Details**: Code compilation, styling declarations, and HTML tag hierarchies have been validated. All pages (`index.html`, `admin.html`, `styles.css`, `app.js`, `server.js`) are syntactically and structurally correct and ready to launch.
