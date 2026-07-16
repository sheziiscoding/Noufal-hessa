# 🚀 Deploying to Vercel with Google Sheets Database Integration

This guide explains how to deploy your wedding invitation to Vercel (completely free) and connect the Node.js backend to your Google Sheets database.

---

## 📂 Architecture Overview
1. **Frontend**: The browser makes requests directly to your Vercel deployment's endpoints (`/api/rsvp` and `/api/wishes`). There are no CORS headers or client-side Google URLs needed.
2. **Backend**: Vercel hosts your Express server as a fast Serverless Function. 
3. **Database**: Since serverless environments are read-only and reset frequently, your Express backend will automatically save all RSVPs and wishes to your **Google Sheet**!

---

## 🛠️ Step 1: Push latest changes to GitHub
Verify you have committed all the files and pushed them to your repository:
```bash
git add .
git commit -m "feat: configure vercel routing and hybrid google sheets server proxy"
git push origin main
```

---

## 🌐 Step 2: Deploy to Vercel
1. Go to [Vercel.com](https://vercel.com) and sign in with your GitHub account.
2. Click **Add New** ➔ **Project**.
3. Import your `Wedding-Invitation` repository.
4. Click **Deploy**. Vercel will automatically read `vercel.json`, compile your code, and deploy your site in less than 1 minute!

---

## 🔐 Step 3: Enable Google Sheets Persistence
To prevent RSVPs and wishes from disappearing when the Vercel server restarts, add your Google Script URL as an environment variable:

1. Inside your Vercel Dashboard, select your project.
2. Click **Settings** in the top menu, then select **Environment Variables** in the left sidebar.
3. Add a new variable:
   - **Key**: `GOOGLE_SCRIPT_URL`
   - **Value**: `https://script.google.com/macros/s/AKfycbxJPyXN-1xs-g40lFQq2m38-1MRGmMKsj_3Pu_LcDnrG0EWEhaSggTly_lxYtCyY49N/exec` *(Your Google Web App URL)*
4. Click **Save**.
5. **Redeploy** to apply the settings: Go to the **Deployments** tab, click the three dots `...` next to your latest deployment, and click **Redeploy**.

🎉 Done! Your wedding site is now live on Vercel. All registrations and greetings are saved directly to your Google Sheets spreadsheet in real-time.
