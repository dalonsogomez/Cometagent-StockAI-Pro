// Componente Alerts completo
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Edit, 
  TrendingUp, 
  TrendingDown, 
  Volume2, 
  Zap,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  Filter,
  Search
} from 'lucide-react';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all'); // all, active, triggered, expired
  const [searchTerm, setSearchTerm] = useState('');
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    type: 'price_above', // price_above, price_below, volume_spike, ai_signal
    value: '',
    message: '',
    enabled: true
  });

  // Datos de ejemplo de alertas
  const sampleAlerts = [
    {
      id: 1,
      symbol: 'AAPL',
      company: 'Apple Inc.',
      type: 'price_above',
      value: 200,
      current_value: 195.50,
      message: 'Apple alcanza $200',
      status: 'active',
      created_date: '2024-06-10',
      triggered_date: null,
      enabled: true
    },
    {
      id: 2,
      symbol: 'NVDA',
      company: 'NVIDIA Corporation',
      type: 'ai_signal',
      value: 'STRONG_BUY',
      current_value: 'BUY',
      message: 'NVIDIA recibe señal STRONG_BUY',
      status: 'triggered',
      created_date: '2024-06-08',
      triggered_date: '2024-06-12',
      enabled: true
    },
    {
      id: 3,
      symbol: 'TSLA',
      company: 'Tesla Inc.',
      type: 'price_below',
      value: 180,
      current_value: 185.30,
      message: 'Tesla baja de $180',
      status: 'active',
      created_date: '2024-06-09',
      triggered_date: null,
      enabled: true
    },
    {
      id: 4,
      symbol: 'MSFT',
      company: 'Microsoft Corporation',
      type: 'volume_spike',
      value: 150, // % increase
      current_value: 45,
      message: 'Volumen de Microsoft aumenta 150%',
      status: 'active',
      created_date: '2024-06-11',
      triggered_date: null,
      enabled: true
    },
    {
      id: 5,
      symbol: 'GOOGL',
      company: 'Alphabet Inc.',
      type: 'price_above',
      value: 150,
      current_value: 152.30,
      message: 'Google supera $150',
      status: 'triggered',
      created_date: '2024-06-05',
      triggered_date: '2024-06-11',
      enabled: false
    }
  ];

  useEffect(() => {
    setAlerts(sampleAlerts);
  }, []);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'price_above': return <TrendingUp className="h-4 w-4" />;
      case 'price_below': return <TrendingDown className="h-4 w-4" />;
      case 'volume_spike': return <Volume2 className="h-4 w-4" />;
      case 'ai_signal': return <Zap className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'price_above': return 'Precio Arriba';
      case 'price_below': return 'Precio Abajo';
      case 'volume_spike': return 'Pico de Volumen';
      case 'ai_signal': return 'Señal de IA';
      default: return type;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-400 bg-blue-400/10';
      case 'triggered': return 'text-green-400 bg-green-400/10';
      case 'expired': return 'text-gray-400 bg-gray-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.status === filter;
    const matchesSearch = alert.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.company.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;
  const triggeredAlertsCount = alerts.filter(a => a.status === 'triggered').length;

  const handleCreateAlert = () => {
    const alert = {
      id: Date.now(),
      ...newAlert,
      company: `${newAlert.symbol} Company`,
      current_value: 0,
      status: 'active',
      created_date: new Date().toISOString().split('T')[0],
      triggered_date: null
    };
    
    setAlerts([...alerts, alert]);
    setNewAlert({
      symbol: '',
      type: 'price_above',
      value: '',
      message: '',
      enabled: true
    });
    setShowCreateModal(false);
  };

  const toggleAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Bell className="h-8 w-8 text-yellow-400" />
            Sistema de Alertas
          </h1>
          <p className="text-muted-foreground mt-2">
            Configura alertas personalizadas para seguimiento automático
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Nueva Alerta
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Alertas</p>
              <p className="text-2xl font-bold text-foreground">{alerts.length}</p>
            </div>
            <Bell className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activas</p>
              <p className="text-2xl font-bold text-blue-400">{activeAlertsCount}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Activadas</p>
              <p className="text-2xl font-bold text-green-400">{triggeredAlertsCount}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Precisión</p>
              <p className="text-2xl font-bold text-yellow-400">87%</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            {[
              { key: 'all', label: 'Todas' },
              { key: 'active', label: 'Activas' },
              { key: 'triggered', label: 'Activadas' },
              { key: 'expired', label: 'Expiradas' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filter === key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar alertas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 bg-muted border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${getStatusColor(alert.status)}`}>
                  {getAlertIcon(alert.type)}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{alert.symbol}</h3>
                    <span className="text-sm text-muted-foreground">{alert.company}</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(alert.status)}`}>
                      {alert.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Tipo: {getAlertTypeLabel(alert.type)}</span>
                    <span>Valor: {alert.value}{alert.type.includes('price') ? '$' : alert.type === 'volume_spike' ? '%' : ''}</span>
                    <span>Creada: {alert.created_date}</span>
                    {alert.triggered_date && <span>Activada: {alert.triggered_date}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleAlert(alert.id)}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${
                    alert.enabled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {alert.enabled ? 'Activa' : 'Inactiva'}
                </button>
                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de crear alerta */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-foreground mb-4">Nueva Alerta</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Símbolo</label>
                <input
                  type="text"
                  value={newAlert.symbol}
                  onChange={(e) => setNewAlert({...newAlert, symbol: e.target.value.toUpperCase()})}
                  placeholder="AAPL"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tipo de Alerta</label>
                <select
                  value={newAlert.type}
                  onChange={(e) => setNewAlert({...newAlert, type: e.target.value})}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                >
                  <option value="price_above">Precio Arriba</option>
                  <option value="price_below">Precio Abajo</option>
                  <option value="volume_spike">Pico de Volumen</option>
                  <option value="ai_signal">Señal de IA</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Valor</label>
                <input
                  type="number"
                  value={newAlert.value}
                  onChange={(e) => setNewAlert({...newAlert, value: e.target.value})}
                  placeholder={newAlert.type.includes('price') ? '200' : '150'}
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mensaje</label>
                <input
                  type="text"
                  value={newAlert.message}
                  onChange={(e) => setNewAlert({...newAlert, message: e.target.value})}
                  placeholder="Descripción de la alerta"
                  className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateAlert}
                className="flex-1 bg-primary text-primary-foreground py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                Crear Alerta
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-muted text-foreground py-2 rounded-md hover:bg-muted/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

