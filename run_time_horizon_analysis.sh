#!/bin/bash

# Script para ejecutar análisis masivo por horizontes temporales
# Ejecuta el análisis en lotes para manejar mejor la carga

echo "🚀 ANÁLISIS MASIVO DE ACCIONES POR HORIZONTES TEMPORALES"
echo "=================================================="
echo "📊 Total de acciones en el CSV: 1228"
echo "📅 Corto Plazo: Máximo 21 días"
echo "📈 Largo Plazo: Máximo 3 meses (90 días)"
echo ""

# Verificar que el archivo CSV existe
CSV_FILE="/workspaces/Cometagent-StockAI-Pro/lightyear_stocks_complete_numbered.csv"
if [ ! -f "$CSV_FILE" ]; then
    echo "❌ Error: No se encuentra el archivo CSV en $CSV_FILE"
    exit 1
fi

echo "✅ Archivo CSV encontrado"
echo "🔄 Iniciando análisis completo..."
echo ""

# Cambiar al directorio del proyecto
cd /workspaces/Cometagent-StockAI-Pro || exit 1

# Ejecutar el analizador de horizontes temporales
python time_horizon_analyzer.py

echo ""
echo "✅ Análisis masivo completado!"
echo "📁 Resultados guardados en: time_horizon_analysis_results.json"
