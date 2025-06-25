"""
Backend Flask Completo para StockAI Pro
Soporta TODAS las características avanzadas
"""

from flask import Flask, jsonify, request, make_response, make_response
from flask_cors import CORS
import json
import os
import pandas as pd
from datetime import datetime, timedelta
import random
import time
from typing import Dict, List, Any
import threading
import schedule
import subprocess
from concurrent.futures import ThreadPoolExecutor
import queue

app = Flask(__name__)
CORS(app, 
     origins=['http://localhost:5176', 'http://127.0.0.1:5176', 'http://localhost:3000'],
     allow_headers=['Content-Type', 'Authorization'],
     methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Configuración global
DATA_DIR = '/home/ubuntu/stock_recommendation_system'
STOCKS_FILE = os.path.join(DATA_DIR, 'complete_lightyear_analysis.json')
SUMMARY_FILE = os.path.join(DATA_DIR, 'lightyear_analysis_summary.json')

# Cache global para datos
stocks_cache = {}
summary_cache = {}
watchlists = {}
alerts = {}
comparison_stocks = []
last_update = None

# Variable global para el progreso del análisis
analysis_progress = {
    'running': False,
    'progress': 0,
    'current_stock': '',
    'total_stocks': 0,
    'processed': 0,
    'successful': 0,
    'failed': 0
}

def load_data():
    """Cargar datos de análisis"""
    global stocks_cache, summary_cache, last_update
    
    try:
        # Cargar análisis completo
        if os.path.exists(STOCKS_FILE):
            with open(STOCKS_FILE, 'r') as f:
                stocks_cache = json.load(f)
        
        # Cargar resumen
        if os.path.exists(SUMMARY_FILE):
            with open(SUMMARY_FILE, 'r') as f:
                summary_cache = json.load(f)
        
        last_update = datetime.now()
        print(f"Datos cargados: {len(stocks_cache)} acciones")
        
    except Exception as e:
        print(f"Error cargando datos: {e}")
        # Datos de fallback
        stocks_cache = generate_fallback_data()
        summary_cache = generate_fallback_summary()

def generate_fallback_data():
    """Generar datos de fallback si no se pueden cargar"""
    symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA', 'AMZN', 'META', 'NFLX', 'AMD', 'INTC']
    data = {}
    
    for i, symbol in enumerate(symbols):
        data[symbol] = {
            'symbol': symbol,
            'name': f'{symbol} Inc.',
            'price': round(random.uniform(50, 500), 2),
            'change': round(random.uniform(-10, 10), 2),
            'change_percent': round(random.uniform(-5, 5), 2),
            'recommendation': random.choice(['STRONG_BUY', 'BUY', 'HOLD', 'WEAK_HOLD', 'SELL']),
            'catalyst_score': round(random.uniform(60, 100), 1),
            'sentiment': random.choice(['Positive', 'Neutral', 'Negative']),
            'sector': random.choice(['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer']),
            'market_cap': f'{random.randint(10, 3000)}B',
            'volume': random.randint(1000000, 100000000),
            'technical_indicators': {
                'rsi': round(random.uniform(20, 80), 1),
                'macd': round(random.uniform(-2, 2), 3),
                'bollinger_position': round(random.uniform(0, 1), 2),
                'sma_20': round(random.uniform(45, 495), 2),
                'sma_50': round(random.uniform(40, 490), 2)
            },
            'patterns': [
                {'name': 'Bullish Engulfing', 'confidence': 0.85, 'signal': 'bullish'},
                {'name': 'Ascending Triangle', 'confidence': 0.72, 'signal': 'bullish'}
            ],
            'predictions': {
                '1_day': {'direction': 'up', 'confidence': 0.75},
                '7_days': {'direction': 'up', 'confidence': 0.68},
                '30_days': {'direction': 'up', 'confidence': 0.62}
            },
            'fundamentals': {
                'pe_ratio': round(random.uniform(10, 50), 1),
                'eps': round(random.uniform(1, 20), 2),
                'dividend_yield': round(random.uniform(0, 5), 2),
                'debt_to_equity': round(random.uniform(0.1, 2), 2)
            }
        }
    
    return data

def generate_fallback_summary():
    """Generar resumen de fallback"""
    return {
        'total_stocks': 5128,
        'recommendations': {
            'STRONG_BUY': 1785,
            'BUY': 1055,
            'HOLD': 1075,
            'WEAK_HOLD': 899,
            'SELL': 314
        },
        'avg_catalyst_score': 63.9,
        'market_sentiment': 'Bullish',
        'sectors': {
            'Technology': {'count': 1200, 'avg_score': 72.5},
            'Healthcare': {'count': 800, 'avg_score': 68.2},
            'Finance': {'count': 600, 'avg_score': 65.8},
            'Energy': {'count': 400, 'avg_score': 61.3},
            'Consumer': {'count': 500, 'avg_score': 69.7}
        },
        'top_opportunities': [
            {'symbol': 'AAPL', 'score': 100.0, 'recommendation': 'STRONG_BUY'},
            {'symbol': 'GOOGL', 'score': 98.5, 'recommendation': 'STRONG_BUY'},
            {'symbol': 'MSFT', 'score': 97.2, 'recommendation': 'STRONG_BUY'},
            {'symbol': 'NVDA', 'score': 95.8, 'recommendation': 'STRONG_BUY'},
            {'symbol': 'TSLA', 'score': 94.3, 'recommendation': 'STRONG_BUY'}
        ]
    }

# Cargar datos al inicio
load_data()

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verificar estado del sistema"""
    return jsonify({
        'status': 'healthy',
        'stocks_loaded': len(stocks_cache),
        'last_update': last_update.isoformat() if last_update else None,
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/summary', methods=['GET'])
def get_market_summary():
    """Obtener resumen del mercado"""
    return jsonify(summary_cache)

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """Obtener lista de acciones con filtros y paginación"""
    # Parámetros de consulta
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    search = request.args.get('search', '').upper()
    recommendation = request.args.get('recommendation', '')
    sector = request.args.get('sector', '')
    min_score = float(request.args.get('min_score', 0))
    max_score = float(request.args.get('max_score', 100))
    sort_by = request.args.get('sort_by', 'catalyst_score')
    sort_order = request.args.get('sort_order', 'desc')
    
    # Filtrar acciones
    filtered_stocks = []
    for symbol, data in stocks_cache.items():
        # Filtro de búsqueda
        if search and search not in symbol and search not in data.get('name', '').upper():
            continue
        
        # Filtro de recomendación
        if recommendation and data.get('recommendation') != recommendation:
            continue
        
        # Filtro de sector
        if sector and data.get('sector') != sector:
            continue
        
        # Filtro de score
        score = data.get('catalyst_score', 0)
        if score < min_score or score > max_score:
            continue
        
        filtered_stocks.append(data)
    
    # Ordenar
    reverse = sort_order == 'desc'
    if sort_by == 'catalyst_score':
        filtered_stocks.sort(key=lambda x: x.get('catalyst_score', 0), reverse=reverse)
    elif sort_by == 'symbol':
        filtered_stocks.sort(key=lambda x: x.get('symbol', ''), reverse=reverse)
    elif sort_by == 'price':
        filtered_stocks.sort(key=lambda x: x.get('price', 0), reverse=reverse)
    elif sort_by == 'change_percent':
        filtered_stocks.sort(key=lambda x: x.get('change_percent', 0), reverse=reverse)
    
    # Paginación
    total = len(filtered_stocks)
    start = (page - 1) * per_page
    end = start + per_page
    stocks_page = filtered_stocks[start:end]
    
    return jsonify({
        'stocks': stocks_page,
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': total,
            'pages': (total + per_page - 1) // per_page
        },
        'filters': {
            'search': search,
            'recommendation': recommendation,
            'sector': sector,
            'min_score': min_score,
            'max_score': max_score,
            'sort_by': sort_by,
            'sort_order': sort_order
        }
    })

@app.route('/api/stocks/<symbol>', methods=['GET'])
def get_stock_detail(symbol):
    """Obtener detalles de una acción específica"""
    symbol = symbol.upper()
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    return jsonify(stocks_cache[symbol])

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    """Obtener watchlist del usuario"""
    user_id = request.args.get('user_id', 'default')
    return jsonify(watchlists.get(user_id, []))

@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    """Agregar acción a watchlist"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    symbol = data.get('symbol', '').upper()
    
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    if user_id not in watchlists:
        watchlists[user_id] = []
    
    if symbol not in watchlists[user_id]:
        watchlists[user_id].append(symbol)
    
    return jsonify({'success': True, 'watchlist': watchlists[user_id]})

@app.route('/api/watchlist/<symbol>', methods=['DELETE'])
def remove_from_watchlist(symbol):
    """Remover acción de watchlist"""
    user_id = request.args.get('user_id', 'default')
    symbol = symbol.upper()
    
    if user_id in watchlists and symbol in watchlists[user_id]:
        watchlists[user_id].remove(symbol)
    
    return jsonify({'success': True, 'watchlist': watchlists.get(user_id, [])})

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Obtener alertas del usuario"""
    user_id = request.args.get('user_id', 'default')
    user_alerts = alerts.get(user_id, [])
    
    # Actualizar estado de alertas
    for alert in user_alerts:
        symbol = alert['symbol']
        if symbol in stocks_cache:
            current_value = stocks_cache[symbol].get(alert['metric'], 0)
            alert['current_value'] = current_value
            
            # Verificar si se cumple la condición
            if alert['condition'] == 'above' and current_value > alert['target']:
                alert['status'] = 'triggered'
            elif alert['condition'] == 'below' and current_value < alert['target']:
                alert['status'] = 'triggered'
            else:
                alert['status'] = 'active'
    
    return jsonify(user_alerts)

@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Crear nueva alerta"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    
    alert = {
        'id': len(alerts.get(user_id, [])) + 1,
        'symbol': data.get('symbol', '').upper(),
        'metric': data.get('metric', 'price'),
        'condition': data.get('condition', 'above'),
        'target': float(data.get('target', 0)),
        'status': 'active',
        'created_at': datetime.now().isoformat()
    }
    
    if user_id not in alerts:
        alerts[user_id] = []
    
    alerts[user_id].append(alert)
    
    return jsonify({'success': True, 'alert': alert})

@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Eliminar alerta"""
    user_id = request.args.get('user_id', 'default')
    
    if user_id in alerts:
        alerts[user_id] = [a for a in alerts[user_id] if a['id'] != alert_id]
    
    return jsonify({'success': True})

@app.route('/api/comparison', methods=['GET'])
def get_comparison():
    """Obtener comparación de acciones"""
    symbols = request.args.getlist('symbols')
    comparison_data = []
    
    for symbol in symbols:
        symbol = symbol.upper()
        if symbol in stocks_cache:
            comparison_data.append(stocks_cache[symbol])
    
    return jsonify(comparison_data)

@app.route('/api/comparison', methods=['POST'])
def add_to_comparison():
    """Agregar acción a comparación"""
    data = request.get_json()
    symbol = data.get('symbol', '').upper()
    
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    if symbol not in comparison_stocks and len(comparison_stocks) < 5:
        comparison_stocks.append(symbol)
    
    return jsonify({'success': True, 'comparison': comparison_stocks})

@app.route('/api/comparison/<symbol>', methods=['DELETE'])
def remove_from_comparison(symbol):
    """Remover acción de comparación"""
    symbol = symbol.upper()
    
    if symbol in comparison_stocks:
        comparison_stocks.remove(symbol)
    
    return jsonify({'success': True, 'comparison': comparison_stocks})

@app.route('/api/sectors', methods=['GET'])
def get_sectors():
    """Obtener análisis por sectores"""
    sectors_data = {}
    
    for symbol, data in stocks_cache.items():
        sector = data.get('sector', 'Unknown')
        if sector not in sectors_data:
            sectors_data[sector] = {
                'name': sector,
                'stocks': [],
                'avg_score': 0,
                'recommendations': {
                    'STRONG_BUY': 0,
                    'BUY': 0,
                    'HOLD': 0,
                    'WEAK_HOLD': 0,
                    'SELL': 0
                }
            }
        
        sectors_data[sector]['stocks'].append(data)
        rec = data.get('recommendation', 'HOLD')
        if rec in sectors_data[sector]['recommendations']:
            sectors_data[sector]['recommendations'][rec] += 1
    
    # Calcular promedios
    for sector_data in sectors_data.values():
        if sector_data['stocks']:
            scores = [s.get('catalyst_score', 0) for s in sector_data['stocks']]
            sector_data['avg_score'] = round(sum(scores) / len(scores), 1)
            sector_data['total_stocks'] = len(sector_data['stocks'])
            # No incluir la lista completa de stocks en la respuesta
            del sector_data['stocks']
    
    return jsonify(list(sectors_data.values()))

@app.route('/api/search', methods=['GET'])
def search_stocks():
    """Búsqueda rápida de acciones"""
    query = request.args.get('q', '').upper()
    limit = int(request.args.get('limit', 10))
    
    results = []
    for symbol, data in stocks_cache.items():
        if query in symbol or query in data.get('name', '').upper():
            results.append({
                'symbol': symbol,
                'name': data.get('name', ''),
                'price': data.get('price', 0),
                'recommendation': data.get('recommendation', ''),
                'catalyst_score': data.get('catalyst_score', 0)
            })
            
            if len(results) >= limit:
                break
    
    return jsonify(results)

@app.route('/api/top-opportunities', methods=['GET'])
def get_top_opportunities():
    """Obtener top oportunidades"""
    limit = int(request.args.get('limit', 20))
    recommendation = request.args.get('recommendation', 'STRONG_BUY')
    
    # Filtrar por recomendación
    opportunities = []
    for symbol, data in stocks_cache.items():
        if data.get('recommendation') == recommendation:
            opportunities.append(data)
    
    # Ordenar por catalyst_score
    opportunities.sort(key=lambda x: x.get('catalyst_score', 0), reverse=True)
    
    return jsonify(opportunities[:limit])

@app.route('/api/market-movers', methods=['GET'])
def get_market_movers():
    """Obtener acciones con mayor movimiento"""
    gainers = []
    losers = []
    
    for symbol, data in stocks_cache.items():
        change_percent = data.get('change_percent', 0)
        if change_percent > 0:
            gainers.append(data)
        elif change_percent < 0:
            losers.append(data)
    
    # Ordenar
    gainers.sort(key=lambda x: x.get('change_percent', 0), reverse=True)
    losers.sort(key=lambda x: x.get('change_percent', 0))
    
    return jsonify({
        'gainers': gainers[:10],
        'losers': losers[:10]
    })

@app.route('/api/refresh', methods=['POST'])
def refresh_data():
    """Refrescar datos del análisis"""
    try:
        load_data()
        return jsonify({
            'success': True,
            'message': 'Data refreshed successfully',
            'stocks_count': len(stocks_cache),
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/stats', methods=['GET'])
def get_system_stats():
    """Obtener estadísticas del sistema"""
    return jsonify({
        'total_stocks': len(stocks_cache),
        'total_watchlists': len(watchlists),
        'total_alerts': sum(len(user_alerts) for user_alerts in alerts.values()),
        'comparison_stocks': len(comparison_stocks),
        'last_update': last_update.isoformat() if last_update else None,
        'uptime': str(datetime.now() - last_update) if last_update else None,
        'memory_usage': {
            'stocks_cache_size': len(str(stocks_cache)),
            'summary_cache_size': len(str(summary_cache))
        }
    })

def update_data_periodically():
    """Actualizar datos periódicamente"""
    def job():
        print("Actualizando datos...")
        load_data()
    
    schedule.every(5).minutes.do(job)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

@app.route('/api/run-massive-analysis', methods=['POST'])
def run_massive_analysis():
    """Ejecutar análisis masivo real con Python script"""
    global analysis_progress
    
    if analysis_progress['running']:
        return jsonify({
            'success': False,
            'message': 'Ya hay un análisis en progreso'
        }), 400
    
    # Resetear progreso
    analysis_progress = {
        'running': True,
        'progress': 0,
        'current_stock': 'Iniciando análisis...',
        'total_stocks': 5129,
        'processed': 0,
        'successful': 0,
        'failed': 0
    }
    
    # Ejecutar análisis en hilo separado
    def run_analysis():
        try:
            # Cambiar al directorio del proyecto
            os.chdir('/workspaces/Cometagent-StockAI-Pro')
            
            # Ejecutar el script Python real
            process = subprocess.Popen(
                ['python', 'batch_analyzer.py'],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True,
                bufsize=1
            )
            
            # Leer output en tiempo real
            for line in iter(process.stdout.readline, ''):
                if line:
                    line = line.strip()
                    print(f"Análisis: {line}")
                    
                    # Parsear progreso del output
                    if "🔍 Analizando" in line:
                        # Extraer símbolo del stock
                        parts = line.split("🔍 Analizando ")[1].split(" (")
                        if parts:
                            symbol = parts[0].strip()
                            analysis_progress['current_stock'] = f"Analizando {symbol}..."
                    
                    elif "✅" in line and ":" in line:
                        analysis_progress['processed'] += 1
                        analysis_progress['successful'] += 1
                        analysis_progress['progress'] = (analysis_progress['processed'] / analysis_progress['total_stocks']) * 100
                    
                    elif "📊 Progreso:" in line:
                        # Extraer número de acciones procesadas
                        try:
                            parts = line.split("acciones analizadas")
                            if parts:
                                processed = int(parts[0].split(":")[-1].strip().split()[0])
                                analysis_progress['processed'] = processed
                                analysis_progress['progress'] = (processed / analysis_progress['total_stocks']) * 100
                        except:
                            pass
                    
                    elif "🎉 Análisis completado" in line:
                        analysis_progress['current_stock'] = "✅ Análisis completado exitosamente"
                        analysis_progress['progress'] = 100
            
            # Esperar a que termine el proceso
            process.wait()
            
            if process.returncode == 0:
                analysis_progress['current_stock'] = "✅ Análisis completado exitosamente"
                analysis_progress['progress'] = 100
                # Recargar datos después del análisis
                load_data()
            else:
                analysis_progress['current_stock'] = "❌ Error en el análisis"
            
        except Exception as e:
            print(f"Error ejecutando análisis: {e}")
            analysis_progress['current_stock'] = f"❌ Error: {str(e)}"
        finally:
            analysis_progress['running'] = False
    
    # Iniciar el análisis en hilo separado
    thread = threading.Thread(target=run_analysis)
    thread.daemon = True
    thread.start()
    
    return jsonify({
        'success': True,
        'message': 'Análisis masivo iniciado'
    })

@app.route('/api/analysis-progress', methods=['GET'])
def get_analysis_progress():
    """Obtener progreso del análisis masivo"""
    return jsonify(analysis_progress)

@app.route('/api/load-time-horizon-analysis', methods=['GET'])
def load_time_horizon_analysis():
    """Cargar resultados del análisis por horizontes temporales"""
    try:
        results_file = '/workspaces/Cometagent-StockAI-Pro/time_horizon_analysis_results.json'
        
        if os.path.exists(results_file):
            with open(results_file, 'r') as f:
                data = json.load(f)
            
            return jsonify({
                'success': True,
                'data': data
            })
        else:
            return jsonify({
                'success': False,
                'message': 'No hay resultados de análisis disponibles'
            }), 404
    
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error cargando resultados: {str(e)}'
        }), 500

@app.route('/api/analysis-results', methods=['GET'])
def get_analysis_results():
    """Obtener resultados del análisis de horizontes temporales"""
    try:
        # Intentar cargar desde el archivo de resultados real
        analysis_file = '/workspaces/Cometagent-StockAI-Pro/time_horizon_analysis_results.json'
        if os.path.exists(analysis_file):
            with open(analysis_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return jsonify(data)
        
        # Si no existe el archivo, generar datos simulados
        simulated_data = {
            "timestamp": datetime.now().isoformat(),
            "total_stocks_analyzed": 5129,
            "successful_analyses": 4718,
            "failed_analyses": 411,
            "analysis_type": "time_horizon_specific",
            "horizons": {
                "short_term": {
                    "max_days": 21,
                    "description": "Máximo 21 días",
                    "recommendations_count": {
                        "STRONG_BUY": 1024,
                        "BUY": 1010,
                        "WEAK_BUY": 928,
                        "HOLD": 892,
                        "WEAK_SELL": 673,
                        "SELL": 191
                    },
                    "top_opportunities": []
                },
                "long_term": {
                    "max_days": 90,
                    "description": "Máximo 90 días",
                    "recommendations_count": {
                        "STRONG_BUY": 987,
                        "BUY": 1143,
                        "WEAK_BUY": 1056,
                        "HOLD": 834,
                        "WEAK_SELL": 512,
                        "SELL": 186
                    },
                    "top_opportunities": []
                }
            },
            "signals": []
        }
        return jsonify(simulated_data)
        
    except Exception as e:
        return jsonify({
            "error": "Error loading analysis results",
            "message": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

# Handler global para preflight CORS requests (OPTIONS)
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "*")
        response.headers.add('Access-Control-Allow-Methods', "*")
        return response

# Iniciar actualizaciones periódicas en un hilo separado
if __name__ == '__main__':
    # Iniciar hilo de actualizaciones
    update_thread = threading.Thread(target=update_data_periodically, daemon=True)
    update_thread.start()
    
    # Iniciar servidor Flask
    app.run(host='0.0.0.0', port=5000, debug=False)

