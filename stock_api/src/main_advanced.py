"""
Backend Flask Expandido - StockAI Pro
APIs Completas para TODAS las funcionalidades avanzadas
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import json
import os
import pandas as pd
from datetime import datetime, timedelta
import random
import time
from typing import Dict, List, Any
import threading
import schedule
import numpy as np
from collections import defaultdict
import yfinance as yf

app = Flask(__name__)
CORS(app, origins="*")
socketio = SocketIO(app, cors_allowed_origins="*")

# Configuración global
DATA_DIR = '/home/ubuntu/stock_recommendation_system'
STOCKS_FILE = os.path.join(DATA_DIR, 'complete_lightyear_analysis.json')
SUMMARY_FILE = os.path.join(DATA_DIR, 'lightyear_analysis_summary.json')

# Cache global para datos
stocks_cache = {}
summary_cache = {}
watchlists = defaultdict(list)
alerts = defaultdict(list)
portfolios = defaultdict(dict)
user_preferences = defaultdict(dict)
comparison_stocks = []
historical_data_cache = {}
last_update = None

def load_data():
    """Cargar datos de análisis"""
    global stocks_cache, summary_cache, last_update
    
    try:
        # Cargar análisis completo
        if os.path.exists(STOCKS_FILE):
            with open(STOCKS_FILE, 'r') as f:
                data = json.load(f)
                if 'stocks' in data:
                    stocks_cache = data['stocks']
                else:
                    stocks_cache = data
        
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

def generate_historical_data(symbol, days=365):
    """Generar datos históricos simulados"""
    if symbol in historical_data_cache:
        return historical_data_cache[symbol]
    
    # Precio base
    base_price = stocks_cache.get(symbol, {}).get('price', 100)
    
    # Generar datos históricos simulados
    dates = []
    prices = []
    volumes = []
    
    current_date = datetime.now() - timedelta(days=days)
    current_price = base_price * 0.8  # Empezar 20% más bajo
    
    for i in range(days):
        dates.append(current_date.strftime('%Y-%m-%d'))
        
        # Movimiento aleatorio del precio
        change = random.uniform(-0.05, 0.05)  # ±5% diario
        current_price *= (1 + change)
        prices.append(round(current_price, 2))
        
        # Volumen aleatorio
        base_volume = random.randint(1000000, 50000000)
        volumes.append(base_volume)
        
        current_date += timedelta(days=1)
    
    historical_data = {
        'dates': dates,
        'prices': prices,
        'volumes': volumes,
        'high': [p * random.uniform(1.01, 1.05) for p in prices],
        'low': [p * random.uniform(0.95, 0.99) for p in prices],
        'open': [p * random.uniform(0.98, 1.02) for p in prices]
    }
    
    historical_data_cache[symbol] = historical_data
    return historical_data

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
            'sentiment': random.choice(['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative']),
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
                '1_day': {'direction': 'up', 'confidence': 0.75, 'target_price': 0},
                '7_days': {'direction': 'up', 'confidence': 0.68, 'target_price': 0},
                '30_days': {'direction': 'up', 'confidence': 0.62, 'target_price': 0}
            },
            'fundamentals': {
                'pe_ratio': round(random.uniform(10, 50), 1),
                'eps': round(random.uniform(1, 20), 2),
                'dividend_yield': round(random.uniform(0, 5), 2),
                'debt_to_equity': round(random.uniform(0.1, 2), 2),
                'roe': round(random.uniform(5, 25), 1),
                'roa': round(random.uniform(2, 15), 1)
            },
            'news_sentiment': {
                'score': round(random.uniform(-1, 1), 2),
                'articles_count': random.randint(5, 50),
                'last_updated': datetime.now().isoformat()
            }
        }
        
        # Calcular target prices
        current_price = data[symbol]['price']
        data[symbol]['predictions']['1_day']['target_price'] = round(current_price * random.uniform(0.98, 1.05), 2)
        data[symbol]['predictions']['7_days']['target_price'] = round(current_price * random.uniform(0.95, 1.15), 2)
        data[symbol]['predictions']['30_days']['target_price'] = round(current_price * random.uniform(0.90, 1.25), 2)
    
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

# ============= APIs BÁSICAS =============

@app.route('/api/health', methods=['GET'])
def health_check():
    """Verificar estado del sistema"""
    return jsonify({
        'status': 'healthy',
        'stocks_loaded': len(stocks_cache),
        'last_update': last_update.isoformat() if last_update else None,
        'timestamp': datetime.now().isoformat(),
        'features': [
            'watchlist', 'alerts', 'charts', 'sectors', 
            'portfolio', 'real_time', 'export', 'screener'
        ]
    })

@app.route('/api/summary', methods=['GET'])
def get_market_summary():
    """Obtener resumen del mercado"""
    return jsonify(summary_cache)

@app.route('/api/stocks', methods=['GET'])
def get_stocks():
    """Obtener lista de acciones con filtros avanzados y paginación"""
    # Parámetros de consulta
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 50))
    search = request.args.get('search', '').upper()
    recommendation = request.args.get('recommendation', '')
    sector = request.args.get('sector', '')
    min_score = float(request.args.get('min_score', 0))
    max_score = float(request.args.get('max_score', 100))
    min_price = float(request.args.get('min_price', 0))
    max_price = float(request.args.get('max_price', 10000))
    sentiment = request.args.get('sentiment', '')
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
        
        # Filtro de precio
        price = data.get('price', 0)
        if price < min_price or price > max_price:
            continue
        
        # Filtro de sentimiento
        if sentiment and data.get('sentiment') != sentiment:
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
    elif sort_by == 'volume':
        filtered_stocks.sort(key=lambda x: x.get('volume', 0), reverse=reverse)
    
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
            'min_price': min_price,
            'max_price': max_price,
            'sentiment': sentiment,
            'sort_by': sort_by,
            'sort_order': sort_order
        }
    })

@app.route('/api/stocks/<symbol>', methods=['GET'])
def get_stock_detail(symbol):
    """Obtener detalles completos de una acción específica"""
    symbol = symbol.upper()
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    stock_data = stocks_cache[symbol].copy()
    
    # Añadir datos históricos
    stock_data['historical'] = generate_historical_data(symbol)
    
    # Añadir análisis de peers
    sector = stock_data.get('sector', '')
    peers = []
    for s, d in stocks_cache.items():
        if d.get('sector') == sector and s != symbol:
            peers.append({
                'symbol': s,
                'name': d.get('name', ''),
                'price': d.get('price', 0),
                'catalyst_score': d.get('catalyst_score', 0),
                'recommendation': d.get('recommendation', '')
            })
    
    # Top 5 peers por score
    peers.sort(key=lambda x: x['catalyst_score'], reverse=True)
    stock_data['peers'] = peers[:5]
    
    return jsonify(stock_data)

# ============= APIs DE GRÁFICOS =============

@app.route('/api/charts/<symbol>/historical', methods=['GET'])
def get_historical_data(symbol):
    """Obtener datos históricos para gráficos"""
    symbol = symbol.upper()
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    days = int(request.args.get('days', 365))
    interval = request.args.get('interval', 'daily')  # daily, weekly, monthly
    
    historical = generate_historical_data(symbol, days)
    
    # Procesar según intervalo
    if interval == 'weekly':
        # Agrupar por semanas
        processed_data = process_weekly_data(historical)
    elif interval == 'monthly':
        # Agrupar por meses
        processed_data = process_monthly_data(historical)
    else:
        processed_data = historical
    
    return jsonify(processed_data)

@app.route('/api/charts/<symbol>/technical', methods=['GET'])
def get_technical_chart_data(symbol):
    """Obtener datos técnicos para gráficos avanzados"""
    symbol = symbol.upper()
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    historical = generate_historical_data(symbol)
    prices = historical['prices']
    
    # Calcular indicadores técnicos
    sma_20 = calculate_sma(prices, 20)
    sma_50 = calculate_sma(prices, 50)
    rsi = calculate_rsi(prices)
    macd = calculate_macd(prices)
    bollinger = calculate_bollinger_bands(prices)
    
    return jsonify({
        'dates': historical['dates'],
        'prices': prices,
        'volume': historical['volumes'],
        'indicators': {
            'sma_20': sma_20,
            'sma_50': sma_50,
            'rsi': rsi,
            'macd': macd,
            'bollinger': bollinger
        }
    })

# ============= APIs DE WATCHLIST =============

@app.route('/api/watchlist', methods=['GET'])
def get_watchlist():
    """Obtener watchlist del usuario con datos completos"""
    user_id = request.args.get('user_id', 'default')
    symbols = watchlists[user_id]
    
    watchlist_data = []
    for symbol in symbols:
        if symbol in stocks_cache:
            stock_data = stocks_cache[symbol].copy()
            # Añadir datos adicionales para watchlist
            stock_data['added_date'] = datetime.now().isoformat()  # En producción, guardar fecha real
            watchlist_data.append(stock_data)
    
    return jsonify(watchlist_data)

@app.route('/api/watchlist', methods=['POST'])
def add_to_watchlist():
    """Agregar acción a watchlist"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    symbol = data.get('symbol', '').upper()
    category = data.get('category', 'default')
    
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    if symbol not in watchlists[user_id]:
        watchlists[user_id].append(symbol)
        
        # Emitir evento en tiempo real
        socketio.emit('watchlist_updated', {
            'user_id': user_id,
            'action': 'added',
            'symbol': symbol,
            'watchlist': watchlists[user_id]
        })
    
    return jsonify({'success': True, 'watchlist': watchlists[user_id]})

