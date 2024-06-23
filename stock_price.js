const axios = require('axios');
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

const getStockPrice = async (symbol) => {
  const url = `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${API_KEY}`;
  try {
    const response = await axios.get(url);
    const data = response.data;
    const timeSeries = data['Time Series (1min)'];
    const latestTime = Object.keys(timeSeries)[0];
    const latestPrice = timeSeries[latestTime]['1. open'];
    return parseFloat(latestPrice);
  } catch (error) {
    console.error('Error fetching stock price:', error);
    throw error;
  }
};

module.exports = getStockPrice;
