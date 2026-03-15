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
    const { startTime, endTime } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    const filtered = actualData.filter(record => {
      const recordTime = new Date(record.startTime);
      return recordTime >= start && recordTime <= end;
    });

    // Sort by startTime
    filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching actual data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
