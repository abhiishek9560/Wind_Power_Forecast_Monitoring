# Wind Power Forecast Monitoring

A web application to visualize and compare UK national wind power generation forecasts against actual values. Built as part of the REint AI Full Stack SWE Assessment.

## Live Demo

🔗 **https://wind-power-forecast-monitoring.vercel.app**

## About

This app helps users understand forecast accuracy by displaying:
- Actual wind power generation (blue line)
- Forecasted generation (green line) - showing the latest forecast made at least N hours before target time
- Key statistics like Mean Absolute Error and MAPE

Users can select custom date ranges(only january 2024) and adjust the forecast horizon (0-48 hours) using an interactive slider.

## Features

- Date range picker with time selection
- Adjustable forecast horizon slider (0-48h)
- Interactive line chart comparing actual vs forecast
- Responsive design for desktop and mobile
- Real-time statistics (MAE, MAPE, averages)

## Tech Stack

**Frontend:** React 19, Recharts, Tailwind CSS
**Backend:** Node.js, Express (Vercel Serverless Functions)  
**Data:** BMRS API (January 2024)

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── actual.js
│   ├── forecast.js
│   └── date-range.js
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── server/                 # Backend & data
│   ├── data/              # Pre-fetched JSON data (Jan 2024)
│   ├── scripts/           # Data fetching script
│   └── index.js           # Express server (for local dev)
├── analysis/              # Jupyter notebook
│   └── Wind_Power_Forecast.ipynb
└── vercel.json
```

## Running Locally

### Prerequisites
- Node.js v18+
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/abhiishek9560/Wind_Power_Forecast_Monitoring.git
cd Wind_Power_Forecast_Monitoring

# Install and run backend
cd server
npm install
npm start
# Server runs on http://localhost:5000

# In a new terminal - Install and run frontend
cd client
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

### Fetching Fresh Data (Optional)

```bash
cd server
npm run fetch-data
```

## API Endpoints


 `GET /api/actual?startTime=&endTime=` -> Actual generation data 
 `GET /api/forecast?startTime=&endTime=&horizon=4` -> Forecast data with horizon filter 
 `GET /api/date-range` -> Available data range 

## Analysis

The `analysis/` folder contains a Jupyter notebook with:

1. **Forecast Error Analysis**
   - Mean, Median, P99 absolute error
   - Error distribution
   - Error vs forecast horizon
   - Error by time of day

2. **Wind Generation Reliability**
   - Historical generation patterns
   - Percentile analysis
   - Recommendations for reliable MW capacity

## Data Sources

- [BMRS FUELHH Dataset](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream) - Actual generation
- [BMRS WINDFOR Dataset](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream) - Forecasts

## AI Tools Used

I used **GitHub Copilot** to assist with:
- Boilerplate code and component structure
- Debugging deployment issues
- Writing API endpoint handlers

The data analysis in the Jupyter notebook was done with my own analytical thinking. I used AI only for minor help like fixing syntax errors or looking up library functions.

## Author

Built by Abhishek Kumar

---

*Submitted for REint AI Full Stack SWE Challenge*
