// Hook para manejo de datos de acciones
import { useState, useEffect, useCallback } from 'react';
import { stockAPI } from '../lib/api';

export function useStockData() {
  const [data, setData] = useState({
    stocks: [],
    summary: {},
    loading: false,
    error: null
  });

  const [filters, setFilters] = useState({
    search: '',
    recommendation: '',
    sector: '',
    min_score: 0,
    max_score: 100,
    sort_by: 'catalyst_score',
    sort_order: 'desc'
  });

  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 50,
    total: 0,
    pages: 0
  });

  const loadStocks = useCallback(async () => {
    try {
      setData(prev => ({ ...prev, loading: true, error: null }));
      
      const params = {
        ...filters,
        page: pagination.page,
        per_page: pagination.per_page
      };
      
      const response = await stockAPI.getStocks(params);
      
      setData(prev => ({
        ...prev,
        stocks: response.stocks || [],
        loading: false
      }));
      
      // Asegurar que pagination existe antes de usarlo
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          ...response.pagination
        }));
      } else {
        // Fallback si no hay pagination en la respuesta
        setPagination(prev => ({
          ...prev,
          total: response.total || response.stocks?.length || 0,
          pages: Math.ceil((response.total || response.stocks?.length || 0) / prev.per_page)
        }));
      }
      
    } catch (error) {
      setData(prev => ({
        ...prev,
        error: error.message,
        loading: false
      }));
    }
  }, [filters, pagination.page, pagination.per_page]);

  const loadSummary = useCallback(async () => {
    try {
      const summary = await stockAPI.getSummary();
      setData(prev => ({ ...prev, summary }));
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }, []);

  useEffect(() => {
    loadStocks();
  }, [loadStocks]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const refresh = useCallback(() => {
    loadStocks();
    loadSummary();
  }, [loadStocks, loadSummary]);

  return {
    ...data,
    filters,
    pagination,
    updateFilters,
    updatePagination,
    refresh
  };
}

