/**
 * Script to fetch January 2024 wind power data from BMRS API
 * Run with: npm run fetch-data
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BMRS_BASE_URL = 'https://data.elexon.co.uk/bmrs/api/v1';

// January 2024 date range
const START_DATE = '2024-01-01T00:00:00Z';
const END_DATE = '2024-01-31T23:59:59Z';

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Fetch actual wind generation data (FUELHH dataset)
 */
async function fetchActualGeneration() {
  console.log('Fetching actual wind generation data...');
  
  try {
    const url = `${BMRS_BASE_URL}/datasets/FUELHH/stream`;
    const params = {
      publishDateTimeFrom: START_DATE,
      publishDateTimeTo: END_DATE,
      fuelType: 'WIND'
    };

    console.log('Request URL:', url);
    console.log('Params:', params);

    const response = await axios.get(url, { 
      params,
      timeout: 120000 // 2 minute timeout
    });

    const data = response.data;
    console.log(`Received ${data.length} actual generation records`);

    // Transform to simplified format
    const simplified = data.map(record => ({
      startTime: record.startTime,
      generation: record.generation
    }));

    // Sort by startTime
    simplified.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // Save to file
    const filePath = path.join(dataDir, 'actual.json');
    fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2));
    console.log(`Saved actual data to ${filePath}`);

    return simplified;
  } catch (error) {
    console.error('Error fetching actual generation:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Fetch wind forecast data (WINDFOR dataset)
 */
async function fetchForecastGeneration() {
  console.log('\nFetching wind forecast data...');
  
  try {
    const url = `${BMRS_BASE_URL}/datasets/WINDFOR/stream`;
    const params = {
      publishDateTimeFrom: START_DATE,
      publishDateTimeTo: END_DATE
    };

    console.log('Request URL:', url);
    console.log('Params:', params);

    const response = await axios.get(url, { 
      params,
      timeout: 120000 // 2 minute timeout
    });

    let data = response.data;
    console.log(`Received ${data.length} forecast records`);

    // Filter for forecast horizon 0-48 hours
    const filtered = data.filter(record => {
      const publishTime = new Date(record.publishTime);
      const startTime = new Date(record.startTime);
      const horizonHours = (startTime - publishTime) / (1000 * 60 * 60);
      return horizonHours >= 0 && horizonHours <= 48;
    });

    console.log(`After filtering for 0-48h horizon: ${filtered.length} records`);

    // Transform to simplified format
    const simplified = filtered.map(record => ({
      startTime: record.startTime,
      publishTime: record.publishTime,
      generation: record.generation
    }));

    // Sort by startTime, then publishTime
    simplified.sort((a, b) => {
      const timeCompare = new Date(a.startTime) - new Date(b.startTime);
      if (timeCompare !== 0) return timeCompare;
      return new Date(a.publishTime) - new Date(b.publishTime);
    });

    // Save to file
    const filePath = path.join(dataDir, 'forecast.json');
    fs.writeFileSync(filePath, JSON.stringify(simplified, null, 2));
    console.log(`Saved forecast data to ${filePath}`);

    return simplified;
  } catch (error) {
    console.error('Error fetching forecast generation:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(50));
  console.log('BMRS Wind Power Data Fetcher');
  console.log('Date Range: January 2024');
  console.log('='.repeat(50));
  console.log('');

  try {
    await fetchActualGeneration();
    await fetchForecastGeneration();

    console.log('\n' + '='.repeat(50));
    console.log('Data fetch completed successfully!');
    console.log('='.repeat(50));
  } catch (error) {
    console.error('\nData fetch failed:', error.message);
    process.exit(1);
  }
}

main();
