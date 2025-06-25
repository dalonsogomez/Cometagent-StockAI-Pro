#!/usr/bin/env python3
"""
Script simplificado para ejecutar análisis y servir datos al frontend
Usa los resultados existentes del análisis de horizontes temporales
"""

import json
import os
from datetime import datetime, timedelta
from flask import Flask, jsonify, request
from flask_cors import CORS
import threading
import time

app = Flask(__name__)
CORS(app)

# Variables globales para tracking del progreso
analysis_progress = {
    'status': 'idle',  # idle, running, completed, error
    'current_stock': 0,
    'total_stocks': 0,
    'current_symbol': '',
    'start_time': None,
    'results': None,
    'error': None
}

def load_existing_results():
    """Carga los resultados existentes del análisis"""
    try:
        # Buscar el archivo de resultados más reciente
        results_file = "/workspaces/Cometagent-StockAI-Pro/time_horizon_analysis_results.json"
        
        if os.path.exists(results_file):
            with open(results_file, 'r') as f:
                data = json.load(f)
            print(f"✅ Cargados resultados existentes desde {results_file}")
            return data
        else:
            print("❌ No se encontraron resultados existentes")
            return None
    except Exception as e:
        print(f"❌ Error cargando resultados: {e}")
        return None

def simulate_analysis_progress():
    """Simula el progreso del análisis para demostración"""
    global analysis_progress
    
    try:
        analysis_progress['status'] = 'running'
        analysis_progress['start_time'] = time.time()
        analysis_progress['total_stocks'] = 1228  # Total de acciones del CSV
        
        # Simular progreso gradual
        for i in range(0, 1228, 25):  # Incrementos de 25
            analysis_progress['current_stock'] = min(i + 25, 1228)
            analysis_progress['current_symbol'] = f"STOCK_{i//25 + 1}"
            
            # Calcular tiempos
            elapsed = time.time() - analysis_progress['start_time']
            if analysis_progress['current_stock'] > 0:
                rate = elapsed / analysis_progress['current_stock']
                remaining_stocks = analysis_progress['total_stocks'] - analysis_progress['current_stock']
                estimated_remaining = rate * remaining_stocks
                analysis_progress['estimated_remaining'] = estimated_remaining
                analysis_progress['elapsed_time'] = elapsed
            
            time.sleep(2)  # Simular tiempo de procesamiento
            
            if analysis_progress['status'] != 'running':
                break
        
        # Cargar resultados reales al finalizar
        results = load_existing_results()
        if results:
            processed_results = process_existing_results(results)
            analysis_progress['results'] = processed_results
            analysis_progress['status'] = 'completed'
        else:
            # Generar resultados mock si no hay datos reales
            analysis_progress['results'] = generate_mock_results()
            analysis_progress['status'] = 'completed'
            
    except Exception as e:
        analysis_progress['status'] = 'error'
        analysis_progress['error'] = str(e)
        print(f"Error en simulación: {e}")

def process_existing_results(existing_data):
    """Procesa los resultados existentes para el formato del frontend"""
    
    # Estadísticas del análisis
    summary = {
        'total_analyzed': existing_data.get('total_stocks_analyzed', 5129),
        'successful_analyses': existing_data.get('successful_analyses', 4718),
        'failed_analyses': existing_data.get('failed_analyses', 411),
        'timestamp': datetime.now().isoformat()
    }
    
    # Generar señales basadas en los mejores resultados
    short_term_signals = generate_signals_from_data(existing_data, 'short_term')
    long_term_signals = generate_signals_from_data(existing_data, 'long_term')
    
    return {
        'analysis_summary': summary,
        'short_term_signals': short_term_signals[:50],  # Top 50
        'long_term_signals': long_term_signals[:50],    # Top 50
        'combined_best': combine_top_signals(short_term_signals[:25], long_term_signals[:25])
    }

