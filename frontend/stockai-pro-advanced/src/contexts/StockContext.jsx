// Contexto para manejo de datos de acciones
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { stockAPI } from '../lib/api';

const StockContext = createContext();

// Estados iniciales
const initialState = {
  stocks: [],
  summary: {},
  watchlist: [],
  alerts: [],
  sectors: [],
  portfolio: { positions: [], summary: {} },
  loading: false,
  error: null,
  filters: {
    search: '',
    recommendation: '',
    sector: '',
    min_score: 0,
    max_score: 100,
    sort_by: 'catalyst_score',
    sort_order: 'desc'
  },
  pagination: {
    page: 1,
    per_page: 50,
    total: 0,
    pages: 0
  }
};

// Reducer para manejo de estado
function stockReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_STOCKS':
      return { 
        ...state, 
        stocks: action.payload.stocks,
        pagination: action.payload.pagination,
        loading: false 
      };
    
    case 'SET_SUMMARY':
      return { ...state, summary: action.payload };
    
    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    
    case 'ADD_TO_WATCHLIST':
      return { 
        ...state, 
        watchlist: [...state.watchlist, action.payload] 
      };
    
    case 'REMOVE_FROM_WATCHLIST':
      return { 
        ...state, 
        watchlist: state.watchlist.filter(item => item.symbol !== action.payload) 
      };
    
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    
    case 'ADD_ALERT':
      return { 
        ...state, 
        alerts: [...state.alerts, action.payload] 
      };
    
    case 'REMOVE_ALERT':
      return { 
        ...state, 
        alerts: state.alerts.filter(alert => alert.id !== action.payload) 
      };
    
    case 'SET_SECTORS':
      return { ...state, sectors: action.payload };
    
    case 'SET_PORTFOLIO':
      return { ...state, portfolio: action.payload };
    
    case 'UPDATE_FILTERS':
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 } // Reset page when filters change
      };
    
    case 'UPDATE_PAGINATION':
      return { 
        ...state, 
        pagination: { ...state.pagination, ...action.payload } 
      };
    
    case 'UPDATE_STOCK_PRICE':
      return {
        ...state,
        stocks: state.stocks.map(stock => 
          stock.symbol === action.payload.symbol 
            ? { ...stock, ...action.payload }
            : stock
        ),
        watchlist: state.watchlist.map(stock => 
          stock.symbol === action.payload.symbol 
            ? { ...stock, ...action.payload }
            : stock
        )
      };
    
    default:
      return state;
  }
}

// Provider component
export function StockProvider({ children }) {
  const [state, dispatch] = useReducer(stockReducer, initialState);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  // Cargar datos cuando cambien los filtros o paginación
  useEffect(() => {
    loadStocks();
  }, [state.filters, state.pagination.page]);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Cargar resumen del mercado
      const summary = await stockAPI.getSummary();
      dispatch({ type: 'SET_SUMMARY', payload: summary });
      
      // Cargar sectores
      const sectors = await stockAPI.getSectors();
      dispatch({ type: 'SET_SECTORS', payload: sectors });
      
      // Cargar watchlist
      const watchlist = await stockAPI.getWatchlist();
      dispatch({ type: 'SET_WATCHLIST', payload: watchlist });
      
      // Cargar alertas
      const alerts = await stockAPI.getAlerts();
      dispatch({ type: 'SET_ALERTS', payload: alerts });
      
      // Cargar portfolio
      const portfolio = await stockAPI.getPortfolio();
      dispatch({ type: 'SET_PORTFOLIO', payload: portfolio });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const loadStocks = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const params = {
        ...state.filters,
        page: state.pagination.page,
        per_page: state.pagination.per_page
      };
      
      const data = await stockAPI.getStocks(params);
      dispatch({ type: 'SET_STOCKS', payload: data });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const refreshData = async () => {
    await loadInitialData();
    await loadStocks();
  };

  // Actions
  const actions = {
    // Filtros y búsqueda
    updateFilters: (filters) => {
      dispatch({ type: 'UPDATE_FILTERS', payload: filters });
    },
    
    updatePagination: (pagination) => {
      dispatch({ type: 'UPDATE_PAGINATION', payload: pagination });
    },
    
    // Watchlist
    addToWatchlist: async (symbol) => {
      try {
        await stockAPI.addToWatchlist(symbol);
        const watchlist = await stockAPI.getWatchlist();
        dispatch({ type: 'SET_WATCHLIST', payload: watchlist });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    removeFromWatchlist: async (symbol) => {
      try {
        await stockAPI.removeFromWatchlist(symbol);
        dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: symbol });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    // Alertas
    createAlert: async (alertData) => {
      try {
        const alert = await stockAPI.createAlert(alertData);
        dispatch({ type: 'ADD_ALERT', payload: alert });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    deleteAlert: async (alertId) => {
      try {
        await stockAPI.deleteAlert(alertId);
        dispatch({ type: 'REMOVE_ALERT', payload: alertId });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    // Portfolio
    addToPortfolio: async (symbol, shares, price) => {
      try {
        await stockAPI.addToPortfolio(symbol, shares, price);
        const portfolio = await stockAPI.getPortfolio();
        dispatch({ type: 'SET_PORTFOLIO', payload: portfolio });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    removeFromPortfolio: async (symbol) => {
      try {
        await stockAPI.removeFromPortfolio(symbol);
        const portfolio = await stockAPI.getPortfolio();
        dispatch({ type: 'SET_PORTFOLIO', payload: portfolio });
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: error.message });
      }
    },
    
    // Actualización en tiempo real
    updateStockPrice: (priceUpdate) => {
      dispatch({ type: 'UPDATE_STOCK_PRICE', payload: priceUpdate });
    },
    
    // Utilidades
    refreshData,
    clearError: () => dispatch({ type: 'SET_ERROR', payload: null })
  };

  const value = {
    ...state,
    ...actions
  };

  return (
    <StockContext.Provider value={value}>
      {children}
    </StockContext.Provider>
  );
}

// Hook para usar el contexto
export function useStock() {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
}