@app.route('/api/watchlist/<symbol>', methods=['DELETE'])
def remove_from_watchlist(symbol):
    """Remover acción de watchlist"""
    user_id = request.args.get('user_id', 'default')
    symbol = symbol.upper()
    
    if symbol in watchlists[user_id]:
        watchlists[user_id].remove(symbol)
        
        # Emitir evento en tiempo real
        socketio.emit('watchlist_updated', {
            'user_id': user_id,
            'action': 'removed',
            'symbol': symbol,
            'watchlist': watchlists[user_id]
        })
    
    return jsonify({'success': True, 'watchlist': watchlists[user_id]})

# ============= APIs DE ALERTAS =============

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Obtener alertas del usuario con estado actualizado"""
    user_id = request.args.get('user_id', 'default')
    user_alerts = alerts[user_id]
    
    # Actualizar estado de alertas
    for alert in user_alerts:
        symbol = alert['symbol']
        if symbol in stocks_cache:
            current_value = get_metric_value(stocks_cache[symbol], alert['metric'])
            alert['current_value'] = current_value
            
            # Verificar si se cumple la condición
            if check_alert_condition(alert, current_value):
                if alert['status'] != 'triggered':
                    alert['status'] = 'triggered'
                    alert['triggered_at'] = datetime.now().isoformat()
                    
                    # Emitir notificación en tiempo real
                    socketio.emit('alert_triggered', {
                        'user_id': user_id,
                        'alert': alert
                    })
            else:
                alert['status'] = 'active'
    
    return jsonify(user_alerts)

@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Crear nueva alerta avanzada"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    
    alert = {
        'id': len(alerts[user_id]) + 1,
        'symbol': data.get('symbol', '').upper(),
        'metric': data.get('metric', 'price'),  # price, catalyst_score, rsi, volume, etc.
        'condition': data.get('condition', 'above'),  # above, below, crosses_above, crosses_below
        'target': float(data.get('target', 0)),
        'status': 'active',
        'notification_methods': data.get('notification_methods', ['web']),  # web, email, push
        'created_at': datetime.now().isoformat(),
        'name': data.get('name', f"{data.get('symbol', '')} Alert")
    }
    
    alerts[user_id].append(alert)
    
    return jsonify({'success': True, 'alert': alert})

@app.route('/api/alerts/<int:alert_id>', methods=['PUT'])
def update_alert(alert_id):
    """Actualizar alerta existente"""
    user_id = request.args.get('user_id', 'default')
    data = request.get_json()
    
    for alert in alerts[user_id]:
        if alert['id'] == alert_id:
            alert.update(data)
            alert['updated_at'] = datetime.now().isoformat()
            return jsonify({'success': True, 'alert': alert})
    
    return jsonify({'error': 'Alert not found'}), 404

@app.route('/api/alerts/<int:alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Eliminar alerta"""
    user_id = request.args.get('user_id', 'default')
    
    alerts[user_id] = [a for a in alerts[user_id] if a['id'] != alert_id]
    
    return jsonify({'success': True})

