// Componente Header con búsqueda y controles
import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  RefreshCw, 
  Moon, 
  Sun,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { useStock } from '../contexts/StockContext';
import { useTheme } from '../contexts/ThemeContext';
import { stockAPI } from '../lib/api';

export default function Header({ onSidebarToggle, sidebarOpen }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { summary, refreshData } = useStock();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = async (query) => {
    setSearchQuery(query);
    
    if (query.length > 1) {
      try {
        const results = await stockAPI.searchStocks(query, 8);
        setSearchResults(results);
        setShowSearchResults(true);
      } catch (error) {
        console.error('Error searching stocks:', error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getMarketStatus = () => {
    const strongBuy = summary.recommendations?.STRONG_BUY || 0;
    const buy = summary.recommendations?.BUY || 0;
    const total = summary.total_stocks || 5128;
    const bullishPercent = ((strongBuy + buy) / total) * 100;
    
    if (bullishPercent > 60) return { status: 'Alcista', color: 'text-green-400', icon: TrendingUp };
    if (bullishPercent < 40) return { status: 'Bajista', color: 'text-red-400', icon: TrendingDown };
    return { status: 'Neutral', color: 'text-yellow-400', icon: Activity };
  };

  const marketStatus = getMarketStatus();
  const MarketIcon = marketStatus.icon;

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onSidebarToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="relative">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar acciones..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Search Results */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchResults.map((stock) => (
                  <div
                    key={stock.symbol}
                    className="flex items-center justify-between p-3 hover:bg-accent cursor-pointer border-b border-border last:border-b-0"
                    onClick={() => {
                      window.location.href = `/stocks/${stock.symbol}`;
                    }}
                  >
                    <div>
                      <div className="font-medium">{stock.symbol}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {stock.name}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${stock.price}</div>
                      <div className={`text-sm px-2 py-1 rounded text-xs ${
                        stock.recommendation === 'STRONG_BUY' ? 'bg-green-500/20 text-green-400' :
                        stock.recommendation === 'BUY' ? 'bg-blue-500/20 text-blue-400' :
                        stock.recommendation === 'HOLD' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {stock.recommendation}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center - Market Status */}
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <MarketIcon className={`w-5 h-5 ${marketStatus.color}`} />
            <span className="text-sm font-medium">Mercado {marketStatus.status}</span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>STRONG_BUY: {summary.recommendations?.STRONG_BUY || 0}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span>BUY: {summary.recommendations?.BUY || 0}</span>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-3">
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
            title="Cambiar tema"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Notifications */}
          <button className="p-2 rounded-lg hover:bg-accent transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-accent transition-colors">
            <Settings className="w-4 h-4" />
          </button>

          {/* User avatar */}
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-primary-foreground">U</span>
          </div>
        </div>
      </div>
    </header>
  );
}

