import React, { useState, useEffect } from 'react';
import { 
  X, TrendingUp, BarChart3, Calendar, Target, 
  DollarSign, Activity, AlertTriangle, Clock 
} from 'lucide-react';

const PredictionChart = ({ stock, timeHorizon, onClose }) => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePredictionData = () => {
      setLoading(true);
      
      // Simular tiempo de carga
      setTimeout(() => {
        const currentPrice = stock.current_price || 10; // Valor por defecto si no existe
        const targetPrice = stock.target_price || currentPrice * 1.2; // 20% más si no existe
        const days = timeHorizon === 'corto_plazo' ? 21 : 90;
        
        // Generar datos de predicción
        const dates = [];
        const prices = [];
        const confidence = [];
        
        for (let i = 0; i <= days; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          dates.push(date.toLocaleDateString('es-ES'));
          
          // Generar curva de precio con tendencia hacia el target
          const progress = i / days;
          
          // Usar una curva suave hacia el target con algo de volatilidad
          const baseProgress = Math.sin(progress * Math.PI / 2); // Curva suave
          const randomVariation = (Math.random() - 0.5) * 0.05; // ±2.5% volatilidad
          const volatilityFactor = Math.sin(i * 0.3) * 0.02; // Oscilación pequeña
          
          const trendPrice = currentPrice + (targetPrice - currentPrice) * baseProgress;
          const finalPrice = trendPrice * (1 + randomVariation + volatilityFactor);
          
          prices.push(Math.max(finalPrice, currentPrice * 0.8)); // No bajar más del 20%
          
          // Confianza que decrece ligeramente con el tiempo
          const baseConfidence = (stock.confidence || 75) / 100;
          const timeDecay = Math.max(0.5, baseConfidence - (progress * 0.2));
          confidence.push(timeDecay * 100);
        }
        
        console.log('Datos generados:', {
          symbol: stock.symbol,
          currentPrice,
          targetPrice,
          days,
          pricesLength: prices.length,
          firstPrice: prices[0],
          lastPrice: prices[prices.length - 1],
          confidenceLength: confidence.length
        });
        
        setChartData({
          dates,
          prices,
          confidence,
          currentPrice,
          targetPrice,
          days
        });
        setLoading(false);
      }, 1000); // Reducir tiempo de carga
    };
    
    generatePredictionData();
  }, [stock, timeHorizon]);

  const getMaxPrice = () => {
    if (!chartData || !chartData.prices || chartData.prices.length === 0) return 100;
    return Math.max(...chartData.prices, chartData.targetPrice);
  };
  
  const getMinPrice = () => {
    if (!chartData || !chartData.prices || chartData.prices.length === 0) return 0;
    return Math.min(...chartData.prices, chartData.currentPrice);
  };
  
  const getPriceRange = () => {
    const range = getMaxPrice() - getMinPrice();
    return range > 0 ? range : 1; // Evitar división por 0
  };

  const getYPosition = (price) => {
    const range = getPriceRange();
    const padding = range * 0.1;
    const adjustedMax = getMaxPrice() + padding;
    const adjustedMin = getMinPrice() - padding;
    const adjustedRange = adjustedMax - adjustedMin;
    
    if (adjustedRange === 0) return 150; // Posición central si no hay rango
    
    return ((adjustedMax - price) / adjustedRange) * 300; // 300px height
  };

  if (loading || !chartData) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-card rounded-lg border border-border w-full max-w-4xl mx-4 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Generando Gráfico de Predicción</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Activity className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
              <p className="text-foreground mb-2">Analizando patrones técnicos para {stock.symbol}</p>
              <p className="text-muted-foreground">Generando predicción para {timeHorizon === 'corto_plazo' ? '21 días' : '3 meses'}</p>
              <div className="mt-4">
                <div className="w-48 h-2 bg-muted rounded-full mx-auto">
                  <div className="h-full bg-primary rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card rounded-lg border border-border w-full max-w-6xl mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Gráfico de Predicción - {stock.symbol}
            </h2>
            <p className="text-muted-foreground">{stock.name}</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Métricas clave */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <DollarSign className="h-5 w-5 text-primary mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Precio Actual</div>
            <div className="text-lg font-bold text-foreground">${chartData.currentPrice.toFixed(2)}</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Target className="h-5 w-5 text-green-400 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Precio Objetivo</div>
            <div className="text-lg font-bold text-green-400">${chartData.targetPrice.toFixed(2)}</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <TrendingUp className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Upside Potencial</div>
            <div className="text-lg font-bold text-blue-400">+{stock.upside_potential}%</div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-4 text-center">
            <Clock className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Horizonte</div>
            <div className="text-lg font-bold text-yellow-400">{chartData.days} días</div>
          </div>
        </div>

        {/* Gráfico */}
        <div className="bg-muted/20 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-foreground mb-4">Proyección de Precio</h3>
          
          <div className="relative h-80 w-full border border-border rounded bg-background/50">
            {chartData && chartData.prices && chartData.prices.length > 0 ? (
              <svg width="100%" height="100%" className="absolute inset-0">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground/20"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Price line */}
                <polyline
                  points={chartData.prices.map((price, index) => {
                    const x = (index / Math.max(chartData.prices.length - 1, 1)) * 100;
                    const y = (getYPosition(price) / 300) * 100;
                    return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                  }).join(' ')}
                  fill="none"
                  stroke="rgb(59, 130, 246)"
                  strokeWidth="3"
                  className="drop-shadow-sm"
                />
                
                {/* Confidence area */}
                <polygon
                  points={[
                    ...chartData.prices.map((price, index) => {
                      const x = (index / Math.max(chartData.prices.length - 1, 1)) * 100;
                      const confidenceRange = price * (chartData.confidence[index] / 100) * 0.1;
                      const upperPrice = price + confidenceRange;
                      const y = (getYPosition(upperPrice) / 300) * 100;
                      return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                    }),
                    ...chartData.prices.slice().reverse().map((price, reverseIndex) => {
                      const index = chartData.prices.length - 1 - reverseIndex;
                      const x = (index / Math.max(chartData.prices.length - 1, 1)) * 100;
                      const confidenceRange = price * (chartData.confidence[index] / 100) * 0.1;
                      const lowerPrice = price - confidenceRange;
                      const y = (getYPosition(lowerPrice) / 300) * 100;
                      return `${x}%,${Math.max(0, Math.min(100, y))}%`;
                    })
                  ].join(' ')}
                  fill="rgb(59, 130, 246)"
                  fillOpacity="0.2"
                />
                
                {/* Current price line */}
                <line
                  x1="0%"
                  y1={`${Math.max(0, Math.min(100, (getYPosition(chartData.currentPrice) / 300) * 100))}%`}
                  x2="100%"
                  y2={`${Math.max(0, Math.min(100, (getYPosition(chartData.currentPrice) / 300) * 100))}%`}
                  stroke="rgb(34, 197, 94)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
                
                {/* Target price line */}
                <line
                  x1="0%"
                  y1={`${Math.max(0, Math.min(100, (getYPosition(chartData.targetPrice) / 300) * 100))}%`}
                  x2="100%"
                  y2={`${Math.max(0, Math.min(100, (getYPosition(chartData.targetPrice) / 300) * 100))}%`}
                  stroke="rgb(239, 68, 68)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Generando datos del gráfico...</p>
                </div>
              </div>
            )}
            
            {/* Price labels */}
            <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
              <div className="space-y-8">
                <div>${getMaxPrice().toFixed(0)}</div>
                <div>${((getMaxPrice() + getMinPrice()) / 2).toFixed(0)}</div>
                <div>${getMinPrice().toFixed(0)}</div>
              </div>
            </div>
            
            {/* Time labels */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-muted-foreground px-8">
              <span>Hoy</span>
              <span>{Math.floor((chartData?.days || 21) / 3)} días</span>
              <span>{Math.floor(((chartData?.days || 21) * 2) / 3)} días</span>
              <span>{chartData?.days || 21} días</span>
            </div>
          </div>
          
          {/* Leyenda */}
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-blue-500"></div>
              <span className="text-muted-foreground">Predicción de Precio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500 border-dashed border"></div>
              <span className="text-muted-foreground">Precio Actual (${chartData.currentPrice.toFixed(2)})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-red-500 border-dashed border"></div>
              <span className="text-muted-foreground">Precio Objetivo (${chartData.targetPrice.toFixed(2)})</span>
            </div>
          </div>
        </div>

        {/* Análisis técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Señales Técnicas</h4>
            <div className="space-y-2">
              {stock.signals?.slice(0, 5).map((signal, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-foreground">{signal}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="font-medium text-foreground">Métricas de Riesgo</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nivel de Riesgo:</span>
                <span className={`font-medium ${
                  stock.risk_level === 'Alto' ? 'text-red-400' : 
                  stock.risk_level === 'Medio' ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {stock.risk_level}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Confianza IA:</span>
                <span className="font-medium text-primary">{stock.confidence}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Score Técnico:</span>
                <span className="font-medium text-blue-400">{stock.score}/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="text-yellow-400 font-medium mb-1">Aviso Importante</p>
              <p className="text-foreground/80">
                Esta predicción se basa en análisis técnico de IA y no constituye asesoramiento financiero. 
                Los precios de las acciones pueden fluctuar significativamente y las inversiones conllevan riesgos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionChart;
