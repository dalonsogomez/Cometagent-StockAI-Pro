// API service para comunicación con el backend
import axios from 'axios';

// Usar datos mock cuando no hay backend disponible
const USE_MOCK_DATA = true;
const API_BASE_URL = 'http://localhost:5000/api';

// Datos mock para desarrollo
const mockData = {
  summary: {
    total_stocks: 5128,
    strong_buy: 1785,
    buy: 1055,
    hold: 1075,
    weak_hold: 899,
    sell: 314,
    avg_catalyst_score: 73.0,
    market_status: "Mercado Bajista",
    last_updated: new Date().toISOString()
  },
  stocks: [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      price: 195.50,
      change_percent: 2.45,
      recommendation: 'STRONG_BUY',
      catalyst_score: 95,
      sentiment: 'Very Positive',
      volume: 45000000,
      market_cap: 3000000000000,
      sector: 'Technology',
      rsi: 65.2,
      macd: 1.23,
      bollinger_position: 'Upper'
    },
    {
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
      price: 152.30,
      change_percent: 1.87,
      recommendation: 'STRONG_BUY',
      catalyst_score: 92,
      sentiment: 'Positive',
      volume: 28000000,
      market_cap: 1900000000000,
      sector: 'Technology',
      rsi: 58.7,
      macd: 0.89,
      bollinger_position: 'Middle'
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corporation',
      price: 378.85,
      change_percent: 0.95,
      recommendation: 'BUY',
      catalyst_score: 88,
      sentiment: 'Positive',
      volume: 32000000,
      market_cap: 2800000000000,
      sector: 'Technology',
      rsi: 62.1,
      macd: 1.45,
      bollinger_position: 'Upper'
    },
    {
      symbol: 'NVDA',
      company: 'NVIDIA Corporation',
      price: 875.28,
      change_percent: 3.21,
      recommendation: 'STRONG_BUY',
      catalyst_score: 98,
      sentiment: 'Very Positive',
      volume: 55000000,
      market_cap: 2200000000000,
      sector: 'Technology',
      rsi: 72.3,
      macd: 2.15,
      bollinger_position: 'Upper'
    },
    {
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      price: 185.30,
      change_percent: -1.25,
      recommendation: 'HOLD',
      catalyst_score: 75,
      sentiment: 'Neutral',
      volume: 78000000,
      market_cap: 590000000000,
      sector: 'Automotive',
      rsi: 45.8,
      macd: -0.32,
      bollinger_position: 'Lower'
    }
  ],
  sectors: [
    {
      name: 'Technology',
      performance: 12.5,
      stock_count: 1247,
      avg_score: 78.2,
      market_cap: 2800000000000
    },
    {
      name: 'Healthcare',
      performance: 8.7,
      stock_count: 892,
      avg_score: 72.1,
      market_cap: 1900000000000
    },
    {
      name: 'Financial',
      performance: -2.3,
      stock_count: 654,
      avg_score: 65.8,
      market_cap: 1500000000000
    }
  ],
  topOpportunities: [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      catalyst_score: 95,
      recommendation: 'STRONG_BUY',
      upside_potential: 25.5
    },
    {
      symbol: 'NVDA',
      company: 'NVIDIA Corporation',
      catalyst_score: 98,
      recommendation: 'STRONG_BUY',
      upside_potential: 45.2
    }
  ],
  marketMovers: {
    gainers: [
      { symbol: 'NVDA', change_percent: 3.21 },
      { symbol: 'AAPL', change_percent: 2.45 }
    ],
    losers: [
      { symbol: 'TSLA', change_percent: -1.25 }
    ]
  }
};

// Configurar axios solo si no usamos mock data
let api;
if (!USE_MOCK_DATA) {
  api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptor para manejo de errores
  api.interceptors.response.use(
    (response) => response.data,
    (error) => {
      console.error('API Error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Error de conexión');
    }
  );
}

// Función helper para simular delay de API
const mockDelay = (data, delay = 500) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

