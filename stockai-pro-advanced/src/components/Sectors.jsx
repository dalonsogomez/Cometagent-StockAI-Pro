// Componente Sectors completo con análisis sectorial avanzado
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Activity,
  Filter,
  Search,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Zap,
  Heart,
  Cpu,
  Car,
  Home,
  ShoppingCart,
  Banknote
} from 'lucide-react';

export default function Sectors() {
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState(null);
  const [timeframe, setTimeframe] = useState('1M'); // 1D, 1W, 1M, 3M, 1Y
  const [sortBy, setSortBy] = useState('performance'); // performance, market_cap, stocks_count

  // Datos de sectores con análisis completo
  const sectorsData = [
    {
      id: 1,
      name: 'Technology',
      icon: <Cpu className="h-6 w-6" />,
      stocks_count: 1247,
      market_cap: '12.8T',
      performance_1d: 2.34,
      performance_1w: 5.67,
      performance_1m: 12.45,
      performance_3m: 18.92,
      performance_1y: 28.76,
      top_stocks: ['AAPL', 'MSFT', 'NVDA', 'GOOGL', 'META'],
      strong_buy: 445,
      buy: 312,
      hold: 298,
      sell: 192,
      avg_score: 78.5,
      momentum: 'bullish',
      volatility: 24.5,
      pe_ratio: 28.4,
      dividend_yield: 1.2,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      name: 'Healthcare',
      icon: <Heart className="h-6 w-6" />,
      stocks_count: 892,
      market_cap: '8.4T',
      performance_1d: 1.12,
      performance_1w: 2.89,
      performance_1m: 7.23,
      performance_3m: 11.67,
      performance_1y: 15.43,
      top_stocks: ['JNJ', 'UNH', 'PFE', 'ABBV', 'TMO'],
      strong_buy: 298,
      buy: 267,
      hold: 201,
      sell: 126,
      avg_score: 72.8,
      momentum: 'neutral',
      volatility: 18.2,
      pe_ratio: 22.1,
      dividend_yield: 2.8,
      color: 'bg-red-500'
    },
    {
      id: 3,
      name: 'Financial',
      icon: <Banknote className="h-6 w-6" />,
      stocks_count: 756,
      market_cap: '6.2T',
      performance_1d: -0.45,
      performance_1w: 1.23,
      performance_1m: 4.56,
      performance_3m: 8.91,
      performance_1y: 12.34,
      top_stocks: ['JPM', 'BAC', 'WFC', 'GS', 'MS'],
      strong_buy: 234,
      buy: 189,
      hold: 198,
      sell: 135,
      avg_score: 68.9,
      momentum: 'bearish',
      volatility: 21.7,
      pe_ratio: 15.6,
      dividend_yield: 3.4,
      color: 'bg-green-500'
    },
    {
      id: 4,
      name: 'Consumer Discretionary',
      icon: <ShoppingCart className="h-6 w-6" />,
      stocks_count: 634,
      market_cap: '4.9T',
      performance_1d: 1.78,
      performance_1w: 3.45,
      performance_1m: 8.92,
      performance_3m: 14.56,
      performance_1y: 22.18,
      top_stocks: ['AMZN', 'TSLA', 'HD', 'MCD', 'NKE'],
      strong_buy: 201,
      buy: 156,
      hold: 167,
      sell: 110,
      avg_score: 74.2,
      momentum: 'bullish',
      volatility: 26.8,
      pe_ratio: 24.7,
      dividend_yield: 1.8,
      color: 'bg-purple-500'
    },
    {
      id: 5,
      name: 'Energy',
      icon: <Zap className="h-6 w-6" />,
      stocks_count: 423,
      market_cap: '3.1T',
      performance_1d: -1.23,
      performance_1w: -2.45,
      performance_1m: 2.34,
      performance_3m: 6.78,
      performance_1y: 18.92,
      top_stocks: ['XOM', 'CVX', 'COP', 'EOG', 'SLB'],
      strong_buy: 145,
      buy: 98,
      hold: 112,
      sell: 68,
      avg_score: 71.5,
      momentum: 'neutral',
      volatility: 32.4,
      pe_ratio: 12.8,
      dividend_yield: 5.2,
      color: 'bg-yellow-500'
    },
    {
      id: 6,
      name: 'Real Estate',
      icon: <Home className="h-6 w-6" />,
      stocks_count: 298,
      market_cap: '1.8T',
      performance_1d: 0.56,
      performance_1w: 1.89,
      performance_1m: 3.45,
      performance_3m: 5.67,
      performance_1y: 8.91,
      top_stocks: ['PLD', 'AMT', 'CCI', 'EQIX', 'PSA'],
      strong_buy: 89,
      buy: 67,
      hold: 78,
      sell: 64,
      avg_score: 65.8,
      momentum: 'neutral',
      volatility: 19.6,
      pe_ratio: 18.9,
      dividend_yield: 4.1,
      color: 'bg-orange-500'
    },
    {
      id: 7,
      name: 'Industrials',
      icon: <Building2 className="h-6 w-6" />,
      stocks_count: 567,
      market_cap: '4.2T',
      performance_1d: 1.45,
      performance_1w: 2.78,
      performance_1m: 6.34,
      performance_3m: 10.89,
      performance_1y: 16.45,
      top_stocks: ['BA', 'CAT', 'GE', 'HON', 'UPS'],
      strong_buy: 178,
      buy: 134,
      hold: 145,
      sell: 110,
      avg_score: 70.3,
      momentum: 'bullish',
      volatility: 22.1,
      pe_ratio: 19.7,
      dividend_yield: 2.3,
      color: 'bg-gray-500'
    },
    {
      id: 8,
      name: 'Automotive',
      icon: <Car className="h-6 w-6" />,
      stocks_count: 311,
      market_cap: '2.3T',
      performance_1d: 2.89,
      performance_1w: 4.56,
      performance_1m: 11.23,
      performance_3m: 17.89,
      performance_1y: 25.67,
      top_stocks: ['TSLA', 'F', 'GM', 'RIVN', 'LCID'],
      strong_buy: 98,
      buy: 76,
      hold: 89,
      sell: 48,
      avg_score: 76.9,
      momentum: 'bullish',
      volatility: 35.2,
      pe_ratio: 21.4,
      dividend_yield: 1.5,
      color: 'bg-indigo-500'
    }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setSectors(sectorsData);
      setLoading(false);
    }, 1500);
  }, []);

  const getPerformanceByTimeframe = (sector) => {
    switch (timeframe) {
      case '1D': return sector.performance_1d;
      case '1W': return sector.performance_1w;
      case '1M': return sector.performance_1m;
      case '3M': return sector.performance_3m;
      case '1Y': return sector.performance_1y;
      default: return sector.performance_1m;
    }
  };

  const sortedSectors = [...sectors].sort((a, b) => {
    switch (sortBy) {
      case 'performance':
        return getPerformanceByTimeframe(b) - getPerformanceByTimeframe(a);
      case 'market_cap':
        return parseFloat(b.market_cap.replace('T', '')) - parseFloat(a.market_cap.replace('T', ''));
      case 'stocks_count':
        return b.stocks_count - a.stocks_count;
      default:
        return 0;
    }
  });

  const getMomentumIcon = (momentum) => {
    switch (momentum) {
      case 'bullish': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'bearish': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-yellow-400" />;
    }
  };

  const getMomentumColor = (momentum) => {
    switch (momentum) {
      case 'bullish': return 'text-green-400 bg-green-400/10';
      case 'bearish': return 'text-red-400 bg-red-400/10';
      default: return 'text-yellow-400 bg-yellow-400/10';
    }
  };

  const getPerformanceColor = (performance) => {
    if (performance > 0) return 'text-green-400';
    if (performance < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Análisis Sectorial</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">Analizando sectores del mercado</h3>
            <p className="text-muted-foreground">Procesando datos de 5,128 acciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <PieChart className="h-8 w-8 text-blue-400" />
            Análisis Sectorial
          </h1>
          <p className="text-muted-foreground mt-2">
            Análisis completo de rendimiento por sectores del mercado
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </button>
        </div>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Período:</span>
            <div className="flex gap-1">
              {['1D', '1W', '1M', '3M', '1Y'].map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeframe(period)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    timeframe === period
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1 bg-muted border border-border rounded-md text-foreground text-sm"
            >
              <option value="performance">Rendimiento</option>
              <option value="market_cap">Cap. Mercado</option>
              <option value="stocks_count">Nº Acciones</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Sectores</p>
              <p className="text-2xl font-bold text-foreground">{sectors.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mejor Sector</p>
              <p className="text-lg font-bold text-green-400">
                {sortedSectors[0]?.name || 'Technology'}
              </p>
              <p className="text-sm text-green-400">
                +{getPerformanceByTimeframe(sortedSectors[0] || sectorsData[0]).toFixed(2)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Sectores Alcistas</p>
              <p className="text-2xl font-bold text-green-400">
                {sectors.filter(s => s.momentum === 'bullish').length}
              </p>
            </div>
            <ArrowUpRight className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cap. Total</p>
              <p className="text-2xl font-bold text-foreground">$43.7T</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Grid de sectores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedSectors.map((sector) => (
          <div
            key={sector.id}
            className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => setSelectedSector(sector)}
          >
            {/* Header del sector */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${sector.color} text-white`}>
                  {sector.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{sector.name}</h3>
                  <p className="text-sm text-muted-foreground">{sector.stocks_count} acciones</p>
                </div>
              </div>
              
              <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${getMomentumColor(sector.momentum)}`}>
                {getMomentumIcon(sector.momentum)}
                <span className="text-xs font-medium">{sector.momentum}</span>
              </div>
            </div>

            {/* Métricas principales */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cap. Mercado</span>
                <span className="font-medium text-foreground">${sector.market_cap}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Rendimiento {timeframe}</span>
                <span className={`font-bold ${getPerformanceColor(getPerformanceByTimeframe(sector))}`}>
                  {getPerformanceByTimeframe(sector) > 0 ? '+' : ''}
                  {getPerformanceByTimeframe(sector).toFixed(2)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score Promedio</span>
                <span className="font-medium text-foreground">{sector.avg_score}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Volatilidad</span>
                <span className="font-medium text-foreground">{sector.volatility}%</span>
              </div>
            </div>

            {/* Distribución de recomendaciones */}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-green-400">STRONG_BUY: {sector.strong_buy}</span>
                <span className="text-blue-400">BUY: {sector.buy}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-yellow-400">HOLD: {sector.hold}</span>
                <span className="text-red-400">SELL: {sector.sell}</span>
              </div>
            </div>

            {/* Top stocks */}
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Top Acciones:</p>
              <div className="flex flex-wrap gap-1">
                {sector.top_stocks.slice(0, 3).map((stock) => (
                  <span key={stock} className="px-2 py-1 bg-muted rounded text-xs text-foreground">
                    {stock}
                  </span>
                ))}
                {sector.top_stocks.length > 3 && (
                  <span className="px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                    +{sector.top_stocks.length - 3}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de detalle del sector */}
      {selectedSector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-lg ${selectedSector.color} text-white`}>
                  {selectedSector.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedSector.name}</h2>
                  <p className="text-muted-foreground">{selectedSector.stocks_count} acciones • ${selectedSector.market_cap} cap. mercado</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedSector(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Métricas detalladas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Rendimiento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1 Día</span>
                    <span className={getPerformanceColor(selectedSector.performance_1d)}>
                      {selectedSector.performance_1d > 0 ? '+' : ''}{selectedSector.performance_1d.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1 Semana</span>
                    <span className={getPerformanceColor(selectedSector.performance_1w)}>
                      {selectedSector.performance_1w > 0 ? '+' : ''}{selectedSector.performance_1w.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1 Mes</span>
                    <span className={getPerformanceColor(selectedSector.performance_1m)}>
                      {selectedSector.performance_1m > 0 ? '+' : ''}{selectedSector.performance_1m.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">3 Meses</span>
                    <span className={getPerformanceColor(selectedSector.performance_3m)}>
                      {selectedSector.performance_3m > 0 ? '+' : ''}{selectedSector.performance_3m.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">1 Año</span>
                    <span className={getPerformanceColor(selectedSector.performance_1y)}>
                      {selectedSector.performance_1y > 0 ? '+' : ''}{selectedSector.performance_1y.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Métricas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score Promedio</span>
                    <span className="text-foreground">{selectedSector.avg_score}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Volatilidad</span>
                    <span className="text-foreground">{selectedSector.volatility}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">P/E Ratio</span>
                    <span className="text-foreground">{selectedSector.pe_ratio}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dividend Yield</span>
                    <span className="text-foreground">{selectedSector.dividend_yield}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Momentum</span>
                    <span className={`flex items-center gap-1 ${getMomentumColor(selectedSector.momentum)}`}>
                      {getMomentumIcon(selectedSector.momentum)}
                      {selectedSector.momentum}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-foreground">Recomendaciones</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-green-400">STRONG_BUY</span>
                    <span className="text-foreground">{selectedSector.strong_buy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400">BUY</span>
                    <span className="text-foreground">{selectedSector.buy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-yellow-400">HOLD</span>
                    <span className="text-foreground">{selectedSector.hold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-400">SELL</span>
                    <span className="text-foreground">{selectedSector.sell}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Top stocks del sector */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Top Acciones del Sector</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedSector.top_stocks.map((stock, index) => (
                  <div key={stock} className="bg-muted rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-primary">#{index + 1}</span>
                        <span className="font-medium text-foreground">{stock}</span>
                      </div>
                      <span className="text-sm text-green-400">+{(Math.random() * 10 + 5).toFixed(2)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

