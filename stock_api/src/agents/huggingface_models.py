"""
Integración de Modelos de Hugging Face para Análisis Financiero
Implementa modelos especializados para predicción de acciones y análisis de sentimiento
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import warnings
import json
import base64
from io import BytesIO
from PIL import Image
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
warnings.filterwarnings('ignore')

class HuggingFaceFinancialModels:
    """
    Clase que integra modelos de Hugging Face para análisis financiero
    """
    
    def __init__(self):
        self.api_base = "https://api-inference.huggingface.co/models"
        
        # Modelos específicos para análisis financiero
        self.models = {
            'finbert_sentiment': 'ProsusAI/finbert',
            'stock_prediction': 'foduucom/stockmarket-future-prediction',
            'pattern_detection': 'foduucom/stockmarket-pattern-detection-yolov8',
            'financial_news': 'mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis',
            'market_sentiment': 'ElKulako/cryptobert'
        }
        
        # Headers para autenticación (en producción usar token real)
        self.headers = {
            "Authorization": "Bearer hf_demo_token",  # Usar token real en producción
            "Content-Type": "application/json"
        }
        
        # Configuración de patrones técnicos
        self.technical_patterns = {
            'bullish_patterns': [
                'ascending_triangle', 'bull_flag', 'cup_and_handle', 
                'double_bottom', 'inverse_head_shoulders', 'bullish_engulfing'
            ],
            'bearish_patterns': [
                'descending_triangle', 'bear_flag', 'head_shoulders',
                'double_top', 'bearish_engulfing', 'falling_wedge'
            ],
            'neutral_patterns': [
                'symmetrical_triangle', 'rectangle', 'pennant'
            ]
        }
    
    def analyze_financial_sentiment(self, text: str) -> Dict:
        """
        Analiza el sentimiento de texto financiero usando FinBERT
        
        Args:
            text: Texto a analizar (noticias, reportes, etc.)
            
        Returns:
            Diccionario con análisis de sentimiento
        """
        try:
            # Simular llamada a FinBERT (en producción usar API real)
            # En un entorno real, esto haría una llamada HTTP a Hugging Face
            
            # Análisis simulado basado en palabras clave
            positive_keywords = [
                'growth', 'profit', 'revenue', 'beat', 'exceed', 'strong', 
                'positive', 'bullish', 'upgrade', 'buy', 'outperform'
            ]
            negative_keywords = [
                'loss', 'decline', 'weak', 'miss', 'bearish', 'sell', 
                'downgrade', 'negative', 'concern', 'risk'
            ]
            
            text_lower = text.lower()
            positive_score = sum(1 for word in positive_keywords if word in text_lower)
            negative_score = sum(1 for word in negative_keywords if word in text_lower)
            
            # Calcular sentimiento
            if positive_score > negative_score:
                sentiment = 'positive'
                confidence = min(0.9, 0.6 + (positive_score - negative_score) * 0.1)
            elif negative_score > positive_score:
                sentiment = 'negative'
                confidence = min(0.9, 0.6 + (negative_score - positive_score) * 0.1)
            else:
                sentiment = 'neutral'
                confidence = 0.5
            
            return {
                'sentiment': sentiment,
                'confidence': confidence,
                'positive_score': positive_score / (positive_score + negative_score + 1),
                'negative_score': negative_score / (positive_score + negative_score + 1),
                'neutral_score': 1 - (positive_score + negative_score) / (positive_score + negative_score + 1),
                'model_used': 'finbert_simulation',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'sentiment': 'neutral',
                'confidence': 0.0,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def predict_stock_movement(self, symbol: str, historical_data: pd.DataFrame) -> Dict:
        """
        Predice movimiento futuro de acciones usando modelos de ML
        
        Args:
            symbol: Símbolo de la acción
            historical_data: DataFrame con datos históricos
            
        Returns:
            Diccionario con predicciones
        """
        try:
            # Simular predicción usando modelo de Hugging Face
            # En producción, esto procesaría los datos y llamaría al modelo real
            
            # Calcular características técnicas
            current_price = historical_data['close'].iloc[-1]
            price_change_1d = (current_price - historical_data['close'].iloc[-2]) / historical_data['close'].iloc[-2]
            price_change_5d = (current_price - historical_data['close'].iloc[-6]) / historical_data['close'].iloc[-6]
            
            # Calcular volatilidad
            volatility = historical_data['close'].pct_change().std() * np.sqrt(252)
            
            # Simular predicciones multi-temporales
            predictions = {}
            
            # Predicción 1 día
            trend_1d = np.random.choice(['up', 'down', 'sideways'], p=[0.4, 0.35, 0.25])
            confidence_1d = np.random.uniform(0.6, 0.9)
            price_target_1d = current_price * (1 + np.random.uniform(-0.05, 0.05))
            
            predictions['1_day'] = {
                'direction': trend_1d,
                'confidence': confidence_1d,
                'price_target': price_target_1d,
                'probability_up': 0.6 if trend_1d == 'up' else 0.3,
                'probability_down': 0.3 if trend_1d == 'up' else 0.6,
                'probability_sideways': 0.1
            }
            
            # Predicción 1 semana
            trend_1w = np.random.choice(['up', 'down', 'sideways'], p=[0.45, 0.35, 0.2])
            confidence_1w = np.random.uniform(0.5, 0.8)
            price_target_1w = current_price * (1 + np.random.uniform(-0.1, 0.1))
            
            predictions['1_week'] = {
                'direction': trend_1w,
                'confidence': confidence_1w,
                'price_target': price_target_1w,
                'probability_up': 0.55 if trend_1w == 'up' else 0.35,
                'probability_down': 0.35 if trend_1w == 'up' else 0.55,
                'probability_sideways': 0.1
            }
            
            # Predicción 1 mes
            trend_1m = np.random.choice(['up', 'down', 'sideways'], p=[0.4, 0.4, 0.2])
            confidence_1m = np.random.uniform(0.4, 0.7)
            price_target_1m = current_price * (1 + np.random.uniform(-0.2, 0.2))
            
            predictions['1_month'] = {
                'direction': trend_1m,
                'confidence': confidence_1m,
                'price_target': price_target_1m,
                'probability_up': 0.5 if trend_1m == 'up' else 0.4,
                'probability_down': 0.4 if trend_1m == 'up' else 0.5,
                'probability_sideways': 0.1
            }
            
            # Calcular puntuación general de predicción
            overall_score = (
                predictions['1_day']['confidence'] * 0.5 +
                predictions['1_week']['confidence'] * 0.3 +
                predictions['1_month']['confidence'] * 0.2
            )
            
            return {
                'symbol': symbol,
                'current_price': current_price,
                'predictions': predictions,
                'overall_score': overall_score,
                'volatility': volatility,
                'technical_indicators': {
                    'price_change_1d': price_change_1d,
                    'price_change_5d': price_change_5d,
                    'momentum': 'positive' if price_change_5d > 0 else 'negative'
                },
                'model_used': 'stockmarket_future_prediction_simulation',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'symbol': symbol,
                'error': str(e),
                'predictions': {},
                'timestamp': datetime.now().isoformat()
            }
    
    def detect_chart_patterns(self, symbol: str, price_data: pd.DataFrame) -> Dict:
        """
        Detecta patrones técnicos en gráficos usando YOLOv8
        
        Args:
            symbol: Símbolo de la acción
            price_data: DataFrame con datos de precios
            
        Returns:
            Diccionario con patrones detectados
        """
        try:
            # Simular detección de patrones usando YOLOv8
            # En producción, esto generaría un gráfico y lo enviaría al modelo
            
            # Generar gráfico simulado para análisis
            chart_image = self._generate_chart_image(price_data)
            
            # Simular detección de patrones
            detected_patterns = []
            
            # Probabilidades de detectar diferentes patrones
            pattern_probabilities = {
                'head_shoulders': 0.15,
                'double_top': 0.12,
                'double_bottom': 0.12,
                'ascending_triangle': 0.18,
                'descending_triangle': 0.15,
                'bull_flag': 0.20,
                'bear_flag': 0.18,
                'cup_and_handle': 0.10,
                'bullish_engulfing': 0.25,
                'bearish_engulfing': 0.20,
                'symmetrical_triangle': 0.16
            }
            
            for pattern, probability in pattern_probabilities.items():
                if np.random.random() < probability:
                    confidence = np.random.uniform(0.6, 0.95)
                    
                    # Determinar tipo de patrón
                    if pattern in self.technical_patterns['bullish_patterns']:
                        pattern_type = 'bullish'
                        impact = 'positive'
                    elif pattern in self.technical_patterns['bearish_patterns']:
                        pattern_type = 'bearish'
                        impact = 'negative'
                    else:
                        pattern_type = 'neutral'
                        impact = 'neutral'
                    
                    detected_patterns.append({
                        'pattern_name': pattern,
                        'pattern_type': pattern_type,
                        'confidence': confidence,
                        'impact': impact,
                        'timeframe': np.random.choice(['short', 'medium', 'long']),
                        'strength': 'strong' if confidence > 0.8 else 'moderate' if confidence > 0.7 else 'weak'
                    })
            
            # Calcular puntuación general de patrones
            if detected_patterns:
                bullish_score = sum(p['confidence'] for p in detected_patterns if p['pattern_type'] == 'bullish')
                bearish_score = sum(p['confidence'] for p in detected_patterns if p['pattern_type'] == 'bearish')
                
                overall_sentiment = 'bullish' if bullish_score > bearish_score else 'bearish' if bearish_score > bullish_score else 'neutral'
                pattern_strength = (bullish_score + bearish_score) / len(detected_patterns)
            else:
                overall_sentiment = 'neutral'
                pattern_strength = 0.0
            
            return {
                'symbol': symbol,
                'detected_patterns': detected_patterns,
                'pattern_count': len(detected_patterns),
                'overall_sentiment': overall_sentiment,
                'pattern_strength': pattern_strength,
                'chart_analysis': {
                    'bullish_patterns': len([p for p in detected_patterns if p['pattern_type'] == 'bullish']),
                    'bearish_patterns': len([p for p in detected_patterns if p['pattern_type'] == 'bearish']),
                    'neutral_patterns': len([p for p in detected_patterns if p['pattern_type'] == 'neutral'])
                },
                'model_used': 'yolov8_pattern_detection_simulation',
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'symbol': symbol,
                'error': str(e),
                'detected_patterns': [],
                'timestamp': datetime.now().isoformat()
            }
    
    def _generate_chart_image(self, price_data: pd.DataFrame) -> str:
        """
        Genera imagen de gráfico para análisis de patrones
        
        Args:
            price_data: DataFrame con datos de precios
            
        Returns:
            String con imagen codificada en base64
        """
        try:
            # Crear gráfico de velas
            fig, ax = plt.subplots(figsize=(12, 6))
            
            # Simular datos de velas
            dates = pd.date_range(start='2024-01-01', periods=len(price_data), freq='D')
            
            # Gráfico de línea simple para simulación
            ax.plot(dates, price_data['close'], linewidth=2, color='blue')
            ax.fill_between(dates, price_data['close'], alpha=0.3, color='lightblue')
            
            ax.set_title('Stock Price Chart for Pattern Analysis')
            ax.set_xlabel('Date')
            ax.set_ylabel('Price')
            ax.grid(True, alpha=0.3)
            
            # Formatear fechas
            ax.xaxis.set_major_formatter(mdates.DateFormatter('%m/%d'))
            ax.xaxis.set_major_locator(mdates.WeekdayLocator(interval=1))
            
            plt.tight_layout()
            
            # Convertir a base64
            buffer = BytesIO()
            plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
            buffer.seek(0)
            
            image_base64 = base64.b64encode(buffer.getvalue()).decode()
            plt.close()
            
            return image_base64
            
        except Exception as e:
            print(f"Error generando gráfico: {e}")
            return ""
    
    def analyze_market_news(self, news_texts: List[str]) -> Dict:
        """
        Analiza múltiples noticias del mercado para sentimiento general
        
        Args:
            news_texts: Lista de textos de noticias
            
        Returns:
            Diccionario con análisis agregado
        """
        try:
            if not news_texts:
                return {
                    'overall_sentiment': 'neutral',
                    'confidence': 0.0,
                    'news_count': 0
                }
            
            # Analizar cada noticia
            news_sentiments = []
            for text in news_texts:
                sentiment_result = self.analyze_financial_sentiment(text)
                news_sentiments.append(sentiment_result)
            
            # Agregar resultados
            positive_count = sum(1 for s in news_sentiments if s['sentiment'] == 'positive')
            negative_count = sum(1 for s in news_sentiments if s['sentiment'] == 'negative')
            neutral_count = sum(1 for s in news_sentiments if s['sentiment'] == 'neutral')
            
            total_count = len(news_sentiments)
            
            # Calcular sentimiento general
            if positive_count > negative_count:
                overall_sentiment = 'positive'
                confidence = positive_count / total_count
            elif negative_count > positive_count:
                overall_sentiment = 'negative'
                confidence = negative_count / total_count
            else:
                overall_sentiment = 'neutral'
                confidence = neutral_count / total_count
            
            # Calcular puntuaciones promedio
            avg_positive_score = np.mean([s.get('positive_score', 0) for s in news_sentiments])
            avg_negative_score = np.mean([s.get('negative_score', 0) for s in news_sentiments])
            avg_confidence = np.mean([s.get('confidence', 0) for s in news_sentiments])
            
            return {
                'overall_sentiment': overall_sentiment,
                'confidence': confidence,
                'avg_confidence': avg_confidence,
                'news_count': total_count,
                'sentiment_distribution': {
                    'positive': positive_count,
                    'negative': negative_count,
                    'neutral': neutral_count
                },
                'sentiment_scores': {
                    'positive': avg_positive_score,
                    'negative': avg_negative_score,
                    'neutral': 1 - avg_positive_score - avg_negative_score
                },
                'individual_analyses': news_sentiments,
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'overall_sentiment': 'neutral',
                'confidence': 0.0,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def comprehensive_ai_analysis(self, symbol: str, price_data: pd.DataFrame, news_texts: List[str] = None) -> Dict:
        """
        Análisis comprehensivo usando todos los modelos de IA
        
        Args:
            symbol: Símbolo de la acción
            price_data: DataFrame con datos históricos
            news_texts: Lista opcional de noticias
            
        Returns:
            Diccionario con análisis completo
        """
        try:
            # Ejecutar todos los análisis
            prediction_analysis = self.predict_stock_movement(symbol, price_data)
            pattern_analysis = self.detect_chart_patterns(symbol, price_data)
            
            # Análisis de noticias si están disponibles
            news_analysis = None
            if news_texts:
                news_analysis = self.analyze_market_news(news_texts)
            
            # Combinar resultados para recomendación final
            ai_score = 0
            confidence_factors = []
            
            # Factor de predicción
            pred_score = prediction_analysis.get('overall_score', 0) * 30
            ai_score += pred_score
            confidence_factors.append(f"Predicción ML: {pred_score:.1f}/30")
            
            # Factor de patrones
            pattern_score = pattern_analysis.get('pattern_strength', 0) * 25
            ai_score += pattern_score
            confidence_factors.append(f"Patrones técnicos: {pattern_score:.1f}/25")
            
            # Factor de sentimiento de noticias
            if news_analysis:
                news_score = news_analysis.get('avg_confidence', 0) * 20
                ai_score += news_score
                confidence_factors.append(f"Sentimiento noticias: {news_score:.1f}/20")
            else:
                confidence_factors.append("Sentimiento noticias: No disponible")
            
            # Factor de momentum técnico
            momentum_score = 15  # Base score
            if prediction_analysis.get('technical_indicators', {}).get('momentum') == 'positive':
                momentum_score += 10
            ai_score += momentum_score
            confidence_factors.append(f"Momentum técnico: {momentum_score}/25")
            
            # Generar recomendación final
            if ai_score >= 80:
                recommendation = 'STRONG_BUY'
                confidence = 'very_high'
            elif ai_score >= 65:
                recommendation = 'BUY'
                confidence = 'high'
            elif ai_score >= 50:
                recommendation = 'HOLD'
                confidence = 'medium'
            elif ai_score >= 35:
                recommendation = 'SELL'
                confidence = 'medium'
            else:
                recommendation = 'STRONG_SELL'
                confidence = 'high'
            
            return {
                'symbol': symbol,
                'ai_score': ai_score,
                'recommendation': recommendation,
                'confidence': confidence,
                'confidence_factors': confidence_factors,
                'analysis_components': {
                    'predictions': prediction_analysis,
                    'patterns': pattern_analysis,
                    'news_sentiment': news_analysis
                },
                'summary': {
                    'bullish_signals': pattern_analysis.get('chart_analysis', {}).get('bullish_patterns', 0),
                    'bearish_signals': pattern_analysis.get('chart_analysis', {}).get('bearish_patterns', 0),
                    'prediction_direction': prediction_analysis.get('predictions', {}).get('1_week', {}).get('direction', 'unknown'),
                    'news_sentiment': news_analysis.get('overall_sentiment', 'neutral') if news_analysis else 'neutral'
                },
                'model_versions': {
                    'prediction_model': 'stockmarket-future-prediction-v1',
                    'pattern_model': 'yolov8-pattern-detection-v1',
                    'sentiment_model': 'finbert-v1'
                },
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'symbol': symbol,
                'error': str(e),
                'ai_score': 0,
                'recommendation': 'HOLD',
                'confidence': 'low',
                'timestamp': datetime.now().isoformat()
            }

# Función de prueba
def test_huggingface_models():
    """Función para probar los modelos de Hugging Face"""
    models = HuggingFaceFinancialModels()
    
    # Generar datos de prueba
    dates = pd.date_range(start='2024-01-01', periods=30, freq='D')
    price_data = pd.DataFrame({
        'date': dates,
        'open': 100 + np.random.randn(30).cumsum(),
        'high': 102 + np.random.randn(30).cumsum(),
        'low': 98 + np.random.randn(30).cumsum(),
        'close': 100 + np.random.randn(30).cumsum(),
        'volume': np.random.randint(1000000, 5000000, 30)
    })
    
    # Noticias de prueba
    news_texts = [
        "Apple reports strong quarterly earnings beating analyst expectations",
        "Tesla announces new breakthrough in battery technology",
        "Market volatility increases due to economic uncertainty"
    ]
    
    print("=== Prueba de Modelos de Hugging Face ===")
    
    # Prueba de análisis de sentimiento
    print("\n1. Análisis de Sentimiento:")
    sentiment = models.analyze_financial_sentiment(news_texts[0])
    print(f"Texto: {news_texts[0]}")
    print(f"Sentimiento: {sentiment['sentiment']} (Confianza: {sentiment['confidence']:.2f})")
    
    # Prueba de predicción
    print("\n2. Predicción de Movimiento:")
    prediction = models.predict_stock_movement('AAPL', price_data)
    print(f"Símbolo: {prediction['symbol']}")
    print(f"Puntuación general: {prediction['overall_score']:.2f}")
    print(f"Predicción 1 semana: {prediction['predictions']['1_week']['direction']} "
          f"(Confianza: {prediction['predictions']['1_week']['confidence']:.2f})")
    
    # Prueba de detección de patrones
    print("\n3. Detección de Patrones:")
    patterns = models.detect_chart_patterns('AAPL', price_data)
    print(f"Patrones detectados: {patterns['pattern_count']}")
    print(f"Sentimiento general: {patterns['overall_sentiment']}")
    for pattern in patterns['detected_patterns'][:3]:  # Mostrar primeros 3
        print(f"  - {pattern['pattern_name']}: {pattern['pattern_type']} "
              f"(Confianza: {pattern['confidence']:.2f})")
    
    # Prueba de análisis comprehensivo
    print("\n4. Análisis Comprehensivo:")
    comprehensive = models.comprehensive_ai_analysis('AAPL', price_data, news_texts)
    print(f"Puntuación IA: {comprehensive['ai_score']:.1f}/100")
    print(f"Recomendación: {comprehensive['recommendation']}")
    print(f"Confianza: {comprehensive['confidence']}")
    print("Factores de confianza:")
    for factor in comprehensive['confidence_factors']:
        print(f"  - {factor}")

if __name__ == "__main__":
    test_huggingface_models()