export const stockAPI = {
  // Health check
  health: () => USE_MOCK_DATA ? 
    mockDelay({ status: 'healthy', message: 'Mock API funcionando' }) : 
    api.get('/health'),

  // Market summary
  getSummary: () => USE_MOCK_DATA ? 
    mockDelay(mockData.summary) : 
    api.get('/summary'),

  // Stocks
  getStocks: (params = {}) => USE_MOCK_DATA ? 
    mockDelay({ 
      stocks: mockData.stocks, 
      total: mockData.stocks.length,
      page: params.page || 1,
      per_page: params.per_page || 50,
      pagination: {
        page: params.page || 1,
        per_page: params.per_page || 50,
        total: mockData.stocks.length,
        pages: Math.ceil(mockData.stocks.length / (params.per_page || 50))
      }
    }) : 
    api.get('/stocks', { params }),
    
  getStock: (symbol) => USE_MOCK_DATA ? 
    mockDelay(mockData.stocks.find(s => s.symbol === symbol) || mockData.stocks[0]) : 
    api.get(`/stocks/${symbol}`),
    
  searchStocks: (query, limit = 10) => USE_MOCK_DATA ? 
    mockDelay(mockData.stocks.filter(s => 
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.company.toLowerCase().includes(query.toLowerCase())
    ).slice(0, limit)) : 
    api.get('/search', { params: { q: query, limit } }),

  // Historical data and charts
  getHistoricalData: (symbol, days = 365, interval = 'daily') => USE_MOCK_DATA ?
    mockDelay({
      symbol,
      data: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        price: 150 + Math.random() * 50,
        volume: 1000000 + Math.random() * 5000000
      })).reverse()
    }) :
    api.get(`/charts/${symbol}/historical`, { params: { days, interval } }),
    
  getTechnicalData: (symbol) => USE_MOCK_DATA ?
    mockDelay({
      symbol,
      rsi: 65.2,
      macd: 1.23,
      bollinger_bands: { upper: 160, middle: 150, lower: 140 },
      moving_averages: { ma20: 148, ma50: 145, ma200: 140 }
    }) :
    api.get(`/charts/${symbol}/technical`),

  // Watchlist
  getWatchlist: (userId = 'default') => USE_MOCK_DATA ? 
    mockDelay([]) : 
    api.get('/watchlist', { params: { user_id: userId } }),
    
  addToWatchlist: (symbol, userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ success: true, message: `${symbol} añadido a watchlist` }) : 
    api.post('/watchlist', { symbol, user_id: userId }),
    
  removeFromWatchlist: (symbol, userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ success: true, message: `${symbol} eliminado de watchlist` }) : 
    api.delete(`/watchlist/${symbol}`, { params: { user_id: userId } }),

  // Alerts
  getAlerts: (userId = 'default') => USE_MOCK_DATA ? 
    mockDelay([]) : 
    api.get('/alerts', { params: { user_id: userId } }),
    
  createAlert: (alertData) => USE_MOCK_DATA ? 
    mockDelay({ success: true, id: Date.now(), ...alertData }) : 
    api.post('/alerts', alertData),
    
  updateAlert: (alertId, alertData, userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ success: true, ...alertData }) : 
    api.put(`/alerts/${alertId}`, alertData, { params: { user_id: userId } }),
    
  deleteAlert: (alertId, userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ success: true }) : 
    api.delete(`/alerts/${alertId}`, { params: { user_id: userId } }),

  // Sectors
  getSectors: () => USE_MOCK_DATA ? 
    mockDelay(mockData.sectors) : 
    api.get('/sectors'),
    
  getSectorStocks: (sectorName) => USE_MOCK_DATA ? 
    mockDelay(mockData.stocks.filter(s => s.sector === sectorName)) : 
    api.get(`/sectors/${sectorName}/stocks`),

  // Comparison
  getComparison: (symbols) => USE_MOCK_DATA ? 
    mockDelay(mockData.stocks.filter(s => symbols.includes(s.symbol))) : 
    api.get('/comparison', { params: { symbols } }),
    
  addToComparison: (symbol) => USE_MOCK_DATA ? 
    mockDelay({ success: true }) : 
    api.post('/comparison', { symbol }),
    
  removeFromComparison: (symbol) => USE_MOCK_DATA ? 
    mockDelay({ success: true }) : 
    api.delete(`/comparison/${symbol}`),

  // Portfolio
  getPortfolio: (userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ positions: [], total_value: 0, total_gain_loss: 0 }) : 
    api.get('/portfolio', { params: { user_id: userId } }),
    
  addToPortfolio: (symbol, shares, price, userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ success: true }) : 
    api.post('/portfolio/position', { symbol, shares, price, user_id: userId }),
    
  removeFromPortfolio: (symbol, userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ success: true }) : 
    api.delete(`/portfolio/position/${symbol}`, { params: { user_id: userId } }),

  // Screener
  customScreener: (criteria) => USE_MOCK_DATA ? 
    mockDelay(mockData.stocks.slice(0, 3)) : 
    api.post('/screener', criteria),

  // Top opportunities and market movers
  getTopOpportunities: (limit = 20, recommendation = 'STRONG_BUY', sector = '', minScore = 80) => USE_MOCK_DATA ? 
    mockDelay(mockData.topOpportunities) : 
    api.get('/top-opportunities', { params: { limit, recommendation, sector, min_score: minScore } }),
    
  getMarketMovers: () => USE_MOCK_DATA ? 
    mockDelay(mockData.marketMovers) : 
    api.get('/market-movers'),

  // Export
  exportWatchlist: (format = 'json', userId = 'default') => USE_MOCK_DATA ? 
    mockDelay({ data: [], format }) : 
    api.get('/export/watchlist', { params: { format, user_id: userId } }),
    
  exportStockAnalysis: (symbol) => USE_MOCK_DATA ? 
    mockDelay({ symbol, analysis: 'Mock analysis data' }) : 
    api.get(`/export/analysis/${symbol}`),

  // Refresh data
  refreshData: () => USE_MOCK_DATA ? 
    mockDelay({ success: true, message: 'Datos actualizados (mock)' }) : 
    api.post('/refresh'),
};

