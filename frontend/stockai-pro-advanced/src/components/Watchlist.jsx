// Componente Watchlist funcional con CRUD completo
import React, { useState, useEffect } from 'react';
import { 
  Heart, Plus, Trash2, TrendingUp, TrendingDown, 
  Search, Filter, BarChart3, Eye, AlertTriangle,
  Star, Download, RefreshCw, Settings
} from 'lucide-react';

export default function Watchlist() {
  const [watchlistStocks, setWatchlistStocks] = useState([]);
  const [allStocks, setAllStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStocks, setSelectedStocks] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'price_change_pct', direction: 'desc' });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWatchlist();
    fetchAllStocks();
  }, []);

  const fetchWatchlist = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/watchlist');
      const data = await response.json();
      setWatchlistStocks(data.watchlist || []);
    } catch (error) {
      console.error('Error fetching watchlist:', error);
      // Datos de ejemplo
      setWatchlistStocks([
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          current_price: 175.43,
          price_change: 2.15,
          price_change_pct: 1.24,
          recommendation: 'STRONG_BUY',
          catalyst_score: 100,
          sentiment: 'Very Positive',
          rsi: 65.2,
          added_date: '2024-01-15',
          alerts_count: 2
        },
        {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          current_price: 142.56,
          price_change: -1.23,
          price_change_pct: -0.85,
          recommendation: 'STRONG_BUY',
          catalyst_score: 100,
          sentiment: 'Positive',
          rsi: 58.7,
          added_date: '2024-01-10',
          alerts_count: 1
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc.',
          current_price: 248.42,
          price_change: -5.67,
          price_change_pct: -2.23,
          recommendation: 'BUY',
          catalyst_score: 85,
          sentiment: 'Neutral',
          rsi: 45.8,
          added_date: '2024-01-08',
          alerts_count: 3
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllStocks = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/stocks?limit=100');
      const data = await response.json();
      setAllStocks(data.stocks || []);
    } catch (error) {
      console.error('Error fetching all stocks:', error);
      // Datos de ejemplo para agregar
      setAllStocks([
        { symbol: 'MSFT', name: 'Microsoft Corporation', current_price: 378.85, recommendation: 'STRONG_BUY' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', current_price: 875.28, recommendation: 'STRONG_BUY' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', current_price: 155.89, recommendation: 'BUY' },
        { symbol: 'META', name: 'Meta Platforms Inc.', current_price: 485.23, recommendation: 'BUY' }
      ]);
    }
  };

  const addToWatchlist = async (symbol) => {
    try {
      const response = await fetch('http://localhost:5000/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol })
      });
      
      if (response.ok) {
        await fetchWatchlist();
        setShowAddModal(false);
        setSearchTerm('');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      // Simulación local
      const stockToAdd = allStocks.find(s => s.symbol === symbol);
      if (stockToAdd && !watchlistStocks.find(s => s.symbol === symbol)) {
        setWatchlistStocks(prev => [...prev, {
          ...stockToAdd,
          added_date: new Date().toISOString().split('T')[0],
          alerts_count: 0
        }]);
        setShowAddModal(false);
        setSearchTerm('');
      }
    }
  };

  const removeFromWatchlist = async (symbol) => {
    try {
      const response = await fetch(`http://localhost:5000/api/watchlist/${symbol}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setWatchlistStocks(prev => prev.filter(stock => stock.symbol !== symbol));
      }
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      // Simulación local
      setWatchlistStocks(prev => prev.filter(stock => stock.symbol !== symbol));
    }
  };

  const refreshWatchlist = async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const sortedStocks = [...watchlistStocks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredAllStocks = allStocks.filter(stock => 
    !watchlistStocks.find(w => w.symbol === stock.symbol) &&
    (stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
     stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'STRONG_BUY': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'BUY': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'HOLD': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'WEAK_HOLD': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'SELL': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 font-bold';
    if (score >= 70) return 'text-blue-400 font-medium';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const calculatePortfolioMetrics = () => {
    const totalValue = watchlistStocks.reduce((sum, stock) => sum + (stock.current_price || 0), 0);
    const totalChange = watchlistStocks.reduce((sum, stock) => sum + (stock.price_change || 0), 0);
    const avgChange = watchlistStocks.length > 0 ? totalChange / watchlistStocks.length : 0;
    
    const gainers = watchlistStocks.filter(stock => (stock.price_change_pct || 0) > 0).length;
    const losers = watchlistStocks.filter(stock => (stock.price_change_pct || 0) < 0).length;
    
    return { totalValue, totalChange, avgChange, gainers, losers };
  };

  const metrics = calculatePortfolioMetrics();

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Watchlist</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-muted-foreground">Cargando watchlist...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Watchlist Personalizada</h1>
          <p className="text-muted-foreground">Seguimiento de tus acciones favoritas</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshWatchlist}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Añadir Acción
          </button>
        </div>
      </div>

      {/* Métricas del Portfolio */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Acciones</span>
            <Heart className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{watchlistStocks.length}</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Valor Total</span>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">${metrics.totalValue.toFixed(2)}</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Cambio Promedio</span>
            {metrics.avgChange >= 0 ? 
              <TrendingUp className="h-4 w-4 text-green-400" /> : 
              <TrendingDown className="h-4 w-4 text-red-400" />
            }
          </div>
          <div className={`text-2xl font-bold ${metrics.avgChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.avgChange >= 0 ? '+' : ''}{metrics.avgChange.toFixed(2)}%
          </div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Ganadores</span>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">{metrics.gainers}</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Perdedores</span>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{metrics.losers}</div>
        </div>
      </div>

      {/* Tabla de Watchlist */}
      {watchlistStocks.length > 0 ? (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Mis Acciones Seguidas</h3>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Download className="h-4 w-4 text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('symbol')}
                  >
                    <div className="flex items-center gap-2">
                      Símbolo
                      {sortConfig.key === 'symbol' && (
                        <span className="text-primary">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">
                    Nombre
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-sm font-medium text-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('current_price')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Precio
                      {sortConfig.key === 'current_price' && (
                        <span className="text-primary">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-sm font-medium text-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('price_change_pct')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Cambio %
                      {sortConfig.key === 'price_change_pct' && (
                        <span className="text-primary">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    Recomendación
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-sm font-medium text-foreground cursor-pointer hover:bg-muted/70"
                    onClick={() => handleSort('catalyst_score')}
                  >
                    <div className="flex items-center justify-end gap-2">
                      Score IA
                      {sortConfig.key === 'catalyst_score' && (
                        <span className="text-primary">
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    Alertas
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-medium text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedStocks.map((stock) => (
                  <tr key={stock.symbol} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <div className="font-bold text-primary text-lg">{stock.symbol}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-foreground max-w-48 truncate font-medium">{stock.name}</div>
                      <div className="text-xs text-muted-foreground">Añadido: {stock.added_date}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-foreground text-lg">
                        ${stock.current_price?.toFixed(2) || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stock.price_change > 0 ? '+' : ''}${stock.price_change?.toFixed(2) || '0.00'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`flex items-center justify-end gap-1 font-bold ${
                        stock.price_change_pct > 0 ? 'text-green-400' : 
                        stock.price_change_pct < 0 ? 'text-red-400' : 'text-gray-400'
                      }`}>
                        {stock.price_change_pct > 0 ? <TrendingUp className="h-4 w-4" /> : 
                         stock.price_change_pct < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                        {stock.price_change_pct > 0 ? '+' : ''}{stock.price_change_pct?.toFixed(2) || '0.00'}%
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRecommendationColor(stock.recommendation)}`}>
                        {stock.recommendation || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className={`text-xl font-bold ${getScoreColor(stock.catalyst_score)}`}>
                        {stock.catalyst_score || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm font-medium text-foreground">{stock.alerts_count || 0}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button 
                          className="p-2 hover:bg-primary/10 rounded-full transition-colors group"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                        <button 
                          className="p-2 hover:bg-primary/10 rounded-full transition-colors group"
                          title="Ver gráfico"
                        >
                          <BarChart3 className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                        </button>
                        <button 
                          onClick={() => removeFromWatchlist(stock.symbol)}
                          className="p-2 hover:bg-red-500/10 rounded-full transition-colors group"
                          title="Quitar de watchlist"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-lg p-12 border border-border text-center">
          <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Tu watchlist está vacía</h3>
          <p className="text-muted-foreground mb-6">
            Añade acciones a tu watchlist para hacer seguimiento de tus inversiones favoritas
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors mx-auto"
          >
            <Plus className="h-5 w-5" />
            Añadir Primera Acción
          </button>
        </div>
      )}

      {/* Modal para añadir acciones */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card rounded-lg p-6 border border-border w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">Añadir a Watchlist</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                ×
              </button>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar acciones por símbolo o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="space-y-2">
                {filteredAllStocks.slice(0, 20).map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-bold text-primary">{stock.symbol}</div>
                        <div className="text-sm text-foreground truncate">{stock.name}</div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium text-foreground">
                          ${stock.current_price?.toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded border ${getRecommendationColor(stock.recommendation)}`}>
                          {stock.recommendation}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => addToWatchlist(stock.symbol)}
                      className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir
                    </button>
                  </div>
                ))}
              </div>

              {filteredAllStocks.length === 0 && searchTerm && (
                <div className="text-center py-8 text-muted-foreground">
                  No se encontraron acciones que coincidan con "{searchTerm}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

