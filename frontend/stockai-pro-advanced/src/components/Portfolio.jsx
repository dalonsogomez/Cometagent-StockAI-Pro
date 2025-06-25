// Componente Portfolio completo con simulador de cartera
import React, { useState, useEffect } from 'react';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Calendar,
  RefreshCw,
  Download,
  Upload,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function Portfolio() {
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStockModal, setShowAddStockModal] = useState(false);
  const [newPortfolio, setNewPortfolio] = useState({
    name: '',
    description: '',
    initial_capital: 100000,
    strategy: 'balanced' // conservative, balanced, aggressive
  });
  const [newStock, setNewStock] = useState({
    symbol: '',
    shares: '',
    purchase_price: '',
    purchase_date: new Date().toISOString().split('T')[0]
  });

  // Datos de ejemplo de portfolios
  const samplePortfolios = [
    {
      id: 1,
      name: 'Portfolio Principal',
      description: 'Cartera diversificada de largo plazo',
      initial_capital: 100000,
      current_value: 127850,
      total_return: 27850,
      total_return_pct: 27.85,
      day_change: 1250,
      day_change_pct: 0.98,
      strategy: 'balanced',
      created_date: '2024-01-15',
      positions: [
        {
          symbol: 'AAPL',
          company: 'Apple Inc.',
          shares: 50,
          purchase_price: 180.50,
          current_price: 195.50,
          purchase_date: '2024-02-01',
          current_value: 9775,
          total_return: 750,
          total_return_pct: 8.30,
          day_change: 125,
          day_change_pct: 1.30,
          weight: 15.2,
          sector: 'Technology'
        },
        {
          symbol: 'MSFT',
          company: 'Microsoft Corporation',
          shares: 30,
          purchase_price: 350.00,
          current_price: 378.85,
          purchase_date: '2024-02-15',
          current_value: 11365.50,
          total_return: 865.50,
          total_return_pct: 8.24,
          day_change: 89.50,
          day_change_pct: 0.79,
          weight: 17.7,
          sector: 'Technology'
        },
        {
          symbol: 'NVDA',
          company: 'NVIDIA Corporation',
          shares: 15,
          purchase_price: 720.00,
          current_price: 875.28,
          purchase_date: '2024-03-01',
          current_value: 13129.20,
          total_return: 2329.20,
          total_return_pct: 21.57,
          day_change: 245.80,
          day_change_pct: 1.91,
          weight: 20.4,
          sector: 'Technology'
        },
        {
          symbol: 'GOOGL',
          company: 'Alphabet Inc.',
          shares: 40,
          purchase_price: 140.00,
          current_price: 152.30,
          purchase_date: '2024-02-20',
          current_value: 6092,
          total_return: 492,
          total_return_pct: 8.79,
          day_change: 78,
          day_change_pct: 1.30,
          weight: 9.5,
          sector: 'Technology'
        },
        {
          symbol: 'TSLA',
          company: 'Tesla Inc.',
          shares: 25,
          purchase_price: 200.00,
          current_price: 185.30,
          purchase_date: '2024-03-15',
          current_value: 4632.50,
          total_return: -367.50,
          total_return_pct: -7.35,
          day_change: -45.50,
          day_change_pct: -0.97,
          weight: 7.2,
          sector: 'Automotive'
        }
      ],
      metrics: {
        sharpe_ratio: 1.45,
        volatility: 18.5,
        max_drawdown: -8.2,
        beta: 1.12,
        alpha: 3.4,
        win_rate: 78.5
      }
    },
    {
      id: 2,
      name: 'Portfolio Agresivo',
      description: 'Cartera de crecimiento con alto riesgo',
      initial_capital: 50000,
      current_value: 58750,
      total_return: 8750,
      total_return_pct: 17.50,
      day_change: 890,
      day_change_pct: 1.54,
      strategy: 'aggressive',
      created_date: '2024-03-01',
      positions: [
        {
          symbol: 'NVDA',
          company: 'NVIDIA Corporation',
          shares: 30,
          purchase_price: 650.00,
          current_price: 875.28,
          purchase_date: '2024-03-05',
          current_value: 26258.40,
          total_return: 6758.40,
          total_return_pct: 34.61,
          day_change: 491.60,
          day_change_pct: 1.91,
          weight: 44.7,
          sector: 'Technology'
        },
        {
          symbol: 'PLTR',
          company: 'Palantir Technologies',
          shares: 200,
          purchase_price: 18.50,
          current_price: 22.75,
          purchase_date: '2024-03-10',
          current_value: 4550,
          total_return: 850,
          total_return_pct: 22.97,
          day_change: 125,
          day_change_pct: 2.82,
          weight: 7.7,
          sector: 'Technology'
        }
      ],
      metrics: {
        sharpe_ratio: 1.12,
        volatility: 28.7,
        max_drawdown: -15.3,
        beta: 1.45,
        alpha: 5.8,
        win_rate: 65.2
      }
    }
  ];

  useEffect(() => {
    setPortfolios(samplePortfolios);
    setSelectedPortfolio(samplePortfolios[0]);
  }, []);

  const getTotalPortfolioValue = () => {
    return portfolios.reduce((total, portfolio) => total + portfolio.current_value, 0);
  };

  const getTotalReturn = () => {
    return portfolios.reduce((total, portfolio) => total + portfolio.total_return, 0);
  };

  const getTotalReturnPct = () => {
    const totalInitial = portfolios.reduce((total, portfolio) => total + portfolio.initial_capital, 0);
    const totalCurrent = getTotalPortfolioValue();
    return totalInitial > 0 ? ((totalCurrent - totalInitial) / totalInitial) * 100 : 0;
  };

  const getReturnColor = (value) => {
    if (value > 0) return 'text-green-400';
    if (value < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getStrategyColor = (strategy) => {
    switch (strategy) {
      case 'conservative': return 'bg-blue-500/10 text-blue-400';
      case 'balanced': return 'bg-yellow-500/10 text-yellow-400';
      case 'aggressive': return 'bg-red-500/10 text-red-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const getStrategyLabel = (strategy) => {
    switch (strategy) {
      case 'conservative': return 'Conservador';
      case 'balanced': return 'Balanceado';
      case 'aggressive': return 'Agresivo';
      default: return strategy;
    }
  };

  const handleCreatePortfolio = () => {
    const portfolio = {
      id: Date.now(),
      ...newPortfolio,
      current_value: newPortfolio.initial_capital,
      total_return: 0,
      total_return_pct: 0,
      day_change: 0,
      day_change_pct: 0,
      created_date: new Date().toISOString().split('T')[0],
      positions: [],
      metrics: {
        sharpe_ratio: 0,
        volatility: 0,
        max_drawdown: 0,
        beta: 1.0,
        alpha: 0,
        win_rate: 0
      }
    };
    
    setPortfolios([...portfolios, portfolio]);
    setNewPortfolio({
      name: '',
      description: '',
      initial_capital: 100000,
      strategy: 'balanced'
    });
    setShowCreateModal(false);
  };

  const handleAddStock = () => {
    if (!selectedPortfolio) return;

    const stock = {
      symbol: newStock.symbol.toUpperCase(),
      company: `${newStock.symbol.toUpperCase()} Company`,
      shares: parseInt(newStock.shares),
      purchase_price: parseFloat(newStock.purchase_price),
      current_price: parseFloat(newStock.purchase_price), // Simular precio actual igual al de compra
      purchase_date: newStock.purchase_date,
      current_value: parseInt(newStock.shares) * parseFloat(newStock.purchase_price),
      total_return: 0,
      total_return_pct: 0,
      day_change: 0,
      day_change_pct: 0,
      weight: 0,
      sector: 'Technology'
    };

    const updatedPortfolio = {
      ...selectedPortfolio,
      positions: [...selectedPortfolio.positions, stock]
    };

    setPortfolios(portfolios.map(p => p.id === selectedPortfolio.id ? updatedPortfolio : p));
    setSelectedPortfolio(updatedPortfolio);
    
    setNewStock({
      symbol: '',
      shares: '',
      purchase_price: '',
      purchase_date: new Date().toISOString().split('T')[0]
    });
    setShowAddStockModal(false);
  };

  const removePosition = (portfolioId, symbol) => {
    const updatedPortfolio = {
      ...selectedPortfolio,
      positions: selectedPortfolio.positions.filter(pos => pos.symbol !== symbol)
    };

    setPortfolios(portfolios.map(p => p.id === portfolioId ? updatedPortfolio : p));
    setSelectedPortfolio(updatedPortfolio);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-green-400" />
            Portfolio Simulator
          </h1>
          <p className="text-muted-foreground mt-2">
            Simula y gestiona carteras de inversión con métricas avanzadas
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Nuevo Portfolio
          </button>
        </div>
      </div>

      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <p className="text-2xl font-bold text-foreground">
                ${getTotalPortfolioValue().toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Retorno Total</p>
              <p className={`text-2xl font-bold ${getReturnColor(getTotalReturn())}`}>
                ${getTotalReturn().toLocaleString()}
              </p>
              <p className={`text-sm ${getReturnColor(getTotalReturnPct())}`}>
                {getTotalReturnPct() > 0 ? '+' : ''}{getTotalReturnPct().toFixed(2)}%
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Portfolios</p>
              <p className="text-2xl font-bold text-foreground">{portfolios.length}</p>
            </div>
            <Briefcase className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Mejor Portfolio</p>
              <p className="text-lg font-bold text-green-400">
                {portfolios.length > 0 ? portfolios.reduce((best, current) => 
                  current.total_return_pct > best.total_return_pct ? current : best
                ).name : 'N/A'}
              </p>
            </div>
            <Target className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Lista de portfolios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold text-foreground mb-4">Mis Portfolios</h2>
          <div className="space-y-3">
            {portfolios.map((portfolio) => (
              <div
                key={portfolio.id}
                className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${
                  selectedPortfolio?.id === portfolio.id 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => setSelectedPortfolio(portfolio)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-foreground">{portfolio.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStrategyColor(portfolio.strategy)}`}>
                    {getStrategyLabel(portfolio.strategy)}
                  </span>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3">{portfolio.description}</p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor:</span>
                    <span className="font-medium text-foreground">
                      ${portfolio.current_value.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Retorno:</span>
                    <span className={`font-medium ${getReturnColor(portfolio.total_return)}`}>
                      {portfolio.total_return > 0 ? '+' : ''}${portfolio.total_return.toLocaleString()} 
                      ({portfolio.total_return_pct > 0 ? '+' : ''}{portfolio.total_return_pct.toFixed(2)}%)
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Posiciones:</span>
                    <span className="font-medium text-foreground">{portfolio.positions.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle del portfolio seleccionado */}
        <div className="lg:col-span-2">
          {selectedPortfolio ? (
            <div className="space-y-6">
              {/* Header del portfolio */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{selectedPortfolio.name}</h2>
                  <p className="text-muted-foreground">{selectedPortfolio.description}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddStockModal(true)}
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Añadir Acción
                  </button>
                  <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Métricas del portfolio */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Sharpe Ratio</p>
                  <p className="text-lg font-bold text-foreground">{selectedPortfolio.metrics.sharpe_ratio}</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Volatilidad</p>
                  <p className="text-lg font-bold text-foreground">{selectedPortfolio.metrics.volatility}%</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Max Drawdown</p>
                  <p className="text-lg font-bold text-red-400">{selectedPortfolio.metrics.max_drawdown}%</p>
                </div>
                <div className="bg-muted rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-lg font-bold text-green-400">{selectedPortfolio.metrics.win_rate}%</p>
                </div>
              </div>

              {/* Posiciones */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Posiciones</h3>
                
                {selectedPortfolio.positions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPortfolio.positions.map((position) => (
                      <div key={position.symbol} className="bg-card border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground">{position.symbol}</h4>
                              <p className="text-sm text-muted-foreground">{position.company}</p>
                            </div>
                            
                            <div className="text-sm">
                              <p className="text-muted-foreground">
                                {position.shares} acciones @ ${position.purchase_price}
                              </p>
                              <p className="text-muted-foreground">
                                Comprado: {position.purchase_date}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              ${position.current_value.toLocaleString()}
                            </p>
                            <p className={`text-sm ${getReturnColor(position.total_return)}`}>
                              {position.total_return > 0 ? '+' : ''}${position.total_return.toLocaleString()} 
                              ({position.total_return_pct > 0 ? '+' : ''}{position.total_return_pct.toFixed(2)}%)
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {position.weight.toFixed(1)}% del portfolio
                            </p>
                          </div>

                          <button
                            onClick={() => removePosition(selectedPortfolio.id, position.symbol)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-muted rounded-lg">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Portfolio vacío</h3>
                    <p className="text-muted-foreground mb-4">
                      Añade tu primera acción para comenzar a simular tu cartera
                    </p>
                    <button
                      onClick={() => setShowAddStockModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto"
                    >
                      <Plus className="h-4 w-4" />
                      Añadir Acción
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Selecciona un portfolio</h3>
              <p className="text-muted-foreground">
                Elige un portfolio de la lista para ver sus detalles y posiciones
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear portfolio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Nuevo Portfolio</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                <input
                  type="text"
                  value={newPortfolio.name}
                  onChange={(e) => setNewPortfolio({...newPortfolio, name: e.target.value})}
                  placeholder="Mi Portfolio"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Descripción</label>
                <input
                  type="text"
                  value={newPortfolio.description}
                  onChange={(e) => setNewPortfolio({...newPortfolio, description: e.target.value})}
                  placeholder="Descripción del portfolio"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Capital Inicial</label>
                <input
                  type="number"
                  value={newPortfolio.initial_capital}
                  onChange={(e) => setNewPortfolio({...newPortfolio, initial_capital: parseInt(e.target.value)})}
                  placeholder="100000"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Estrategia</label>
                <select
                  value={newPortfolio.strategy}
                  onChange={(e) => setNewPortfolio({...newPortfolio, strategy: e.target.value})}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                >
                  <option value="conservative">Conservador</option>
                  <option value="balanced">Balanceado</option>
                  <option value="aggressive">Agresivo</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreatePortfolio}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Crear Portfolio
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-muted text-foreground py-2 rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal añadir acción */}
      {showAddStockModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Añadir Acción</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Símbolo</label>
                <input
                  type="text"
                  value={newStock.symbol}
                  onChange={(e) => setNewStock({...newStock, symbol: e.target.value.toUpperCase()})}
                  placeholder="AAPL"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Número de Acciones</label>
                <input
                  type="number"
                  value={newStock.shares}
                  onChange={(e) => setNewStock({...newStock, shares: e.target.value})}
                  placeholder="100"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Precio de Compra</label>
                <input
                  type="number"
                  step="0.01"
                  value={newStock.purchase_price}
                  onChange={(e) => setNewStock({...newStock, purchase_price: e.target.value})}
                  placeholder="150.00"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Fecha de Compra</label>
                <input
                  type="date"
                  value={newStock.purchase_date}
                  onChange={(e) => setNewStock({...newStock, purchase_date: e.target.value})}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAddStock}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Añadir Acción
              </button>
              <button
                onClick={() => setShowAddStockModal(false)}
                className="flex-1 bg-muted text-foreground py-2 rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

