// Componente Screener avanzado con filtros personalizables
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Save, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Percent,
  Volume2,
  Target,
  Zap,
  Star,
  Settings,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Eye,
  Heart,
  Bell,
  Trash2,
  Edit3
} from 'lucide-react';

export default function Screener() {
  const [filters, setFilters] = useState({
    price_min: '',
    price_max: '',
    market_cap_min: '',
    market_cap_max: '',
    volume_min: '',
    pe_ratio_max: '',
    dividend_yield_min: '',
    rsi_min: '',
    rsi_max: '',
    recommendation: '',
    sector: '',
    score_min: '',
    change_1d_min: '',
    change_1d_max: ''
  });

  const [presets] = useState([
    {
      name: 'Growth Stocks',
      description: 'Acciones de crecimiento con alto potencial',
      icon: TrendingUp,
      color: 'text-green-400',
      filters: {
        score_min: '80',
        recommendation: 'STRONG_BUY',
        change_1d_min: '2',
        market_cap_min: '1000000000'
      }
    },
    {
      name: 'Value Stocks',
      description: 'Acciones infravaloradas con buen PE',
      icon: DollarSign,
      color: 'text-blue-400',
      filters: {
        pe_ratio_max: '15',
        dividend_yield_min: '2',
        recommendation: 'BUY'
      }
    },
    {
      name: 'Momentum Plays',
      description: 'Acciones con fuerte momentum',
      icon: Zap,
      color: 'text-yellow-400',
      filters: {
        change_1d_min: '5',
        volume_min: '1000000',
        rsi_min: '60'
      }
    },
    {
      name: 'AI Signals',
      description: 'Acciones recomendadas por IA',
      icon: Target,
      color: 'text-purple-400',
      filters: {
        score_min: '85',
        recommendation: 'STRONG_BUY'
      }
    },
    {
      name: 'Dividend Kings',
      description: 'Acciones con altos dividendos',
      icon: Percent,
      color: 'text-orange-400',
      filters: {
        dividend_yield_min: '3',
        pe_ratio_max: '25'
      }
    },
    {
      name: 'Small Cap Gems',
      description: 'Pequeñas empresas con potencial',
      icon: Star,
      color: 'text-pink-400',
      filters: {
        market_cap_max: '2000000000',
        score_min: '75',
        volume_min: '500000'
      }
    }
  ]);

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState(new Set());

  // Datos expandidos para el screener
  const sampleResults = [
    {
      symbol: 'AAPL',
      company: 'Apple Inc.',
      price: 195.50,
      change_1d: 2.45,
      change_1d_pct: 1.27,
      volume: 45678900,
      market_cap: 3020000000000,
      pe_ratio: 28.5,
      dividend_yield: 0.44,
      rsi: 65.2,
      score: 95,
      recommendation: 'STRONG_BUY',
      sector: 'Technology',
      beta: 1.25,
      eps: 6.95,
      revenue_growth: 8.2,
      profit_margin: 25.3
    },
    {
      symbol: 'NVDA',
      company: 'NVIDIA Corporation',
      price: 875.28,
      change_1d: 15.67,
      change_1d_pct: 1.82,
      volume: 32456789,
      market_cap: 2150000000000,
      pe_ratio: 65.8,
      dividend_yield: 0.03,
      rsi: 72.1,
      score: 98,
      recommendation: 'STRONG_BUY',
      sector: 'Technology',
      beta: 1.68,
      eps: 13.31,
      revenue_growth: 126.0,
      profit_margin: 32.8
    },
    {
      symbol: 'MSFT',
      company: 'Microsoft Corporation',
      price: 378.85,
      change_1d: 4.23,
      change_1d_pct: 1.13,
      volume: 28934567,
      market_cap: 2810000000000,
      pe_ratio: 32.1,
      dividend_yield: 0.68,
      rsi: 58.9,
      score: 92,
      recommendation: 'STRONG_BUY',
      sector: 'Technology',
      beta: 0.89,
      eps: 11.79,
      revenue_growth: 12.1,
      profit_margin: 36.7
    },
    {
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
      price: 152.30,
      change_1d: 1.85,
      change_1d_pct: 1.23,
      volume: 25678901,
      market_cap: 1920000000000,
      pe_ratio: 24.7,
      dividend_yield: 0.00,
      rsi: 61.4,
      score: 89,
      recommendation: 'BUY',
      sector: 'Technology',
      beta: 1.05,
      eps: 6.17,
      revenue_growth: 15.4,
      profit_margin: 21.2
    },
    {
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      price: 185.30,
      change_1d: -2.45,
      change_1d_pct: -1.30,
      volume: 45123456,
      market_cap: 590000000000,
      pe_ratio: 45.2,
      dividend_yield: 0.00,
      rsi: 42.8,
      score: 75,
      recommendation: 'HOLD',
      sector: 'Automotive',
      beta: 2.01,
      eps: 4.10,
      revenue_growth: 51.4,
      profit_margin: 8.1
    },
    {
      symbol: 'AMD',
      company: 'Advanced Micro Devices',
      price: 142.75,
      change_1d: 3.89,
      change_1d_pct: 2.80,
      volume: 38567890,
      market_cap: 230000000000,
      pe_ratio: 52.3,
      dividend_yield: 0.00,
      rsi: 68.5,
      score: 88,
      recommendation: 'BUY',
      sector: 'Technology',
      beta: 1.87,
      eps: 2.73,
      revenue_growth: 4.2,
      profit_margin: 4.6
    },
    {
      symbol: 'META',
      company: 'Meta Platforms Inc.',
      price: 485.20,
      change_1d: 8.45,
      change_1d_pct: 1.77,
      volume: 19876543,
      market_cap: 1230000000000,
      pe_ratio: 23.8,
      dividend_yield: 0.37,
      rsi: 64.2,
      score: 86,
      recommendation: 'BUY',
      sector: 'Technology',
      beta: 1.32,
      eps: 20.38,
      revenue_growth: 22.1,
      profit_margin: 29.3
    },
    {
      symbol: 'PLTR',
      company: 'Palantir Technologies',
      price: 22.75,
      change_1d: 1.25,
      change_1d_pct: 5.81,
      volume: 67890123,
      market_cap: 48000000000,
      pe_ratio: 185.2,
      dividend_yield: 0.00,
      rsi: 75.3,
      score: 82,
      recommendation: 'BUY',
      sector: 'Technology',
      beta: 2.34,
      eps: 0.12,
      revenue_growth: 16.8,
      profit_margin: 1.2
    },
    {
      symbol: 'JNJ',
      company: 'Johnson & Johnson',
      price: 162.45,
      change_1d: 0.85,
      change_1d_pct: 0.53,
      volume: 12345678,
      market_cap: 430000000000,
      pe_ratio: 15.2,
      dividend_yield: 3.15,
      rsi: 52.1,
      score: 78,
      recommendation: 'BUY',
      sector: 'Healthcare',
      beta: 0.68,
      eps: 10.70,
      revenue_growth: 6.8,
      profit_margin: 17.4
    },
    {
      symbol: 'KO',
      company: 'The Coca-Cola Company',
      price: 58.90,
      change_1d: 0.45,
      change_1d_pct: 0.77,
      volume: 15678901,
      market_cap: 255000000000,
      pe_ratio: 26.8,
      dividend_yield: 3.08,
      rsi: 48.7,
      score: 76,
      recommendation: 'BUY',
      sector: 'Consumer',
      beta: 0.58,
      eps: 2.20,
      revenue_growth: 11.2,
      profit_margin: 22.8
    },
    {
      symbol: 'ABBV',
      company: 'AbbVie Inc.',
      price: 175.30,
      change_1d: 1.85,
      change_1d_pct: 1.07,
      volume: 8765432,
      market_cap: 310000000000,
      pe_ratio: 14.8,
      dividend_yield: 3.45,
      rsi: 55.9,
      score: 85,
      recommendation: 'STRONG_BUY',
      sector: 'Healthcare',
      beta: 0.72,
      eps: 11.84,
      revenue_growth: 2.9,
      profit_margin: 18.7
    },
    {
      symbol: 'AMZN',
      company: 'Amazon.com Inc.',
      price: 145.80,
      change_1d: -1.25,
      change_1d_pct: -0.85,
      volume: 35678901,
      market_cap: 1520000000000,
      pe_ratio: 48.5,
      dividend_yield: 0.00,
      rsi: 45.3,
      score: 81,
      recommendation: 'BUY',
      sector: 'Consumer',
      beta: 1.15,
      eps: 3.01,
      revenue_growth: 9.7,
      profit_margin: 5.3
    }
  ];

  useEffect(() => {
    setResults(sampleResults);
  }, []);

  const applyFilters = () => {
    setLoading(true);
    
    // Simular delay de API
    setTimeout(() => {
      let filtered = sampleResults.filter(stock => {
        // Filtro por precio
        if (filters.price_min && stock.price < parseFloat(filters.price_min)) return false;
        if (filters.price_max && stock.price > parseFloat(filters.price_max)) return false;
        
        // Filtro por capitalización de mercado
        if (filters.market_cap_min && stock.market_cap < parseFloat(filters.market_cap_min)) return false;
        if (filters.market_cap_max && stock.market_cap > parseFloat(filters.market_cap_max)) return false;
        
        // Filtro por volumen
        if (filters.volume_min && stock.volume < parseFloat(filters.volume_min)) return false;
        
        // Filtro por PE ratio
        if (filters.pe_ratio_max && stock.pe_ratio > parseFloat(filters.pe_ratio_max)) return false;
        
        // Filtro por dividend yield
        if (filters.dividend_yield_min && stock.dividend_yield < parseFloat(filters.dividend_yield_min)) return false;
        
        // Filtro por RSI
        if (filters.rsi_min && stock.rsi < parseFloat(filters.rsi_min)) return false;
        if (filters.rsi_max && stock.rsi > parseFloat(filters.rsi_max)) return false;
        
        // Filtro por recomendación
        if (filters.recommendation && stock.recommendation !== filters.recommendation) return false;
        
        // Filtro por sector
        if (filters.sector && stock.sector !== filters.sector) return false;
        
        // Filtro por score
        if (filters.score_min && stock.score < parseFloat(filters.score_min)) return false;
        
        // Filtro por cambio diario
        if (filters.change_1d_min && stock.change_1d_pct < parseFloat(filters.change_1d_min)) return false;
        if (filters.change_1d_max && stock.change_1d_pct > parseFloat(filters.change_1d_max)) return false;
        
        return true;
      });

      setResults(filtered);
      setLoading(false);
    }, 800);
  };

  const applyPreset = (preset) => {
    setFilters(preset.filters);
    setTimeout(() => applyFilters(), 100);
  };

  const clearFilters = () => {
    setFilters({
      price_min: '',
      price_max: '',
      market_cap_min: '',
      market_cap_max: '',
      volume_min: '',
      pe_ratio_max: '',
      dividend_yield_min: '',
      rsi_min: '',
      rsi_max: '',
      recommendation: '',
      sector: '',
      score_min: '',
      change_1d_min: '',
      change_1d_max: ''
    });
    setResults(sampleResults);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });

    const sorted = [...results].sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
    setResults(sorted);
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

  const saveFilter = () => {
    if (!filterName.trim()) return;
    
    const newFilter = {
      id: Date.now(),
      name: filterName,
      filters: { ...filters },
      created: new Date().toISOString()
    };
    
    setSavedFilters([...savedFilters, newFilter]);
    setFilterName('');
    setShowSaveModal(false);
  };

  const exportResults = () => {
    const csv = [
      ['Symbol', 'Company', 'Price', 'Change %', 'Volume', 'Market Cap', 'PE Ratio', 'Dividend Yield', 'RSI', 'Score', 'Recommendation', 'Sector', 'Beta', 'EPS', 'Revenue Growth', 'Profit Margin'].join(','),
      ...results.map(stock => [
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
        stock.sector,
        stock.beta,
        stock.eps,
        stock.revenue_growth,
        stock.profit_margin
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `screener_results_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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

  const addToWatchlist = (symbols) => {
    // Simular añadir a watchlist
    alert(`${symbols.length} acciones añadidas a Watchlist: ${Array.from(symbols).join(', ')}`);
    setSelectedStocks(new Set());
  };

  const createAlert = (symbols) => {
    // Simular crear alerta
    alert(`Alertas creadas para ${symbols.length} acciones: ${Array.from(symbols).join(', ')}`);
    setSelectedStocks(new Set());
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Search className="h-8 w-8 text-blue-400" />
            Stock Screener
          </h1>
          <p className="text-muted-foreground mt-2">
            Encuentra acciones que cumplan tus criterios específicos de inversión
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors"
          >
            <Save className="h-4 w-4" />
            Guardar Filtros
          </button>
          <button
            onClick={exportResults}
            className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar ({results.length})
          </button>
        </div>
      </div>

      {/* Métricas del Screener */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-muted-foreground">Resultados</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {results.length}
          </div>
          <div className="text-xs text-muted-foreground">
            de {sampleResults.length} acciones
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <span className="text-sm text-muted-foreground">STRONG_BUY</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {results.filter(s => s.recommendation === 'STRONG_BUY').length}
          </div>
          <div className="text-xs text-muted-foreground">
            {((results.filter(s => s.recommendation === 'STRONG_BUY').length / results.length) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-muted-foreground">Precio Promedio</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            ${(results.reduce((sum, s) => sum + s.price, 0) / results.length).toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">
            por acción
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-muted-foreground">Score Promedio</span>
          </div>
          <div className="text-2xl font-bold text-foreground mt-1">
            {(results.reduce((sum, s) => sum + s.score, 0) / results.length).toFixed(0)}
          </div>
          <div className="text-xs text-muted-foreground">
            de 100 puntos
          </div>
        </div>
      </div>

      {/* Presets */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Filtros Predefinidos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset, index) => {
            const IconComponent = preset.icon;
            return (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/50 transition-colors group"
                onClick={() => applyPreset(preset)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <IconComponent className={`h-5 w-5 ${preset.color} group-hover:scale-110 transition-transform`} />
                  <h3 className="font-semibold text-foreground">{preset.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{preset.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Filtros Personalizados</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
              Limpiar
            </button>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors"
            >
              <Settings className="h-4 w-4" />
              {showAdvanced ? 'Ocultar Avanzados' : 'Mostrar Avanzados'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filtros básicos */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Precio Mínimo</label>
            <input
              type="number"
              value={filters.price_min}
              onChange={(e) => setFilters({...filters, price_min: e.target.value})}
              placeholder="0"
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Precio Máximo</label>
            <input
              type="number"
              value={filters.price_max}
              onChange={(e) => setFilters({...filters, price_max: e.target.value})}
              placeholder="1000"
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

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

          {/* Filtros avanzados */}
          {showAdvanced && (
            <>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Score IA Mínimo</label>
                <input
                  type="number"
                  value={filters.score_min}
                  onChange={(e) => setFilters({...filters, score_min: e.target.value})}
                  placeholder="70"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Volumen Mínimo</label>
                <input
                  type="number"
                  value={filters.volume_min}
                  onChange={(e) => setFilters({...filters, volume_min: e.target.value})}
                  placeholder="1000000"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">PE Ratio Máximo</label>
                <input
                  type="number"
                  value={filters.pe_ratio_max}
                  onChange={(e) => setFilters({...filters, pe_ratio_max: e.target.value})}
                  placeholder="30"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Dividend Yield Mínimo (%)</label>
                <input
                  type="number"
                  value={filters.dividend_yield_min}
                  onChange={(e) => setFilters({...filters, dividend_yield_min: e.target.value})}
                  placeholder="2"
                  step="0.1"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">RSI Mínimo</label>
                <input
                  type="number"
                  value={filters.rsi_min}
                  onChange={(e) => setFilters({...filters, rsi_min: e.target.value})}
                  placeholder="30"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">RSI Máximo</label>
                <input
                  type="number"
                  value={filters.rsi_max}
                  onChange={(e) => setFilters({...filters, rsi_max: e.target.value})}
                  placeholder="70"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Cambio 1D Mínimo (%)</label>
                <input
                  type="number"
                  value={filters.change_1d_min}
                  onChange={(e) => setFilters({...filters, change_1d_min: e.target.value})}
                  placeholder="-10"
                  step="0.1"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Market Cap Mínimo</label>
                <input
                  type="number"
                  value={filters.market_cap_min}
                  onChange={(e) => setFilters({...filters, market_cap_min: e.target.value})}
                  placeholder="1000000000"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-6">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Filter className="h-4 w-4" />
            )}
            {loading ? 'Filtrando...' : 'Aplicar Filtros'}
          </button>
          
          <div className="text-sm text-muted-foreground">
            {results.length} resultados encontrados
          </div>
        </div>
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
              <button
                onClick={() => addToWatchlist(selectedStocks)}
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Heart className="h-4 w-4" />
                Añadir a Watchlist
              </button>
              <button
                onClick={() => createAlert(selectedStocks)}
                className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
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

      {/* Tabla de resultados */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStocks.size === results.length && results.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStocks(new Set(results.map(s => s.symbol)));
                      } else {
                        setSelectedStocks(new Set());
                      }
                    }}
                    className="rounded border-border"
                  />
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
                    Cambio %
                    {getSortIcon('change_1d_pct')}
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
                  onClick={() => handleSort('pe_ratio')}
                >
                  <div className="flex items-center gap-2">
                    P/E
                    {getSortIcon('pe_ratio')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('dividend_yield')}
                >
                  <div className="flex items-center gap-2">
                    Dividend
                    {getSortIcon('dividend_yield')}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:text-primary transition-colors"
                  onClick={() => handleSort('rsi')}
                >
                  <div className="flex items-center gap-2">
                    RSI
                    {getSortIcon('rsi')}
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
                      <span className="text-muted-foreground">Filtrando acciones...</span>
                    </div>
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan="12" className="px-4 py-8 text-center">
                    <div className="text-muted-foreground">
                      No se encontraron acciones que cumplan los criterios seleccionados
                    </div>
                  </td>
                </tr>
              ) : (
                results.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedStocks.has(stock.symbol)}
                        onChange={() => toggleStockSelection(stock.symbol)}
                        className="rounded border-border"
                      />
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
                      <div className="text-foreground">
                        {formatVolume(stock.volume)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">
                        {formatMarketCap(stock.market_cap)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">
                        {stock.pe_ratio.toFixed(1)}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-foreground">
                        {stock.dividend_yield.toFixed(2)}%
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-foreground ${stock.rsi > 70 ? 'text-red-400' : stock.rsi < 30 ? 'text-green-400' : ''}`}>
                        {stock.rsi.toFixed(1)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para guardar filtros */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-foreground mb-4">Guardar Filtros</h3>
            <input
              type="text"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Nombre del filtro..."
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground mb-4 focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={saveFilter}
                disabled={!filterName.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

