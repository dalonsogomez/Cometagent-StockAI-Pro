// Componente Settings completo con configuración avanzada
import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Palette, 
  Database, 
  Shield, 
  Download, 
  Upload,
  RefreshCw,
  Save,
  X,
  Check,
  AlertTriangle,
  Info,
  Moon,
  Sun,
  Monitor,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Key,
  Mail,
  Smartphone,
  Globe,
  Clock,
  DollarSign,
  Percent,
  BarChart3,
  TrendingUp,
  Zap,
  Target,
  Filter,
  Search,
  Heart,
  Star,
  Calendar,
  FileText,
  HelpCircle,
  ExternalLink,
  Trash2,
  RotateCcw,
  CheckCircle
} from 'lucide-react';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // Configuración General
    general: {
      language: 'es',
      timezone: 'America/Mexico_City',
      currency: 'USD',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'US',
      autoRefresh: true,
      refreshInterval: 30,
      compactMode: false,
      showTooltips: true
    },
    
    // Configuración de Tema
    theme: {
      mode: 'dark',
      primaryColor: 'blue',
      accentColor: 'purple',
      fontSize: 'medium',
      fontFamily: 'Inter',
      animations: true,
      reducedMotion: false,
      highContrast: false,
      colorBlindMode: 'none'
    },
    
    // Configuración de Notificaciones
    notifications: {
      enabled: true,
      sound: true,
      desktop: true,
      email: false,
      push: true,
      priceAlerts: true,
      volumeAlerts: true,
      newsAlerts: true,
      aiSignals: true,
      portfolioUpdates: true,
      marketOpen: true,
      marketClose: false,
      weeklyReport: true,
      monthlyReport: false
    },
    
    // Configuración de Dashboard
    dashboard: {
      defaultView: 'overview',
      showMarketStatus: true,
      showTopMovers: true,
      showAISignals: true,
      showSectorPerformance: true,
      showWatchlist: true,
      showPortfolio: true,
      showNews: false,
      showCalendar: false,
      autoLayout: true,
      gridSize: 'medium',
      chartType: 'candlestick',
      timeframe: '1D'
    },
    
    // Configuración de Trading
    trading: {
      defaultOrderType: 'market',
      confirmOrders: true,
      showRiskWarnings: true,
      maxPositionSize: 10,
      stopLossDefault: 5,
      takeProfitDefault: 10,
      paperTrading: true,
      realTimeData: true,
      levelIIData: false,
      optionsTrading: false,
      marginTrading: false,
      cryptoTrading: false
    },
    
    // Configuración de Datos
    data: {
      dataProvider: 'lightyear',
      realTimeQuotes: true,
      extendedHours: true,
      internationalMarkets: false,
      cryptoData: false,
      forexData: false,
      commoditiesData: false,
      economicData: true,
      newsData: true,
      socialSentiment: true,
      cacheData: true,
      dataRetention: 90
    },
    
    // Configuración de Privacidad
    privacy: {
      shareData: false,
      analytics: true,
      crashReports: true,
      performanceData: false,
      locationData: false,
      cookiesEssential: true,
      cookiesAnalytics: false,
      cookiesMarketing: false,
      dataExport: true,
      dataDelete: false,
      twoFactorAuth: false,
      sessionTimeout: 60
    }
  });

  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [importingData, setImportingData] = useState(false);
  const [resetConfirm, setResetConfirm] = useState('');

  const tabs = [
    { id: 'general', name: 'General', icon: SettingsIcon },
    { id: 'theme', name: 'Tema', icon: Palette },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'trading', name: 'Trading', icon: TrendingUp },
    { id: 'data', name: 'Datos', icon: Database },
    { id: 'privacy', name: 'Privacidad', icon: Shield }
  ];

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setUnsavedChanges(true);
  };

  const saveSettings = async () => {
    setSaving(true);
    
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Aquí se guardarían en localStorage o se enviarían al backend
    localStorage.setItem('stockai_settings', JSON.stringify(settings));
    
    setSaving(false);
    setUnsavedChanges(false);
  };

  const exportSettings = async () => {
    setExportingData(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `stockai_settings_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    setExportingData(false);
  };

  const importSettings = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setImportingData(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        setSettings(importedSettings);
        setUnsavedChanges(true);
        alert('Configuración importada exitosamente');
      } catch (error) {
        alert('Error al importar la configuración. Archivo inválido.');
      }
      setImportingData(false);
    };
    reader.readAsText(file);
  };

  const resetSettings = () => {
    if (resetConfirm !== 'RESET') {
      alert('Por favor escribe "RESET" para confirmar');
      return;
    }
    
    // Configuración por defecto
    const defaultSettings = {
      general: {
        language: 'es',
        timezone: 'America/Mexico_City',
        currency: 'USD',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'US',
        autoRefresh: true,
        refreshInterval: 30,
        compactMode: false,
        showTooltips: true
      },
      theme: {
        mode: 'dark',
        primaryColor: 'blue',
        accentColor: 'purple',
        fontSize: 'medium',
        fontFamily: 'Inter',
        animations: true,
        reducedMotion: false,
        highContrast: false,
        colorBlindMode: 'none'
      },
      notifications: {
        enabled: true,
        sound: true,
        desktop: true,
        email: false,
        push: true,
        priceAlerts: true,
        volumeAlerts: true,
        newsAlerts: true,
        aiSignals: true,
        portfolioUpdates: true,
        marketOpen: true,
        marketClose: false,
        weeklyReport: true,
        monthlyReport: false
      },
      dashboard: {
        defaultView: 'overview',
        showMarketStatus: true,
        showTopMovers: true,
        showAISignals: true,
        showSectorPerformance: true,
        showWatchlist: true,
        showPortfolio: true,
        showNews: false,
        showCalendar: false,
        autoLayout: true,
        gridSize: 'medium',
        chartType: 'candlestick',
        timeframe: '1D'
      },
      trading: {
        defaultOrderType: 'market',
        confirmOrders: true,
        showRiskWarnings: true,
        maxPositionSize: 10,
        stopLossDefault: 5,
        takeProfitDefault: 10,
        paperTrading: true,
        realTimeData: true,
        levelIIData: false,
        optionsTrading: false,
        marginTrading: false,
        cryptoTrading: false
      },
      data: {
        dataProvider: 'lightyear',
        realTimeQuotes: true,
        extendedHours: true,
        internationalMarkets: false,
        cryptoData: false,
        forexData: false,
        commoditiesData: false,
        economicData: true,
        newsData: true,
        socialSentiment: true,
        cacheData: true,
        dataRetention: 90
      },
      privacy: {
        shareData: false,
        analytics: true,
        crashReports: true,
        performanceData: false,
        locationData: false,
        cookiesEssential: true,
        cookiesAnalytics: false,
        cookiesMarketing: false,
        dataExport: true,
        dataDelete: false,
        twoFactorAuth: false,
        sessionTimeout: 60
      }
    };
    
    setSettings(defaultSettings);
    setUnsavedChanges(true);
    setResetConfirm('');
    alert('Configuración restablecida a valores por defecto');
  };

  useEffect(() => {
    // Cargar configuración guardada
    const savedSettings = localStorage.getItem('stockai_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración General</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Idioma</label>
            <select
              value={settings.general.language}
              onChange={(e) => updateSetting('general', 'language', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Zona Horaria</label>
            <select
              value={settings.general.timezone}
              onChange={(e) => updateSetting('general', 'timezone', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="America/Mexico_City">México (GMT-6)</option>
              <option value="America/New_York">Nueva York (GMT-5)</option>
              <option value="Europe/London">Londres (GMT+0)</option>
              <option value="Europe/Madrid">Madrid (GMT+1)</option>
              <option value="Asia/Tokyo">Tokio (GMT+9)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Moneda</label>
            <select
              value={settings.general.currency}
              onChange={(e) => updateSetting('general', 'currency', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
              <option value="MXN">MXN - Peso Mexicano</option>
              <option value="GBP">GBP - Libra Esterlina</option>
              <option value="JPY">JPY - Yen Japonés</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Formato de Fecha</label>
            <select
              value={settings.general.dateFormat}
              onChange={(e) => updateSetting('general', 'dateFormat', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Intervalo de Actualización (segundos)</label>
            <select
              value={settings.general.refreshInterval}
              onChange={(e) => updateSetting('general', 'refreshInterval', Number(e.target.value))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value={15}>15 segundos</option>
              <option value={30}>30 segundos</option>
              <option value={60}>1 minuto</option>
              <option value={300}>5 minutos</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Actualización Automática</div>
              <div className="text-sm text-muted-foreground">Actualizar datos automáticamente</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.general.autoRefresh}
                onChange={(e) => updateSetting('general', 'autoRefresh', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Modo Compacto</div>
              <div className="text-sm text-muted-foreground">Interfaz más densa con menos espaciado</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.general.compactMode}
                onChange={(e) => updateSetting('general', 'compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Mostrar Tooltips</div>
              <div className="text-sm text-muted-foreground">Mostrar ayuda contextual al pasar el mouse</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.general.showTooltips}
                onChange={(e) => updateSetting('general', 'showTooltips', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderThemeSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Tema</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Modo de Tema</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'auto', label: 'Auto', icon: Monitor }
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('theme', 'mode', value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                    settings.theme.mode === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Color Primario</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'blue', color: 'bg-blue-500' },
                { value: 'green', color: 'bg-green-500' },
                { value: 'purple', color: 'bg-purple-500' },
                { value: 'red', color: 'bg-red-500' },
                { value: 'orange', color: 'bg-orange-500' },
                { value: 'pink', color: 'bg-pink-500' },
                { value: 'indigo', color: 'bg-indigo-500' },
                { value: 'teal', color: 'bg-teal-500' }
              ].map(({ value, color }) => (
                <button
                  key={value}
                  onClick={() => updateSetting('theme', 'primaryColor', value)}
                  className={`w-10 h-10 rounded-lg ${color} border-2 transition-all ${
                    settings.theme.primaryColor === value
                      ? 'border-white scale-110'
                      : 'border-transparent hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tamaño de Fuente</label>
            <select
              value={settings.theme.fontSize}
              onChange={(e) => updateSetting('theme', 'fontSize', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
              <option value="xlarge">Extra Grande</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Familia de Fuente</label>
            <select
              value={settings.theme.fontFamily}
              onChange={(e) => updateSetting('theme', 'fontFamily', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Poppins">Poppins</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Animaciones</div>
              <div className="text-sm text-muted-foreground">Habilitar transiciones y animaciones</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.theme.animations}
                onChange={(e) => updateSetting('theme', 'animations', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Alto Contraste</div>
              <div className="text-sm text-muted-foreground">Mejorar la legibilidad con mayor contraste</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.theme.highContrast}
                onChange={(e) => updateSetting('theme', 'highContrast', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Movimiento Reducido</div>
              <div className="text-sm text-muted-foreground">Reducir animaciones para sensibilidad al movimiento</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.theme.reducedMotion}
                onChange={(e) => updateSetting('theme', 'reducedMotion', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Notificaciones</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Notificaciones Habilitadas</div>
              <div className="text-sm text-muted-foreground">Habilitar todas las notificaciones</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifications.enabled}
                onChange={(e) => updateSetting('notifications', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Tipos de Notificación</h4>
            <div className="space-y-3">
              {[
                { key: 'sound', label: 'Sonido', desc: 'Reproducir sonido con las notificaciones' },
                { key: 'desktop', label: 'Escritorio', desc: 'Mostrar notificaciones del navegador' },
                { key: 'email', label: 'Email', desc: 'Enviar notificaciones por correo electrónico' },
                { key: 'push', label: 'Push', desc: 'Notificaciones push en dispositivos móviles' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[key]}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      disabled={!settings.notifications.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Alertas Específicas</h4>
            <div className="space-y-3">
              {[
                { key: 'priceAlerts', label: 'Alertas de Precio', desc: 'Cuando el precio alcance niveles específicos' },
                { key: 'volumeAlerts', label: 'Alertas de Volumen', desc: 'Cuando el volumen supere umbrales' },
                { key: 'newsAlerts', label: 'Alertas de Noticias', desc: 'Noticias importantes de acciones seguidas' },
                { key: 'aiSignals', label: 'Señales de IA', desc: 'Nuevas señales del sistema de IA' },
                { key: 'portfolioUpdates', label: 'Actualizaciones de Portfolio', desc: 'Cambios significativos en el portfolio' },
                { key: 'marketOpen', label: 'Apertura de Mercado', desc: 'Cuando abra el mercado' },
                { key: 'marketClose', label: 'Cierre de Mercado', desc: 'Cuando cierre el mercado' },
                { key: 'weeklyReport', label: 'Reporte Semanal', desc: 'Resumen semanal de rendimiento' },
                { key: 'monthlyReport', label: 'Reporte Mensual', desc: 'Resumen mensual de rendimiento' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.notifications[key]}
                      onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                      disabled={!settings.notifications.enabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboardSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración del Dashboard</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Vista por Defecto</label>
            <select
              value={settings.dashboard.defaultView}
              onChange={(e) => updateSetting('dashboard', 'defaultView', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="overview">Resumen General</option>
              <option value="stocks">Lista de Acciones</option>
              <option value="portfolio">Portfolio</option>
              <option value="watchlist">Watchlist</option>
              <option value="ai-signals">AI Signals</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tamaño de Grid</label>
            <select
              value={settings.dashboard.gridSize}
              onChange={(e) => updateSetting('dashboard', 'gridSize', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="small">Pequeño</option>
              <option value="medium">Mediano</option>
              <option value="large">Grande</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de Gráfico</label>
            <select
              value={settings.dashboard.chartType}
              onChange={(e) => updateSetting('dashboard', 'chartType', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="line">Línea</option>
              <option value="candlestick">Velas</option>
              <option value="area">Área</option>
              <option value="bar">Barras</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Marco Temporal</label>
            <select
              value={settings.dashboard.timeframe}
              onChange={(e) => updateSetting('dashboard', 'timeframe', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="1D">1 Día</option>
              <option value="1W">1 Semana</option>
              <option value="1M">1 Mes</option>
              <option value="3M">3 Meses</option>
              <option value="1Y">1 Año</option>
            </select>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-foreground mb-3">Widgets Visibles</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: 'showMarketStatus', label: 'Estado del Mercado' },
              { key: 'showTopMovers', label: 'Mayores Movimientos' },
              { key: 'showAISignals', label: 'Señales de IA' },
              { key: 'showSectorPerformance', label: 'Rendimiento Sectorial' },
              { key: 'showWatchlist', label: 'Watchlist' },
              { key: 'showPortfolio', label: 'Portfolio' },
              { key: 'showNews', label: 'Noticias' },
              { key: 'showCalendar', label: 'Calendario Económico' }
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="font-medium text-foreground">{label}</div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.dashboard[key]}
                    onChange={(e) => updateSetting('dashboard', key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-foreground">Layout Automático</div>
              <div className="text-sm text-muted-foreground">Organizar widgets automáticamente</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.dashboard.autoLayout}
                onChange={(e) => updateSetting('dashboard', 'autoLayout', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTradingSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Trading</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de Orden por Defecto</label>
            <select
              value={settings.trading.defaultOrderType}
              onChange={(e) => updateSetting('trading', 'defaultOrderType', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="market">Mercado</option>
              <option value="limit">Límite</option>
              <option value="stop">Stop</option>
              <option value="stop-limit">Stop-Límite</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tamaño Máximo de Posición (%)</label>
            <input
              type="number"
              value={settings.trading.maxPositionSize}
              onChange={(e) => updateSetting('trading', 'maxPositionSize', Number(e.target.value))}
              min="1"
              max="100"
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Stop Loss por Defecto (%)</label>
            <input
              type="number"
              value={settings.trading.stopLossDefault}
              onChange={(e) => updateSetting('trading', 'stopLossDefault', Number(e.target.value))}
              min="1"
              max="50"
              step="0.5"
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Take Profit por Defecto (%)</label>
            <input
              type="number"
              value={settings.trading.takeProfitDefault}
              onChange={(e) => updateSetting('trading', 'takeProfitDefault', Number(e.target.value))}
              min="1"
              max="100"
              step="0.5"
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: 'confirmOrders', label: 'Confirmar Órdenes', desc: 'Solicitar confirmación antes de ejecutar órdenes' },
            { key: 'showRiskWarnings', label: 'Mostrar Advertencias de Riesgo', desc: 'Mostrar alertas sobre operaciones de alto riesgo' },
            { key: 'paperTrading', label: 'Paper Trading', desc: 'Modo de práctica sin dinero real' },
            { key: 'realTimeData', label: 'Datos en Tiempo Real', desc: 'Usar datos de mercado en tiempo real' },
            { key: 'levelIIData', label: 'Datos Level II', desc: 'Mostrar libro de órdenes detallado' },
            { key: 'optionsTrading', label: 'Trading de Opciones', desc: 'Habilitar trading de opciones' },
            { key: 'marginTrading', label: 'Trading con Margen', desc: 'Habilitar trading con margen' },
            { key: 'cryptoTrading', label: 'Trading de Crypto', desc: 'Habilitar trading de criptomonedas' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.trading[key]}
                  onChange={(e) => updateSetting('trading', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDataSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Datos</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Proveedor de Datos</label>
            <select
              value={settings.data.dataProvider}
              onChange={(e) => updateSetting('data', 'dataProvider', e.target.value)}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value="lightyear">Lightyear</option>
              <option value="yahoo">Yahoo Finance</option>
              <option value="alpha-vantage">Alpha Vantage</option>
              <option value="iex">IEX Cloud</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Retención de Datos (días)</label>
            <select
              value={settings.data.dataRetention}
              onChange={(e) => updateSetting('data', 'dataRetention', Number(e.target.value))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
              <option value={180}>180 días</option>
              <option value={365}>1 año</option>
              <option value={-1}>Ilimitado</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {[
            { key: 'realTimeQuotes', label: 'Cotizaciones en Tiempo Real', desc: 'Recibir precios actualizados en tiempo real' },
            { key: 'extendedHours', label: 'Horario Extendido', desc: 'Incluir datos de pre-market y after-hours' },
            { key: 'internationalMarkets', label: 'Mercados Internacionales', desc: 'Incluir datos de mercados internacionales' },
            { key: 'cryptoData', label: 'Datos de Criptomonedas', desc: 'Incluir datos de criptomonedas' },
            { key: 'forexData', label: 'Datos de Forex', desc: 'Incluir datos de divisas' },
            { key: 'commoditiesData', label: 'Datos de Commodities', desc: 'Incluir datos de materias primas' },
            { key: 'economicData', label: 'Datos Económicos', desc: 'Incluir indicadores económicos' },
            { key: 'newsData', label: 'Datos de Noticias', desc: 'Incluir feed de noticias financieras' },
            { key: 'socialSentiment', label: 'Sentimiento Social', desc: 'Incluir análisis de sentimiento de redes sociales' },
            { key: 'cacheData', label: 'Cache de Datos', desc: 'Almacenar datos localmente para mejor rendimiento' }
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-foreground">{label}</div>
                <div className="text-sm text-muted-foreground">{desc}</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.data[key]}
                  onChange={(e) => updateSetting('data', key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Configuración de Privacidad</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tiempo de Sesión (minutos)</label>
            <select
              value={settings.privacy.sessionTimeout}
              onChange={(e) => updateSetting('privacy', 'sessionTimeout', Number(e.target.value))}
              className="w-full px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary"
            >
              <option value={15}>15 minutos</option>
              <option value={30}>30 minutos</option>
              <option value={60}>1 hora</option>
              <option value={120}>2 horas</option>
              <option value={-1}>Sin límite</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-3">Compartir Datos</h4>
            <div className="space-y-3">
              {[
                { key: 'shareData', label: 'Compartir Datos de Uso', desc: 'Compartir datos anónimos para mejorar el servicio' },
                { key: 'analytics', label: 'Analytics', desc: 'Permitir recopilación de datos de uso para analytics' },
                { key: 'crashReports', label: 'Reportes de Errores', desc: 'Enviar reportes automáticos de errores' },
                { key: 'performanceData', label: 'Datos de Rendimiento', desc: 'Compartir datos de rendimiento de la aplicación' },
                { key: 'locationData', label: 'Datos de Ubicación', desc: 'Permitir acceso a datos de ubicación' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy[key]}
                      onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Cookies</h4>
            <div className="space-y-3">
              {[
                { key: 'cookiesEssential', label: 'Cookies Esenciales', desc: 'Necesarias para el funcionamiento básico', disabled: true },
                { key: 'cookiesAnalytics', label: 'Cookies de Analytics', desc: 'Para análisis de uso y mejoras' },
                { key: 'cookiesMarketing', label: 'Cookies de Marketing', desc: 'Para personalización de contenido' }
              ].map(({ key, label, desc, disabled }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy[key]}
                      onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                      disabled={disabled}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary peer-disabled:opacity-50"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h4 className="font-medium text-foreground mb-3">Seguridad</h4>
            <div className="space-y-3">
              {[
                { key: 'twoFactorAuth', label: 'Autenticación de Dos Factores', desc: 'Añadir capa extra de seguridad' },
                { key: 'dataExport', label: 'Exportación de Datos', desc: 'Permitir exportar todos los datos personales' },
                { key: 'dataDelete', label: 'Eliminación de Datos', desc: 'Permitir eliminar todos los datos personales' }
              ].map(({ key, label, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-foreground">{label}</div>
                    <div className="text-sm text-muted-foreground">{desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.privacy[key]}
                      onChange={(e) => updateSetting('privacy', key, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralSettings();
      case 'theme': return renderThemeSettings();
      case 'notifications': return renderNotificationSettings();
      case 'dashboard': return renderDashboardSettings();
      case 'trading': return renderTradingSettings();
      case 'data': return renderDataSettings();
      case 'privacy': return renderPrivacySettings();
      default: return renderGeneralSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <SettingsIcon className="h-8 w-8 text-blue-400" />
            Configuración
          </h1>
          <p className="text-muted-foreground mt-2">
            Personaliza StockAI Pro según tus preferencias
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {unsavedChanges && (
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <AlertTriangle className="h-4 w-4" />
              Cambios sin guardar
            </div>
          )}
          
          <button
            onClick={saveSettings}
            disabled={saving || !unsavedChanges}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar de navegación */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-card border border-border rounded-lg p-4">
            <nav className="space-y-2">
              {tabs.map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {name}
                </button>
              ))}
            </nav>

            {/* Acciones rápidas */}
            <div className="mt-6 pt-6 border-t border-border space-y-2">
              <button
                onClick={exportSettings}
                disabled={exportingData}
                className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
              >
                {exportingData ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Exportar Config
              </button>
              
              <label className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer">
                <Upload className="h-4 w-4" />
                Importar Config
                <input
                  type="file"
                  accept=".json"
                  onChange={importSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1">
          <div className="bg-card border border-border rounded-lg p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Zona de peligro */}
      <div className="bg-card border border-red-500/20 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Zona de Peligro
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-foreground mb-2">Restablecer Configuración</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Esto restablecerá toda la configuración a los valores por defecto. Esta acción no se puede deshacer.
            </p>
            
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={resetConfirm}
                onChange={(e) => setResetConfirm(e.target.value)}
                placeholder='Escribe "RESET" para confirmar'
                className="px-3 py-2 bg-muted border border-border rounded-md text-foreground focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
              />
              <button
                onClick={resetSettings}
                disabled={resetConfirm !== 'RESET'}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RotateCcw className="h-4 w-4" />
                Restablecer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

