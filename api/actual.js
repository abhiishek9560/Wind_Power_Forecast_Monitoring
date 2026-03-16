const fs = require('fs');
const path = require('path');

// Load data - handle both local and Vercel environments
let actualData = [];
try {
  // Try multiple paths for compatibility
  const possiblePaths = [
    path.join(process.cwd(), 'server', 'data', 'actual.json'),
    path.join(__dirname, '..', 'server', 'data', 'actual.json'),
    '/var/task/server/data/actual.json'
  ];
  
  for (const dataPath of possiblePaths) {
    if (fs.existsSync(dataPath)) {
      actualData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log('Loaded actual data from:', dataPath, 'Records:', actualData.length);
      break;
    }
  }
  
  if (actualData.length === 0) {
    console.error('Could not find actual.json in any expected location');
  }
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
