// Componente StockList mejorado con tabla avanzada
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Volume2,
  Target,
  Star,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  Bell,
  Plus,
  Minus,
  Grid3X3,
  List,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  TrendingDown as TrendingDownIcon,
  Activity,
  Percent,
  Calendar,
  Building,
  Users,
  Zap
} from 'lucide-react';

export default function StockList() {
  const [stocks, setStocks] = useState([]);
  const [filteredStocks, setFilteredStocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [filters, setFilters] = useState({
    recommendation: '',
    sector: '',
    priceRange: '',
    scoreRange: '',
    changeRange: ''
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedStocks, setSelectedStocks] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Datos expandidos para la tabla
  const sampleStocks = [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      price: 195.50,
      change_1d: 2.45,
      change_1d_pct: 1.27,
      change_1w_pct: 3.45,
      change_1m_pct: 8.92,
      change_ytd_pct: 15.67,
      volume: 45678900,
      avg_volume: 52000000,
      market_cap: 3020000000000,
      pe_ratio: 28.5,
      dividend_yield: 0.44,
      rsi: 65.2,
      macd: 1.25,
      bollinger_position: 0.75,
      score: 95,
      recommendation: 'STRONG_BUY',
      sector: 'Technology',
      industry: 'Consumer Electronics',
      beta: 1.25,
      eps: 6.95,
      revenue_growth: 8.2,
      profit_margin: 25.3,
      debt_to_equity: 1.73,
      roe: 147.4,
      next_earnings: '2024-01-25',
      analyst_target: 210.50,
      analyst_count: 42,
      sentiment: 'Bullish',
      news_count: 15,
      insider_ownership: 0.07,
      institutional_ownership: 59.8,
      short_interest: 1.2,
      float_shares: 15.7e9
    },
    {
      symbol: 'NVDA',
      company: 'NVIDIA Corporation',
      price: 875.28,
      change_1d: 15.67,
      change_1d_pct: 1.82,
      change_1w_pct: 8.45,
      change_1m_pct: 22.15,
      change_ytd_pct: 185.34,
      volume: 32456789,
      avg_volume: 45000000,
      market_cap: 2150000000000,
      pe_ratio: 65.8,
      dividend_yield: 0.03,
      rsi: 72.1,
      macd: 8.45,
      bollinger_position: 0.92,
      score: 98,
      recommendation: 'STRONG_BUY',
      sector: 'Technology',
      industry: 'Semiconductors',
      beta: 1.68,
      eps: 13.31,
      revenue_growth: 126.0,
      profit_margin: 32.8,
      debt_to_equity: 0.24,
      roe: 123.7,
      next_earnings: '2024-02-21',
      analyst_target: 950.00,
      analyst_count: 38,
      sentiment: 'Very Bullish',
      news_count: 28,
      insider_ownership: 4.1,
      institutional_ownership: 65.2,
      short_interest: 2.8,
      float_shares: 2.45e9
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corporation',
      price: 378.85,
      change_1d: 4.23,
      change_1d_pct: 1.13,
      change_1w_pct: 2.87,
      change_1m_pct: 6.45,
      change_ytd_pct: 28.92,
      volume: 28934567,
      avg_volume: 35000000,
      market_cap: 2810000000000,
      pe_ratio: 32.1,
      dividend_yield: 0.68,
      rsi: 58.9,
      macd: 2.15,
      bollinger_position: 0.68,
      score: 92,
      recommendation: 'STRONG_BUY',
      sector: 'Technology',
      industry: 'Software',
      beta: 0.89,
      eps: 11.79,
      revenue_growth: 12.1,
      profit_margin: 36.7,
      debt_to_equity: 0.35,
      roe: 38.9,
      next_earnings: '2024-01-24',
      analyst_target: 420.00,
      analyst_count: 45,
      sentiment: 'Bullish',
      news_count: 12,
      insider_ownership: 0.1,
      institutional_ownership: 71.5,
      short_interest: 0.8,
      float_shares: 7.43e9
    },
    {
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
      price: 152.30,
      change_1d: 1.85,
      change_1d_pct: 1.23,
      change_1w_pct: 4.12,
      change_1m_pct: 9.87,
      change_ytd_pct: 45.23,
      volume: 25678901,
      avg_volume: 28000000,
      market_cap: 1920000000000,
      pe_ratio: 24.7,
      dividend_yield: 0.00,
      rsi: 61.4,
      macd: 1.87,
      bollinger_position: 0.72,
      score: 89,
      recommendation: 'BUY',
      sector: 'Technology',
      industry: 'Internet Services',
      beta: 1.05,
      eps: 6.17,
      revenue_growth: 15.4,
      profit_margin: 21.2,
      debt_to_equity: 0.11,
      roe: 29.2,
      next_earnings: '2024-02-06',
      analyst_target: 175.00,
      analyst_count: 41,
      sentiment: 'Bullish',
      news_count: 18,
      insider_ownership: 11.2,
      institutional_ownership: 65.8,
      short_interest: 1.5,
      float_shares: 12.6e9
    },
    {
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      price: 185.30,
      change_1d: -2.45,
      change_1d_pct: -1.30,
      change_1w_pct: -3.45,
      change_1m_pct: 12.67,
      change_ytd_pct: -15.23,
      volume: 45123456,
      avg_volume: 85000000,
      market_cap: 590000000000,
      pe_ratio: 45.2,
      dividend_yield: 0.00,
      rsi: 42.8,
      macd: -1.25,
      bollinger_position: 0.35,
      score: 75,
      recommendation: 'HOLD',
      sector: 'Automotive',
      industry: 'Electric Vehicles',
      beta: 2.01,
      eps: 4.10,
      revenue_growth: 51.4,
      profit_margin: 8.1,
      debt_to_equity: 0.17,
      roe: 28.1,
      next_earnings: '2024-01-24',
      analyst_target: 220.00,
      analyst_count: 35,
      sentiment: 'Neutral',
      news_count: 22,
      insider_ownership: 12.9,
      institutional_ownership: 44.2,
      short_interest: 3.2,
      float_shares: 3.16e9
    },
    {
      symbol: 'AMD',
      company: 'Advanced Micro Devices',
      price: 142.75,
      change_1d: 3.89,
      change_1d_pct: 2.80,
      change_1w_pct: 6.45,
      change_1m_pct: 18.92,
      change_ytd_pct: 67.45,
      volume: 38567890,
      avg_volume: 42000000,
      market_cap: 230000000000,
      pe_ratio: 52.3,
      dividend_yield: 0.00,
      rsi: 68.5,
      macd: 3.25,
      bollinger_position: 0.85,
      score: 88,
      recommendation: 'BUY',
      sector: 'Technology',
      industry: 'Semiconductors',
      beta: 1.87,
      eps: 2.73,
      revenue_growth: 4.2,
      profit_margin: 4.6,
      debt_to_equity: 0.04,
      roe: 3.2,
      next_earnings: '2024-01-30',
      analyst_target: 165.00,
      analyst_count: 32,
      sentiment: 'Bullish',
      news_count: 14,
      insider_ownership: 1.2,
      institutional_ownership: 68.9,
      short_interest: 4.1,
      float_shares: 1.61e9
    },
    {
      symbol: 'META',
      company: 'Meta Platforms Inc.',
      price: 485.20,
      change_1d: 8.45,
      change_1d_pct: 1.77,
      change_1w_pct: 5.23,
      change_1m_pct: 15.67,
      change_ytd_pct: 178.45,
      volume: 19876543,
      avg_volume: 25000000,
      market_cap: 1230000000000,
      pe_ratio: 23.8,
      dividend_yield: 0.37,
      rsi: 64.2,
      macd: 4.15,
      bollinger_position: 0.78,
      score: 86,
      recommendation: 'BUY',
      sector: 'Technology',
      industry: 'Social Media',
      beta: 1.32,
      eps: 20.38,
      revenue_growth: 22.1,
      profit_margin: 29.3,
      debt_to_equity: 0.00,
      roe: 36.9,
      next_earnings: '2024-02-01',
      analyst_target: 520.00,
      analyst_count: 39,
      sentiment: 'Bullish',
      news_count: 16,
      insider_ownership: 13.5,
      institutional_ownership: 65.1,
      short_interest: 1.8,
      float_shares: 2.53e9
    },
    {
      symbol: 'PLTR',
      company: 'Palantir Technologies',
      price: 22.75,
      change_1d: 1.25,
      change_1d_pct: 5.81,
      change_1w_pct: 12.45,
      change_1m_pct: 28.67,
      change_ytd_pct: 156.78,
      volume: 67890123,
      avg_volume: 45000000,
      market_cap: 48000000000,
      pe_ratio: 185.2,
      dividend_yield: 0.00,
      rsi: 75.3,
      macd: 1.85,
      bollinger_position: 0.95,
      score: 82,
      recommendation: 'BUY',
      sector: 'Technology',
      industry: 'Software',
      beta: 2.34,
      eps: 0.12,
      revenue_growth: 16.8,
      profit_margin: 1.2,
      debt_to_equity: 0.00,
      roe: 1.8,
      next_earnings: '2024-02-05',
      analyst_target: 28.00,
      analyst_count: 18,
      sentiment: 'Bullish',
      news_count: 8,
      insider_ownership: 7.8,
      institutional_ownership: 35.2,
      short_interest: 5.2,
      float_shares: 2.11e9
    },
    {
      symbol: 'JNJ',
      company: 'Johnson & Johnson',
      price: 162.45,
      change_1d: 0.85,
      change_1d_pct: 0.53,
      change_1w_pct: 1.23,
      change_1m_pct: 3.45,
      change_ytd_pct: 8.92,
      volume: 12345678,
      avg_volume: 15000000,
      market_cap: 430000000000,
      pe_ratio: 15.2,
      dividend_yield: 3.15,
      rsi: 52.1,
      macd: 0.45,
      bollinger_position: 0.55,
      score: 78,
      recommendation: 'BUY',
      sector: 'Healthcare',
      industry: 'Pharmaceuticals',
      beta: 0.68,
      eps: 10.70,
      revenue_growth: 6.8,
      profit_margin: 17.4,
      debt_to_equity: 0.46,
      roe: 25.1,
      next_earnings: '2024-01-23',
      analyst_target: 175.00,
      analyst_count: 28,
      sentiment: 'Neutral',
      news_count: 6,
      insider_ownership: 0.1,
      institutional_ownership: 70.8,
      short_interest: 0.9,
      float_shares: 2.65e9
    },
    {
      symbol: 'KO',
      company: 'The Coca-Cola Company',
      price: 58.90,
      change_1d: 0.45,
      change_1d_pct: 0.77,
      change_1w_pct: 2.15,
      change_1m_pct: 4.67,
      change_ytd_pct: 12.34,
      volume: 15678901,
      avg_volume: 18000000,
      market_cap: 255000000000,
      pe_ratio: 26.8,
      dividend_yield: 3.08,
      rsi: 48.7,
      macd: 0.25,
      bollinger_position: 0.52,
      score: 76,
      recommendation: 'BUY',
      sector: 'Consumer',
      industry: 'Beverages',
      beta: 0.58,
      eps: 2.20,
      revenue_growth: 11.2,
      profit_margin: 22.8,
      debt_to_equity: 1.45,
      roe: 42.8,
      next_earnings: '2024-02-13',
      analyst_target: 65.00,
      analyst_count: 22,
      sentiment: 'Neutral',
      news_count: 4,
      insider_ownership: 0.3,
      institutional_ownership: 66.2,
      short_interest: 1.1,
      float_shares: 4.33e9
    }
  ];

  useEffect(() => {
    setStocks(sampleStocks);
    setFilteredStocks(sampleStocks);
  }, []);

  useEffect(() => {
    let filtered = stocks.filter(stock => {
      // Filtro de búsqueda
      if (searchTerm && !stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !stock.company.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }

      // Filtro por recomendación
      if (filters.recommendation && stock.recommendation !== filters.recommendation) {
        return false;
      }

      // Filtro por sector
      if (filters.sector && stock.sector !== filters.sector) {
        return false;
      }

      // Filtro por rango de precio
      if (filters.priceRange) {
        const [min, max] = filters.priceRange.split('-').map(Number);
        if (max && (stock.price < min || stock.price > max)) return false;
        if (!max && stock.price < min) return false;
      }

      // Filtro por rango de score
      if (filters.scoreRange) {
        const [min, max] = filters.scoreRange.split('-').map(Number);
        if (max && (stock.score < min || stock.score > max)) return false;
        if (!max && stock.score < min) return false;
      }

      // Filtro por rango de cambio
      if (filters.changeRange) {
        const [min, max] = filters.changeRange.split('-').map(Number);
        if (max && (stock.change_1d_pct < min || stock.change_1d_pct > max)) return false;
        if (!max && stock.change_1d_pct < min) return false;
      }

      return true;
    });

    setFilteredStocks(filtered);
    setCurrentPage(1);
  }, [stocks, searchTerm, filters]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...filteredStocks].sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
    setFilteredStocks(sorted);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4 text-primary" />
      : <ChevronDown className="h-4 w-4 text-primary" />;
  };

  const formatMarketCap = (value) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    return `$${value.toLocaleString()}`;
  };

  const formatVolume = (value) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getRecommendationColor = (rec) => {
    switch (rec) {
      case 'STRONG_BUY': return 'text-green-400 bg-green-400/10';
      case 'BUY': return 'text-blue-400 bg-blue-400/10';
      case 'HOLD': return 'text-yellow-400 bg-yellow-400/10';
      case 'WEAK_HOLD': return 'text-orange-400 bg-orange-400/10';
      case 'SELL': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getChangeColor = (value) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'Very Bullish': return 'text-green-500 bg-green-500/10';
      case 'Bullish': return 'text-green-400 bg-green-400/10';
      case 'Neutral': return 'text-yellow-400 bg-yellow-400/10';
      case 'Bearish': return 'text-red-400 bg-red-400/10';
      case 'Very Bearish': return 'text-red-500 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const toggleStockSelection = (symbol) => {
    const newSelected = new Set(selectedStocks);
    if (newSelected.has(symbol)) {
      newSelected.delete(symbol);
    } else {
      newSelected.add(symbol);
    }
    setSelectedStocks(newSelected);
  };

  const toggleRowExpansion = (symbol) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(symbol)) {
      newExpanded.delete(symbol);
    } else {
      newExpanded.add(symbol);
    }
    setExpandedRows(newExpanded);
  };

  const clearFilters = () => {
    setFilters({
      recommendation: '',
      sector: '',
      priceRange: '',
      scoreRange: '',
      changeRange: ''
    });
    setSearchTerm('');
  };

  const exportData = () => {
    const csv = [
      ['Symbol', 'Company', 'Price', 'Change %', 'Volume', 'Market Cap', 'PE Ratio', 'Dividend Yield', 'RSI', 'Score', 'Recommendation', 'Sector'].join(','),
      ...filteredStocks.map(stock => [
        stock.symbol,
        `"${stock.company}"`,
        stock.price,
        stock.change_1d_pct,
        stock.volume,
        stock.market_cap,
        stock.pe_ratio,
        stock.dividend_yield,
        stock.rsi,
        stock.score,
        stock.recommendation,
        stock.sector
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stocks_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Paginación
  const totalPages = Math.ceil(filteredStocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStocks = filteredStocks.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            Lista de Acciones
          </h1>
          <p className="text-muted-foreground mt-2">
            Análisis detallado de {filteredStocks.length} acciones con datos en tiempo real
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}
            className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            {viewMode === 'table' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
            {viewMode === 'table' ? 'Vista Tarjetas' : 'Vista Tabla'}
          </button>
          <button
            onClick={exportData}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar ({filteredStocks.length})
          </button>
        </div>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-muted-foreground">Total Acciones</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {filteredStocks.length}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-muted-foreground">STRONG_BUY</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {filteredStocks.filter(s => s.recommendation === 'STRONG_BUY').length}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Precio Promedio</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            ${filteredStocks.length > 0 ? (filteredStocks.reduce((sum, s) => sum + s.price, 0) / filteredStocks.length).toFixed(0) : 0}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-muted-foreground">Score Promedio</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {filteredStocks.length > 0 ? (filteredStocks.reduce((sum, s) => sum + s.score, 0) / filteredStocks.length).toFixed(0) : 0}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-400" />
            <span className="text-sm text-muted-foreground">Ganadores Hoy</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {filteredStocks.filter(s => s.change_1d_pct > 0).length}
          </div>
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Búsqueda y Filtros</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Filter className="h-4 w-4" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por símbolo o nombre de empresa..."
              className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {/* Filtros avanzados */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Recomendación</label>
              <select
                value={filters.recommendation}
                onChange={(e) => setFilters({...filters, recommendation: e.target.value})}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Todas</option>
                <option value="STRONG_BUY">STRONG_BUY</option>
                <option value="BUY">BUY</option>
                <option value="HOLD">HOLD</option>
                <option value="WEAK_HOLD">WEAK_HOLD</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Sector</label>
              <select
                value={filters.sector}
                onChange={(e) => setFilters({...filters, sector: e.target.value})}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Financial">Financial</option>
                <option value="Consumer">Consumer</option>
                <option value="Industrial">Industrial</option>
                <option value="Energy">Energy</option>
                <option value="Automotive">Automotive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rango de Precio</label>
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="0-50">$0 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200-500">$200 - $500</option>
                <option value="500">$500+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Score IA</label>
              <select
                value={filters.scoreRange}
                onChange={(e) => setFilters({...filters, scoreRange: e.target.value})}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="90">90+</option>
                <option value="80-90">80-90</option>
                <option value="70-80">70-80</option>
                <option value="60-70">60-70</option>
                <option value="0-60">Menos de 60</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Cambio Diario</label>
              <select
                value={filters.changeRange}
                onChange={(e) => setFilters({...filters, changeRange: e.target.value})}
                className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
              >
                <option value="">Todos</option>
                <option value="5">+5% o más</option>
                <option value="2-5">+2% a +5%</option>
                <option value="0-2">0% a +2%</option>
                <option value="-2-0">-2% a 0%</option>
                <option value="-5--2">-5% a -2%</option>
                <option value="-5">-5% o menos</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Acciones en lote */}
      {selectedStocks.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {selectedStocks.size} acciones seleccionadas
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Heart className="h-4 w-4" />
                Añadir a Watchlist
              </button>
              <button className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                <Bell className="h-4 w-4" />
                Crear Alertas
              </button>
              <button
                onClick={() => setSelectedStocks(new Set())}
                className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4" />
                Limpiar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Configuración de tabla */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-2 py-1 bg-muted border border-border rounded text-foreground text-sm"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredStocks.length)} de {filteredStocks.length} acciones
          </div>
        </div>

        {/* Paginación */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Tabla de acciones */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStocks.size === currentStocks.length && currentStocks.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStocks(new Set([...selectedStocks, ...currentStocks.map(s => s.symbol)]));
                      } else {
                        const newSelected = new Set(selectedStocks);
                        currentStocks.forEach(s => newSelected.delete(s.symbol));
                        setSelectedStocks(newSelected);
                      }
                    }}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  <div className="flex items-center gap-2">
                    Expandir
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('symbol')}
                >
                  <div className="flex items-center gap-2">
                    Símbolo
                    {getSortIcon('symbol')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Precio
                    {getSortIcon('price')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('change_1d_pct')}
                >
                  <div className="flex items-center gap-2">
                    1D %
                    {getSortIcon('change_1d_pct')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('change_1w_pct')}
                >
                  <div className="flex items-center gap-2">
                    1W %
                    {getSortIcon('change_1w_pct')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('change_1m_pct')}
                >
                  <div className="flex items-center gap-2">
                    1M %
                    {getSortIcon('change_1m_pct')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('volume')}
                >
                  <div className="flex items-center gap-2">
                    Volumen
                    {getSortIcon('volume')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('market_cap')}
                >
                  <div className="flex items-center gap-2">
                    Market Cap
                    {getSortIcon('market_cap')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('score')}
                >
                  <div className="flex items-center gap-2">
                    Score IA
                    {getSortIcon('score')}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Recomendación
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-5 w-5 animate-spin text-primary" />
                      <span className="text-muted-foreground">Cargando acciones...</span>
                    </div>
                  </td>
                </tr>
              ) : currentStocks.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center">
                    <div className="text-muted-foreground">
                      No se encontraron acciones que cumplan los criterios seleccionados
                    </div>
                  </td>
                </tr>
              ) : (
                currentStocks.map((stock) => (
                  <React.Fragment key={stock.symbol}>
                    <tr className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedStocks.has(stock.symbol)}
                          onChange={() => toggleStockSelection(stock.symbol)}
                          className="rounded border-border"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleRowExpansion(stock.symbol)}
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {expandedRows.has(stock.symbol) ? (
                            <Minus className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-foreground">{stock.symbol}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[120px]">
                            {stock.company}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">
                          ${stock.price.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-semibold ${getChangeColor(stock.change_1d_pct)}`}>
                          {stock.change_1d_pct > 0 ? '+' : ''}{stock.change_1d_pct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-semibold ${getChangeColor(stock.change_1w_pct)}`}>
                          {stock.change_1w_pct > 0 ? '+' : ''}{stock.change_1w_pct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`font-semibold ${getChangeColor(stock.change_1m_pct)}`}>
                          {stock.change_1m_pct > 0 ? '+' : ''}{stock.change_1m_pct.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">
                          {formatVolume(stock.volume)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Avg: {formatVolume(stock.avg_volume)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-foreground">
                          {formatMarketCap(stock.market_cap)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-foreground">
                            {stock.score}
                          </div>
                          <div className="w-12 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                              style={{ width: `${stock.score}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(stock.recommendation)}`}>
                          {stock.recommendation}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            className="p-1 text-muted-foreground hover:text-blue-400 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground hover:text-red-400 transition-colors"
                            title="Añadir a watchlist"
                          >
                            <Heart className="h-4 w-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground hover:text-orange-400 transition-colors"
                            title="Crear alerta"
                          >
                            <Bell className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Fila expandida con detalles adicionales */}
                    {expandedRows.has(stock.symbol) && (
                      <tr className="bg-muted/20">
                        <td colSpan="12" className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Métricas Técnicas */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground text-sm">Métricas Técnicas</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">RSI:</span>
                                  <span className={`font-medium ${stock.rsi > 70 ? 'text-red-400' : stock.rsi < 30 ? 'text-green-400' : 'text-foreground'}`}>
                                    {stock.rsi.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">MACD:</span>
                                  <span className={`font-medium ${getChangeColor(stock.macd)}`}>
                                    {stock.macd.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Bollinger:</span>
                                  <span className="font-medium text-foreground">
                                    {(stock.bollinger_position * 100).toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Beta:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.beta.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Métricas Fundamentales */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground text-sm">Métricas Fundamentales</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">P/E Ratio:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.pe_ratio.toFixed(1)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">EPS:</span>
                                  <span className="font-medium text-foreground">
                                    ${stock.eps.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">ROE:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.roe.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Debt/Equity:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.debt_to_equity.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Información de Mercado */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground text-sm">Información de Mercado</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Sector:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.sector}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Industria:</span>
                                  <span className="font-medium text-foreground text-right max-w-[100px] truncate">
                                    {stock.industry}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Dividend:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.dividend_yield.toFixed(2)}%
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Float:</span>
                                  <span className="font-medium text-foreground">
                                    {formatVolume(stock.float_shares)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Análisis y Sentimiento */}
                            <div className="space-y-2">
                              <h4 className="font-semibold text-foreground text-sm">Análisis y Sentimiento</h4>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Sentimiento:</span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getSentimentColor(stock.sentiment)}`}>
                                    {stock.sentiment}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Target:</span>
                                  <span className="font-medium text-foreground">
                                    ${stock.analyst_target.toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Analistas:</span>
                                  <span className="font-medium text-foreground">
                                    {stock.analyst_count}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Earnings:</span>
                                  <span className="font-medium text-foreground">
                                    {new Date(stock.next_earnings).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginación inferior */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Mostrando {startIndex + 1}-{Math.min(endIndex, filteredStocks.length)} de {filteredStocks.length} acciones
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Primera
          </button>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => goToPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Última
          </button>
        </div>
      </div>
    </div>
  );
}

