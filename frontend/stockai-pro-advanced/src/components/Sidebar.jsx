// Componente Sidebar con navegación
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TrendingUp, 
  Heart, 
  Bell, 
  PieChart, 
  Briefcase, 
  Search, 
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Activity,
  Zap
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Acciones', href: '/stocks', icon: TrendingUp },
  { name: 'Watchlist', href: '/watchlist', icon: Heart },
  { name: 'Alertas', href: '/alerts', icon: Bell },
  { name: 'AI Signals', href: '/ai-signals', icon: Zap, highlight: true },
  { name: 'Sectores', href: '/sectors', icon: PieChart },
  { name: 'Portfolio', href: '/portfolio', icon: Briefcase },
  { name: 'Screener', href: '/screener', icon: Search },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  return (
    <div className={cn(
      "bg-card border-r border-border transition-all duration-300 ease-in-out flex flex-col",
      isOpen ? "w-64" : "w-16"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {isOpen && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">StockAI Pro</h1>
              <p className="text-xs text-muted-foreground">5,128 acciones</p>
            </div>
          </div>
        )}
        
        <button
          onClick={onToggle}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-lg" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent",
                !isOpen && "justify-center",
                item.highlight && !isActive && "bg-yellow-400/10 border border-yellow-400/20"
              )}
            >
              <Icon className={cn(
                "w-5 h-5", 
                isActive && "text-primary-foreground",
                item.highlight && !isActive && "text-yellow-400"
              )} />
              {isOpen && (
                <span className={cn(
                  "font-medium",
                  item.highlight && !isActive && "text-yellow-400"
                )}>{item.name}</span>
              )}
              {item.highlight && isOpen && !isActive && (
                <div className="absolute right-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      {isOpen && (
        <div className="p-4 border-t border-border">
          <div className="bg-muted/50 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Estado del Mercado</span>
            </div>
            <div className="text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>STRONG_BUY:</span>
                <span className="text-green-400">1,785</span>
              </div>
              <div className="flex justify-between">
                <span>BUY:</span>
                <span className="text-blue-400">1,055</span>
              </div>
              <div className="flex justify-between">
                <span>HOLD:</span>
                <span className="text-yellow-400">1,075</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

