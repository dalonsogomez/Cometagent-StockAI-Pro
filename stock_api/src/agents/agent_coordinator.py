"""
Sistema Multi-Agente para Recomendación de Acciones
Coordinador principal que gestiona agentes especializados
"""

import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor
import warnings
warnings.filterwarnings('ignore')

class AgentCoordinator:
    """
    Coordinador principal del sistema multi-agente
    Gestiona y coordina diferentes agentes especializados
    """
    
    def __init__(self):
        self.agents = {}
        self.executor = ThreadPoolExecutor(max_workers=4)
        self.analysis_cache = {}
        self.cache_duration = timedelta(minutes=15)  # Cache por 15 minutos
        
        # Inicializar agentes especializados
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Inicializa todos los agentes especializados"""
        try:
            from .technical_analyzer import TechnicalAnalyzer
            from .pattern_detector import PatternDetector
            from .multi_temporal_predictor import MultiTemporalPredictor
            from .sentiment_agent import SentimentAgent
            from .catalyst_agent import CatalystAgent
            
            self.agents = {
                'technical': TechnicalAnalyzer(),
                'patterns': PatternDetector(),
                'predictor': MultiTemporalPredictor(),
                'sentiment': SentimentAgent(),
                'catalyst': CatalystAgent()
            }
            print("Agentes inicializados correctamente")
            
        except ImportError as e:
            print(f"Error importando agentes: {e}")
            # Crear agentes mock para desarrollo
            self.agents = {
                'technical': MockTechnicalAgent(),
                'patterns': MockPatternAgent(),
                'predictor': MockPredictorAgent(),
                'sentiment': MockSentimentAgent(),
                'catalyst': MockCatalystAgent()
            }
    
    def _is_cache_valid(self, symbol: str) -> bool:
        """Verifica si el cache es válido para un símbolo"""
        if symbol not in self.analysis_cache:
            return False
        
        cache_time = self.analysis_cache[symbol].get('timestamp')
        if not cache_time:
            return False
        
        return datetime.now() - cache_time < self.cache_duration
    
    def _get_cached_analysis(self, symbol: str) -> Dict:
        """Obtiene análisis del cache si es válido"""
        if self._is_cache_valid(symbol):
            return self.analysis_cache[symbol]['data']
        return None
    
    def _cache_analysis(self, symbol: str, analysis: Dict):
        """Guarda análisis en cache"""
        self.analysis_cache[symbol] = {
            'data': analysis,
            'timestamp': datetime.now()
        }
    
    async def analyze_stock_comprehensive(self, symbol: str, 
                                        include_patterns: bool = True,
                                        include_predictions: bool = True,
                                        include_sentiment: bool = True,
                                        include_catalysts: bool = True) -> Dict:
        """
        Análisis comprehensivo de una acción usando todos los agentes
        
        Args:
            symbol: Símbolo de la acción
            include_patterns: Incluir análisis de patrones
            include_predictions: Incluir predicciones multi-temporales
            include_sentiment: Incluir análisis de sentimiento
            include_catalysts: Incluir análisis de catalizadores
            
        Returns:
            Diccionario con análisis completo
        """
        # Verificar cache
        cached = self._get_cached_analysis(symbol)
        if cached:
            return cached
        
        print(f"Iniciando análisis comprehensivo para {symbol}...")
        
        # Análisis técnico base (siempre requerido)
        technical_analysis = await self._run_technical_analysis(symbol)
        
        if "error" in technical_analysis:
            return technical_analysis
        
        # Preparar tareas asíncronas
        tasks = []
        
        if include_patterns:
            tasks.append(self._run_pattern_analysis(symbol, technical_analysis['data']))
        
        if include_predictions:
            tasks.append(self._run_prediction_analysis(symbol, technical_analysis['data']))
        
        if include_sentiment:
            tasks.append(self._run_sentiment_analysis(symbol))
        
        if include_catalysts:
            tasks.append(self._run_catalyst_analysis(symbol))
        
        # Ejecutar análisis en paralelo
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Compilar resultados
        comprehensive_analysis = {
            'symbol': symbol,
            'timestamp': datetime.now().isoformat(),
            'technical': technical_analysis,
            'patterns': None,
            'predictions': None,
            'sentiment': None,
            'catalysts': None
        }
        
        # Asignar resultados
        result_index = 0
        if include_patterns:
            comprehensive_analysis['patterns'] = results[result_index] if not isinstance(results[result_index], Exception) else {'error': str(results[result_index])}
            result_index += 1
        
        if include_predictions:
            comprehensive_analysis['predictions'] = results[result_index] if not isinstance(results[result_index], Exception) else {'error': str(results[result_index])}
            result_index += 1
        
        if include_sentiment:
            comprehensive_analysis['sentiment'] = results[result_index] if not isinstance(results[result_index], Exception) else {'error': str(results[result_index])}
            result_index += 1
        
        if include_catalysts:
            comprehensive_analysis['catalysts'] = results[result_index] if not isinstance(results[result_index], Exception) else {'error': str(results[result_index])}
            result_index += 1
        
        # Generar recomendación final
        comprehensive_analysis['final_recommendation'] = self._generate_final_recommendation(comprehensive_analysis)
        
        # Guardar en cache
        self._cache_analysis(symbol, comprehensive_analysis)
        
        return comprehensive_analysis
    
    async def _run_technical_analysis(self, symbol: str) -> Dict:
        """Ejecuta análisis técnico"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.agents['technical'].analyze_stock,
            symbol, "1d", "6mo"
        )
    
    async def _run_pattern_analysis(self, symbol: str, df: pd.DataFrame) -> Dict:
        """Ejecuta análisis de patrones"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.agents['patterns'].analyze_patterns,
            df, symbol
        )
    
    async def _run_prediction_analysis(self, symbol: str, df: pd.DataFrame) -> Dict:
        """Ejecuta análisis de predicción"""
        loop = asyncio.get_event_loop()
        
        def run_prediction():
            try:
                # Crear características y entrenar modelos
                features_df = self.agents['predictor'].create_features(df)
                targets_df = self.agents['predictor'].create_targets(df)
                
                # Entrenar modelos (solo si no están entrenados)
                if not hasattr(self.agents['predictor'], 'model_performance') or not self.agents['predictor'].model_performance:
                    self.agents['predictor'].train_models(features_df, targets_df)
                
                # Generar predicciones
                predictions = self.agents['predictor'].predict(features_df)
                
                # Generar señales de trading
                current_price = df['close'].iloc[-1]
                signals = self.agents['predictor'].generate_trading_signals(predictions, current_price)
                
                return {
                    'predictions': predictions,
                    'trading_signals': signals,
                    'current_price': current_price,
                    'confidence': self.agents['predictor'].get_prediction_confidence(predictions)
                }
            except Exception as e:
                return {'error': str(e)}
        
        return await loop.run_in_executor(self.executor, run_prediction)
    
    async def _run_sentiment_analysis(self, symbol: str) -> Dict:
        """Ejecuta análisis de sentimiento"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.agents['sentiment'].analyze_sentiment,
            symbol
        )
    
    async def _run_catalyst_analysis(self, symbol: str) -> Dict:
        """Ejecuta análisis de catalizadores"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            self.executor,
            self.agents['catalyst'].find_catalysts,
            symbol
        )
    
    def _generate_final_recommendation(self, analysis: Dict) -> Dict:
        """
        Genera recomendación final basada en todos los análisis
        
        Args:
            analysis: Diccionario con todos los análisis
            
        Returns:
            Diccionario con recomendación final
        """
        scores = {
            'technical': 0,
            'patterns': 0,
            'predictions': 0,
            'sentiment': 0,
            'catalysts': 0
        }
        
        weights = {
            'technical': 0.25,
            'patterns': 0.20,
            'predictions': 0.30,
            'sentiment': 0.15,
            'catalysts': 0.10
        }
        
        # Evaluar análisis técnico
        if analysis['technical'] and 'recommendation' in analysis['technical']:
            tech_rec = analysis['technical']['recommendation']
            if 'BUY' in tech_rec:
                scores['technical'] = 1 if 'STRONG' in tech_rec else 0.5
            elif 'SELL' in tech_rec:
                scores['technical'] = -1 if 'STRONG' in tech_rec else -0.5
        
        # Evaluar patrones
        if analysis['patterns'] and 'summary' in analysis['patterns']:
            pattern_strength = analysis['patterns']['summary'].get('pattern_strength', 'neutral')
            if pattern_strength == 'strong':
                scores['patterns'] = 0.8
            elif pattern_strength == 'moderate':
                scores['patterns'] = 0.4
        
        # Evaluar predicciones
        if analysis['predictions'] and 'trading_signals' in analysis['predictions']:
            signals = analysis['predictions']['trading_signals']
            signal_scores = []
            
            for horizon, signal_data in signals.items():
                if 'signal' in signal_data:
                    signal = signal_data['signal']
                    confidence = signal_data.get('confidence', 'medium')
                    
                    signal_score = 0
                    if 'BUY' in signal:
                        signal_score = 1 if 'STRONG' in signal else 0.5
                    elif 'SELL' in signal:
                        signal_score = -1 if 'STRONG' in signal else -0.5
                    
                    # Ajustar por confianza
                    if confidence == 'high':
                        signal_score *= 1.0
                    elif confidence == 'medium':
                        signal_score *= 0.7
                    else:
                        signal_score *= 0.4
                    
                    signal_scores.append(signal_score)
            
            if signal_scores:
                scores['predictions'] = np.mean(signal_scores)
        
        # Evaluar sentimiento
        if analysis['sentiment'] and 'overall_sentiment' in analysis['sentiment']:
            sentiment = analysis['sentiment']['overall_sentiment']
            if sentiment == 'positive':
                scores['sentiment'] = 0.6
            elif sentiment == 'negative':
                scores['sentiment'] = -0.6
        
        # Evaluar catalizadores
        if analysis['catalysts'] and 'catalyst_score' in analysis['catalysts']:
            catalyst_score = analysis['catalysts']['catalyst_score']
            scores['catalysts'] = min(catalyst_score / 100, 1.0)  # Normalizar a [-1, 1]
        
        # Calcular puntuación final
        final_score = sum(scores[key] * weights[key] for key in scores)
        
        # Determinar recomendación
        if final_score > 0.4:
            recommendation = 'STRONG_BUY'
        elif final_score > 0.1:
            recommendation = 'BUY'
        elif final_score < -0.4:
            recommendation = 'STRONG_SELL'
        elif final_score < -0.1:
            recommendation = 'SELL'
        else:
            recommendation = 'HOLD'
        
        # Calcular confianza
        confidence_score = abs(final_score)
        if confidence_score > 0.6:
            confidence = 'high'
        elif confidence_score > 0.3:
            confidence = 'medium'
        else:
            confidence = 'low'
        
        return {
            'recommendation': recommendation,
            'confidence': confidence,
            'score': final_score,
            'component_scores': scores,
            'reasoning': self._generate_reasoning(scores, analysis)
        }
    
    def _generate_reasoning(self, scores: Dict, analysis: Dict) -> List[str]:
        """Genera explicación del razonamiento"""
        reasoning = []
        
        # Análisis técnico
        if scores['technical'] > 0.3:
            reasoning.append("Indicadores técnicos muestran señales alcistas")
        elif scores['technical'] < -0.3:
            reasoning.append("Indicadores técnicos muestran señales bajistas")
        
        # Patrones
        if scores['patterns'] > 0.3:
            reasoning.append("Patrones técnicos favorables detectados")
        
        # Predicciones
        if scores['predictions'] > 0.3:
            reasoning.append("Modelos predictivos sugieren movimiento alcista")
        elif scores['predictions'] < -0.3:
            reasoning.append("Modelos predictivos sugieren movimiento bajista")
        
        # Sentimiento
        if scores['sentiment'] > 0.3:
            reasoning.append("Sentimiento del mercado es positivo")
        elif scores['sentiment'] < -0.3:
            reasoning.append("Sentimiento del mercado es negativo")
        
        # Catalizadores
        if scores['catalysts'] > 0.3:
            reasoning.append("Catalizadores positivos identificados")
        
        if not reasoning:
            reasoning.append("Señales mixtas en el análisis")
        
        return reasoning

# Agentes Mock para desarrollo
class MockTechnicalAgent:
    def analyze_stock(self, symbol, interval, period):
        return {
            'symbol': symbol,
            'recommendation': 'BUY',
            'confidence': 75,
            'data': pd.DataFrame({
                'close': np.random.randn(100).cumsum() + 100,
                'volume': np.random.randint(1000000, 10000000, 100)
            })
        }

class MockPatternAgent:
    def analyze_patterns(self, df, symbol):
        return {
            'symbol': symbol,
            'summary': {
                'total_patterns_found': 3,
                'pattern_strength': 'moderate'
            }
        }

class MockPredictorAgent:
    def create_features(self, df):
        return df
    
    def create_targets(self, df):
        return df
    
    def train_models(self, features, targets):
        pass
    
    def predict(self, features):
        return {
            'short_term': {'ensemble': 0.05},
            'medium_term': {'ensemble': 0.03},
            'long_term': {'ensemble': 0.02}
        }
    
    def generate_trading_signals(self, predictions, current_price):
        return {
            'short_term': {'signal': 'BUY', 'confidence': 'medium'},
            'medium_term': {'signal': 'HOLD', 'confidence': 'medium'},
            'long_term': {'signal': 'BUY', 'confidence': 'low'}
        }
    
    def get_prediction_confidence(self, predictions):
        return {
            'short_term': 'medium',
            'medium_term': 'medium',
            'long_term': 'low'
        }

class MockSentimentAgent:
    def analyze_sentiment(self, symbol):
        return {
            'symbol': symbol,
            'overall_sentiment': 'positive',
            'sentiment_score': 0.6
        }

class MockCatalystAgent:
    def find_catalysts(self, symbol):
        return {
            'symbol': symbol,
            'catalyst_score': 65,
            'catalysts_found': ['earnings_beat', 'analyst_upgrade']
        }

# Función de prueba
async def test_coordinator():
    """Función para probar el coordinador"""
    coordinator = AgentCoordinator()
    
    # Probar análisis comprehensivo
    symbol = "AAPL"
    print(f"Probando análisis comprehensivo para {symbol}...")
    
    analysis = await coordinator.analyze_stock_comprehensive(
        symbol,
        include_patterns=True,
        include_predictions=True,
        include_sentiment=True,
        include_catalysts=True
    )
    
    print(f"\n=== Análisis Comprehensivo de {symbol} ===")
    print(f"Recomendación final: {analysis['final_recommendation']['recommendation']}")
    print(f"Confianza: {analysis['final_recommendation']['confidence']}")
    print(f"Puntuación: {analysis['final_recommendation']['score']:.3f}")
    print(f"Razonamiento: {analysis['final_recommendation']['reasoning']}")

if __name__ == "__main__":
    asyncio.run(test_coordinator())

