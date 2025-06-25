// Componente StockDetail completo con análisis y gráficos
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, TrendingDown, BarChart3, Heart, 
  AlertTriangle, Target, Calendar, DollarSign, Activity,
  Brain, Zap, Eye, Share2, Download, Plus
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function StockDetail() {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const [stockData, setStockData] = useState(null);
  const [historicalData, setHistoricalData] = useState(null);
  const [technicalData, setTechnicalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (symbol) {
      fetchStockData();
      fetchHistoricalData();
      fetchTechnicalData();
    }
  }, [symbol]);

  const fetchStockData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/stocks/${symbol}`);
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      // Datos de ejemplo
      setStockData({
        symbol: symbol || 'AAPL',
        name: 'Apple Inc.',
        current_price: 175.43,
        price_change: 2.15,
        price_change_pct: 1.24,
        recommendation: 'STRONG_BUY',
        catalyst_score: 100,
        confidence: 'very_high',
        sentiment: 'Very Positive',
        sentiment_score: 0.89,
        sector: 'Technology',
        market_cap: '2.8T',
        volume: '45.2M',
        avg_volume: '52.1M',
        pe_ratio: 28.5,
        predictions: {
          '1_day': { direction: 'up', magnitude: 2.1, confidence: 78.5 },
          '1_week': { direction: 'up', magnitude: 5.8, confidence: 72.3 },
          '1_month': { direction: 'up', magnitude: 12.4, confidence: 68.9 },
          '3_months': { direction: 'up', magnitude: 18.7, confidence: 65.2 }
        },
        technical_indicators: {
          rsi: 65.2,
          macd: 1.45,
          bollinger_position: 'Upper Band',
          volume_trend: 'High Volume'
        },
        patterns_detected: [
          { pattern: 'Bull Flag', confidence: 87.3, signal: 'Bullish' },
          { pattern: 'Ascending Triangle', confidence: 82.1, signal: 'Bullish' }
        ],
        catalysts: [
          { type: 'Earnings Beat', impact: 'High', date: '2024-01-25', description: 'Q4 earnings exceeded expectations by 15%' },
          { type: 'Product Launch', impact: 'Medium', date: '2024-02-01', description: 'New iPhone model announcement' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/charts/${symbol}/historical`);
      const data = await response.json();
      setHistoricalData(data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Datos de ejemplo para el gráfico
      const dates = [];
      const prices = [];
      const volumes = [];
      
      for (let i = 30; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
        
        const basePrice = 170;
        const randomChange = (Math.random() - 0.5) * 10;
        prices.push(basePrice + randomChange + (i * 0.2));
        volumes.push(Math.floor(Math.random() * 20000000) + 30000000);
      }
      
      setHistoricalData({ dates, prices, volumes });
    }
  };

  const fetchTechnicalData = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/charts/${symbol}/technical`);
      const data = await response.json();
      setTechnicalData(data);
    } catch (error) {
      console.error('Error fetching technical data:', error);
      // Datos técnicos de ejemplo
      setTechnicalData({
        rsi_history: Array.from({ length: 30 }, (_, i) => 50 + Math.sin(i * 0.2) * 20),
        macd_history: Array.from({ length: 30 }, (_, i) => Math.sin(i * 0.3) * 2),
        bollinger_bands: {
          upper: Array.from({ length: 30 }, (_, i) => 180 + Math.sin(i * 0.1) * 5),
          middle: Array.from({ length: 30 }, (_, i) => 175 + Math.sin(i * 0.1) * 3),
          lower: Array.from({ length: 30 }, (_, i) => 170 + Math.sin(i * 0.1) * 2)
        }
      });
    }
  };

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
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-blue-400';
    if (score >= 50) return 'text-yellow-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPredictionColor = (direction) => {
    return direction === 'up' ? 'text-green-400' : 'text-red-400';
  };

  // Configuración del gráfico de precio
  const priceChartData = historicalData ? {
    labels: historicalData.dates,
    datasets: [
      {
        label: 'Precio',
        data: historicalData.prices,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4,
      }
    ]
  } : null;

  const priceChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Precio Histórico (30 días)',
        color: '#ffffff'
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  // Configuración del gráfico de volumen
  const volumeChartData = historicalData ? {
    labels: historicalData.dates,
    datasets: [
      {
        label: 'Volumen',
        data: historicalData.volumes,
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      }
    ]
  } : null;

  const volumeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false
      },
      title: {
        display: true,
        text: 'Volumen de Trading',
        color: '#ffffff'
      }
    },
    scales: {
      x: {
        ticks: { color: '#9ca3af' },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      },
      y: {
        ticks: { 
          color: '#9ca3af',
          callback: function(value) {
            return (value / 1000000).toFixed(1) + 'M';
          }
        },
        grid: { color: 'rgba(156, 163, 175, 0.1)' }
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/stocks')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Cargando análisis...</h1>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!stockData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/stocks')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-3xl font-bold text-foreground">Acción no encontrada</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/stocks')}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{stockData.symbol}</h1>
            <p className="text-muted-foreground">{stockData.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Heart className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          <button className="p-2 hover:bg-muted rounded-full transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Precio Actual</span>
            <DollarSign className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">${stockData.current_price?.toFixed(2)}</div>
          <div className={`flex items-center gap-1 text-sm ${
            stockData.price_change_pct > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {stockData.price_change_pct > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {stockData.price_change_pct > 0 ? '+' : ''}{stockData.price_change_pct?.toFixed(2)}% ({stockData.price_change > 0 ? '+' : ''}${stockData.price_change?.toFixed(2)})
          </div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Score IA</span>
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className={`text-2xl font-bold ${getScoreColor(stockData.catalyst_score)}`}>
            {stockData.catalyst_score}
          </div>
          <div className="text-sm text-muted-foreground">Confianza: {stockData.confidence}</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Recomendación</span>
            <Target className="h-4 w-4 text-primary" />
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full text-sm font-bold border ${getRecommendationColor(stockData.recommendation)}`}>
            {stockData.recommendation}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Sentimiento: {stockData.sentiment}</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Volumen</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{stockData.volume}</div>
          <div className="text-sm text-muted-foreground">Promedio: {stockData.avg_volume}</div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-border">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Resumen', icon: Eye },
            { id: 'charts', label: 'Gráficos', icon: BarChart3 },
            { id: 'technical', label: 'Análisis Técnico', icon: Activity },
            { id: 'predictions', label: 'Predicciones', icon: Zap },
            { id: 'catalysts', label: 'Catalizadores', icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información general */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Información General</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sector:</span>
                  <span className="text-foreground font-medium">{stockData.sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cap. de Mercado:</span>
                  <span className="text-foreground font-medium">{stockData.market_cap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">P/E Ratio:</span>
                  <span className="text-foreground font-medium">{stockData.pe_ratio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">RSI:</span>
                  <span className={`font-medium ${
                    stockData.technical_indicators.rsi > 70 ? 'text-red-400' : 
                    stockData.technical_indicators.rsi < 30 ? 'text-green-400' : 'text-foreground'
                  }`}>
                    {stockData.technical_indicators.rsi}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">MACD:</span>
                  <span className="text-foreground font-medium">{stockData.technical_indicators.macd}</span>
                </div>
              </div>
            </div>

            {/* Patrones detectados */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Patrones Detectados</h3>
              <div className="space-y-3">
                {stockData.patterns_detected?.map((pattern, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <div className="font-medium text-foreground">{pattern.pattern}</div>
                      <div className="text-sm text-muted-foreground">Confianza: {pattern.confidence}%</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      pattern.signal === 'Bullish' ? 'text-green-400 bg-green-400/10' :
                      pattern.signal === 'Bearish' ? 'text-red-400 bg-red-400/10' :
                      'text-yellow-400 bg-yellow-400/10'
                    }`}>
                      {pattern.signal}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'charts' && (
          <div className="space-y-6">
            {/* Gráfico de precio */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Gráfico de Precio</h3>
              {priceChartData && (
                <div className="h-80">
                  <Line data={priceChartData} options={priceChartOptions} />
                </div>
              )}
            </div>

            {/* Gráfico de volumen */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Volumen de Trading</h3>
              {volumeChartData && (
                <div className="h-60">
                  <Bar data={volumeChartData} options={volumeChartOptions} />
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Indicadores técnicos */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Indicadores Técnicos</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">RSI (14)</span>
                    <span className={`font-bold ${
                      stockData.technical_indicators.rsi > 70 ? 'text-red-400' : 
                      stockData.technical_indicators.rsi < 30 ? 'text-green-400' : 'text-foreground'
                    }`}>
                      {stockData.technical_indicators.rsi}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        stockData.technical_indicators.rsi > 70 ? 'bg-red-400' : 
                        stockData.technical_indicators.rsi < 30 ? 'bg-green-400' : 'bg-blue-400'
                      }`}
                      style={{ width: `${stockData.technical_indicators.rsi}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stockData.technical_indicators.rsi > 70 ? 'Sobrecompra' : 
                     stockData.technical_indicators.rsi < 30 ? 'Sobreventa' : 'Neutral'}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">MACD</span>
                    <span className={`font-bold ${
                      stockData.technical_indicators.macd > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {stockData.technical_indicators.macd}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {stockData.technical_indicators.macd > 0 ? 'Señal alcista' : 'Señal bajista'}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Bollinger Bands</span>
                    <span className="font-bold text-foreground">{stockData.technical_indicators.bollinger_position}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Posición actual en las bandas
                  </div>
                </div>
              </div>
            </div>

            {/* Análisis de volumen */}
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Análisis de Volumen</h3>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-foreground">Tendencia de Volumen</span>
                    <span className={`font-bold px-2 py-1 rounded text-xs ${
                      stockData.technical_indicators.volume_trend === 'High Volume' ? 'text-green-400 bg-green-400/10' :
                      stockData.technical_indicators.volume_trend === 'Low Volume' ? 'text-red-400 bg-red-400/10' :
                      'text-yellow-400 bg-yellow-400/10'
                    }`}>
                      {stockData.technical_indicators.volume_trend}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-foreground">Volumen vs Promedio</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Actual: {stockData.volume} | Promedio: {stockData.avg_volume}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(stockData.predictions || {}).map(([period, prediction]) => (
              <div key={period} className="bg-card rounded-lg p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-foreground capitalize">
                    {period.replace('_', ' ')}
                  </h4>
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    {prediction.direction === 'up' ? 
                      <TrendingUp className="h-5 w-5 text-green-400" /> : 
                      <TrendingDown className="h-5 w-5 text-red-400" />
                    }
                    <span className={`font-bold ${getPredictionColor(prediction.direction)}`}>
                      {prediction.direction === 'up' ? '+' : '-'}{prediction.magnitude?.toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Confianza: {prediction.confidence?.toFixed(1)}%
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="h-2 rounded-full bg-primary"
                      style={{ width: `${prediction.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'catalysts' && (
          <div className="space-y-6">
            <div className="bg-card rounded-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">Catalizadores Identificados</h3>
              <div className="space-y-4">
                {stockData.catalysts?.map((catalyst, index) => (
                  <div key={index} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-foreground">{catalyst.type}</h4>
                        <p className="text-sm text-muted-foreground">{catalyst.description}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          catalyst.impact === 'High' ? 'text-red-400 bg-red-400/10' :
                          catalyst.impact === 'Medium' ? 'text-yellow-400 bg-yellow-400/10' :
                          'text-green-400 bg-green-400/10'
                        }`}>
                          {catalyst.impact} Impact
                        </span>
                        <span className="text-xs text-muted-foreground">{catalyst.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Acciones rápidas */}
      <div className="bg-card rounded-lg p-6 border border-border">
        <h3 className="text-lg font-semibold text-foreground mb-4">Acciones Rápidas</h3>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            <Plus className="h-4 w-4" />
            Añadir a Watchlist
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            <AlertTriangle className="h-4 w-4" />
            Crear Alerta
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            <BarChart3 className="h-4 w-4" />
            Comparar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
            <Download className="h-4 w-4" />
            Exportar Análisis
          </button>
        </div>
      </div>
    </div>
  );
}

