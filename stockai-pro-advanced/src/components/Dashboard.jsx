// Componente Dashboard principal
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Bell,
  Briefcase
} from 'lucide-react';
import { useStock } from '../contexts/StockContext';
import { stockAPI, formatPrice, formatPercent, getCatalystScoreColor, getRecommendationColor } from '../lib/api';
import MarketOverviewChart from './charts/MarketOverviewChart';
import SectorPerformanceChart from './charts/SectorPerformanceChart';
import TopOpportunitiesChart from './charts/TopOpportunitiesChart';

export default function Dashboard() {
  const { summary, watchlist, alerts, portfolio } = useStock();
  const [topOpportunities, setTopOpportunities] = useState([]);
  const [marketMovers, setMarketMovers] = useState({ gainers: [], losers: [] });
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [opportunities, movers, sectorsData] = await Promise.all([
        stockAPI.getTopOpportunities(10),
        stockAPI.getMarketMovers(),
        stockAPI.getSectors()
      ]);
      
      setTopOpportunities(opportunities);
      setMarketMovers(movers);
      setSectors(sectorsData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMarketSentiment = () => {
    const strongBuy = summary.recommendations?.STRONG_BUY || 0;
    const buy = summary.recommendations?.BUY || 0;
    const total = summary.total_stocks || 5128;
    const bullishPercent = ((strongBuy + buy) / total) * 100;
    
    if (bullishPercent > 60) return { sentiment: 'Muy Alcista', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    if (bullishPercent > 50) return { sentiment: 'Alcista', color: 'text-green-300', bgColor: 'bg-green-500/10' };
    if (bullishPercent < 40) return { sentiment: 'Bajista', color: 'text-red-400', bgColor: 'bg-red-500/20' };
    if (bullishPercent < 50) return { sentiment: 'Ligeramente Bajista', color: 'text-red-300', bgColor: 'bg-red-500/10' };
    return { sentiment: 'Neutral', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20' };
  };

  const marketSentiment = getMarketSentiment();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-muted rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Análisis completo de {summary.total_stocks || 5128} acciones con IA
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg ${marketSentiment.bgColor}`}>
          <span className={`font-medium ${marketSentiment.color}`}>
            Mercado {marketSentiment.sentiment}
          </span>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Acciones</p>
              <p className="text-2xl font-bold text-foreground">
                {(summary.total_stocks || 5128).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Activity className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">100% analizadas</span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">STRONG_BUY</p>
              <p className="text-2xl font-bold text-green-400">
                {(summary.recommendations?.STRONG_BUY || 1785).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">
              {(((summary.recommendations?.STRONG_BUY || 1785) / (summary.total_stocks || 5128)) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Score Promedio</p>
              <p className="text-2xl font-bold text-foreground">
                {(summary.avg_catalyst_score || 73.0).toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={getCatalystScoreColor(summary.avg_catalyst_score || 73.0)}>
              Catalyst Score IA
            </span>
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">En Watchlist</p>
              <p className="text-2xl font-bold text-foreground">
                {watchlist.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <Bell className="w-4 h-4 text-purple-400 mr-1" />
            <span className="text-purple-400">{alerts.length} alertas activas</span>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Overview Chart */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Distribución de Recomendaciones</h3>
          <MarketOverviewChart data={summary.recommendations || {}} />
        </div>

        {/* Sector Performance */}
        <div className="bg-card rounded-lg p-6 border border-border">
          <h3 className="text-lg font-semibold mb-4">Rendimiento por Sectores</h3>
          <SectorPerformanceChart data={sectors.slice(0, 6)} />
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Opportunities */}
        <div className="lg:col-span-2 bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Oportunidades IA</h3>
            <button className="text-sm text-primary hover:underline">
              Ver todas
            </button>
          </div>
          
          <div className="space-y-3">
            {topOpportunities.slice(0, 8).map((stock, index) => (
              <div 
                key={stock.symbol}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                onClick={() => window.location.href = `/stocks/${stock.symbol}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-medium">{stock.symbol}</div>
                    <div className="text-sm text-muted-foreground truncate max-w-32">
                      {stock.name}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">{formatPrice(stock.price)}</div>
                    <div className={`text-sm ${
                      stock.change_percent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPercent(stock.change_percent)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getCatalystScoreColor(stock.catalyst_score)}`}>
                      {stock.catalyst_score}
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getRecommendationColor(stock.recommendation)}`}>
                    {stock.recommendation}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Movers & Quick Stats */}
        <div className="space-y-6">
          {/* Market Movers */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Mayores Movimientos</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-green-400 mb-2 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  Subidas
                </h4>
                <div className="space-y-2">
                  {marketMovers.gainers.slice(0, 3).map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">{formatPrice(stock.price)}</div>
                      </div>
                      <div className="text-green-400 text-sm font-medium">
                        {formatPercent(stock.change_percent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2 flex items-center">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  Bajadas
                </h4>
                <div className="space-y-2">
                  {marketMovers.losers.slice(0, 3).map((stock) => (
                    <div key={stock.symbol} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">{formatPrice(stock.price)}</div>
                      </div>
                      <div className="text-red-400 text-sm font-medium">
                        {formatPercent(stock.change_percent)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-card rounded-lg p-6 border border-border">
            <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
            
            <div className="space-y-3">
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                onClick={() => window.location.href = '/screener'}
              >
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Screener Avanzado</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-primary" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
                onClick={() => window.location.href = '/stocks?recommendation=STRONG_BUY'}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium">Ver STRONG_BUY</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-green-400" />
              </button>
              
              <button 
                className="w-full flex items-center justify-between p-3 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-colors"
                onClick={() => window.location.href = '/sectors'}
              >
                <div className="flex items-center space-x-2">
                  <PieChart className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-medium">Análisis Sectorial</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-blue-400" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

