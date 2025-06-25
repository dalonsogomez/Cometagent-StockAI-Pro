#!/bin/bash

# Script de Análisis Masivo Automatizado
# Ejecuta análisis de todas las acciones del CSV y genera reportes

echo "🚀 INICIANDO ANÁLISIS MASIVO AUTOMATIZADO"
echo "=========================================="

# Directorio del proyecto
PROJECT_DIR="/home/ubuntu/stock_recommendation_system"
cd "$PROJECT_DIR"

# Timestamp para archivos
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "📊 Ejecutando análisis masivo de acciones..."

# Ejecutar análisis masivo
python3 simplified_massive_analyzer.py > "logs/analysis_$TIMESTAMP.log" 2>&1

# Verificar si el análisis fue exitoso
if [ $? -eq 0 ]; then
    echo "✅ Análisis completado exitosamente"
    
    # Copiar resultados con timestamp
    cp massive_analysis_results.json "results/analysis_results_$TIMESTAMP.json"
    
    # Crear resumen rápido
    echo "📋 Generando resumen ejecutivo..."
    python3 -c "
import json
from datetime import datetime

# Cargar resultados
with open('massive_analysis_results.json', 'r') as f:
    data = json.load(f)

# Generar resumen
summary = f'''
🤖 STOCKAI PRO - RESUMEN EJECUTIVO
==================================
Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Acciones Analizadas: {data['total_stocks_analyzed']}
Análisis Exitosos: {data['successful_analyses']}

📊 MERCADO GENERAL:
- Sentimiento: {data['market_summary']['market_mood']}
- Score Promedio: {data['market_summary']['average_catalyst_score']}
- Acciones Alcistas: {data['market_summary']['bullish_percentage']}%
- Acciones Bajistas: {data['market_summary']['bearish_percentage']}%

🚀 TOP 5 OPORTUNIDADES:
'''

for i, stock in enumerate(data['top_opportunities'][:5], 1):
    summary += f'{i}. {stock[\"symbol\"]} - {stock[\"recommendation\"]} (Score: {stock[\"catalyst_score\"]})\n'

summary += f'''
🌐 Acceso Web: https://tkdfdlbz.manus.space
📁 Resultados: {PROJECT_DIR}/massive_analysis_results.json
'''

print(summary)

# Guardar resumen
with open('latest_summary.txt', 'w') as f:
    f.write(summary)
"
    
    echo "💾 Resultados guardados en:"
    echo "   - massive_analysis_results.json"
    echo "   - results/analysis_results_$TIMESTAMP.json"
    echo "   - latest_summary.txt"
    
else
    echo "❌ Error en el análisis masivo"
    exit 1
fi

echo ""
echo "🌐 Aplicación Web: https://tkdfdlbz.manus.space"
echo "📊 Dashboard actualizado con análisis de $(cat massive_analysis_results.json | python3 -c "import sys, json; print(json.load(sys.stdin)['total_stocks_analyzed'])") acciones"
echo ""
echo "✅ Análisis masivo automatizado completado"

