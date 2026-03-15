import { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ForecastChart from './components/ForecastChart';
import { getActualGeneration, getForecastGeneration, getDateRange } from './services/api';

function App() {
  // Date range state
  const [startDate, setStartDate] = useState(new Date('2024-01-15T00:00:00'));
  const [endDate, setEndDate] = useState(new Date('2024-01-16T00:00:00'));
  
  // Available date range from server
  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  
  // Forecast horizon in hours
  const [horizon, setHorizon] = useState(4);
  
  // Chart data and loading state
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch available date range on mount
  useEffect(() => {
    const fetchDateRange = async () => {
      try {
        const range = await getDateRange();
        if (range.minDate && range.maxDate) {
          setMinDate(new Date(range.minDate));
          setMaxDate(new Date(range.maxDate));
        }
      } catch (err) {
        console.error('Failed to fetch date range:', err);
      }
    };
    fetchDateRange();
  }, []);

  // Fetch and merge data
  const fetchData = useCallback(async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Fetch actual and forecast data in parallel
      const [actualData, forecastData] = await Promise.all([
        getActualGeneration(startDate, endDate),
        getForecastGeneration(startDate, endDate, horizon),
      ]);

      // Create a map of all time points
      const timeMap = new Map();

      // Add actual data
      actualData.forEach((item) => {
        const timeKey = item.startTime;
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { time: timeKey });
        }
        timeMap.get(timeKey).actual = item.generation;
      });

      // Add forecast data
      forecastData.forEach((item) => {
        const timeKey = item.startTime;
        if (!timeMap.has(timeKey)) {
          timeMap.set(timeKey, { time: timeKey });
        }
        timeMap.get(timeKey).forecast = item.generation;
      });

      // Convert map to array and sort by time
      const merged = Array.from(timeMap.values()).sort(
        (a, b) => new Date(a.time) - new Date(b.time)
      );

      setChartData(merged);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Failed to load data. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate, horizon]);

  // Fetch data when parameters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) return null;

    const validData = chartData.filter(d => d.actual !== undefined && d.forecast !== undefined);
    if (validData.length === 0) return null;

    const errors = validData.map(d => d.forecast - d.actual);
    const absErrors = errors.map(e => Math.abs(e));
    
    const mae = absErrors.reduce((a, b) => a + b, 0) / absErrors.length;
    const avgActual = validData.reduce((a, b) => a + b.actual, 0) / validData.length;
    const avgForecast = validData.reduce((a, b) => a + b.forecast, 0) / validData.length;
    const mape = (absErrors.reduce((a, b, i) => a + (b / validData[i].actual), 0) / validData.length) * 100;

    return {
      dataPoints: validData.length,
      mae: mae.toFixed(0),
      mape: mape.toFixed(1),
      avgActual: avgActual.toFixed(0),
      avgForecast: avgForecast.toFixed(0),
    };
  }, [chartData]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">
                Wind Power Forecast Monitoring
              </h1>
              <p className="text-sm text-blue-100 mt-0.5">
                UK National Wind Power Generation - January 2024
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time:
              </label>
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={minDate}
                maxDate={maxDate}
                className="w-full"
                placeholderText="Select start time"
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time:
              </label>
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="dd/MM/yyyy HH:mm"
                minDate={minDate}
                maxDate={maxDate}
                className="w-full"
                placeholderText="Select end time"
              />
            </div>

            {/* Forecast Horizon */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Forecast Horizon: {horizon}h
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="48"
                  step="1"
                  value={horizon}
                  onChange={(e) => setHorizon(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500 w-12 text-right">
                  {horizon}h
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Show forecasts made at least {horizon} hours before target time
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && !loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Avg Actual</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{Number(stats.avgActual).toLocaleString()}</p>
              <p className="text-xs text-gray-400">MW</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Avg Forecast</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{Number(stats.avgForecast).toLocaleString()}</p>
              <p className="text-xs text-gray-400">MW</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-amber-500">
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">Mean Abs Error</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{Number(stats.mae).toLocaleString()}</p>
              <p className="text-xs text-gray-400">MW</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
              <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide">MAPE</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">{stats.mape}%</p>
              <p className="text-xs text-gray-400">{stats.dataPoints} data points</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Chart */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-100">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-800">
              Generation vs Forecast
            </h2>
            <p className="text-sm text-gray-500">
              Comparing actual wind power generation with forecasted values
            </p>
          </div>
          <ForecastChart data={chartData} loading={loading} />
        </div>

        {/* Legend/Info */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">About this data</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-blue-500 mt-0.5 flex-shrink-0"></div>
              <div>
                <strong>Actual Generation</strong> - Real-time wind power output 
                measured at 30-minute intervals
              </div>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 rounded bg-green-500 mt-0.5 flex-shrink-0"></div>
              <div>
                <strong>Forecasted Generation</strong> - Latest forecast created 
                at least {horizon} hours before the target time
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-500 text-center">
            Data source: BMRS (Balancing Mechanism Reporting Service) | 
            Built for REint AI Full Stack Assessment
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
