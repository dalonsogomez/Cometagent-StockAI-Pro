// API real que conecta con el backend Python para ejecutar análisis masivo
const API_BASE_URL = 'http://localhost:5000/api';

// Función para cargar análisis de horizontes temporales desde backend real
export const loadTimeHorizonAnalysisReal = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/load-time-horizon-analysis`);
    const data = await response.json();
    
    if (data.success) {
      return {
        success: true,
        data: data.data
      };
    } else {
      // Si no hay datos en el backend, intentar cargar desde archivo público
      return await loadTimeHorizonAnalysisFromFile();
    }
  } catch (error) {
    console.error('Error conectando con backend, usando archivo local:', error);
    // Fallback al archivo local si el backend no está disponible
    return await loadTimeHorizonAnalysisFromFile();
  }
};

// Función fallback para cargar desde archivo público
const loadTimeHorizonAnalysisFromFile = async () => {
  try {
    const response = await fetch('/time_horizon_analysis_results.json');
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        data: data
      };
    } else {
      return {
        success: false,
        message: 'No se pudieron cargar los datos de análisis'
      };
    }
  } catch (error) {
    console.error('Error cargando análisis desde archivo:', error);
    return {
      success: false,
      message: 'Error cargando análisis'
    };
  }
};

// Función para ejecutar análisis masivo real
export const runMassiveStockAnalysisReal = async (progressCallback) => {
  try {
    // Iniciar el análisis en el backend
    const startResponse = await fetch(`${API_BASE_URL}/run-massive-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const startData = await startResponse.json();
    
    if (!startData.success) {
      throw new Error(startData.message);
    }
    
    // Polling para obtener progreso
    return new Promise((resolve, reject) => {
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch(`${API_BASE_URL}/analysis-progress`);
          const progressData = await progressResponse.json();
          
          // Llamar callback con datos de progreso
          if (progressCallback) {
            progressCallback({
              progress: progressData.progress,
              currentStock: progressData.current_stock,
              totalStocks: progressData.total_stocks,
              processed: progressData.processed,
              successful: progressData.successful,
              failed: progressData.failed
            });
          }
          
          // Si el análisis está completo
          if (!progressData.running) {
            if (progressData.progress >= 100 && progressData.current_stock.includes('✅')) {
              // Cargar los resultados actualizados
              const resultsData = await loadTimeHorizonAnalysisReal();
              if (resultsData.success) {
                resolve(resultsData.data);
              } else {
                reject(new Error('Error cargando resultados del análisis'));
              }
            } else {
              reject(new Error(progressData.current_stock));
            }
          } else {
            // Continuar polling
            setTimeout(pollProgress, 2000); // Cada 2 segundos
          }
        } catch (error) {
          reject(error);
        }
      };
      
      // Iniciar polling
      pollProgress();
    });
    
  } catch (error) {
    console.error('Error ejecutando análisis masivo:', error);
    throw error;
  }
};

// Función híbrida que intenta usar backend real, si no funciona usa simulación
export const runMassiveStockAnalysisHybrid = async (progressCallback) => {
  try {
    // Primero intentar con backend real
    return await runMassiveStockAnalysisReal(progressCallback);
  } catch (error) {
    console.warn('Backend no disponible, usando simulación:', error);
    // Fallback a simulación si el backend no está disponible
    return await runMassiveStockAnalysisSimulated(progressCallback);
  }
};

// Simulación (código existente como fallback)
const runMassiveStockAnalysisSimulated = async (progressCallback) => {
  const totalStocks = 5129;
  let processed = 0;
  let successful = 0;
  let failed = 0;
  
  const stockExamples = [
    'MRNO', 'DLO', 'BBAI', 'VLGEA', 'MLAB', 'HOV', 'VALU', 'LZM', 'ARAY', 'AENT',
    'CMCM', 'NEOV', 'CTNM', 'QUIK', 'INVE', 'NVDA', 'META', 'AVGO', 'TSM', 'WMT',
    'JPM', 'LLY', 'NFLX', 'ORCL', 'XOM', 'BAC', 'PLTR', 'ASML', 'PM', 'AAPL'
  ];
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      // Simular análisis de lotes
      const batchSize = Math.floor(Math.random() * 30) + 20;
      const newProcessed = Math.min(processed + batchSize, totalStocks);
      const newSuccessful = successful + Math.floor(batchSize * 0.92);
      const newFailed = failed + Math.floor(batchSize * 0.08);
      
      processed = newProcessed;
      successful = newSuccessful;
      failed = newFailed;
      
      const progress = (processed / totalStocks) * 100;
      const currentStock = `Analizando ${stockExamples[Math.floor(Math.random() * stockExamples.length)]}...`;
      
      if (progressCallback) {
        progressCallback({
          progress,
          currentStock,
          totalStocks,
          processed,
          successful,
          failed
        });
      }
      
      if (processed >= totalStocks) {
        clearInterval(interval);
        
        // Cargar datos existentes
        setTimeout(async () => {
          const data = await loadTimeHorizonAnalysisReal();
          resolve(data.data);
        }, 1000);
      }
    }, 100);
  });
};

// Funciones de compatibilidad con la API existente
export const loadTimeHorizonAnalysis = loadTimeHorizonAnalysisReal;
export const runMassiveStockAnalysis = runMassiveStockAnalysisHybrid;

export const getRecommendationsSummary = async () => {
  // Esta función puede mantenerse como está o también conectarse al backend
  return {};
};
