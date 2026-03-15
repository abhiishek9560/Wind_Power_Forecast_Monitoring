import axios from 'axios';

// API base URL - use environment variable or default to empty (same origin)
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/**
 * Get actual wind generation data for a date range
 * @param {Date} startTime 
 * @param {Date} endTime 
 * @returns {Promise<Array>}
 */
export const getActualGeneration = async (startTime, endTime) => {
  const response = await api.get('/api/actual', {
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
    },
  });
  return response.data;
};

/**
 * Get forecast data for a date range with specified horizon
 * @param {Date} startTime 
 * @param {Date} endTime 
 * @param {number} horizon - Forecast horizon in hours
 * @returns {Promise<Array>}
 */
export const getForecastGeneration = async (startTime, endTime, horizon) => {
  const response = await api.get('/api/forecast', {
    params: {
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      horizon: horizon,
    },
  });
  return response.data;
};

/**
 * Get the available date range of data
 * @returns {Promise<{minDate: string, maxDate: string}>}
 */
export const getDateRange = async () => {
  const response = await api.get('/api/date-range');
  return response.data;
};

/**
 * Health check
 * @returns {Promise<Object>}
 */
export const healthCheck = async () => {
  const response = await api.get('/api/health');
  return response.data;
};

export default api;
