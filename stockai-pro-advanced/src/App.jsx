import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Componentes principales
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import StockList from './components/StockList';
import StockDetail from './components/StockDetail';
import Watchlist from './components/Watchlist';
import Alerts from './components/Alerts';
import Sectors from './components/Sectors';
import Portfolio from './components/Portfolio';
import Screener from './components/Screener';
import Settings from './components/Settings';
import StockAISignals from './components/StockAISignals';

// Hooks y servicios
import { useStockData } from './hooks/useStockData';
import { useWebSocket } from './hooks/useWebSocket';
import { useLocalStorage } from './hooks/useLocalStorage';

// Contexto global
import { StockProvider } from './contexts/StockContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser] = useLocalStorage('stockai_user', 'default');
  
  return (
    <ThemeProvider>
      <UserProvider>
        <StockProvider>
          <Router>
            <div className="min-h-screen bg-background text-foreground">
              <div className="flex h-screen overflow-hidden">
                {/* Sidebar */}
                <Sidebar 
                  isOpen={sidebarOpen} 
                  onToggle={() => setSidebarOpen(!sidebarOpen)} 
                />
                
                {/* Main Content */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Header */}
                  <Header 
                    onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                    sidebarOpen={sidebarOpen}
                  />
                  
                  {/* Content Area */}
                  <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-background to-muted/20">
                    <div className="container mx-auto px-6 py-8">
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/stocks" element={<StockList />} />
                        <Route path="/stocks/:symbol" element={<StockDetail />} />
                        <Route path="/watchlist" element={<Watchlist />} />
                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/ai-signals" element={<StockAISignals />} />
                        <Route path="/sectors" element={<Sectors />} />
                        <Route path="/portfolio" element={<Portfolio />} />
                        <Route path="/screener" element={<Screener />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </div>
                  </main>
                </div>
              </div>
            </div>
          </Router>
        </StockProvider>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;

