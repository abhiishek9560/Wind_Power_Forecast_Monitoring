const fs = require('fs');
const path = require('path');

// Load data - handle both local and Vercel environments
let forecastData = [];
try {
  const possiblePaths = [
    path.join(process.cwd(), 'server', 'data', 'forecast.json'),
    path.join(__dirname, '..', 'server', 'data', 'forecast.json'),
    '/var/task/server/data/forecast.json'
  ];
  
  for (const dataPath of possiblePaths) {
    if (fs.existsSync(dataPath)) {
      forecastData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      console.log('Loaded forecast data from:', dataPath, 'Records:', forecastData.length);
      break;
    }
  }
  
  if (forecastData.length === 0) {
    console.error('Could not find forecast.json in any expected location');
  }
} catch (error) {
  console.error('Error loading forecast data:', error.message);
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
    const { startTime, endTime, horizon = 4 } = req.query;

    if (!startTime || !endTime) {
      return res.status(400).json({ error: 'startTime and endTime are required' });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const horizonHours = parseFloat(horizon);

    // Filter forecasts for the target time range
    const relevantForecasts = forecastData.filter(record => {
      const targetTime = new Date(record.startTime);
      return targetTime >= start && targetTime <= end;
    });

    // Group forecasts by target time (startTime)
    const forecastsByTarget = {};
    relevantForecasts.forEach(record => {
      const targetKey = record.startTime;
      if (!forecastsByTarget[targetKey]) {
        forecastsByTarget[targetKey] = [];
      }
      forecastsByTarget[targetKey].push(record);
    });

    // For each target time, find the latest forecast created at least 'horizon' hours before
    const result = [];
    Object.keys(forecastsByTarget).forEach(targetTime => {
      const targetDate = new Date(targetTime);
      const cutoffTime = new Date(targetDate.getTime() - horizonHours * 60 * 60 * 1000);

      // Get forecasts created before cutoff time
      const validForecasts = forecastsByTarget[targetTime].filter(f => {
        const publishTime = new Date(f.publishTime);
        return publishTime <= cutoffTime;
      });

      if (validForecasts.length > 0) {
        // Sort by publishTime descending and take the latest
        validForecasts.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
        result.push({
          startTime: targetTime,
          generation: validForecasts[0].generation,
          publishTime: validForecasts[0].publishTime
        });
      }
    });

    // Sort by startTime
    result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json(result);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