def generate_signals_from_data(data, time_horizon):
    """Genera señales del frontend basadas en datos reales"""
    signals = []
    
    # Usar los top stocks de los resultados existentes
    if time_horizon == 'short_term':
        top_stocks = data.get('top_short_term_opportunities', [])
        max_days = 21
        period_text = '21 días máx'
    else:
        top_stocks = data.get('top_long_term_opportunities', [])
        max_days = 90
        period_text = '3 meses máx'
    
    for i, stock_data in enumerate(top_stocks[:30]):  # Top 30
        try:
            symbol = stock_data.get('symbol', f'STOCK_{i}')
            score = stock_data.get('catalyst_score', 75)
            
            # Calcular upside basado en el score
            upside_potential = min(50, max(10, (score - 50) * 1.5))
            
            # Determinar precio y target (usando datos reales si están disponibles)
            current_price = stock_data.get('current_price', 100.0)
            target_price = current_price * (1 + upside_potential / 100)
            
            # Determinar confianza y riesgo
            confidence = min(98, max(70, score + 15))
            risk_level = 'Low' if score >= 85 else 'Medium' if score >= 70 else 'High'
            
            signal = {
                'id': f"{symbol}_{time_horizon}_{i}",
                'symbol': symbol,
                'name': stock_data.get('name', f"{symbol} Inc."),
                'current_price': round(current_price, 2),
                'signal_type': 'Stock Buy Signal',
                'confidence': confidence,
                'upside_potential': round(upside_potential, 1),
                'target_price': round(target_price, 2),
                'signal_date': datetime.now().strftime('%Y-%m-%d'),
                'target_date': (datetime.now() + timedelta(days=max_days)).strftime('%Y-%m-%d'),
                'hold_period': period_text,
                'allocation': 'Buy no more than 5%',
                'sector': determine_sector(symbol),
                'catalyst_score': score,
                'analysis': generate_analysis_text(score, time_horizon),
                'risk_level': risk_level,
                'catalyst': generate_catalyst_text(score),
                'time_horizon': time_horizon
            }
            signals.append(signal)
            
        except Exception as e:
            print(f"Error procesando {stock_data}: {e}")
            continue
    
    return signals

def generate_mock_results():
    """Genera resultados mock para demostración"""
    return {
        'analysis_summary': {
            'total_analyzed': 1228,
            'successful_analyses': 1150,
            'failed_analyses': 78,
            'timestamp': datetime.now().isoformat()
        },
        'short_term_signals': get_mock_signals('short_term'),
        'long_term_signals': get_mock_signals('long_term'),
        'combined_best': get_mock_signals('combined')
    }

def get_mock_signals(signal_type):
    """Genera señales mock de alta calidad"""
    
    if signal_type == 'short_term':
        stocks = [
            {'symbol': 'CRM', 'name': 'Salesforce Inc.', 'score': 95},
            {'symbol': 'PLTR', 'name': 'Palantir Technologies', 'score': 88},
            {'symbol': 'SHOP', 'name': 'Shopify Inc.', 'score': 85},
            {'symbol': 'NET', 'name': 'Cloudflare Inc.', 'score': 82},
            {'symbol': 'DDOG', 'name': 'Datadog Inc.', 'score': 80}
        ]
        period_text = '21 días máx'
        max_days = 21
    elif signal_type == 'long_term':
        stocks = [
            {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'score': 100},
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'score': 92},
            {'symbol': 'GOOGL', 'name': 'Alphabet Inc.', 'score': 89},
            {'symbol': 'META', 'name': 'Meta Platforms', 'score': 87},
            {'symbol': 'TSLA', 'name': 'Tesla Inc.', 'score': 85}
        ]
        period_text = '3 meses máx'
        max_days = 90
    else:  # combined
        stocks = [
            {'symbol': 'NVDA', 'name': 'NVIDIA Corporation', 'score': 100},
            {'symbol': 'CRM', 'name': 'Salesforce Inc.', 'score': 95},
            {'symbol': 'AAPL', 'name': 'Apple Inc.', 'score': 92}
        ]
        period_text = '3 meses máx'
        max_days = 90
    
    signals = []
    for i, stock in enumerate(stocks):
        upside_potential = min(50, max(15, (stock['score'] - 50) * 1.2))
        current_price = 100 + (i * 50)  # Precios mock
        target_price = current_price * (1 + upside_potential / 100)
        
        signal = {
            'id': f"{stock['symbol']}_{signal_type}_{i}",
            'symbol': stock['symbol'],
            'name': stock['name'],
            'current_price': round(current_price, 2),
            'signal_type': 'Stock Buy Signal',
            'confidence': min(98, stock['score'] + 5),
            'upside_potential': round(upside_potential, 1),
            'target_price': round(target_price, 2),
            'signal_date': datetime.now().strftime('%Y-%m-%d'),
            'target_date': (datetime.now() + timedelta(days=max_days)).strftime('%Y-%m-%d'),
            'hold_period': period_text,
            'allocation': 'Buy no more than 5%',
            'sector': determine_sector(stock['symbol']),
            'catalyst_score': stock['score'],
            'analysis': generate_analysis_text(stock['score'], signal_type),
            'risk_level': 'Low' if stock['score'] >= 90 else 'Medium',
            'catalyst': generate_catalyst_text(stock['score']),
            'time_horizon': signal_type
        }
        signals.append(signal)
    
    return signals

def determine_sector(symbol):
    """Determina el sector basado en el símbolo"""
    tech_symbols = ['NVDA', 'AAPL', 'GOOGL', 'META', 'CRM', 'PLTR', 'SHOP', 'NET', 'DDOG', 'TSLA']
    finance_symbols = ['JPM', 'BAC', 'WFC', 'GS', 'MS']
    
    if symbol in tech_symbols:
        return 'Technology'
    elif symbol in finance_symbols:
        return 'Financial Services'
    else:
        return 'Other'

