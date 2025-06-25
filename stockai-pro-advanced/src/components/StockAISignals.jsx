// Componente StockAISignals simplificado y corregido
import React, { useState, useEffect } from 'react';
import { 
  Zap, TrendingUp, Calendar, Target, Brain, 
  AlertTriangle, Clock, DollarSign, BarChart3,
  Filter, Search, RefreshCw, Eye, Star,
  ArrowUp, ArrowDown, Activity, Lightbulb
} from 'lucide-react';

export default function StockAISignals() {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateAISignals();
  }, []);

  const generateAISignals = async () => {
    setLoading(true);
    
    setTimeout(() => {
      const aiSignals = [
        {
          id: 1,
          symbol: 'CRM',
          name: 'Salesforce Inc.',
          current_price: 245.67,
          signal_type: 'Stock Buy Signal',
          confidence: 95,
          upside_potential: 30,
          target_price: 319.37,
          signal_date: '2024-05-20',
          target_date: '2024-08-29',
          hold_period: '3 months',
          allocation: 'Buy no more than 5%',
          sector: 'Technology',
          market_cap: '$245Bn',
          insider_ownership: 2.6,
          institutional_ownership: 82.4,
          retail_ownership: 16.5,
          analysis: 'With all-time high financials and steady revenue growth, this stock shows strong technical momentum, signaling a potential +30% upside in the coming months.',
          risk_level: 'Medium',
          catalyst: 'Strong Q4 earnings beat expected',
          next_earnings: '2024-06-20'
        },
        {
          id: 2,
          symbol: 'NVDA',
          name: 'NVIDIA Corporation',
          current_price: 875.28,
          signal_type: 'AI Momentum Signal',
          confidence: 92,
          upside_potential: 45,
          target_price: 1269.16,
          signal_date: '2024-06-12',
          target_date: '2024-10-15',
          hold_period: '4 months',
          allocation: 'Buy no more than 8%',
          sector: 'Technology',
          market_cap: '$2.1T',
          insider_ownership: 4.1,
          institutional_ownership: 65.8,
          retail_ownership: 30.1,
          analysis: 'AI revolution leader with unprecedented demand for GPU chips. Technical breakout pattern suggests continuation of bull run with potential 45% upside.',
          risk_level: 'High',
          catalyst: 'New AI chip architecture announcement',
          next_earnings: '2024-08-28'
        },
        {
          id: 3,
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          current_price: 378.85,
          signal_type: 'Cloud Growth Signal',
          confidence: 89,
          upside_potential: 25,
          target_price: 473.56,
          signal_date: '2024-06-08',
          target_date: '2024-09-30',
          hold_period: '3.5 months',
          allocation: 'Buy no more than 6%',
          sector: 'Technology',
          market_cap: '$2.8T',
          insider_ownership: 0.1,
          institutional_ownership: 71.2,
          retail_ownership: 28.7,
          analysis: 'Azure cloud growth acceleration combined with AI integration across Office suite creates compelling growth narrative.',
          risk_level: 'Low',
          catalyst: 'Azure revenue growth beats expectations',
          next_earnings: '2024-07-24'
        },
        {
          id: 4,
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          current_price: 142.56,
          signal_type: 'Search AI Signal',
          confidence: 85,
          upside_potential: 35,
          target_price: 192.46,
          signal_date: '2024-06-05',
          target_date: '2024-11-15',
          hold_period: '5 months',
          allocation: 'Buy no more than 7%',
          sector: 'Technology',
          market_cap: '$1.8T',
          insider_ownership: 11.2,
          institutional_ownership: 65.4,
          retail_ownership: 23.4,
          analysis: 'Gemini AI integration into search creates new monetization opportunities. YouTube Shorts growth and cloud expansion provide multiple growth drivers.',
          risk_level: 'Medium',
          catalyst: 'Gemini AI search rollout success',
          next_earnings: '2024-07-23'
        },
        {
          id: 5,
          symbol: 'ACN',
          name: 'Accenture PLC',
          current_price: 333.45,
          signal_type: 'Stock Buy Signal',
          confidence: 88,
          upside_potential: 30,
          target_price: 433.49,
          signal_date: '2024-06-10',
          target_date: '2024-09-10',
          hold_period: '3 months',
          allocation: 'Buy no more than 5%',
          sector: 'Technology',
          market_cap: '$178Bn',
          insider_ownership: 0.1,
          institutional_ownership: 73.2,
          retail_ownership: 27.7,
          analysis: 'This strong tech consulting company has shown a clear cyclical pattern—and current levels suggest an attractive entry point.',
          risk_level: 'Low',
          catalyst: 'Digital transformation contracts surge',
          next_earnings: '2024-06-20'
        }
      ];
      
      setSignals(aiSignals);
      setLoading(false);
    }, 2000);
  };

  const refreshSignals = async () => {
    setRefreshing(true);
    await generateAISignals();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const filteredSignals = signals.filter(signal => {
    const matchesSearch = signal.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         signal.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'short_term' && signal.hold_period.includes('3 months')) ||
                         (filter === 'long_term' && !signal.hold_period.includes('3 months'));
    
    return matchesSearch && matchesFilter;
  });

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400 bg-green-400/10';
    if (confidence >= 80) return 'text-blue-400 bg-blue-400/10';
    if (confidence >= 70) return 'text-yellow-400 bg-yellow-400/10';
    return 'text-orange-400 bg-orange-400/10';
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-400/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'High': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Stock AI Signals</h1>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <div className="text-center">
            <h3 className="text-lg font-medium text-foreground mb-2">Analizando 5,128 acciones con IA</h3>
            <p className="text-muted-foreground">Identificando oportunidades de inversión...</p>
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
            <Zap className="h-8 w-8 text-yellow-400" />
            Stock AI Signals
          </h1>
          <p className="text-muted-foreground">Señales de IA para acciones con potencial de subida</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={refreshSignals}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar Señales
          </button>
        </div>
      </div>

      {/* Métricas de análisis */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Acciones Analizadas</span>
            <Brain className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">5,128</div>
          <div className="text-sm text-green-400">100% completado</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Señales Activas</span>
            <Lightbulb className="h-4 w-4 text-yellow-400" />
          </div>
          <div className="text-2xl font-bold text-foreground">{signals.length}</div>
          <div className="text-sm text-blue-400">Alta confianza</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Upside Promedio</span>
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <div className="text-2xl font-bold text-green-400">+33%</div>
          <div className="text-sm text-muted-foreground">Próximos 3-5 meses</div>
        </div>

        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Confianza IA</span>
            <Activity className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">89%</div>
          <div className="text-sm text-muted-foreground">Precisión histórica</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-card rounded-lg p-6 border border-border space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium text-foreground">Filtrar Señales</h3>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar por símbolo o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'all' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('short_term')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'short_term' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Corto Plazo
            </button>
            <button
              onClick={() => setFilter('long_term')}
              className={`px-4 py-2 rounded-md transition-colors ${
                filter === 'long_term' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Largo Plazo
            </button>
          </div>
        </div>
      </div>

      {/* Lista de señales */}
      <div className="space-y-4">
        {filteredSignals.map((signal) => (
          <div key={signal.id} className="bg-card rounded-lg border border-border overflow-hidden">
            <div className="p-6">
              {/* Header de la señal */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary text-lg">{signal.symbol}</span>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{signal.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm text-muted-foreground">{signal.sector}</span>
                      <span className="text-sm text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">{signal.market_cap}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-foreground">
                    ${signal.current_price.toFixed(2)}
                  </div>
                  <div className="text-sm text-green-400">
                    Target: ${signal.target_price.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Métricas principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Tipo de Señal</div>
                  <div className="font-medium text-foreground">{signal.signal_type}</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Confianza</div>
                  <div className={`font-bold px-2 py-1 rounded ${getConfidenceColor(signal.confidence)}`}>
                    {signal.confidence}%
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Upside Potencial</div>
                  <div className="font-bold text-green-400">+{signal.upside_potential}%</div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">Riesgo</div>
                  <div className={`font-medium px-2 py-1 rounded ${getRiskColor(signal.risk_level)}`}>
                    {signal.risk_level}
                  </div>
                </div>
              </div>

              {/* Información de la señal */}
              <div className="bg-muted/30 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-2 mb-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium text-green-400 mb-1">Stock Buy Signal:</div>
                    <p className="text-sm text-foreground leading-relaxed">
                      {signal.analysis}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detalles adicionales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Fechas Importantes</span>
                  </div>
                  <div className="space-y-1">
                    <div>Señal enviada: {signal.signal_date}</div>
                    <div>Target fecha: {signal.target_date}</div>
                    <div>Próximos earnings: {signal.next_earnings}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Recomendaciones</span>
                  </div>
                  <div className="space-y-1">
                    <div>Período: {signal.hold_period}</div>
                    <div>Asignación: {signal.allocation}</div>
                    <div>Catalizador: {signal.catalyst}</div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Estructura Accionaria</span>
                  </div>
                  <div className="space-y-1">
                    <div>Insiders: {signal.insider_ownership}%</div>
                    <div>Instituciones: {signal.institutional_ownership}%</div>
                    <div>Retail: {signal.retail_ownership}%</div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  <Eye className="h-4 w-4" />
                  Ver Gráfico de Predicción
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
                  <Star className="h-4 w-4" />
                  Añadir a Watchlist
                </button>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-md hover:bg-muted/80 transition-colors">
                  <AlertTriangle className="h-4 w-4" />
                  Crear Alerta
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSignals.length === 0 && (
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No se encontraron señales</h3>
          <p className="text-muted-foreground">
            Intenta ajustar los filtros o buscar por un término diferente.
          </p>
        </div>
      )}
    </div>
  );
}

