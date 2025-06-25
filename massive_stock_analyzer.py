"""
Analizador Masivo de Acciones
Procesa todas las acciones del archivo CSV y genera recomendaciones
"""

import pandas as pd
import json
import time
from datetime import datetime
import sys
import os

# Agregar el directorio de agentes al path
sys.path.append('/home/ubuntu/stock_recommendation_system/stock_api/src/agents')

from technical_analyzer import TechnicalAnalyzer
from pattern_detector import PatternDetector
from multi_temporal_predictor import MultiTemporalPredictor

class MassiveStockAnalyzer:
    def __init__(self, csv_file_path):
        self.csv_file_path = csv_file_path
        self.technical_analyzer = TechnicalAnalyzer()
        self.pattern_detector = PatternDetector()
        self.predictor = MultiTemporalPredictor()
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
    
    def analyze_single_stock(self, symbol, name):
        """Analiza una sola acción y retorna los resultados"""
        try:
            print(f"🔍 Analizando {symbol} ({name})...")
            
            # Análisis técnico
            technical_data = self.technical_analyzer.analyze(symbol)
            
            # Detección de patrones
            patterns = self.pattern_detector.detect_patterns(symbol)
            
            # Predicciones multi-temporales
            predictions = self.predictor.predict_multi_temporal(symbol)
            
            # Calcular catalyst score basado en análisis técnico
            catalyst_score = self.calculate_catalyst_score(technical_data, patterns)
            
            # Generar recomendación final
            recommendation = self.generate_recommendation(technical_data, patterns, catalyst_score)
            
            result = {
                'symbol': symbol,
                'name': name,
                'timestamp': datetime.now().isoformat(),
                'recommendation': recommendation,
                'catalyst_score': catalyst_score,
                'technical_data': technical_data,
                'patterns': patterns,
                'predictions': predictions,
                'confidence': self.calculate_confidence(technical_data, patterns)
            }
            
            print(f"✅ {symbol}: {recommendation} (Score: {catalyst_score})")
            return result
            
        except Exception as e:
            print(f"❌ Error analizando {symbol}: {e}")
            return {
                'symbol': symbol,
                'name': name,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def calculate_catalyst_score(self, technical_data, patterns):
        """Calcula el catalyst score basado en indicadores técnicos y patrones"""
        score = 50  # Base score
        
        if technical_data:
            # RSI scoring
            rsi = technical_data.get('rsi', 50)
            if 30 <= rsi <= 70:  # Zona óptima
                score += 15
            elif rsi < 30:  # Sobreventa (oportunidad)
                score += 25
            elif rsi > 80:  # Muy sobrecomprado (riesgo)
                score -= 15
            
            # MACD scoring
            macd = technical_data.get('macd', {})
            if macd.get('signal') == 'bullish':
                score += 20
            elif macd.get('signal') == 'bearish':
                score -= 20
        
        # Patterns scoring
        if patterns:
            bullish_patterns = ['hammer', 'bullish_engulfing', 'morning_star', 'breakout', 'bull_flag']
            bearish_patterns = ['shooting_star', 'bearish_engulfing', 'evening_star', 'head_shoulders']
            
            for pattern in patterns:
                if pattern.get('type') in bullish_patterns:
                    score += 10
                elif pattern.get('type') in bearish_patterns:
                    score -= 10
        
        return max(0, min(100, score))  # Mantener entre 0-100
    
    def generate_recommendation(self, technical_data, patterns, catalyst_score):
        """Genera recomendación final basada en todos los factores"""
        if catalyst_score >= 85:
            return "STRONG_BUY"
        elif catalyst_score >= 70:
            return "BUY"
        elif catalyst_score >= 55:
            return "HOLD"
        elif catalyst_score >= 40:
            return "WEAK_HOLD"
        else:
            return "SELL"
    
    def calculate_confidence(self, technical_data, patterns):
        """Calcula nivel de confianza de la recomendación"""
        confidence_factors = 0
        total_factors = 0
        
        if technical_data:
            total_factors += 2
            if technical_data.get('rsi'):
                confidence_factors += 1
            if technical_data.get('macd'):
                confidence_factors += 1
        
        if patterns:
            total_factors += 1
            if len(patterns) > 0:
                confidence_factors += 1
        
        if total_factors == 0:
            return "low"
        
        confidence_ratio = confidence_factors / total_factors
        
        if confidence_ratio >= 0.8:
            return "high"
        elif confidence_ratio >= 0.6:
            return "medium"
        else:
            return "low"
    
    def analyze_all_stocks(self, limit=None):
        """Analiza todas las acciones del archivo CSV"""
        stocks_df = self.load_stocks()
        if stocks_df is None:
            return
        
        if limit:
            stocks_df = stocks_df.head(limit)
            print(f"🔬 Analizando las primeras {limit} acciones...")
        else:
            print(f"🔬 Analizando todas las {len(stocks_df)} acciones...")
        
        start_time = time.time()
        
        for index, row in stocks_df.iterrows():
            symbol = row['Symbol']
            name = row['Stock Name']
            
            result = self.analyze_single_stock(symbol, name)
            self.results.append(result)
            
            # Pequeña pausa para no sobrecargar las APIs
            time.sleep(0.1)
            
            # Progreso cada 50 acciones
            if (index + 1) % 50 == 0:
                elapsed = time.time() - start_time
                print(f"📊 Progreso: {index + 1}/{len(stocks_df)} acciones ({elapsed:.1f}s)")
        
        total_time = time.time() - start_time
        print(f"🎉 Análisis completado en {total_time:.1f} segundos")
        
        return self.results
    
    def get_top_opportunities(self, top_n=20):
        """Obtiene las mejores oportunidades de inversión"""
        valid_results = [r for r in self.results if 'error' not in r]
        
        # Ordenar por catalyst score descendente
        sorted_results = sorted(valid_results, key=lambda x: x.get('catalyst_score', 0), reverse=True)
        
        return sorted_results[:top_n]
    
    def get_strong_buy_recommendations(self):
        """Obtiene todas las recomendaciones STRONG_BUY"""
        return [r for r in self.results if r.get('recommendation') == 'STRONG_BUY']
    
    def save_results(self, filename='massive_analysis_results.json'):
        """Guarda los resultados en un archivo JSON"""
        output_path = f"/home/ubuntu/stock_recommendation_system/{filename}"
        
        analysis_summary = {
            'timestamp': datetime.now().isoformat(),
            'total_stocks_analyzed': len(self.results),
            'successful_analyses': len([r for r in self.results if 'error' not in r]),
            'failed_analyses': len([r for r in self.results if 'error' in r]),
            'top_opportunities': self.get_top_opportunities(50),
            'strong_buy_recommendations': self.get_strong_buy_recommendations(),
            'all_results': self.results
        }
        
        with open(output_path, 'w') as f:
            json.dump(analysis_summary, f, indent=2)
        
        print(f"💾 Resultados guardados en: {output_path}")
        return output_path
    
    def print_summary(self):
        """Imprime un resumen de los resultados"""
        if not self.results:
            print("❌ No hay resultados para mostrar")
            return
        
        valid_results = [r for r in self.results if 'error' not in r]
        
        print("\n" + "="*60)
        print("📊 RESUMEN DEL ANÁLISIS MASIVO DE ACCIONES")
        print("="*60)
        print(f"Total de acciones analizadas: {len(self.results)}")
        print(f"Análisis exitosos: {len(valid_results)}")
        print(f"Análisis fallidos: {len(self.results) - len(valid_results)}")
        
        # Contar recomendaciones
        recommendations = {}
        for result in valid_results:
            rec = result.get('recommendation', 'UNKNOWN')
            recommendations[rec] = recommendations.get(rec, 0) + 1
        
        print("\n📈 DISTRIBUCIÓN DE RECOMENDACIONES:")
        for rec, count in sorted(recommendations.items(), key=lambda x: x[1], reverse=True):
            print(f"  {rec}: {count} acciones")
        
        # Top 10 oportunidades
        top_opportunities = self.get_top_opportunities(10)
        print("\n🚀 TOP 10 OPORTUNIDADES:")
        for i, stock in enumerate(top_opportunities, 1):
            print(f"  {i:2d}. {stock['symbol']:6s} - {stock['recommendation']:10s} (Score: {stock['catalyst_score']:3d})")
        
        print("="*60)

def main():
    """Función principal para ejecutar el análisis masivo"""
    csv_file = "/home/ubuntu/stock_recommendation_system/lightyear_stocks_complete_numbered.csv"
    
    print("🚀 INICIANDO ANÁLISIS MASIVO DE ACCIONES")
    print("="*50)
    
    analyzer = MassiveStockAnalyzer(csv_file)
    
    # Analizar las primeras 100 acciones como prueba
    # Para análisis completo, cambiar limit=None
    results = analyzer.analyze_all_stocks(limit=100)
    
    # Mostrar resumen
    analyzer.print_summary()
    
    # Guardar resultados
    analyzer.save_results()
    
    print("\n✅ Análisis masivo completado exitosamente!")

if __name__ == "__main__":
    main()

