const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load data from JSON files
let actualData = [];
let forecastData = [];

const loadData = () => {
  try {
    const actualPath = path.join(__dirname, 'data', 'actual.json');
    const forecastPath = path.join(__dirname, 'data', 'forecast.json');

    if (fs.existsSync(actualPath)) {
      actualData = JSON.parse(fs.readFileSync(actualPath, 'utf-8'));
      console.log(`Loaded ${actualData.length} actual generation records`);
    } else {
      console.warn('actual.json not found. Run "npm run fetch-data" first.');
    }

    if (fs.existsSync(forecastPath)) {
      forecastData = JSON.parse(fs.readFileSync(forecastPath, 'utf-8'));
      console.log(`Loaded ${forecastData.length} forecast records`);
    } else {
      console.warn('forecast.json not found. Run "npm run fetch-data" first.');
    }
  } catch (error) {
    console.error('Error loading data:', error.message);
  }
};

// Load data on startup
loadData();

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    actualRecords: actualData.length,
    forecastRecords: forecastData.length 
  });
});

// Get actual generation data
// Query params: startTime, endTime (ISO strings)
app.get('/api/actual', (req, res) => {
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
});

// Get forecast data with horizon filtering
// Query params: startTime, endTime (ISO strings), horizon (hours)
app.get('/api/forecast', (req, res) => {
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
      // If no valid forecast, skip this target time (as per requirements)
    });

    // Sort by startTime
    result.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    res.json(result);
  } catch (error) {
    console.error('Error fetching forecast data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get date range of available data
app.get('/api/date-range', (req, res) => {
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
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
