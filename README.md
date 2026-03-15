# Wind Power Forecast Monitoring

A full-stack web application for monitoring UK national wind power generation forecasts vs actual values.

**Built for REint AI Full Stack Internship Assessment**

![Application Screenshot](./docs/screenshot.png)

## Features

- Interactive date range selection with calendar widgets
- Configurable forecast horizon slider (0-48 hours)
- Real-time comparison chart of actual vs forecasted wind power generation
- Responsive design (works on both desktop and mobile)
- Data from BMRS (Balancing Mechanism Reporting Service) API

## Tech Stack

### Frontend
- React 19 with JavaScript
- Recharts for data visualization
- React DatePicker for date/time selection
- Tailwind CSS for styling
- Axios for API requests
- Vite for development and build

### Backend
- Node.js with Express
- Pre-fetched January 2024 data stored as JSON
- RESTful API endpoints

## Project Structure

```
Wind_Power_Forecast_Monitoring/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── App.jsx         # Main application
│   │   └── index.css       # Global styles
│   ├── package.json
│   └── vite.config.js
├── server/                 # Express backend
│   ├── data/               # Pre-fetched JSON data
│   ├── scripts/            # Data fetching utilities
│   ├── index.js            # Server entry point
│   └── package.json
├── analysis/               # Jupyter notebooks (data analysis)
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Wind_Power_Forecast_Monitoring
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Fetch data from BMRS API** (if not already present)
   ```bash
   npm run fetch-data
   ```

4. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Running Locally

1. **Start the backend server**
   ```bash
   cd server
   npm start
   ```
   Server runs on `http://localhost:5000`

2. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

3. **Open the app**
   Navigate to `http://localhost:5173` in your browser

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/actual` | GET | Get actual generation data |
| `/api/forecast` | GET | Get forecast data with horizon filtering |
| `/api/date-range` | GET | Get available data date range |

### Query Parameters

**`/api/actual`** and **`/api/forecast`**:
- `startTime` (required): ISO date string
- `endTime` (required): ISO date string
- `horizon` (forecast only): Forecast horizon in hours (default: 4)

## Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variable: `VITE_API_URL` = your backend URL
4. Deploy

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Set root directory to `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy

## Live Demo

- **App URL**: [Add Vercel/Heroku URL]
- **Demo Video**: [Add YouTube URL]

## Data Sources

- **Actual Generation**: [BMRS FUELHH Dataset](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/FUELHH/stream)
- **Forecast Data**: [BMRS WINDFOR Dataset](https://bmrs.elexon.co.uk/api-documentation/endpoint/datasets/WINDFOR/stream)

## AI Tools Disclosure

This project was built with assistance from GitHub Copilot (Claude) for:
- Project structure setup
- API integration code
- React component scaffolding
- Documentation

The analytical notebooks (in `/analysis`) were created manually to demonstrate first-principles reasoning.

## Author

**[Your Name]**
- LinkedIn: [Your LinkedIn URL]
- Wellfound: [Your Wellfound URL]

## License

This project is created for educational/assessment purposes.
