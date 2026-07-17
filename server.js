const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'rsvps.json');
const WISHES_FILE = path.join(__dirname, 'wishes.json');

// Google Sheets proxy configurations (set via process.env.GOOGLE_SCRIPT_URL)
const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

const isGoogleScriptActive = () => {
  return GOOGLE_SCRIPT_URL && GOOGLE_SCRIPT_URL !== 'YOUR_GOOGLE_SCRIPT_URL';
};

// Middleware to parse JSON and URL-encoded form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Initialization Helpers
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), 'utf8');
      console.log('✓ RSVP Database initialized: rsvps.json');
    } catch (err) {
      console.error('Error initializing RSVP database:', err);
    }
  }
  if (!fs.existsSync(WISHES_FILE)) {
    try {
      fs.writeFileSync(WISHES_FILE, JSON.stringify([], null, 2), 'utf8');
      console.log('✓ Wishes Database initialized: wishes.json');
    } catch (err) {
      console.error('Error initializing wishes database:', err);
    }
  }
}

// Read database helper
function readData(filepath) {
  try {
    initDatabase();
    const rawData = fs.readFileSync(filepath, 'utf8');
    return JSON.parse(rawData);
  } catch (err) {
    console.error(`Error reading database file (${filepath}), returning empty array:`, err);
    return [];
  }
}

// Write database helper
function writeData(filepath, data) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing database file (${filepath}):`, err);
    return false;
  }
}

// ==========================================
// STATIC FRONTEND ROUTING
// ==========================================
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/app.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'app.js'));
});

app.use('/audio', express.static(path.join(__dirname, 'audio')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ==========================================
// ADMIN DASHBOARD ROUTING
// ==========================================
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// ==========================================
// API ENDPOINTS — RSVPS
// ==========================================

// 1. GET ALL RSVPS
app.get('/api/rsvp', async (req, res) => {
  let sortedData = [];

  if (isGoogleScriptActive()) {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=rsvp`);
      const googleData = await response.json();
      if (Array.isArray(googleData)) {
        sortedData = googleData.map(item => ({
          name: item.name,
          count: item.count,
          timestamp: item.timestamp
        }));
      }
    } catch (err) {
      console.error('Error fetching RSVPs from Google Sheets proxy, falling back to local file:', err);
      const data = readData(DB_FILE);
      sortedData = [...data];
    }
  } else {
    const data = readData(DB_FILE);
    sortedData = [...data];
  }

  // Sort descending (newest confirmations first)
  sortedData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  const totalGroups = sortedData.length;
  const totalGuests = sortedData.reduce((acc, curr) => {
    const countVal = curr.count === '5+' ? 5 : parseInt(curr.count, 10);
    return acc + (isNaN(countVal) ? 1 : countVal);
  }, 0);

  res.json({
    success: true,
    totalGroups,
    totalGuests,
    data: sortedData
  });
});

// 2. POST NEW RSVP
app.post('/api/rsvp', async (req, res) => {
  const { guestName, guestCount } = req.body;

  if (!guestName || typeof guestName !== 'string' || guestName.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'A valid guest name is required.'
    });
  }

  if (!guestCount) {
    return res.status(400).json({
      success: false,
      message: 'Guest count must be selected.'
    });
  }

  if (isGoogleScriptActive()) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'rsvp', name: guestName, count: guestCount })
      });
      const result = await response.json();
      if (result.success) {
        console.log(`[RSVP-Sheets] Registered: "${guestName}" (${guestCount} guests)`);
        return res.json({
          success: true,
          message: `Thank you, ${guestName}! Your response has been received.`
        });
      }
    } catch (err) {
      console.error('Error posting RSVP to Google Sheets proxy, falling back to local file:', err);
    }
  }

  // Fallback to local flat file database
  const database = readData(DB_FILE);
  const newRsvp = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    name: guestName.trim(),
    count: guestCount,
    timestamp: new Date().toISOString()
  };

  database.push(newRsvp);
  
  const writeSuccess = writeData(DB_FILE, database);
  if (!writeSuccess) {
    return res.status(500).json({
      success: false,
      message: 'Failed to write registration to database.'
    });
  }

  console.log(`[RSVP-Local] Registered: "${newRsvp.name}" (${newRsvp.count} guests)`);

  res.json({
    success: true,
    message: `Thank you, ${newRsvp.name}! Your response has been received.`
  });
});

// ==========================================
// API ENDPOINTS — WISHES (GUESTBOOK)
// ==========================================

// 1. GET ALL WISHES
app.get('/api/wishes', async (req, res) => {
  let sortedWishes = [];

  if (isGoogleScriptActive()) {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=wish`);
      const googleWishes = await response.json();
      if (Array.isArray(googleWishes)) {
        sortedWishes = googleWishes;
      }
    } catch (err) {
      console.error('Error fetching wishes from Google Sheets proxy, falling back to local file:', err);
      const data = readData(WISHES_FILE);
      sortedWishes = [...data];
    }
  } else {
    const data = readData(WISHES_FILE);
    sortedWishes = [...data];
  }

  // Sort descending (newest comments first)
  sortedWishes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json({
    success: true,
    data: sortedWishes
  });
});

// 2. POST NEW WISH
app.post('/api/wishes', async (req, res) => {
  const { name, message } = req.body;

  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Your name is required.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Please write a message.'
    });
  }

  if (isGoogleScriptActive()) {
    try {
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'wish', name, message })
      });
      const result = await response.json();
      if (result.success) {
        console.log(`[WISH-Sheets] New greeting from: "${name}"`);
        return res.json({
          success: true,
          message: 'Thank you for your warm wishes!'
        });
      }
    } catch (err) {
      console.error('Error posting wish to Google Sheets proxy, falling back to local file:', err);
    }
  }

  // Fallback to local flat file database
  const wishes = readData(WISHES_FILE);
  const newWish = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    name: name.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString()
  };

  wishes.push(newWish);

  const writeSuccess = writeData(WISHES_FILE, wishes);
  if (!writeSuccess) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save wish to database.'
    });
  }

  console.log(`[WISH-Local] New greeting from: "${newWish.name}"`);

  res.json({
    success: true,
    message: 'Thank you for your warm wishes!'
  });
});

// ==========================================
// START SERVER
// ==========================================
initDatabase();

app.listen(PORT, () => {
  console.log(`==========================================`);
  console.log(`Champagne Luxury Wedding Server Running`);
  console.log(`Local Access: http://localhost:${PORT}`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`==========================================`);
});

module.exports = app;