// Utility functions
export const formatPrice = (price) => {
  if (typeof price !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatPercent = (percent) => {
  if (typeof percent !== 'number') return '0.00%';
  return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
};

export const formatNumber = (number) => {
  if (typeof number !== 'number') return '0';
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatMarketCap = (marketCap) => {
  if (typeof marketCap === 'string') return marketCap;
  if (typeof marketCap !== 'number') return 'N/A';
  
  if (marketCap >= 1e12) {
    return `$${(marketCap / 1e12).toFixed(1)}T`;
  } else if (marketCap >= 1e9) {
    return `$${(marketCap / 1e9).toFixed(1)}B`;
  } else if (marketCap >= 1e6) {
    return `$${(marketCap / 1e6).toFixed(1)}M`;
  } else {
    return `$${marketCap.toFixed(0)}`;
  }
};

export const getRecommendationColor = (recommendation) => {
  switch (recommendation) {
    case 'STRONG_BUY':
      return 'text-green-400 bg-green-500/20 border-green-500/30';
    case 'BUY':
      return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    case 'HOLD':
      return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    case 'WEAK_HOLD':
      return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    case 'SELL':
      return 'text-red-400 bg-red-500/20 border-red-500/30';
    default:
      return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
  }
};

export const getSentimentColor = (sentiment) => {
  switch (sentiment) {
    case 'Very Positive':
      return 'text-green-400';
    case 'Positive':
      return 'text-green-300';
    case 'Neutral':
      return 'text-gray-400';
    case 'Negative':
      return 'text-red-300';
    case 'Very Negative':
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
};

export const getCatalystScoreColor = (score) => {
  if (score >= 90) return 'text-green-400';
  if (score >= 80) return 'text-green-300';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 60) return 'text-orange-400';
  return 'text-red-400';
};

export default api;

