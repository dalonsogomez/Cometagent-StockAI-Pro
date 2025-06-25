"""
Analizador de Acciones con Horizontes Temporales Específicos
- Corto Plazo: Máximo 21 días
- Largo Plazo: Máximo 3 meses (90 días)

Analiza todas las acciones del CSV de Lightyear con recomendaciones específicas por horizonte temporal
"""

import pandas as pd
import json
import time
from datetime import datetime, timedelta
import yfinance as yf
import numpy as np
import warnings
warnings.filterwarnings('ignore')

class TimeHorizonAnalyzer:
    def __init__(self, csv_file_path):
        self.csv_file_path = csv_file_path
        self.results = []
        
    def load_stocks(self):
        """Carga la lista de acciones desde el archivo CSV"""
        try:
            df = pd.read_csv(self.csv_file_path)
            print(f"✅ Cargadas {len(df)} acciones desde {self.csv_file_path}")
            return df
        except Exception as e:
            print(f"❌ Error cargando archivo CSV: {e}")
            return None
    
    def get_stock_data(self, symbol, period="6mo"):
        """Obtiene datos históricos de la acción"""
        try:
            stock = yf.Ticker(symbol)
            data = stock.history(period=period)
            if data.empty:
                return None
            return data
        except Exception as e:
            print(f"Error obteniendo datos para {symbol}: {e}")
            return None
    
    def calculate_technical_indicators(self, data):
        """Calcula indicadores técnicos específicos para ambos horizontes"""
        if data is None or len(data) < 20:
            return None
        
        # Precios
        close = data['Close']
        high = data['High']
        low = data['Low']
        volume = data['Volume']
        
        # RSI (14 períodos)
        delta = close.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        # MACD
        ema12 = close.ewm(span=12).mean()
        ema26 = close.ewm(span=26).mean()
        macd_line = ema12 - ema26
        signal_line = macd_line.ewm(span=9).mean()
        macd_histogram = macd_line - signal_line
        
        # Bollinger Bands
        bb_period = 20
        bb_std = 2
        bb_middle = close.rolling(window=bb_period).mean()
        bb_upper = bb_middle + (close.rolling(window=bb_period).std() * bb_std)
        bb_lower = bb_middle - (close.rolling(window=bb_period).std() * bb_std)
        bb_width = ((bb_upper - bb_lower) / bb_middle) * 100
        
        # Moving Averages para diferentes horizontes
        sma5 = close.rolling(window=5).mean()    # Corto plazo
        sma10 = close.rolling(window=10).mean()  # Corto plazo
        sma20 = close.rolling(window=20).mean()  # Corto-medio plazo
        sma50 = close.rolling(window=50).mean()  # Largo plazo
        
        # Volumen promedio
        avg_volume_20 = volume.rolling(window=20).mean()
        volume_ratio = volume.iloc[-1] / avg_volume_20.iloc[-1] if not avg_volume_20.empty else 1
        
        # Volatilidad
        returns = close.pct_change()
        volatility_21d = returns.rolling(window=21).std() * np.sqrt(252) * 100
        volatility_90d = returns.rolling(window=90).std() * np.sqrt(252) * 100
        
        # Momentum
        momentum_5d = (close.iloc[-1] / close.iloc[-6] - 1) * 100 if len(close) > 5 else 0
        momentum_21d = (close.iloc[-1] / close.iloc[-22] - 1) * 100 if len(close) > 21 else 0
        
        current_data = {
            'current_price': float(close.iloc[-1]),
            'rsi': float(rsi.iloc[-1]) if not rsi.empty else None,
            'macd': {
                'line': float(macd_line.iloc[-1]) if not macd_line.empty else None,
                'signal': float(signal_line.iloc[-1]) if not signal_line.empty else None,
                'histogram': float(macd_histogram.iloc[-1]) if not macd_histogram.empty else None,
                'trend': 'bullish' if macd_line.iloc[-1] > signal_line.iloc[-1] else 'bearish'
            },
            'bollinger': {
                'upper': float(bb_upper.iloc[-1]) if not bb_upper.empty else None,
                'middle': float(bb_middle.iloc[-1]) if not bb_middle.empty else None,
                'lower': float(bb_lower.iloc[-1]) if not bb_lower.empty else None,
                'width': float(bb_width.iloc[-1]) if not bb_width.empty else None,
                'position': 'upper' if close.iloc[-1] > bb_upper.iloc[-1] else 'lower' if close.iloc[-1] < bb_lower.iloc[-1] else 'middle'
            },
            'moving_averages': {
                'sma5': float(sma5.iloc[-1]) if not sma5.empty else None,
                'sma10': float(sma10.iloc[-1]) if not sma10.empty else None,
                'sma20': float(sma20.iloc[-1]) if not sma20.empty else None,
                'sma50': float(sma50.iloc[-1]) if not sma50.empty else None,
                'trend_short': 'up' if close.iloc[-1] > sma10.iloc[-1] else 'down',
                'trend_long': 'up' if close.iloc[-1] > sma50.iloc[-1] else 'down'
            },
            'volume': {
                'current': float(volume.iloc[-1]),
                'avg_20d': float(avg_volume_20.iloc[-1]) if not avg_volume_20.empty else None,
                'ratio': float(volume_ratio)
            },
            'volatility': {
                'vol_21d': float(volatility_21d.iloc[-1]) if not volatility_21d.empty else None,
                'vol_90d': float(volatility_90d.iloc[-1]) if not volatility_90d.empty else None
            },
            'momentum': {
                'momentum_5d': float(momentum_5d),
                'momentum_21d': float(momentum_21d)
            }
        }
        
        return current_data
    
    def analyze_short_term(self, technical_data):
        """Análisis para horizonte corto plazo (máximo 21 días)"""
        if not technical_data:
            return None
        
        score = 50
        signals = []
        
        # RSI para corto plazo
        rsi = technical_data.get('rsi')
        if rsi:
            if rsi < 30:  # Sobreventa - oportunidad de compra a corto plazo
                score += 20
                signals.append("RSI oversold - potential bounce")
            elif rsi > 70:  # Sobrecompra - riesgo a corto plazo
                score -= 15
                signals.append("RSI overbought - potential pullback")
            elif 40 <= rsi <= 60:  # Zona neutral favorable
                score += 10
                signals.append("RSI in neutral zone")
        
        # MACD para momentum a corto plazo
        macd = technical_data.get('macd', {})
        if macd.get('trend') == 'bullish' and macd.get('histogram', 0) > 0:
            score += 15
            signals.append("MACD bullish momentum")
        elif macd.get('trend') == 'bearish':
            score -= 10
            signals.append("MACD bearish momentum")
        
        # Bollinger Bands para volatilidad y puntos de entrada
        bb = technical_data.get('bollinger', {})
        if bb.get('position') == 'lower':  # Cerca del soporte
            score += 15
            signals.append("Near Bollinger lower band - support level")
        elif bb.get('position') == 'upper':  # Cerca de resistencia
            score -= 10
            signals.append("Near Bollinger upper band - resistance level")
        
        # Moving averages para tendencia corta
        ma = technical_data.get('moving_averages', {})
        if ma.get('trend_short') == 'up':
            score += 10
            signals.append("Above short-term MA")
        
        # Volumen para confirmación
        vol = technical_data.get('volume', {})
        if vol.get('ratio', 1) > 1.5:  # Volumen superior al promedio
            score += 10
            signals.append("Above average volume")
        
        # Momentum de 5 días
        momentum_5d = technical_data.get('momentum', {}).get('momentum_5d', 0)
        if momentum_5d > 3:
            score += 10
            signals.append("Strong 5-day momentum")
        elif momentum_5d < -3:
            score -= 10
            signals.append("Weak 5-day momentum")
        
        # Ajustar por volatilidad
        vol_21d = technical_data.get('volatility', {}).get('vol_21d', 20)
        if vol_21d > 40:  # Alta volatilidad - mayor riesgo
            score -= 5
            signals.append("High volatility - increased risk")
        
        recommendation = self.get_recommendation(score)
        confidence = self.calculate_confidence_short(technical_data)
        
        return {
            'horizon': 'short_term',
            'max_days': 21,
            'recommendation': recommendation,
            'score': max(0, min(100, score)),
            'confidence': confidence,
            'signals': signals,
            'risk_level': 'high' if vol_21d > 35 else 'medium' if vol_21d > 25 else 'low'
        }
    
    def analyze_long_term(self, technical_data):
        """Análisis para horizonte largo plazo (máximo 3 meses / 90 días)"""
        if not technical_data:
            return None
        
        score = 50
        signals = []
        
        # RSI para largo plazo - menos peso a extremos
        rsi = technical_data.get('rsi')
        if rsi:
            if 35 <= rsi <= 65:  # Zona saludable para largo plazo
                score += 15
                signals.append("RSI in healthy range")
            elif rsi < 25 or rsi > 75:  # Extremos que pueden revertir
                score += 5
                signals.append("RSI in extreme zone - potential reversal")
        
        # MACD para tendencia sostenida
        macd = technical_data.get('macd', {})
        if macd.get('trend') == 'bullish':
            score += 20
            signals.append("MACD bullish trend")
        elif macd.get('trend') == 'bearish':
            score -= 15
            signals.append("MACD bearish trend")
        
        # Moving averages para tendencia de largo plazo
        ma = technical_data.get('moving_averages', {})
        current_price = technical_data.get('current_price')
        
        if ma.get('trend_long') == 'up':
            score += 20
            signals.append("Above long-term MA - uptrend")
        elif ma.get('trend_long') == 'down':
            score -= 15
            signals.append("Below long-term MA - downtrend")
        
        # Alineación de medias móviles (muy importante para largo plazo)
        sma10 = ma.get('sma10')
        sma20 = ma.get('sma20')
        sma50 = ma.get('sma50')
        
        if sma10 and sma20 and sma50:
            if sma10 > sma20 > sma50:  # Alineación alcista
                score += 25
                signals.append("Bullish MA alignment")
            elif sma10 < sma20 < sma50:  # Alineación bajista
                score -= 20
                signals.append("Bearish MA alignment")
        
        # Momentum de 21 días para largo plazo
        momentum_21d = technical_data.get('momentum', {}).get('momentum_21d', 0)
        if momentum_21d > 10:
            score += 15
            signals.append("Strong 21-day momentum")
        elif momentum_21d < -10:
            score -= 15
            signals.append("Weak 21-day momentum")
        
        # Volatilidad para largo plazo
        vol_90d = technical_data.get('volatility', {}).get('vol_90d', 20)
        if vol_90d < 20:  # Baja volatilidad favorable para largo plazo
            score += 10
            signals.append("Low volatility - stable for long-term")
        elif vol_90d > 50:  # Alta volatilidad - riesgo para largo plazo
            score -= 10
            signals.append("High volatility - risky for long-term")
        
        # Bollinger Band width para squeeze detection
        bb_width = technical_data.get('bollinger', {}).get('width', 10)
        if bb_width < 5:  # Squeeze - potential breakout
            score += 10
            signals.append("Bollinger squeeze - potential breakout")
        
        recommendation = self.get_recommendation(score)
        confidence = self.calculate_confidence_long(technical_data)
        
        return {
            'horizon': 'long_term',
            'max_days': 90,
            'recommendation': recommendation,
            'score': max(0, min(100, score)),
            'confidence': confidence,
            'signals': signals,
            'risk_level': 'high' if vol_90d > 40 else 'medium' if vol_90d > 25 else 'low'
        }
    
    def get_recommendation(self, score):
        """Convierte el score en recomendación"""
        if score >= 80:
            return "STRONG_BUY"
        elif score >= 65:
            return "BUY"
        elif score >= 55:
            return "WEAK_BUY"
        elif score >= 45:
            return "HOLD"
        elif score >= 35:
            return "WEAK_SELL"
        else:
            return "SELL"
    
    def calculate_confidence_short(self, technical_data):
        """Calcula confianza para análisis de corto plazo"""
        factors = 0
        total = 0
        
        # RSI
        if technical_data.get('rsi'):
            total += 1
            rsi = technical_data['rsi']
            if rsi < 30 or rsi > 70:  # Señales claras
                factors += 1
        
        # MACD
        if technical_data.get('macd', {}).get('histogram'):
            total += 1
            if abs(technical_data['macd']['histogram']) > 0.5:
                factors += 1
        
        # Volumen
        if technical_data.get('volume', {}).get('ratio'):
            total += 1
            if technical_data['volume']['ratio'] > 1.3:
                factors += 1
        
        if total == 0:
            return "low"
        
        ratio = factors / total
        if ratio >= 0.7:
            return "high"
        elif ratio >= 0.5:
            return "medium"
        else:
            return "low"
    
    def calculate_confidence_long(self, technical_data):
        """Calcula confianza para análisis de largo plazo"""
        factors = 0
        total = 0
        
        # Tendencia de MA
        ma = technical_data.get('moving_averages', {})
        if ma.get('sma50'):
            total += 1
            if ma.get('trend_long'):
                factors += 1
        
        # MACD trend
        if technical_data.get('macd', {}).get('trend'):
            total += 1
            factors += 1
        
        # Momentum 21d
        momentum = technical_data.get('momentum', {}).get('momentum_21d', 0)
        if momentum != 0:
            total += 1
            if abs(momentum) > 5:
                factors += 1
        
        if total == 0:
            return "low"
        
        ratio = factors / total
        if ratio >= 0.8:
            return "high"
        elif ratio >= 0.6:
            return "medium"
        else:
            return "low"
    
    def analyze_single_stock(self, symbol, name):
        """Analiza una sola acción para ambos horizontes temporales"""
        try:
            print(f"🔍 Analizando {symbol} ({name})...")
            
            # Obtener datos históricos
            data = self.get_stock_data(symbol)
            if data is None:
                return {
                    'symbol': symbol,
                    'name': name,
                    'error': 'No data available',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Calcular indicadores técnicos
            technical_data = self.calculate_technical_indicators(data)
            if technical_data is None:
                return {
                    'symbol': symbol,
                    'name': name,
                    'error': 'Insufficient data for analysis',
                    'timestamp': datetime.now().isoformat()
                }
            
            # Análisis para ambos horizontes
            short_term_analysis = self.analyze_short_term(technical_data)
            long_term_analysis = self.analyze_long_term(technical_data)
            
            result = {
                'symbol': symbol,
                'name': name,
                'timestamp': datetime.now().isoformat(),
                'current_price': technical_data['current_price'],
                'short_term': short_term_analysis,
                'long_term': long_term_analysis,
                'technical_indicators': technical_data
            }
            
            short_rec = short_term_analysis['recommendation'] if short_term_analysis else 'N/A'
            long_rec = long_term_analysis['recommendation'] if long_term_analysis else 'N/A'
            
            print(f"✅ {symbol}: Corto: {short_rec} | Largo: {long_rec}")
            return result
            
        except Exception as e:
            print(f"❌ Error analizando {symbol}: {e}")
            return {
                'symbol': symbol,
                'name': name,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def analyze_all_stocks(self, limit=None, start_from=0):
        """Analiza todas las acciones del archivo CSV"""
        stocks_df = self.load_stocks()
        if stocks_df is None:
            return
        
        # Aplicar filtros
        if start_from > 0:
            stocks_df = stocks_df.iloc[start_from:]
        
        if limit:
            stocks_df = stocks_df.head(limit)
            print(f"🔬 Analizando {limit} acciones desde la posición {start_from}...")
        else:
            print(f"🔬 Analizando todas las {len(stocks_df)} acciones desde la posición {start_from}...")
        
        start_time = time.time()
        
        for index, row in stocks_df.iterrows():
            symbol = row['Symbol']
            name = row['Stock Name']
            
            result = self.analyze_single_stock(symbol, name)
            self.results.append(result)
            
            # Pausa para no sobrecargar las APIs
            time.sleep(0.2)
            
            # Progreso cada 25 acciones
            if (len(self.results)) % 25 == 0:
                elapsed = time.time() - start_time
                print(f"📊 Progreso: {len(self.results)} acciones analizadas ({elapsed:.1f}s)")
        
        total_time = time.time() - start_time
        print(f"🎉 Análisis completado en {total_time:.1f} segundos")
        
        return self.results
    
    def get_top_opportunities(self, horizon='both', top_n=20):
        """Obtiene las mejores oportunidades por horizonte temporal"""
        valid_results = [r for r in self.results if 'error' not in r]
        
        if horizon == 'short':
            # Ordenar por score de corto plazo
            sorted_results = sorted(valid_results, 
                                  key=lambda x: x.get('short_term', {}).get('score', 0), 
                                  reverse=True)
        elif horizon == 'long':
            # Ordenar por score de largo plazo
            sorted_results = sorted(valid_results, 
                                  key=lambda x: x.get('long_term', {}).get('score', 0), 
                                  reverse=True)
        else:
            # Ordenar por promedio de ambos scores
            def avg_score(x):
                short_score = x.get('short_term', {}).get('score', 0)
                long_score = x.get('long_term', {}).get('score', 0)
                return (short_score + long_score) / 2
            
            sorted_results = sorted(valid_results, key=avg_score, reverse=True)
        
        return sorted_results[:top_n]
    
    def get_recommendations_by_type(self, rec_type, horizon='both'):
        """Obtiene recomendaciones por tipo y horizonte"""
        valid_results = [r for r in self.results if 'error' not in r]
        filtered = []
        
        for result in valid_results:
            if horizon == 'short' or horizon == 'both':
                if result.get('short_term', {}).get('recommendation') == rec_type:
                    filtered.append(result)
            if horizon == 'long' or horizon == 'both':
                if result.get('long_term', {}).get('recommendation') == rec_type:
                    filtered.append(result)
        
        return filtered
    
    def save_results(self, filename='time_horizon_analysis_results.json'):
        """Guarda los resultados en un archivo JSON"""
        output_path = f"/workspaces/Cometagent-StockAI-Pro/{filename}"
        
        # Estadísticas por horizonte
        valid_results = [r for r in self.results if 'error' not in r]
        
        short_recommendations = {}
        long_recommendations = {}
        
        for result in valid_results:
            # Contar recomendaciones de corto plazo
            short_rec = result.get('short_term', {}).get('recommendation', 'N/A')
            short_recommendations[short_rec] = short_recommendations.get(short_rec, 0) + 1
            
            # Contar recomendaciones de largo plazo
            long_rec = result.get('long_term', {}).get('recommendation', 'N/A')
            long_recommendations[long_rec] = long_recommendations.get(long_rec, 0) + 1
        
        analysis_summary = {
            'timestamp': datetime.now().isoformat(),
            'total_stocks_analyzed': len(self.results),
            'successful_analyses': len(valid_results),
            'failed_analyses': len(self.results) - len(valid_results),
            'analysis_type': 'time_horizon_specific',
            'horizons': {
                'short_term': {
                    'max_days': 21,
                    'description': 'Máximo 21 días',
                    'recommendations_count': short_recommendations,
                    'top_opportunities': self.get_top_opportunities('short', 30)
                },
                'long_term': {
                    'max_days': 90,
                    'description': 'Máximo 3 meses (90 días)',
                    'recommendations_count': long_recommendations,
                    'top_opportunities': self.get_top_opportunities('long', 30)
                }
            },
            'strong_buy_short': self.get_recommendations_by_type('STRONG_BUY', 'short'),
            'strong_buy_long': self.get_recommendations_by_type('STRONG_BUY', 'long'),
            'all_results': self.results
        }
        
        with open(output_path, 'w') as f:
            json.dump(analysis_summary, f, indent=2)
        
        print(f"💾 Resultados guardados en: {output_path}")
        return output_path
    
    def print_summary(self):
        """Imprime un resumen detallado de los resultados"""
        if not self.results:
            print("❌ No hay resultados para mostrar")
            return
        
        valid_results = [r for r in self.results if 'error' not in r]
        
        print("\n" + "="*80)
        print("📊 ANÁLISIS DE ACCIONES POR HORIZONTES TEMPORALES")
        print("="*80)
        print(f"Total de acciones analizadas: {len(self.results)}")
        print(f"Análisis exitosos: {len(valid_results)}")
        print(f"Análisis fallidos: {len(self.results) - len(valid_results)}")
        
        # Estadísticas por horizonte
        short_recommendations = {}
        long_recommendations = {}
        
        for result in valid_results:
            short_rec = result.get('short_term', {}).get('recommendation', 'N/A')
            short_recommendations[short_rec] = short_recommendations.get(short_rec, 0) + 1
            
            long_rec = result.get('long_term', {}).get('recommendation', 'N/A')
            long_recommendations[long_rec] = long_recommendations.get(long_rec, 0) + 1
        
        print("\n🚀 RECOMENDACIONES CORTO PLAZO (máx. 21 días):")
        for rec, count in sorted(short_recommendations.items(), key=lambda x: x[1], reverse=True):
            print(f"  {rec}: {count} acciones")
        
        print("\n📈 RECOMENDACIONES LARGO PLAZO (máx. 3 meses):")
        for rec, count in sorted(long_recommendations.items(), key=lambda x: x[1], reverse=True):
            print(f"  {rec}: {count} acciones")
        
        # Top oportunidades
        print("\n🔥 TOP 15 OPORTUNIDADES CORTO PLAZO:")
        top_short = self.get_top_opportunities('short', 15)
        for i, stock in enumerate(top_short, 1):
            short_data = stock.get('short_term', {})
            print(f"  {i:2d}. {stock['symbol']:6s} - {short_data.get('recommendation', 'N/A'):12s} "
                  f"(Score: {short_data.get('score', 0):3.0f}, Confianza: {short_data.get('confidence', 'N/A')})")
        
        print("\n📊 TOP 15 OPORTUNIDADES LARGO PLAZO:")
        top_long = self.get_top_opportunities('long', 15)
        for i, stock in enumerate(top_long, 1):
            long_data = stock.get('long_term', {})
            print(f"  {i:2d}. {stock['symbol']:6s} - {long_data.get('recommendation', 'N/A'):12s} "
                  f"(Score: {long_data.get('score', 0):3.0f}, Confianza: {long_data.get('confidence', 'N/A')})")
        
        # STRONG BUY específicas
        strong_buy_short = self.get_recommendations_by_type('STRONG_BUY', 'short')
        strong_buy_long = self.get_recommendations_by_type('STRONG_BUY', 'long')
        
        print(f"\n⭐ STRONG BUY CORTO PLAZO: {len(strong_buy_short)} acciones")
        for stock in strong_buy_short[:10]:  # Mostrar solo las primeras 10
            short_data = stock.get('short_term', {})
            print(f"  {stock['symbol']:6s} - Score: {short_data.get('score', 0):3.0f}, "
                  f"Riesgo: {short_data.get('risk_level', 'N/A')}")
        
        print(f"\n⭐ STRONG BUY LARGO PLAZO: {len(strong_buy_long)} acciones")
        for stock in strong_buy_long[:10]:  # Mostrar solo las primeras 10
            long_data = stock.get('long_term', {})
            print(f"  {stock['symbol']:6s} - Score: {long_data.get('score', 0):3.0f}, "
                  f"Riesgo: {long_data.get('risk_level', 'N/A')}")
        
        print("="*80)

def main():
    """Función principal para ejecutar el análisis con horizontes temporales"""
    csv_file = "/workspaces/Cometagent-StockAI-Pro/lightyear_stocks_complete_numbered.csv"
    
    print("🚀 INICIANDO ANÁLISIS POR HORIZONTES TEMPORALES")
    print("📅 Corto Plazo: Máximo 21 días")
    print("📈 Largo Plazo: Máximo 3 meses (90 días)")
    print("="*60)
    
    analyzer = TimeHorizonAnalyzer(csv_file)
    
    # Analizar todas las acciones
    print("⚠️  ANÁLISIS COMPLETO DE TODAS LAS ACCIONES")
    print("🕐 Esto puede tomar aproximadamente 30-45 minutos...")
    
    results = analyzer.analyze_all_stocks()
    
    # Mostrar resumen
    analyzer.print_summary()
    
    # Guardar resultados
    analyzer.save_results()
    
    print("\n✅ Análisis por horizontes temporales completado exitosamente!")

if __name__ == "__main__":
    main()