# ============= APIs DE ANÁLISIS SECTORIAL =============

@app.route('/api/sectors', methods=['GET'])
def get_sectors():
    """Obtener análisis completo por sectores"""
    sectors_data = {}
    
    for symbol, data in stocks_cache.items():
        sector = data.get('sector', 'Unknown')
        if sector not in sectors_data:
            sectors_data[sector] = {
                'name': sector,
                'stocks': [],
                'metrics': {
                    'avg_score': 0,
                    'avg_price': 0,
                    'avg_change': 0,
                    'total_volume': 0,
                    'avg_rsi': 0,
                    'avg_pe': 0
                },
                'recommendations': {
                    'STRONG_BUY': 0,
                    'BUY': 0,
                    'HOLD': 0,
                    'WEAK_HOLD': 0,
                    'SELL': 0
                },
                'sentiment_distribution': {
                    'Very Positive': 0,
                    'Positive': 0,
                    'Neutral': 0,
                    'Negative': 0,
                    'Very Negative': 0
                }
            }
        
        sectors_data[sector]['stocks'].append(data)
        
        # Contar recomendaciones
        rec = data.get('recommendation', 'HOLD')
        if rec in sectors_data[sector]['recommendations']:
            sectors_data[sector]['recommendations'][rec] += 1
        
        # Contar sentimientos
        sentiment = data.get('sentiment', 'Neutral')
        if sentiment in sectors_data[sector]['sentiment_distribution']:
            sectors_data[sector]['sentiment_distribution'][sentiment] += 1
    
    # Calcular métricas promedio
    for sector_data in sectors_data.values():
        stocks = sector_data['stocks']
        if stocks:
            sector_data['metrics']['avg_score'] = round(
                sum(s.get('catalyst_score', 0) for s in stocks) / len(stocks), 1
            )
            sector_data['metrics']['avg_price'] = round(
                sum(s.get('price', 0) for s in stocks) / len(stocks), 2
            )
            sector_data['metrics']['avg_change'] = round(
                sum(s.get('change_percent', 0) for s in stocks) / len(stocks), 2
            )
            sector_data['metrics']['total_volume'] = sum(s.get('volume', 0) for s in stocks)
            
            # RSI promedio
            rsi_values = [s.get('technical_indicators', {}).get('rsi', 50) for s in stocks]
            sector_data['metrics']['avg_rsi'] = round(sum(rsi_values) / len(rsi_values), 1)
            
            # P/E promedio
            pe_values = [s.get('fundamentals', {}).get('pe_ratio', 15) for s in stocks]
            sector_data['metrics']['avg_pe'] = round(sum(pe_values) / len(pe_values), 1)
            
            sector_data['total_stocks'] = len(stocks)
            
            # Top 3 stocks del sector
            top_stocks = sorted(stocks, key=lambda x: x.get('catalyst_score', 0), reverse=True)[:3]
            sector_data['top_stocks'] = [
                {
                    'symbol': s['symbol'],
                    'name': s.get('name', ''),
                    'catalyst_score': s.get('catalyst_score', 0),
                    'recommendation': s.get('recommendation', '')
                }
                for s in top_stocks
            ]
            
            # No incluir la lista completa de stocks en la respuesta
            del sector_data['stocks']
    
    return jsonify(list(sectors_data.values()))

