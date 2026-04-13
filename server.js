require('dotenv').config();
const express = require('express');
const path = require('path');
const { appendWaitlistEntry } = require('./sheets');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/waitlist', async (req, res) => {
  const { email, zip } = req.body || {};

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!zip || !/^\d{5}$/.test(zip)) {
    return res.status(400).json({ error: 'Please enter a valid 5-digit zip code.' });
  }

  try {
    await appendWaitlistEntry(email, zip);
    return res.json({ ok: true });
  } catch (err) {
    console.error('Sheets error:', err.message);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

module.exports = app;
