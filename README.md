# 🚀 StockAI Pro - Análisis Masivo de Acciones

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Python](https://img.shields.io/badge/python-3.8+-blue.svg)
![React](https://img.shields.io/badge/react-18+-blue.svg)

## 📋 Descripción

StockAI Pro es una plataforma avanzada de análisis técnico de acciones que utiliza inteligencia artificial para analizar más de 1200+ símbolos de acciones y generar recomendaciones de trading para diferentes horizontes temporales.

### ✨ Características Principales

- 🔍 **Análisis Masivo**: Procesamiento de 1200+ símbolos de acciones
- ⏰ **Horizontes Temporales**: Análisis para corto plazo (21 días) y largo plazo (3 meses)
- 📊 **Dashboard Interactivo**: Visualización en tiempo real de señales y métricas
- 🤖 **IA Avanzada**: Algoritmos de análisis técnico y detección de patrones
- 📈 **Recomendaciones**: Sistema de señales BUY/SELL/HOLD con niveles de confianza
- 🎯 **Top Oportunidades**: Identificación automática de las mejores oportunidades

## 🗂️ Estructura del Proyecto

```
StockAI-Pro/
├── 📁 analysis/           # Módulos de análisis técnico
│   ├── time_horizon_analyzer.py
│   ├── batch_analyzer.py
│   ├── massive_stock_analyzer.py
│   └── ...
├── 📁 api/                # Backend y APIs
│   ├── stock_api/         # API principal
│   ├── backend/           # Módulos del backend
│   └── run_analysis_api.py
├── 📁 data/               # Datos y resultados
│   ├── lightyear_stocks_complete_numbered.csv
│   ├── time_horizon_analysis_results.json
│   └── results/
├── 📁 docs/               # Documentación
│   ├── GUIA_RAPIDA.md
│   ├── ESPECIFICACIONES_TECNICAS.md
│   └── ...
├── 📁 frontend/           # Aplicación React
│   └── stockai-pro-advanced/
├── 📁 scripts/            # Scripts de utilidad
│   ├── run_time_horizon_analysis.sh
│   └── run_massive_analysis.sh
└── README.md
```

## 🚀 Instalación y Configuración

### Requisitos Previos

- Python 3.8+
- Node.js 16+
- npm o pnpm

### 1. Clonar el Repositorio

```bash
git clone https://github.com/dalonsogomez/Cometagent-StockAI-Pro.git
cd Cometagent-StockAI-Pro
```

### 2. Configurar Backend

```bash
# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Instalar dependencias Python
cd api/stock_api
pip install -r requirements.txt
```

### 3. Configurar Frontend

```bash
# Ir al directorio del frontend
cd frontend/stockai-pro-advanced

# Instalar dependencias
npm install --legacy-peer-deps
# o usando pnpm
pnpm install
```

## 🎯 Uso

### Ejecutar Análisis Masivo

```bash
# Ejecutar análisis completo
./scripts/run_time_horizon_analysis.sh

# O manualmente
cd analysis
python time_horizon_analyzer.py
```

### Iniciar Frontend

```bash
cd frontend/stockai-pro-advanced
npm run dev
# o
pnpm dev
```

Acceder a: `http://localhost:5173`

### Iniciar API (Opcional)

```bash
cd api/stock_api/src
python main.py
```

## 📊 Funcionalidades

### 🔍 Análisis Técnico

- **RSI (Relative Strength Index)**: Identificación de sobrecompra/sobreventa
- **MACD**: Análisis de momentum y tendencias
- **Bandas de Bollinger**: Detección de volatilidad
- **Medias Móviles**: Análisis de tendencias a corto y largo plazo
- **Volumen**: Confirmación de movimientos de precio

### 🎯 Horizontes Temporales

#### Corto Plazo (≤ 21 días)
- Análisis técnico intensivo
- Señales de momentum
- Oportunidades de swing trading

#### Largo Plazo (≤ 3 meses)
- Análisis fundamental combinado
- Tendencias estructurales
- Oportunidades de inversión

### 📈 Dashboard Features

- **Análisis en Tiempo Real**: Progreso visual del análisis masivo
- **Top Oportunidades**: Las mejores señales por horizonte
- **Métricas Clave**: Estadísticas de recomendaciones
- **Filtros Avanzados**: Por recomendación, sector, riesgo
- **Exportación**: Resultados en JSON/CSV

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🔗 Enlaces

- [Documentación Completa](./docs/DOCUMENTACION_COMPLETA.md)
- [Guía Rápida](./docs/GUIA_RAPIDA.md)
- [Especificaciones Técnicas](./docs/ESPECIFICACIONES_TECNICAS.md)

## 👨‍💻 Autor

**Daniel Alonso Gómez**
- GitHub: [@dalonsogomez](https://github.com/dalonsogomez)

---

⭐ **¡No olvides dar una estrella al proyecto si te ha sido útil!**