@app.route('/api/sectors/<sector_name>/stocks', methods=['GET'])
def get_sector_stocks(sector_name):
    """Obtener todas las acciones de un sector específico"""
    sector_stocks = []
    
    for symbol, data in stocks_cache.items():
        if data.get('sector', '').lower() == sector_name.lower():
            sector_stocks.append(data)
    
    # Ordenar por catalyst_score
    sector_stocks.sort(key=lambda x: x.get('catalyst_score', 0), reverse=True)
    
    return jsonify(sector_stocks)

# ============= APIs DE COMPARACIÓN =============

@app.route('/api/comparison', methods=['GET'])
def get_comparison():
    """Obtener comparación detallada de acciones"""
    symbols = request.args.getlist('symbols')
    comparison_data = []
    
    for symbol in symbols:
        symbol = symbol.upper()
        if symbol in stocks_cache:
            stock_data = stocks_cache[symbol].copy()
            # Añadir datos históricos para comparación
            stock_data['historical'] = generate_historical_data(symbol, 90)  # 3 meses
            comparison_data.append(stock_data)
    
    # Calcular correlaciones si hay múltiples acciones
    if len(comparison_data) > 1:
        correlations = calculate_correlations(comparison_data)
        return jsonify({
            'stocks': comparison_data,
            'correlations': correlations,
            'comparison_metrics': calculate_comparison_metrics(comparison_data)
        })
    
    return jsonify({'stocks': comparison_data})

@app.route('/api/comparison', methods=['POST'])
def add_to_comparison():
    """Agregar acción a comparación"""
    data = request.get_json()
    symbol = data.get('symbol', '').upper()
    
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    if symbol not in comparison_stocks and len(comparison_stocks) < 10:
        comparison_stocks.append(symbol)
    
    return jsonify({'success': True, 'comparison': comparison_stocks})

@app.route('/api/comparison/<symbol>', methods=['DELETE'])
def remove_from_comparison(symbol):
    """Remover acción de comparación"""
    symbol = symbol.upper()
    
    if symbol in comparison_stocks:
        comparison_stocks.remove(symbol)
    
    return jsonify({'success': True, 'comparison': comparison_stocks})

# ============= APIs DE PORTFOLIO =============

