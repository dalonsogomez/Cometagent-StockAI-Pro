// Hook para WebSocket y actualizaciones en tiempo real
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

export function useWebSocket(url = 'http://localhost:5000') {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    const newSocket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('WebSocket connected');
      setConnected(true);
      reconnectAttempts.current = 0;
    });

    newSocket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      setConnected(false);
      
      // Intentar reconectar
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectAttempts.current++;
        setTimeout(() => {
          newSocket.connect();
        }, 1000 * reconnectAttempts.current);
      }
    });

    // Escuchar actualizaciones de precios
    newSocket.on('price_update', (data) => {
      setLastMessage({ type: 'price_update', data });
    });

    // Escuchar actualizaciones de watchlist
    newSocket.on('watchlist_updated', (data) => {
      setLastMessage({ type: 'watchlist_updated', data });
    });

    // Escuchar alertas disparadas
    newSocket.on('alert_triggered', (data) => {
      setLastMessage({ type: 'alert_triggered', data });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [url]);

  const subscribeToStock = (symbol) => {
    if (socket && connected) {
      socket.emit('subscribe_stock', { symbol });
    }
  };

  const unsubscribeFromStock = (symbol) => {
    if (socket && connected) {
      socket.emit('unsubscribe_stock', { symbol });
    }
  };

  const sendMessage = (event, data) => {
    if (socket && connected) {
      socket.emit(event, data);
    }
  };

  return {
    socket,
    connected,
    lastMessage,
    subscribeToStock,
    unsubscribeFromStock,
    sendMessage
  };
}