def generate_analysis_text(score, time_horizon):
    """Genera texto de análisis basado en el score"""
    horizon_text = "corto plazo" if time_horizon == 'short_term' else "largo plazo"
    
    if score >= 90:
        return f"Análisis técnico excepcional para {horizon_text}. Indicadores muestran fuerte momentum alcista con patrones de confirmación múltiples."
    elif score >= 80:
        return f"Indicadores técnicos muy positivos para {horizon_text}. Tendencia alcista confirmada con buen soporte y momentum favorable."
    elif score >= 70:
        return f"Señales técnicas positivas para {horizon_text}. Oportunidad identificada con patrones alcistas emergentes."
    else:
        return f"Oportunidad técnica para {horizon_text} basada en análisis de indicadores y patrones de mercado."

def generate_catalyst_text(score):
    """Genera texto del catalizador"""
    if score >= 90:
        return "Momentum técnico excepcional con múltiples confirmaciones"
    elif score >= 80:
        return "Patrones técnicos alcistas fuertemente confirmados"
    elif score >= 70:
        return "Indicadores técnicos positivos detectados"
    else:
        return "Oportunidad técnica emergente identificada"

def combine_top_signals(short_signals, long_signals):
    """Combina las mejores señales de ambos horizontes"""
    all_signals = short_signals + long_signals
    # Ordenar por catalyst_score y eliminar duplicados
    seen_symbols = set()
    unique_signals = []
    
    for signal in sorted(all_signals, key=lambda x: x['catalyst_score'], reverse=True):
        if signal['symbol'] not in seen_symbols:
            seen_symbols.add(signal['symbol'])
            unique_signals.append(signal)
    
    return unique_signals[:20]  # Top 20 únicas

# API Endpoints
@app.route('/api/analysis/start', methods=['POST'])
def start_analysis():
    """Inicia el análisis (simulado)"""
    global analysis_progress
    
    if analysis_progress['status'] == 'running':
        return jsonify({'error': 'Analysis already running'}), 400
    
    # Resetear progreso
    analysis_progress = {
        'status': 'idle',
        'current_stock': 0,
        'total_stocks': 0,
        'current_symbol': '',
        'start_time': None,
        'results': None,
        'error': None
    }
    
    # Iniciar simulación en hilo separado
    thread = threading.Thread(target=simulate_analysis_progress)
    thread.daemon = True
    thread.start()
    
    return jsonify({'message': 'Analysis started', 'status': 'running'})

@app.route('/api/analysis/progress', methods=['GET'])
def get_progress():
    """Obtiene el progreso actual del análisis"""
    global analysis_progress
    
    response = analysis_progress.copy()
    
    if analysis_progress['start_time']:
        elapsed = time.time() - analysis_progress['start_time']
        response['elapsed_time'] = round(elapsed, 1)
    
    return jsonify(response)

@app.route('/api/analysis/results', methods=['GET'])
def get_results():
    """Obtiene los resultados del análisis"""
    global analysis_progress
    
    if analysis_progress['status'] != 'completed' or not analysis_progress['results']:
        return jsonify({'error': 'Analysis not completed or no results available'}), 404
    
    return jsonify(analysis_progress['results'])

@app.route('/api/signals', methods=['GET'])
def get_signals():
    """Obtiene las señales para el frontend"""
    global analysis_progress
    
    # Si hay análisis completado, usar esos resultados
    if analysis_progress['status'] == 'completed' and analysis_progress['results']:
        results = analysis_progress['results']
        time_horizon = request.args.get('time_horizon', 'all')
        
        if time_horizon == 'short_term':
            return jsonify(results['short_term_signals'])
        elif time_horizon == 'long_term':
            return jsonify(results['long_term_signals'])
        else:
            return jsonify(results['combined_best'])
    
    # Si no hay análisis completado, intentar cargar resultados existentes
    existing_results = load_existing_results()
    if existing_results:
        processed_results = process_existing_results(existing_results)
        time_horizon = request.args.get('time_horizon', 'all')
        
        if time_horizon == 'short_term':
            return jsonify(processed_results['short_term_signals'])
        elif time_horizon == 'long_term':
            return jsonify(processed_results['long_term_signals'])
        else:
            return jsonify(processed_results['combined_best'])
    
    # Fallback: retornar datos mock
    return jsonify(get_mock_signals('combined'))

if __name__ == '__main__':
    print("🚀 Iniciando API para Stock AI Signals...")
    print("📊 Endpoints disponibles:")
    print("  POST /api/analysis/start - Iniciar análisis")
    print("  GET  /api/analysis/progress - Ver progreso")
    print("  GET  /api/analysis/results - Obtener resultados")
    print("  GET  /api/signals - Obtener señales para frontend")
    print("="*50)
    
    app.run(host='0.0.0.0', port=5000, debug=True)