@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Obtener portfolio del usuario"""
    user_id = request.args.get('user_id', 'default')
    portfolio = portfolios[user_id]
    
    if not portfolio:
        return jsonify({'positions': [], 'summary': {}})
    
    # Calcular métricas del portfolio
    total_value = 0
    total_cost = 0
    positions = []
    
    for symbol, position in portfolio.items():
        if symbol in stocks_cache:
            current_price = stocks_cache[symbol]['price']
            market_value = position['shares'] * current_price
            cost_basis = position['shares'] * position['avg_cost']
            pnl = market_value - cost_basis
            pnl_percent = (pnl / cost_basis) * 100 if cost_basis > 0 else 0
            
            positions.append({
                'symbol': symbol,
                'name': stocks_cache[symbol].get('name', ''),
                'shares': position['shares'],
                'avg_cost': position['avg_cost'],
                'current_price': current_price,
                'market_value': round(market_value, 2),
                'cost_basis': round(cost_basis, 2),
                'pnl': round(pnl, 2),
                'pnl_percent': round(pnl_percent, 2),
                'weight': 0  # Se calculará después
            })
            
            total_value += market_value
            total_cost += cost_basis
    
    # Calcular pesos
    for position in positions:
        position['weight'] = round((position['market_value'] / total_value) * 100, 2) if total_value > 0 else 0
    
    total_pnl = total_value - total_cost
    total_pnl_percent = (total_pnl / total_cost) * 100 if total_cost > 0 else 0
    
    summary = {
        'total_value': round(total_value, 2),
        'total_cost': round(total_cost, 2),
        'total_pnl': round(total_pnl, 2),
        'total_pnl_percent': round(total_pnl_percent, 2),
        'positions_count': len(positions)
    }
    
    return jsonify({
        'positions': positions,
        'summary': summary
    })

@app.route('/api/portfolio/position', methods=['POST'])
def add_portfolio_position():
    """Agregar posición al portfolio"""
    data = request.get_json()
    user_id = data.get('user_id', 'default')
    symbol = data.get('symbol', '').upper()
    shares = float(data.get('shares', 0))
    price = float(data.get('price', 0))
    
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    if symbol in portfolios[user_id]:
        # Actualizar posición existente (promedio ponderado)
        existing = portfolios[user_id][symbol]
        total_shares = existing['shares'] + shares
        total_cost = (existing['shares'] * existing['avg_cost']) + (shares * price)
        avg_cost = total_cost / total_shares if total_shares > 0 else 0
        
        portfolios[user_id][symbol] = {
            'shares': total_shares,
            'avg_cost': avg_cost,
            'last_updated': datetime.now().isoformat()
        }
    else:
        # Nueva posición
        portfolios[user_id][symbol] = {
            'shares': shares,
            'avg_cost': price,
            'last_updated': datetime.now().isoformat()
        }
    
    return jsonify({'success': True})

@app.route('/api/portfolio/position/<symbol>', methods=['DELETE'])
def remove_portfolio_position(symbol):
    """Remover posición del portfolio"""
    user_id = request.args.get('user_id', 'default')
    symbol = symbol.upper()
    
    if symbol in portfolios[user_id]:
        del portfolios[user_id][symbol]
    
    return jsonify({'success': True})

# ============= APIs DE BÚSQUEDA Y SCREENER =============

@app.route('/api/search', methods=['GET'])
def search_stocks():
    """Búsqueda avanzada de acciones"""
    query = request.args.get('q', '').upper()
    limit = int(request.args.get('limit', 20))
    include_fundamentals = request.args.get('include_fundamentals', 'false').lower() == 'true'
    
    results = []
    for symbol, data in stocks_cache.items():
        if query in symbol or query in data.get('name', '').upper():
            result = {
                'symbol': symbol,
                'name': data.get('name', ''),
                'price': data.get('price', 0),
                'change_percent': data.get('change_percent', 0),
                'recommendation': data.get('recommendation', ''),
                'catalyst_score': data.get('catalyst_score', 0),
                'sector': data.get('sector', ''),
                'market_cap': data.get('market_cap', '')
            }
            
            if include_fundamentals:
                result['fundamentals'] = data.get('fundamentals', {})
                result['technical_indicators'] = data.get('technical_indicators', {})
            
            results.append(result)
            
            if len(results) >= limit:
                break
    
    return jsonify(results)

@app.route('/api/screener', methods=['POST'])
def custom_screener():
    """Screener personalizado con múltiples criterios"""
    criteria = request.get_json()
    
    results = []
    for symbol, data in stocks_cache.items():
        if meets_criteria(data, criteria):
            results.append(data)
    
    # Ordenar resultados
    sort_by = criteria.get('sort_by', 'catalyst_score')
    reverse = criteria.get('sort_order', 'desc') == 'desc'
    
    if sort_by in ['catalyst_score', 'price', 'change_percent', 'volume']:
        results.sort(key=lambda x: x.get(sort_by, 0), reverse=reverse)
    
    # Limitar resultados
    limit = criteria.get('limit', 100)
    results = results[:limit]
    
    return jsonify({
        'results': results,
        'total_found': len(results),
        'criteria': criteria
    })

# ============= APIs DE EXPORTACIÓN =============

@app.route('/api/export/watchlist', methods=['GET'])
def export_watchlist():
    """Exportar watchlist en diferentes formatos"""
    user_id = request.args.get('user_id', 'default')
    format_type = request.args.get('format', 'json')  # json, csv, excel
    
    symbols = watchlists[user_id]
    export_data = []
    
    for symbol in symbols:
        if symbol in stocks_cache:
            stock = stocks_cache[symbol]
            export_data.append({
                'Symbol': symbol,
                'Name': stock.get('name', ''),
                'Price': stock.get('price', 0),
                'Change %': stock.get('change_percent', 0),
                'Recommendation': stock.get('recommendation', ''),
                'Catalyst Score': stock.get('catalyst_score', 0),
                'Sector': stock.get('sector', ''),
                'Market Cap': stock.get('market_cap', '')
            })
    
    if format_type == 'csv':
        # Convertir a CSV
        import io
        import csv
        
        output = io.StringIO()
        if export_data:
            writer = csv.DictWriter(output, fieldnames=export_data[0].keys())
            writer.writeheader()
            writer.writerows(export_data)
        
        return jsonify({
            'format': 'csv',
            'data': output.getvalue(),
            'filename': f'watchlist_{user_id}_{datetime.now().strftime("%Y%m%d")}.csv'
        })
    
    return jsonify({
        'format': 'json',
        'data': export_data,
        'filename': f'watchlist_{user_id}_{datetime.now().strftime("%Y%m%d")}.json'
    })

@app.route('/api/export/analysis/<symbol>', methods=['GET'])
def export_stock_analysis(symbol):
    """Exportar análisis completo de una acción"""
    symbol = symbol.upper()
    if symbol not in stocks_cache:
        return jsonify({'error': 'Stock not found'}), 404
    
    stock_data = stocks_cache[symbol].copy()
    stock_data['historical'] = generate_historical_data(symbol)
    stock_data['export_date'] = datetime.now().isoformat()
    
    return jsonify({
        'format': 'json',
        'data': stock_data,
        'filename': f'{symbol}_analysis_{datetime.now().strftime("%Y%m%d")}.json'
    })

# ============= FUNCIONES AUXILIARES =============

def get_metric_value(stock_data, metric):
    """Obtener valor de métrica específica"""
    if metric == 'price':
        return stock_data.get('price', 0)
    elif metric == 'catalyst_score':
        return stock_data.get('catalyst_score', 0)
    elif metric == 'rsi':
        return stock_data.get('technical_indicators', {}).get('rsi', 50)
    elif metric == 'volume':
        return stock_data.get('volume', 0)
    elif metric == 'change_percent':
        return stock_data.get('change_percent', 0)
    else:
        return 0

def check_alert_condition(alert, current_value):
    """Verificar si se cumple condición de alerta"""
    condition = alert['condition']
    target = alert['target']
    
    if condition == 'above':
        return current_value > target
    elif condition == 'below':
        return current_value < target
    elif condition == 'equals':
        return abs(current_value - target) < 0.01
    else:
        return False

def calculate_sma(prices, period):
    """Calcular Media Móvil Simple"""
    if len(prices) < period:
        return prices
    
    sma = []
    for i in range(len(prices)):
        if i < period - 1:
            sma.append(None)
        else:
            sma.append(sum(prices[i-period+1:i+1]) / period)
    
    return sma

def calculate_rsi(prices, period=14):
    """Calcular RSI"""
    if len(prices) < period + 1:
        return [50] * len(prices)
    
    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]
    
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    
    rsi = []
    for i in range(len(prices)):
        if i < period:
            rsi.append(50)
        else:
            if avg_loss == 0:
                rsi.append(100)
            else:
                rs = avg_gain / avg_loss
                rsi.append(100 - (100 / (1 + rs)))
            
            # Actualizar promedios
            if i < len(deltas):
                gain = deltas[i] if deltas[i] > 0 else 0
                loss = -deltas[i] if deltas[i] < 0 else 0
                avg_gain = (avg_gain * (period - 1) + gain) / period
                avg_loss = (avg_loss * (period - 1) + loss) / period
    
    return rsi

def calculate_macd(prices):
    """Calcular MACD"""
    if len(prices) < 26:
        return {'macd': [0] * len(prices), 'signal': [0] * len(prices), 'histogram': [0] * len(prices)}
    
    ema_12 = calculate_ema(prices, 12)
    ema_26 = calculate_ema(prices, 26)
    
    macd_line = [ema_12[i] - ema_26[i] for i in range(len(prices))]
    signal_line = calculate_ema(macd_line, 9)
    histogram = [macd_line[i] - signal_line[i] for i in range(len(prices))]
    
    return {
        'macd': macd_line,
        'signal': signal_line,
        'histogram': histogram
    }

def calculate_ema(prices, period):
    """Calcular Media Móvil Exponencial"""
    if len(prices) < period:
        return prices
    
    multiplier = 2 / (period + 1)
    ema = [prices[0]]
    
    for i in range(1, len(prices)):
        ema.append((prices[i] * multiplier) + (ema[i-1] * (1 - multiplier)))
    
    return ema

def calculate_bollinger_bands(prices, period=20, std_dev=2):
    """Calcular Bandas de Bollinger"""
    if len(prices) < period:
        return {'upper': prices, 'middle': prices, 'lower': prices}
    
    sma = calculate_sma(prices, period)
    upper = []
    lower = []
    
    for i in range(len(prices)):
        if i < period - 1:
            upper.append(prices[i])
            lower.append(prices[i])
        else:
            period_prices = prices[i-period+1:i+1]
            std = np.std(period_prices)
            upper.append(sma[i] + (std * std_dev))
            lower.append(sma[i] - (std * std_dev))
    
    return {
        'upper': upper,
        'middle': sma,
        'lower': lower
    }

def process_weekly_data(daily_data):
    """Procesar datos diarios a semanales"""
    # Simplificado - en producción usar pandas para agrupación correcta
    weekly_data = {
        'dates': daily_data['dates'][::7],
        'prices': daily_data['prices'][::7],
        'volumes': daily_data['volumes'][::7],
        'high': daily_data['high'][::7],
        'low': daily_data['low'][::7],
        'open': daily_data['open'][::7]
    }
    return weekly_data

def process_monthly_data(daily_data):
    """Procesar datos diarios a mensuales"""
    # Simplificado - en producción usar pandas para agrupación correcta
    monthly_data = {
        'dates': daily_data['dates'][::30],
        'prices': daily_data['prices'][::30],
        'volumes': daily_data['volumes'][::30],
        'high': daily_data['high'][::30],
        'low': daily_data['low'][::30],
        'open': daily_data['open'][::30]
    }
    return monthly_data

def calculate_correlations(stocks_data):
    """Calcular correlaciones entre acciones"""
    if len(stocks_data) < 2:
        return {}
    
    correlations = {}
    for i, stock1 in enumerate(stocks_data):
        for j, stock2 in enumerate(stocks_data):
            if i != j:
                # Correlación simulada basada en sector
                if stock1.get('sector') == stock2.get('sector'):
                    correlation = random.uniform(0.6, 0.9)
                else:
                    correlation = random.uniform(-0.3, 0.5)
                
                key = f"{stock1['symbol']}-{stock2['symbol']}"
                correlations[key] = round(correlation, 3)
    
    return correlations

def calculate_comparison_metrics(stocks_data):
    """Calcular métricas de comparación"""
    metrics = {
        'best_performer': None,
        'worst_performer': None,
        'highest_score': None,
        'lowest_risk': None
    }
    
    if not stocks_data:
        return metrics
    
    # Mejor rendimiento (change_percent)
    best = max(stocks_data, key=lambda x: x.get('change_percent', 0))
    metrics['best_performer'] = {
        'symbol': best['symbol'],
        'change_percent': best.get('change_percent', 0)
    }
    
    # Peor rendimiento
    worst = min(stocks_data, key=lambda x: x.get('change_percent', 0))
    metrics['worst_performer'] = {
        'symbol': worst['symbol'],
        'change_percent': worst.get('change_percent', 0)
    }
    
    # Mayor score
    highest = max(stocks_data, key=lambda x: x.get('catalyst_score', 0))
    metrics['highest_score'] = {
        'symbol': highest['symbol'],
        'catalyst_score': highest.get('catalyst_score', 0)
    }
    
    # Menor riesgo (RSI más cercano a 50)
    lowest_risk = min(stocks_data, key=lambda x: abs(x.get('technical_indicators', {}).get('rsi', 50) - 50))
    metrics['lowest_risk'] = {
        'symbol': lowest_risk['symbol'],
        'rsi': lowest_risk.get('technical_indicators', {}).get('rsi', 50)
    }
    
    return metrics

def meets_criteria(stock_data, criteria):
    """Verificar si una acción cumple los criterios del screener"""
    # Precio
    price = stock_data.get('price', 0)
    if 'min_price' in criteria and price < criteria['min_price']:
        return False
    if 'max_price' in criteria and price > criteria['max_price']:
        return False
    
    # Catalyst Score
    score = stock_data.get('catalyst_score', 0)
    if 'min_score' in criteria and score < criteria['min_score']:
        return False
    if 'max_score' in criteria and score > criteria['max_score']:
        return False
    
    # Sector
    if 'sectors' in criteria and stock_data.get('sector') not in criteria['sectors']:
        return False
    
    # Recomendación
    if 'recommendations' in criteria and stock_data.get('recommendation') not in criteria['recommendations']:
        return False
    
    # RSI
    rsi = stock_data.get('technical_indicators', {}).get('rsi', 50)
    if 'min_rsi' in criteria and rsi < criteria['min_rsi']:
        return False
    if 'max_rsi' in criteria and rsi > criteria['max_rsi']:
        return False
    
    # Volumen
    volume = stock_data.get('volume', 0)
    if 'min_volume' in criteria and volume < criteria['min_volume']:
        return False
    
    return True

# ============= WEBSOCKET EVENTS =============

@socketio.on('connect')
def handle_connect():
    """Manejar conexión WebSocket"""
    print('Cliente conectado')
    emit('connected', {'status': 'connected'})

@socketio.on('disconnect')
def handle_disconnect():
    """Manejar desconexión WebSocket"""
    print('Cliente desconectado')

@socketio.on('subscribe_stock')
def handle_subscribe_stock(data):
    """Suscribirse a actualizaciones de una acción"""
    symbol = data.get('symbol', '').upper()
    if symbol in stocks_cache:
        emit('stock_subscribed', {'symbol': symbol, 'status': 'subscribed'})

@socketio.on('unsubscribe_stock')
def handle_unsubscribe_stock(data):
    """Desuscribirse de actualizaciones de una acción"""
    symbol = data.get('symbol', '').upper()
    emit('stock_unsubscribed', {'symbol': symbol, 'status': 'unsubscribed'})

# ============= TAREAS PROGRAMADAS =============

def update_market_data():
    """Actualizar datos del mercado (simulado)"""
    print("Actualizando datos del mercado...")
    
    # Simular cambios en precios
    for symbol, data in stocks_cache.items():
        old_price = data.get('price', 100)
        change = random.uniform(-0.02, 0.02)  # ±2%
        new_price = old_price * (1 + change)
        
        data['price'] = round(new_price, 2)
        data['change'] = round(new_price - old_price, 2)
        data['change_percent'] = round(((new_price - old_price) / old_price) * 100, 2)
        
        # Emitir actualización en tiempo real
        socketio.emit('price_update', {
            'symbol': symbol,
            'price': new_price,
            'change': data['change'],
            'change_percent': data['change_percent']
        })

# Programar actualización cada 30 segundos
def start_scheduler():
    """Iniciar programador de tareas"""
    schedule.every(30).seconds.do(update_market_data)
    
    while True:
        schedule.run_pending()
        time.sleep(1)

# Iniciar scheduler en hilo separado
scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
scheduler_thread.start()

# ============= RUTAS ADICIONALES =============

@app.route('/api/top-opportunities', methods=['GET'])
def get_top_opportunities():
    """Obtener top oportunidades con filtros avanzados"""
    limit = int(request.args.get('limit', 20))
    recommendation = request.args.get('recommendation', 'STRONG_BUY')
    sector = request.args.get('sector', '')
    min_score = float(request.args.get('min_score', 80))
    
    # Filtrar por recomendación
    opportunities = []
    for symbol, data in stocks_cache.items():
        if data.get('recommendation') == recommendation:
            if sector and data.get('sector') != sector:
                continue
            if data.get('catalyst_score', 0) < min_score:
                continue
            opportunities.append(data)
    
    # Ordenar por catalyst_score
    opportunities.sort(key=lambda x: x.get('catalyst_score', 0), reverse=True)
    
    return jsonify(opportunities[:limit])

@app.route('/api/market-movers', methods=['GET'])
def get_market_movers():
    """Obtener acciones con mayor movimiento del día"""
    gainers = []
    losers = []
    most_active = []
    
    for symbol, data in stocks_cache.items():
        change_percent = data.get('change_percent', 0)
        volume = data.get('volume', 0)
        
        if change_percent > 0:
            gainers.append(data)
        elif change_percent < 0:
            losers.append(data)
        
        most_active.append((data, volume))
    
    # Ordenar
    gainers.sort(key=lambda x: x.get('change_percent', 0), reverse=True)
    losers.sort(key=lambda x: x.get('change_percent', 0))
    most_active.sort(key=lambda x: x[1], reverse=True)
    
    return jsonify({
        'gainers': gainers[:10],
        'losers': losers[:10],
        'most_active': [item[0] for item in most_active[:10]]
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
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

if __name__ == '__main__':
    print("🚀 StockAI Pro Backend - Todas las funcionalidades activadas")
    print(f"📊 Acciones cargadas: {len(stocks_cache)}")
    print("🌐 Servidor iniciando en http://0.0.0.0:5000")
    
    # Ejecutar con SocketIO para tiempo real
    socketio.run(app, host='0.0.0.0', port=5000, debug=False, allow_unsafe_werkzeug=True)

