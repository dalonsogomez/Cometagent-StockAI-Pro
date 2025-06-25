"""
Agente de Análisis de Sentimiento
Analiza noticias, redes sociales y sentimiento del mercado
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List
import re
import warnings
warnings.filterwarnings('ignore')

class SentimentAgent:
    """
    Agente especializado en análisis de sentimiento financiero
    """
    
    def __init__(self):
        self.sentiment_keywords = {
            'positive': [
                'beat', 'exceed', 'strong', 'growth', 'profit', 'gain', 'rise', 'surge',
                'bullish', 'optimistic', 'upgrade', 'buy', 'outperform', 'positive',
                'revenue growth', 'earnings beat', 'market share', 'innovation'
            ],
            'negative': [
                'miss', 'decline', 'loss', 'fall', 'drop', 'weak', 'bearish',
                'pessimistic', 'downgrade', 'sell', 'underperform', 'negative',
                'revenue decline', 'earnings miss', 'lawsuit', 'investigation'
            ]
        }
        
        self.sector_sentiment_weights = {
            'technology': 1.2,
            'healthcare': 1.1,
            'finance': 1.0,
            'energy': 0.9,
            'utilities': 0.8
        }
    
    def analyze_sentiment(self, symbol: str) -> Dict:
        """
        Analiza el sentimiento general para una acción
        
        Args:
            symbol: Símbolo de la acción
            
        Returns:
            Diccionario con análisis de sentimiento
        """
        print(f"Analizando sentimiento para {symbol}...")
        
        try:
            # Obtener noticias recientes
            news_sentiment = self._analyze_news_sentiment(symbol)
            
            # Obtener sentimiento de redes sociales (simulado)
            social_sentiment = self._analyze_social_sentiment(symbol)
            
            # Obtener sentimiento del mercado
            market_sentiment = self._analyze_market_sentiment(symbol)
            
            # Combinar sentimientos
            overall_sentiment = self._combine_sentiments(
                news_sentiment, social_sentiment, market_sentiment
            )
            
            return {
                'symbol': symbol,
                'timestamp': datetime.now().isoformat(),
                'news_sentiment': news_sentiment,
                'social_sentiment': social_sentiment,
                'market_sentiment': market_sentiment,
                'overall_sentiment': overall_sentiment['sentiment'],
                'sentiment_score': overall_sentiment['score'],
                'confidence': overall_sentiment['confidence'],
                'key_factors': overall_sentiment['factors']
            }
            
        except Exception as e:
            return {
                'symbol': symbol,
                'error': str(e),
                'overall_sentiment': 'neutral',
                'sentiment_score': 0.0
            }
    
    def _analyze_news_sentiment(self, symbol: str) -> Dict:
        """Analiza sentimiento de noticias"""
        try:
            # Simular análisis de noticias (en producción usaríamos APIs reales)
            # Aquí podríamos integrar con News API, Alpha Vantage News, etc.
            
            # Generar sentimiento simulado basado en patrones comunes
            news_items = self._get_simulated_news(symbol)
            
            sentiments = []
            for news in news_items:
                sentiment_score = self._calculate_text_sentiment(news['title'] + ' ' + news['summary'])
                sentiments.append({
                    'title': news['title'],
                    'sentiment': sentiment_score,
                    'source': news['source'],
                    'date': news['date']
                })
            
            # Calcular sentimiento promedio
            if sentiments:
                avg_sentiment = np.mean([s['sentiment'] for s in sentiments])
                sentiment_label = self._score_to_label(avg_sentiment)
            else:
                avg_sentiment = 0.0
                sentiment_label = 'neutral'
            
            return {
                'sentiment': sentiment_label,
                'score': avg_sentiment,
                'news_count': len(sentiments),
                'recent_news': sentiments[:5]  # Últimas 5 noticias
            }
            
        except Exception as e:
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'error': str(e)
            }
    
    def _analyze_social_sentiment(self, symbol: str) -> Dict:
        """Analiza sentimiento de redes sociales"""
        try:
            # Simular análisis de redes sociales
            # En producción integraríamos con Twitter API, Reddit API, etc.
            
            # Generar métricas simuladas
            mention_count = np.random.randint(50, 500)
            positive_mentions = np.random.randint(0, mention_count)
            negative_mentions = np.random.randint(0, mention_count - positive_mentions)
            neutral_mentions = mention_count - positive_mentions - negative_mentions
            
            # Calcular sentimiento
            if mention_count > 0:
                sentiment_score = (positive_mentions - negative_mentions) / mention_count
            else:
                sentiment_score = 0.0
            
            sentiment_label = self._score_to_label(sentiment_score)
            
            return {
                'sentiment': sentiment_label,
                'score': sentiment_score,
                'mention_count': mention_count,
                'positive_mentions': positive_mentions,
                'negative_mentions': negative_mentions,
                'neutral_mentions': neutral_mentions,
                'trending': mention_count > 200
            }
            
        except Exception as e:
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'error': str(e)
            }
    
    def _analyze_market_sentiment(self, symbol: str) -> Dict:
        """Analiza sentimiento del mercado"""
        try:
            # Simular análisis de sentimiento del mercado
            # En producción usaríamos indicadores como VIX, Put/Call ratio, etc.
            
            # Generar métricas simuladas
            vix_level = np.random.uniform(15, 35)  # VIX típico
            put_call_ratio = np.random.uniform(0.8, 1.2)
            insider_trading = np.random.choice(['buying', 'selling', 'neutral'])
            
            # Calcular sentimiento basado en métricas
            sentiment_score = 0.0
            
            # VIX (volatilidad implícita)
            if vix_level < 20:
                sentiment_score += 0.3  # Baja volatilidad = optimismo
            elif vix_level > 30:
                sentiment_score -= 0.3  # Alta volatilidad = miedo
            
            # Put/Call ratio
            if put_call_ratio < 0.9:
                sentiment_score += 0.2  # Más calls = optimismo
            elif put_call_ratio > 1.1:
                sentiment_score -= 0.2  # Más puts = pesimismo
            
            # Insider trading
            if insider_trading == 'buying':
                sentiment_score += 0.3
            elif insider_trading == 'selling':
                sentiment_score -= 0.3
            
            sentiment_label = self._score_to_label(sentiment_score)
            
            return {
                'sentiment': sentiment_label,
                'score': sentiment_score,
                'vix_level': vix_level,
                'put_call_ratio': put_call_ratio,
                'insider_trading': insider_trading,
                'market_fear_greed': self._calculate_fear_greed_index(vix_level, put_call_ratio)
            }
            
        except Exception as e:
            return {
                'sentiment': 'neutral',
                'score': 0.0,
                'error': str(e)
            }
    
    def _get_simulated_news(self, symbol: str) -> List[Dict]:
        """Genera noticias simuladas para pruebas"""
        news_templates = [
            {
                'title': f'{symbol} Reports Strong Q4 Earnings',
                'summary': 'Company beats analyst expectations with strong revenue growth',
                'source': 'Financial News',
                'sentiment_hint': 'positive'
            },
            {
                'title': f'{symbol} Announces New Product Launch',
                'summary': 'Innovative product expected to drive future growth',
                'source': 'Tech News',
                'sentiment_hint': 'positive'
            },
            {
                'title': f'{symbol} Faces Regulatory Challenges',
                'summary': 'New regulations may impact company operations',
                'source': 'Business Wire',
                'sentiment_hint': 'negative'
            },
            {
                'title': f'{symbol} CEO Discusses Market Strategy',
                'summary': 'Leadership outlines plans for market expansion',
                'source': 'Market Watch',
                'sentiment_hint': 'neutral'
            }
        ]
        
        # Seleccionar noticias aleatorias
        selected_news = np.random.choice(news_templates, size=np.random.randint(2, 5), replace=False)
        
        # Agregar fechas
        for news in selected_news:
            days_ago = np.random.randint(0, 7)
            news['date'] = (datetime.now() - timedelta(days=days_ago)).isoformat()
        
        return selected_news.tolist()
    
    def _calculate_text_sentiment(self, text: str) -> float:
        """Calcula sentimiento de un texto"""
        text_lower = text.lower()
        
        positive_count = sum(1 for word in self.sentiment_keywords['positive'] if word in text_lower)
        negative_count = sum(1 for word in self.sentiment_keywords['negative'] if word in text_lower)
        
        total_words = len(text.split())
        
        if total_words == 0:
            return 0.0
        
        # Normalizar por longitud del texto
        sentiment_score = (positive_count - negative_count) / max(total_words / 10, 1)
        
        # Limitar a rango [-1, 1]
        return max(-1.0, min(1.0, sentiment_score))
    
    def _score_to_label(self, score: float) -> str:
        """Convierte puntuación numérica a etiqueta"""
        if score > 0.2:
            return 'positive'
        elif score < -0.2:
            return 'negative'
        else:
            return 'neutral'
    
    def _calculate_fear_greed_index(self, vix: float, put_call_ratio: float) -> Dict:
        """Calcula índice de miedo y codicia"""
        # Normalizar VIX (0-100 scale)
        vix_normalized = max(0, min(100, (vix - 10) * 2.5))
        
        # Normalizar Put/Call ratio
        pc_normalized = max(0, min(100, (put_call_ratio - 0.5) * 100))
        
        # Combinar métricas (invertir VIX porque alto VIX = miedo)
        fear_greed_score = (100 - vix_normalized + (100 - pc_normalized)) / 2
        
        if fear_greed_score > 75:
            label = 'Extreme Greed'
        elif fear_greed_score > 55:
            label = 'Greed'
        elif fear_greed_score > 45:
            label = 'Neutral'
        elif fear_greed_score > 25:
            label = 'Fear'
        else:
            label = 'Extreme Fear'
        
        return {
            'score': fear_greed_score,
            'label': label
        }
    
    def _combine_sentiments(self, news: Dict, social: Dict, market: Dict) -> Dict:
        """Combina diferentes fuentes de sentimiento"""
        # Pesos para diferentes fuentes
        weights = {
            'news': 0.4,
            'social': 0.3,
            'market': 0.3
        }
        
        # Obtener puntuaciones
        news_score = news.get('score', 0.0)
        social_score = social.get('score', 0.0)
        market_score = market.get('score', 0.0)
        
        # Calcular puntuación combinada
        combined_score = (
            news_score * weights['news'] +
            social_score * weights['social'] +
            market_score * weights['market']
        )
        
        # Determinar sentimiento general
        sentiment_label = self._score_to_label(combined_score)
        
        # Calcular confianza basada en consistencia
        scores = [news_score, social_score, market_score]
        score_std = np.std(scores)
        
        if score_std < 0.2:
            confidence = 'high'
        elif score_std < 0.5:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        # Identificar factores clave
        factors = []
        if abs(news_score) > 0.3:
            factors.append(f"Noticias {news['sentiment']}")
        if abs(social_score) > 0.3:
            factors.append(f"Redes sociales {social['sentiment']}")
        if abs(market_score) > 0.3:
            factors.append(f"Mercado {market['sentiment']}")
        
        return {
            'sentiment': sentiment_label,
            'score': combined_score,
            'confidence': confidence,
            'factors': factors
        }

# Función de prueba
def test_sentiment_agent():
    """Función para probar el agente de sentimiento"""
    agent = SentimentAgent()
    
    symbols = ["AAPL", "TSLA", "MSFT"]
    
    for symbol in symbols:
        print(f"\n=== Análisis de Sentimiento para {symbol} ===")
        
        analysis = agent.analyze_sentiment(symbol)
        
        if 'error' not in analysis:
            print(f"Sentimiento general: {analysis['overall_sentiment']}")
            print(f"Puntuación: {analysis['sentiment_score']:.3f}")
            print(f"Confianza: {analysis['confidence']}")
            print(f"Factores clave: {analysis['key_factors']}")
            
            # Detalles por fuente
            print(f"\nNoticias: {analysis['news_sentiment']['sentiment']} ({analysis['news_sentiment']['score']:.3f})")
            print(f"Redes sociales: {analysis['social_sentiment']['sentiment']} ({analysis['social_sentiment']['score']:.3f})")
            print(f"Mercado: {analysis['market_sentiment']['sentiment']} ({analysis['market_sentiment']['score']:.3f})")
        else:
            print(f"Error: {analysis['error']}")

if __name__ == "__main__":
    test_sentiment_agent()

