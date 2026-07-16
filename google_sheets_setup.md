# 📊 Google Sheets Backend Integration Guide

Follow this simple, step-by-step guide to connect your wedding invitation's RSVP form and wishes greeting board directly to a free **Google Sheet**.

---

## 📅 Step 1: Create a Google Sheet
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. Name the spreadsheet (e.g., `Wedding Reception RSVPs & Wishes`).
3. Rename the default sheet (tab) in the bottom-left corner to:
   - **`Wishes`** (this is where guest messages will go).
4. Create a second sheet (tab) by clicking the `+` button in the bottom-left corner and name it:
   - **`RSVPs`** (this is where RSVP responses will go).

---

## 🛠️ Step 2: Open Google Apps Script
1. Inside your spreadsheet, click **Extensions** in the top menu.
2. Select **Apps Script**.
3. Delete any default code in the editor (e.g., `function myFunction() { ... }`).
4. Copy and paste the following Google Apps Script code into the editor:

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var params = JSON.parse(e.postData.contents);
  var action = params.action; // 'rsvp' or 'wish'
  
  if (action === 'rsvp') {
    var targetSheet = sheet.getSheetByName('RSVPs') || sheet.insertSheet('RSVPs');
    if (targetSheet.getLastRow() === 0) {
      targetSheet.appendRow(['Timestamp', 'Name', 'Guest Count']);
    }
    targetSheet.appendRow([
      new Date(),
      params.name,
      params.count
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'wish') {
    var targetSheet = sheet.getSheetByName('Wishes') || sheet.insertSheet('Wishes');
    if (targetSheet.getLastRow() === 0) {
      targetSheet.appendRow(['Timestamp', 'Name', 'Message']);
    }
    targetSheet.appendRow([
      new Date(),
      params.name,
      params.message
    ]);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Invalid action' }))
                       .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var targetSheet = sheet.getSheetByName('Wishes');
  var wishes = [];
  
  if (targetSheet) {
    var data = targetSheet.getDataRange().getValues();
    // Assuming row 0 is header: ['Timestamp', 'Name', 'Message']
    for (var i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][2]) {
        wishes.push({
          timestamp: data[i][0],
          name: data[i][1],
          message: data[i][2]
        });
      }
    }
  }
  
  // Show newest wishes first
  wishes.reverse();
  
  return ContentService.createTextOutput(JSON.stringify(wishes))
                       .setMimeType(ContentService.MimeType.JSON);
}
```

---

## 🌐 Step 3: Deploy as a Web App
1. In the top-right of the Apps Script page, click the blue **Deploy** button and select **New deployment**.
2. Click the gear icon next to "Select type" and select **Web app**.
3. Fill in the deployment details:
   - **Description**: `Wedding Backend API`
   - **Execute as**: **Me (your_email@gmail.com)**
   - **Who has access**: **Anyone** *(This is critical! If set to only you, guests will not be able to send RSVPs).*
4. Click **Deploy**.
5. Google may ask you to **Authorize Access**. Click "Authorize Access", sign in with your Google account, click "Advanced" (unsafe warning), and select **"Go to Untitled project (unsafe)"** to grant permission.
6. Copy the **Web App URL** generated in the window (it will look like: `https://script.google.com/macros/s/AKfycb.../exec`).

---

## 🔗 Step 4: Link to Your Website Code
1. Open your code editor and edit the file:
   - **`Wedding-Invitation/app.js`**
2. Find the configuration block at the top of the file (around lines 8–12):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_URL';
   ```
3. Replace `'YOUR_GOOGLE_SCRIPT_URL'` with the Apps Script Web App URL you copied in Step 3.
4. Save the file.
5. Push the change to your GitHub repository:
   ```bash
   git add app.js
   git commit -m "chore: connect Google Sheets backend"
   git push origin main
   ```

🎉 Your GitHub Pages site is now fully connected to your Google Sheet! All wishes and RSVPs will update in real-time.
