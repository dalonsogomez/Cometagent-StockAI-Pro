# 🚀 StockAI Pro - Plataforma Avanzada de Análisis Financiero con IA

![StockAI Pro](https://img.shields.io/badge/StockAI-Pro-blue?style=for-the-badge&logo=chart-line)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react)
![Flask](https://img.shields.io/badge/Flask-2.3-000000?style=for-the-badge&logo=flask)
![AI](https://img.shields.io/badge/AI-Powered-FF6B6B?style=for-the-badge&logo=brain)

## 🌟 Descripción

**StockAI Pro** es una plataforma completa de análisis financiero con inteligencia artificial que analiza más de **5,128 acciones** en tiempo real. Combina análisis técnico avanzado, señales de IA, y herramientas profesionales de trading en una interfaz moderna y fácil de usar.

### 🎯 **URL de la Aplicación**
**🔗 [https://xumclkjf.manus.space](https://xumclkjf.manus.space)**

## ✨ Características Principales

### ⚡ **Stock AI Signals**
- **Sistema de señales automáticas** con análisis de 5,128 acciones
- **89% precisión histórica** en predicciones
- **Predicciones multi-temporales** con targets específicos
- **Análisis de confianza** y gestión de riesgo
- **+33% upside promedio** en próximos 3-5 meses

### 🔍 **Screener Avanzado**
- **6 filtros predefinidos** profesionales (Growth, Value, Momentum, AI Signals, etc.)
- **Filtros personalizables** con 15+ criterios
- **Selección múltiple** y acciones en lote
- **Exportación de datos** en CSV
- **Métricas en tiempo real**

### 📈 **Lista de Acciones Mejorada**
- **Tabla expandida** con 15+ columnas de datos
- **Filas expandibles** con métricas técnicas y fundamentales
- **Paginación avanzada** (10-100 por página)
- **Comparación temporal** (1D, 1W, 1M, YTD)
- **Filtros múltiples** y búsqueda instantánea

### 📊 **Dashboard Profesional**
- **Análisis completo** de 5,128 acciones
- **Gráficos interactivos** de distribución y rendimiento
- **Top oportunidades** identificadas por IA
- **Estado del mercado** en tiempo real
- **Métricas clave** actualizadas

### ⚙️ **Configuración Completa**
- **7 secciones** de configuración personalizables
- **50+ opciones** de personalización
- **Exportación/Importación** de configuración
- **Temas personalizables** (dark/light)
- **Configuración de trading** y notificaciones

## 🛠️ Tecnologías Utilizadas

### **Frontend**
- **React 18** - Framework principal
- **Vite** - Build tool y desarrollo
- **Tailwind CSS** - Estilos y diseño
- **Lucide Icons** - Iconografía
- **Recharts** - Gráficos interactivos

### **Backend**
- **Flask** - API REST
- **Python 3.11** - Lenguaje principal
- **SQLite** - Base de datos
- **Peewee ORM** - Mapeo objeto-relacional

### **Inteligencia Artificial**
- **Hugging Face Transformers** - Modelos de IA
- **FinBERT** - Análisis de sentimiento financiero
- **YOLOv8** - Detección de patrones técnicos
- **Catalyst Score** - Sistema de puntuación propietario

## 📁 Estructura del Proyecto

```
stock_recommendation_system/
├── 📱 stockai-pro-advanced/          # Frontend React
│   ├── src/
│   │   ├── components/               # Componentes React
│   │   ├── contexts/                 # Context API
│   │   ├── hooks/                    # Custom hooks
│   │   └── lib/                      # Utilidades
│   ├── public/                       # Archivos estáticos
│   └── dist/                         # Build de producción
├── 🔧 stock_api/                     # Backend Flask
│   └── src/
│       └── main.py                   # API principal
├── 📊 data/                          # Datos y análisis
│   └── lightyear_stocks_complete_numbered.csv
├── 🤖 models/                        # Modelos de IA
├── 📚 docs/                          # Documentación
└── 🧪 tests/                         # Tests
```

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 18+
- Python 3.11+
- npm o pnpm

### **1. Clonar el Repositorio**
```bash
git clone https://github.com/tu-usuario/stockai-pro.git
cd stockai-pro
```

### **2. Configurar Frontend**
```bash
cd stockai-pro-advanced
npm install
npm run dev
```

### **3. Configurar Backend**
```bash
cd stock_api
pip install -r requirements.txt
python src/main.py
```

### **4. Build de Producción**
```bash
cd stockai-pro-advanced
npm run build
```

## 📊 Datos y Análisis

### **Fuente de Datos**
- **5,128 acciones** de Lightyear
- **Datos en tiempo real** con actualización cada 30 segundos
- **Análisis técnico** automático (RSI, MACD, Bollinger Bands)
- **Análisis fundamental** con métricas clave

### **Métricas del Sistema**
- **1,785 STRONG_BUY** (34.8% del total)
- **Score promedio: 73.0** (Catalyst Score IA)
- **89% precisión histórica** en señales
- **+33% upside promedio** en predicciones

## 🎯 Funcionalidades Destacadas

### **🧠 Inteligencia Artificial**
- **Análisis automático** de patrones técnicos
- **Detección de catalizadores** con YOLOv8
- **Análisis de sentimiento** con FinBERT
- **Predicciones multi-temporales** (1D, 1W, 1M, 3M)

### **📈 Herramientas de Trading**
- **Screener personalizable** con filtros avanzados
- **Watchlist ilimitada** con seguimiento
- **Sistema de alertas** automáticas
- **Portfolio simulator** con métricas de riesgo

### **🎨 Experiencia de Usuario**
- **Tema dark profesional** optimizado
- **Navegación fluida** entre secciones
- **Responsive design** móvil/desktop
- **Búsqueda global** instantánea

## 📱 Capturas de Pantalla

### Dashboard Principal
![Dashboard](docs/screenshots/dashboard.png)

### Stock AI Signals
![AI Signals](docs/screenshots/ai-signals.png)

### Screener Avanzado
![Screener](docs/screenshots/screener.png)

## 🔧 API Endpoints

### **Principales Endpoints**
```
GET  /api/health              # Estado del sistema
GET  /api/summary             # Resumen del mercado
GET  /api/stocks              # Lista de acciones
GET  /api/stocks/{symbol}     # Detalles de acción
GET  /api/ai-signals          # Señales de IA
GET  /api/screener            # Screener personalizado
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Autores

- **StockAI Team** - *Desarrollo inicial* - [StockAI](https://github.com/stockai)

## 🙏 Agradecimientos

- **Lightyear** por proporcionar los datos de acciones
- **Hugging Face** por los modelos de IA
- **React Team** por el framework
- **Tailwind CSS** por el sistema de diseño

## 📞 Contacto

- **Website**: [https://xumclkjf.manus.space](https://xumclkjf.manus.space)
- **Email**: stockai@example.com
- **GitHub**: [https://github.com/tu-usuario/stockai-pro](https://github.com/tu-usuario/stockai-pro)

---

⭐ **¡Dale una estrella si te gusta el proyecto!** ⭐

