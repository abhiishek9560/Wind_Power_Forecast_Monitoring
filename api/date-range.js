const fs = require('fs');
const path = require('path');

// Load data
let actualData = [];
try {
  const dataPath = path.join(__dirname, '..', 'server', 'data', 'actual.json');
  actualData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
} catch (error) {
  console.error('Error loading actual data:', error.message);
}

module.exports = (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (actualData.length === 0) {
      return res.json({ minDate: null, maxDate: null });
    }

    const dates = actualData.map(r => new Date(r.startTime));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    res.json({
      minDate: minDate.toISOString(),
      maxDate: maxDate.toISOString()
    });
  } catch (error) {
    console.error('Error getting date range:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
