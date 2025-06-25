#!/bin/bash

# Setup script para StockAI Pro
# Este script configura el entorno completo del proyecto

set -e

echo "🚀 Configurando StockAI Pro..."

# Crear entorno virtual de Python
echo "📦 Creando entorno virtual de Python..."
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias del backend
echo "🐍 Instalando dependencias de Python..."
cd api/stock_api
pip install -r requirements.txt
cd ../..

# Instalar dependencias del frontend
echo "⚛️ Instalando dependencias de React..."
cd frontend/stockai-pro-advanced
npm install --legacy-peer-deps
cd ../..

# Copiar archivo de resultados a frontend
echo "📋 Copiando datos de análisis..."
cp data/time_horizon_analysis_results.json frontend/stockai-pro-advanced/public/

# Hacer ejecutables los scripts
echo "🔧 Configurando permisos de scripts..."
chmod +x scripts/*.sh

echo "✅ ¡Configuración completada!"
echo ""
echo "Para iniciar el proyecto:"
echo "1. Frontend: cd frontend/stockai-pro-advanced && npm run dev"
echo "2. Backend: cd api/stock_api/src && python main.py"
echo "3. Análisis: ./scripts/run_time_horizon_analysis.sh"
