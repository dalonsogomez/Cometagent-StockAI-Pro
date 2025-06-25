"""
Rutas de la API para el sistema de recomendación de acciones
"""

from flask import Blueprint, request, jsonify
import asyncio
import json
from datetime import datetime
import sys
import os

# Agregar el directorio de agentes al path
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agents'))

try:
    from src.agents.agent_coordinator import AgentCoordinator
    from src.agents.technical_analyzer import TechnicalAnalyzer
    from src.agents.sentiment_agent import SentimentAgent
    from src.agents.catalyst_agent import CatalystAgent
except ImportError as e:
    print(f"Error importando agentes: {e}")
    # Usar agentes mock para desarrollo
    from src.agents.agent_coordinator import AgentCoordinator

# Crear blueprint
stock_bp = Blueprint('stock', __name__)

# Inicializar coordinador
coordinator = AgentCoordinator()

@stock_bp.route('/health', methods=['GET'])
def health_check():
    """Verificación de salud de la API"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'agents_available': list(coordinator.agents.keys())
    })

@stock_bp.route('/analyze/<symbol>', methods=['GET'])
def analyze_stock(symbol):
    """
    Análisis comprehensivo de una acción
    
    Query parameters:
    - include_patterns: bool (default: true)
    - include_predictions: bool (default: true)
    - include_sentiment: bool (default: true)
    - include_catalysts: bool (default: true)
    """
    try:
        # Obtener parámetros de consulta
        include_patterns = request.args.get('include_patterns', 'true').lower() == 'true'
        include_predictions = request.args.get('include_predictions', 'true').lower() == 'true'
        include_sentiment = request.args.get('include_sentiment', 'true').lower() == 'true'
        include_catalysts = request.args.get('include_catalysts', 'true').lower() == 'true'
        
        # Ejecutar análisis asíncrono
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        analysis = loop.run_until_complete(
            coordinator.analyze_stock_comprehensive(
                symbol.upper(),
                include_patterns=include_patterns,
                include_predictions=include_predictions,
                include_sentiment=include_sentiment,
                include_catalysts=include_catalysts
            )
        )
        
        loop.close()
        
        # Convertir DataFrames a diccionarios para JSON
        if 'technical' in analysis and 'data' in analysis['technical']:
            # No incluir datos raw en la respuesta para reducir tamaño
            analysis['technical']['data_summary'] = {
                'rows': len(analysis['technical']['data']),
                'latest_price': float(analysis['technical']['data']['close'].iloc[-1]),
                'latest_volume': int(analysis['technical']['data']['volume'].iloc[-1])
            }
            del analysis['technical']['data']
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'symbol': symbol,
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/technical/<symbol>', methods=['GET'])
def technical_analysis(symbol):
    """Análisis técnico específico"""
    try:
        analyzer = TechnicalAnalyzer()
        
        # Parámetros opcionales
        interval = request.args.get('interval', '1d')
        period = request.args.get('period', '6mo')
        
        analysis = analyzer.analyze_stock(symbol.upper(), interval, period)
        
        # Convertir DataFrame a resumen
        if 'data' in analysis:
            analysis['data_summary'] = {
                'rows': len(analysis['data']),
                'latest_price': float(analysis['data']['close'].iloc[-1]),
                'latest_volume': int(analysis['data']['volume'].iloc[-1]),
                'price_change_1d': float(analysis['data']['close'].iloc[-1] - analysis['data']['close'].iloc[-2]),
                'volume_avg_30d': float(analysis['data']['volume'].tail(30).mean())
            }
            del analysis['data']
        
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'symbol': symbol,
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/sentiment/<symbol>', methods=['GET'])
def sentiment_analysis(symbol):
    """Análisis de sentimiento específico"""
    try:
        agent = SentimentAgent()
        analysis = agent.analyze_sentiment(symbol.upper())
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'symbol': symbol,
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/catalysts/<symbol>', methods=['GET'])
def catalyst_analysis(symbol):
    """Análisis de catalizadores específico"""
    try:
        agent = CatalystAgent()
        analysis = agent.find_catalysts(symbol.upper())
        return jsonify(analysis)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'symbol': symbol,
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/recommendations', methods=['POST'])
def batch_recommendations():
    """
    Análisis en lote de múltiples acciones
    
    Body: {
        "symbols": ["AAPL", "TSLA", "MSFT"],
        "analysis_type": "quick" | "full"
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'symbols' not in data:
            return jsonify({'error': 'Se requiere lista de símbolos'}), 400
        
        symbols = data['symbols']
        analysis_type = data.get('analysis_type', 'quick')
        
        if len(symbols) > 10:
            return jsonify({'error': 'Máximo 10 símbolos por solicitud'}), 400
        
        results = {}
        
        # Configurar análisis según tipo
        if analysis_type == 'quick':
            include_patterns = False
            include_predictions = False
            include_sentiment = True
            include_catalysts = True
        else:  # full
            include_patterns = True
            include_predictions = True
            include_sentiment = True
            include_catalysts = True
        
        # Procesar cada símbolo
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        for symbol in symbols:
            try:
                analysis = loop.run_until_complete(
                    coordinator.analyze_stock_comprehensive(
                        symbol.upper(),
                        include_patterns=include_patterns,
                        include_predictions=include_predictions,
                        include_sentiment=include_sentiment,
                        include_catalysts=include_catalysts
                    )
                )
                
                # Simplificar respuesta para análisis en lote
                results[symbol.upper()] = {
                    'recommendation': analysis.get('final_recommendation', {}),
                    'technical_summary': analysis.get('technical', {}).get('recommendation', 'N/A'),
                    'sentiment': analysis.get('sentiment', {}).get('overall_sentiment', 'neutral'),
                    'catalyst_score': analysis.get('catalysts', {}).get('catalyst_score', 0),
                    'timestamp': analysis.get('timestamp')
                }
                
            except Exception as e:
                results[symbol.upper()] = {
                    'error': str(e),
                    'timestamp': datetime.now().isoformat()
                }
        
        loop.close()
        
        return jsonify({
            'results': results,
            'analysis_type': analysis_type,
            'processed_count': len(symbols),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/screener', methods=['GET'])
def stock_screener():
    """
    Screener de acciones basado en criterios
    
    Query parameters:
    - sector: string
    - max_price: float
    - min_volume: int
    - catalyst_score_min: float
    """
    try:
        # Obtener parámetros de filtro
        sector = request.args.get('sector')
        max_price = request.args.get('max_price', type=float)
        min_volume = request.args.get('min_volume', type=int)
        catalyst_score_min = request.args.get('catalyst_score_min', type=float, default=50)
        
        # Lista de símbolos para screening (en producción sería más extensa)
        screening_symbols = [
            'AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX',
            'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'PYPL', 'UBER', 'LYFT',
            'PLTR', 'SNOW', 'ZM', 'DOCU', 'ROKU', 'SQ', 'SHOP', 'SPOT'
        ]
        
        filtered_stocks = []
        
        # Procesar cada símbolo
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        for symbol in screening_symbols[:15]:  # Limitar para demo
            try:
                # Análisis rápido
                analysis = loop.run_until_complete(
                    coordinator.analyze_stock_comprehensive(
                        symbol,
                        include_patterns=False,
                        include_predictions=False,
                        include_sentiment=False,
                        include_catalysts=True
                    )
                )
                
                # Aplicar filtros
                if 'technical' in analysis and 'data_summary' in analysis['technical']:
                    price = analysis['technical']['data_summary']['latest_price']
                    volume = analysis['technical']['data_summary']['latest_volume']
                else:
                    continue
                
                catalyst_score = analysis.get('catalysts', {}).get('catalyst_score', 0)
                
                # Verificar filtros
                if max_price and price > max_price:
                    continue
                if min_volume and volume < min_volume:
                    continue
                if catalyst_score < catalyst_score_min:
                    continue
                
                # Agregar a resultados
                filtered_stocks.append({
                    'symbol': symbol,
                    'price': price,
                    'volume': volume,
                    'catalyst_score': catalyst_score,
                    'recommendation': analysis.get('final_recommendation', {}).get('recommendation', 'HOLD'),
                    'confidence': analysis.get('final_recommendation', {}).get('confidence', 'low')
                })
                
            except Exception as e:
                print(f"Error procesando {symbol}: {e}")
                continue
        
        loop.close()
        
        # Ordenar por puntuación de catalizador
        filtered_stocks.sort(key=lambda x: x['catalyst_score'], reverse=True)
        
        return jsonify({
            'stocks': filtered_stocks,
            'filters_applied': {
                'sector': sector,
                'max_price': max_price,
                'min_volume': min_volume,
                'catalyst_score_min': catalyst_score_min
            },
            'total_found': len(filtered_stocks),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/watchlist', methods=['POST'])
def create_watchlist():
    """
    Crea una watchlist personalizada
    
    Body: {
        "name": "My Watchlist",
        "symbols": ["AAPL", "TSLA"],
        "criteria": {
            "min_catalyst_score": 60,
            "preferred_sentiment": "positive"
        }
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'symbols' not in data:
            return jsonify({'error': 'Se requiere lista de símbolos'}), 400
        
        watchlist_name = data.get('name', 'Unnamed Watchlist')
        symbols = data['symbols']
        criteria = data.get('criteria', {})
        
        # Analizar cada símbolo en la watchlist
        watchlist_analysis = {}
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        for symbol in symbols:
            try:
                analysis = loop.run_until_complete(
                    coordinator.analyze_stock_comprehensive(symbol.upper())
                )
                
                watchlist_analysis[symbol.upper()] = {
                    'current_price': analysis.get('technical', {}).get('data_summary', {}).get('latest_price', 0),
                    'recommendation': analysis.get('final_recommendation', {}),
                    'catalyst_score': analysis.get('catalysts', {}).get('catalyst_score', 0),
                    'sentiment': analysis.get('sentiment', {}).get('overall_sentiment', 'neutral'),
                    'last_updated': datetime.now().isoformat()
                }
                
            except Exception as e:
                watchlist_analysis[symbol.upper()] = {
                    'error': str(e),
                    'last_updated': datetime.now().isoformat()
                }
        
        loop.close()
        
        # Crear respuesta de watchlist
        watchlist = {
            'name': watchlist_name,
            'symbols': symbols,
            'criteria': criteria,
            'analysis': watchlist_analysis,
            'created_at': datetime.now().isoformat(),
            'summary': {
                'total_symbols': len(symbols),
                'strong_buy_count': sum(1 for a in watchlist_analysis.values() 
                                      if a.get('recommendation', {}).get('recommendation') == 'STRONG_BUY'),
                'buy_count': sum(1 for a in watchlist_analysis.values() 
                               if a.get('recommendation', {}).get('recommendation') == 'BUY'),
                'avg_catalyst_score': sum(a.get('catalyst_score', 0) for a in watchlist_analysis.values()) / len(symbols)
            }
        }
        
        return jsonify(watchlist)
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@stock_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Obtiene alertas basadas en catalizadores y cambios significativos"""
    try:
        # Símbolos para monitorear alertas
        alert_symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL']
        
        alerts = []
        
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        for symbol in alert_symbols:
            try:
                analysis = loop.run_until_complete(
                    coordinator.analyze_stock_comprehensive(symbol)
                )
                
                # Generar alertas basadas en criterios
                catalyst_score = analysis.get('catalysts', {}).get('catalyst_score', 0)
                recommendation = analysis.get('final_recommendation', {})
                
                # Alerta por alto puntaje de catalizador
                if catalyst_score > 75:
                    alerts.append({
                        'type': 'high_catalyst',
                        'symbol': symbol,
                        'message': f'{symbol} tiene un puntaje de catalizador alto: {catalyst_score:.1f}',
                        'severity': 'high',
                        'recommendation': recommendation.get('recommendation', 'HOLD'),
                        'timestamp': datetime.now().isoformat()
                    })
                
                # Alerta por recomendación fuerte
                if recommendation.get('recommendation') in ['STRONG_BUY', 'STRONG_SELL']:
                    alerts.append({
                        'type': 'strong_recommendation',
                        'symbol': symbol,
                        'message': f'{symbol}: {recommendation.get("recommendation", "")} con confianza {recommendation.get("confidence", "")}',
                        'severity': 'medium',
                        'recommendation': recommendation.get('recommendation', 'HOLD'),
                        'timestamp': datetime.now().isoformat()
                    })
                
            except Exception as e:
                print(f"Error generando alerta para {symbol}: {e}")
                continue
        
        loop.close()
        
        # Ordenar alertas por severidad
        severity_order = {'high': 3, 'medium': 2, 'low': 1}
        alerts.sort(key=lambda x: severity_order.get(x['severity'], 0), reverse=True)
        
        return jsonify({
            'alerts': alerts,
            'total_alerts': len(alerts),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

