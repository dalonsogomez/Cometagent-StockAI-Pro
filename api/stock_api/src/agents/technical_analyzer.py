"""
Sistema de Análisis Técnico para Recomendación de Acciones
Implementa indicadores técnicos fundamentales y detección de patrones
"""

import pandas as pd
import numpy as np
import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient
from typing import Dict, List, Tuple, Optional
import warnings
warnings.filterwarnings('ignore')

class TechnicalAnalyzer:
    """
    Clase principal para análisis técnico de acciones
    """
    
    def __init__(self):
        self.client = ApiClient()
        
    def get_stock_data(self, symbol: str, interval: str = "1d", range_period: str = "1y") -> pd.DataFrame:
        """
        Obtiene datos históricos de una acción
        
        Args:
            symbol: Símbolo de la acción (ej: AAPL)
            interval: Intervalo de tiempo (1m, 5m, 15m, 30m, 1h, 1d, 1wk, 1mo)
            range_period: Período de datos (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)
            
        Returns:
            DataFrame con datos OHLCV
        """
        try:
            response = self.client.call_api('YahooFinance/get_stock_chart', query={
                'symbol': symbol,
                'interval': interval,
                'range': range_period,
                'includeAdjustedClose': True
            })
            
            if not response or 'chart' not in response:
                raise ValueError(f"No se pudieron obtener datos para {symbol}")
                
            result = response['chart']['result'][0]
            timestamps = result['timestamp']
            indicators = result['indicators']
            
            # Extraer datos OHLCV
            quote = indicators['quote'][0]
            adjclose = indicators.get('adjclose', [{}])[0].get('adjclose', quote['close'])
            
            # Crear DataFrame
            df = pd.DataFrame({
                'timestamp': timestamps,
                'open': quote['open'],
                'high': quote['high'],
                'low': quote['low'],
                'close': quote['close'],
                'volume': quote['volume'],
                'adj_close': adjclose
            })
            
            # Convertir timestamp a datetime
            df['datetime'] = pd.to_datetime(df['timestamp'], unit='s')
            df.set_index('datetime', inplace=True)
            df.drop('timestamp', axis=1, inplace=True)
            
            # Limpiar datos nulos
            df = df.dropna()
            
            return df
            
        except Exception as e:
            print(f"Error obteniendo datos para {symbol}: {str(e)}")
            return pd.DataFrame()
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> pd.Series:
        """
        Calcula el Relative Strength Index (RSI)
        
        Args:
            prices: Serie de precios (generalmente close)
            period: Período para el cálculo (default: 14)
            
        Returns:
            Serie con valores RSI
        """
        delta = prices.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        
        return rsi
    
    def calculate_macd(self, prices: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9) -> Dict[str, pd.Series]:
        """
        Calcula MACD (Moving Average Convergence Divergence)
        
        Args:
            prices: Serie de precios
            fast: Período EMA rápida (default: 12)
            slow: Período EMA lenta (default: 26)
            signal: Período línea de señal (default: 9)
            
        Returns:
            Diccionario con MACD, señal e histograma
        """
        ema_fast = prices.ewm(span=fast).mean()
        ema_slow = prices.ewm(span=slow).mean()
        
        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal).mean()
        histogram = macd_line - signal_line
        
        return {
            'macd': macd_line,
            'signal': signal_line,
            'histogram': histogram
        }
    
    def calculate_bollinger_bands(self, prices: pd.Series, period: int = 20, std_dev: float = 2) -> Dict[str, pd.Series]:
        """
        Calcula Bollinger Bands
        
        Args:
            prices: Serie de precios
            period: Período para media móvil (default: 20)
            std_dev: Número de desviaciones estándar (default: 2)
            
        Returns:
            Diccionario con banda superior, media y banda inferior
        """
        sma = prices.rolling(window=period).mean()
        std = prices.rolling(window=period).std()
        
        upper_band = sma + (std * std_dev)
        lower_band = sma - (std * std_dev)
        
        return {
            'upper': upper_band,
            'middle': sma,
            'lower': lower_band
        }
    
    def calculate_moving_averages(self, prices: pd.Series, periods: List[int] = [5, 10, 20, 50, 200]) -> Dict[str, pd.Series]:
        """
        Calcula múltiples medias móviles simples
        
        Args:
            prices: Serie de precios
            periods: Lista de períodos para las medias móviles
            
        Returns:
            Diccionario con las medias móviles
        """
        mas = {}
        for period in periods:
            mas[f'sma_{period}'] = prices.rolling(window=period).mean()
        
        return mas
    
    def calculate_stochastic(self, high: pd.Series, low: pd.Series, close: pd.Series, 
                           k_period: int = 14, d_period: int = 3) -> Dict[str, pd.Series]:
        """
        Calcula el oscilador estocástico
        
        Args:
            high: Serie de precios máximos
            low: Serie de precios mínimos
            close: Serie de precios de cierre
            k_period: Período para %K (default: 14)
            d_period: Período para %D (default: 3)
            
        Returns:
            Diccionario con %K y %D
        """
        lowest_low = low.rolling(window=k_period).min()
        highest_high = high.rolling(window=k_period).max()
        
        k_percent = 100 * ((close - lowest_low) / (highest_high - lowest_low))
        d_percent = k_percent.rolling(window=d_period).mean()
        
        return {
            'k_percent': k_percent,
            'd_percent': d_percent
        }
    
    def calculate_atr(self, high: pd.Series, low: pd.Series, close: pd.Series, period: int = 14) -> pd.Series:
        """
        Calcula Average True Range (ATR)
        
        Args:
            high: Serie de precios máximos
            low: Serie de precios mínimos
            close: Serie de precios de cierre
            period: Período para el cálculo (default: 14)
            
        Returns:
            Serie con valores ATR
        """
        prev_close = close.shift(1)
        
        tr1 = high - low
        tr2 = abs(high - prev_close)
        tr3 = abs(low - prev_close)
        
        true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        atr = true_range.rolling(window=period).mean()
        
        return atr
    
    def detect_candlestick_patterns(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """
        Detecta patrones básicos de velas japonesas
        
        Args:
            df: DataFrame con datos OHLCV
            
        Returns:
            Diccionario con patrones detectados
        """
        patterns = {}
        
        # Doji
        body_size = abs(df['close'] - df['open'])
        total_range = df['high'] - df['low']
        doji_threshold = total_range * 0.1
        patterns['doji'] = body_size <= doji_threshold
        
        # Hammer
        lower_shadow = df[['open', 'close']].min(axis=1) - df['low']
        upper_shadow = df['high'] - df[['open', 'close']].max(axis=1)
        patterns['hammer'] = (lower_shadow >= 2 * body_size) & (upper_shadow <= body_size * 0.1)
        
        # Shooting Star
        patterns['shooting_star'] = (upper_shadow >= 2 * body_size) & (lower_shadow <= body_size * 0.1)
        
        # Engulfing Bullish
        prev_open = df['open'].shift(1)
        prev_close = df['close'].shift(1)
        patterns['bullish_engulfing'] = (
            (prev_close < prev_open) &  # Vela anterior bajista
            (df['close'] > df['open']) &  # Vela actual alcista
            (df['open'] < prev_close) &  # Abre por debajo del cierre anterior
            (df['close'] > prev_open)   # Cierra por encima de la apertura anterior
        )
        
        # Engulfing Bearish
        patterns['bearish_engulfing'] = (
            (prev_close > prev_open) &  # Vela anterior alcista
            (df['close'] < df['open']) &  # Vela actual bajista
            (df['open'] > prev_close) &  # Abre por encima del cierre anterior
            (df['close'] < prev_open)   # Cierra por debajo de la apertura anterior
        )
        
        return patterns
    
    def generate_signals(self, df: pd.DataFrame) -> Dict[str, pd.Series]:
        """
        Genera señales de trading basadas en indicadores técnicos
        
        Args:
            df: DataFrame con datos OHLCV e indicadores
            
        Returns:
            Diccionario con señales de compra/venta
        """
        signals = {}
        
        # Señales RSI
        signals['rsi_oversold'] = df['rsi'] < 30  # Sobreventa
        signals['rsi_overbought'] = df['rsi'] > 70  # Sobrecompra
        
        # Señales MACD
        signals['macd_bullish'] = (df['macd'] > df['macd_signal']) & (df['macd'].shift(1) <= df['macd_signal'].shift(1))
        signals['macd_bearish'] = (df['macd'] < df['macd_signal']) & (df['macd'].shift(1) >= df['macd_signal'].shift(1))
        
        # Señales Bollinger Bands
        signals['bb_oversold'] = df['close'] < df['bb_lower']
        signals['bb_overbought'] = df['close'] > df['bb_upper']
        
        # Señales de medias móviles
        signals['golden_cross'] = (df['sma_50'] > df['sma_200']) & (df['sma_50'].shift(1) <= df['sma_200'].shift(1))
        signals['death_cross'] = (df['sma_50'] < df['sma_200']) & (df['sma_50'].shift(1) >= df['sma_200'].shift(1))
        
        return signals
    
    def analyze_stock(self, symbol: str, interval: str = "1d", range_period: str = "1y") -> Dict:
        """
        Realiza análisis técnico completo de una acción
        
        Args:
            symbol: Símbolo de la acción
            interval: Intervalo de tiempo
            range_period: Período de datos
            
        Returns:
            Diccionario con análisis completo
        """
        print(f"Analizando {symbol}...")
        
        # Obtener datos
        df = self.get_stock_data(symbol, interval, range_period)
        if df.empty:
            return {"error": f"No se pudieron obtener datos para {symbol}"}
        
        # Calcular indicadores técnicos
        df['rsi'] = self.calculate_rsi(df['close'])
        
        macd_data = self.calculate_macd(df['close'])
        df['macd'] = macd_data['macd']
        df['macd_signal'] = macd_data['signal']
        df['macd_histogram'] = macd_data['histogram']
        
        bb_data = self.calculate_bollinger_bands(df['close'])
        df['bb_upper'] = bb_data['upper']
        df['bb_middle'] = bb_data['middle']
        df['bb_lower'] = bb_data['lower']
        
        ma_data = self.calculate_moving_averages(df['close'])
        for key, value in ma_data.items():
            df[key] = value
        
        stoch_data = self.calculate_stochastic(df['high'], df['low'], df['close'])
        df['stoch_k'] = stoch_data['k_percent']
        df['stoch_d'] = stoch_data['d_percent']
        
        df['atr'] = self.calculate_atr(df['high'], df['low'], df['close'])
        
        # Detectar patrones de velas
        patterns = self.detect_candlestick_patterns(df)
        for pattern_name, pattern_series in patterns.items():
            df[f'pattern_{pattern_name}'] = pattern_series
        
        # Generar señales
        signals = self.generate_signals(df)
        for signal_name, signal_series in signals.items():
            df[f'signal_{signal_name}'] = signal_series
        
        # Análisis del estado actual
        latest = df.iloc[-1]
        
        analysis = {
            "symbol": symbol,
            "last_price": latest['close'],
            "last_update": df.index[-1].strftime('%Y-%m-%d %H:%M:%S'),
            "technical_indicators": {
                "rsi": latest['rsi'],
                "macd": latest['macd'],
                "macd_signal": latest['macd_signal'],
                "bb_position": self._get_bb_position(latest['close'], latest['bb_upper'], latest['bb_lower']),
                "stoch_k": latest['stoch_k'],
                "stoch_d": latest['stoch_d'],
                "atr": latest['atr']
            },
            "moving_averages": {
                "sma_5": latest.get('sma_5'),
                "sma_10": latest.get('sma_10'),
                "sma_20": latest.get('sma_20'),
                "sma_50": latest.get('sma_50'),
                "sma_200": latest.get('sma_200')
            },
            "signals": self._get_active_signals(latest, signals.keys()),
            "patterns": self._get_active_patterns(latest, patterns.keys()),
            "trend_analysis": self._analyze_trend(df),
            "support_resistance": self._find_support_resistance(df),
            "recommendation": self._generate_recommendation(latest, df),
            "data": df
        }
        
        return analysis
    
    def _get_bb_position(self, price: float, upper: float, lower: float) -> str:
        """Determina la posición del precio respecto a las Bollinger Bands"""
        if price > upper:
            return "above_upper"
        elif price < lower:
            return "below_lower"
        else:
            return "within_bands"
    
    def _get_active_signals(self, latest_row: pd.Series, signal_names: List[str]) -> List[str]:
        """Obtiene las señales activas en la última vela"""
        active_signals = []
        for signal_name in signal_names:
            if latest_row.get(f'signal_{signal_name}', False):
                active_signals.append(signal_name)
        return active_signals
    
    def _get_active_patterns(self, latest_row: pd.Series, pattern_names: List[str]) -> List[str]:
        """Obtiene los patrones activos en la última vela"""
        active_patterns = []
        for pattern_name in pattern_names:
            if latest_row.get(f'pattern_{pattern_name}', False):
                active_patterns.append(pattern_name)
        return active_patterns
    
    def _analyze_trend(self, df: pd.DataFrame) -> Dict[str, str]:
        """Analiza la tendencia general de la acción"""
        latest = df.iloc[-1]
        
        # Tendencia basada en medias móviles
        short_term = "neutral"
        medium_term = "neutral"
        long_term = "neutral"
        
        if 'sma_5' in latest and 'sma_20' in latest:
            if latest['close'] > latest['sma_5'] > latest['sma_20']:
                short_term = "bullish"
            elif latest['close'] < latest['sma_5'] < latest['sma_20']:
                short_term = "bearish"
        
        if 'sma_20' in latest and 'sma_50' in latest:
            if latest['sma_20'] > latest['sma_50']:
                medium_term = "bullish"
            elif latest['sma_20'] < latest['sma_50']:
                medium_term = "bearish"
        
        if 'sma_50' in latest and 'sma_200' in latest:
            if latest['sma_50'] > latest['sma_200']:
                long_term = "bullish"
            elif latest['sma_50'] < latest['sma_200']:
                long_term = "bearish"
        
        return {
            "short_term": short_term,
            "medium_term": medium_term,
            "long_term": long_term
        }
    
    def _find_support_resistance(self, df: pd.DataFrame, window: int = 20) -> Dict[str, float]:
        """Encuentra niveles de soporte y resistencia"""
        recent_data = df.tail(window * 2)
        
        # Soporte: mínimo reciente
        support = recent_data['low'].min()
        
        # Resistencia: máximo reciente
        resistance = recent_data['high'].max()
        
        return {
            "support": support,
            "resistance": resistance
        }
    
    def _generate_recommendation(self, latest_row: pd.Series, df: pd.DataFrame) -> Dict[str, str]:
        """Genera recomendación basada en el análisis técnico"""
        bullish_signals = 0
        bearish_signals = 0
        
        # Evaluar RSI
        if latest_row.get('rsi', 50) < 30:
            bullish_signals += 1
        elif latest_row.get('rsi', 50) > 70:
            bearish_signals += 1
        
        # Evaluar MACD
        if latest_row.get('macd', 0) > latest_row.get('macd_signal', 0):
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        # Evaluar tendencia
        if latest_row.get('sma_20', 0) > latest_row.get('sma_50', 0):
            bullish_signals += 1
        else:
            bearish_signals += 1
        
        # Determinar recomendación
        if bullish_signals > bearish_signals:
            action = "BUY"
            confidence = min(90, 50 + (bullish_signals - bearish_signals) * 10)
        elif bearish_signals > bullish_signals:
            action = "SELL"
            confidence = min(90, 50 + (bearish_signals - bullish_signals) * 10)
        else:
            action = "HOLD"
            confidence = 50
        
        return {
            "action": action,
            "confidence": f"{confidence}%",
            "reasoning": f"Señales alcistas: {bullish_signals}, Señales bajistas: {bearish_signals}"
        }

# Función de prueba
def test_analyzer():
    """Función para probar el analizador técnico"""
    analyzer = TechnicalAnalyzer()
    
    # Probar con algunas acciones populares
    symbols = ["AAPL", "TSLA", "MSFT"]
    
    for symbol in symbols:
        try:
            analysis = analyzer.analyze_stock(symbol, interval="1d", range_period="6mo")
            
            if "error" in analysis:
                print(f"Error analizando {symbol}: {analysis['error']}")
                continue
            
            print(f"\n=== Análisis de {symbol} ===")
            print(f"Precio actual: ${analysis['last_price']:.2f}")
            print(f"RSI: {analysis['technical_indicators']['rsi']:.2f}")
            print(f"MACD: {analysis['technical_indicators']['macd']:.4f}")
            print(f"Tendencia: {analysis['trend_analysis']}")
            print(f"Recomendación: {analysis['recommendation']['action']} ({analysis['recommendation']['confidence']})")
            print(f"Señales activas: {analysis['signals']}")
            print(f"Patrones detectados: {analysis['patterns']}")
            
        except Exception as e:
            print(f"Error procesando {symbol}: {str(e)}")

if __name__ == "__main__":
    test_analyzer()


    def analyze(self, symbol: str) -> Dict:
        """
        Método principal de análisis para compatibilidad con el analizador masivo
        
        Args:
            symbol: Símbolo de la acción a analizar
            
        Returns:
            Diccionario con resultados del análisis técnico
        """
        try:
            # Usar el método analyze_stock existente
            full_analysis = self.analyze_stock(symbol)
            
            if "error" in full_analysis:
                return full_analysis
            
            # Extraer información clave para el analizador masivo
            latest_indicators = full_analysis.get("technical_indicators", {})
            
            # Determinar señal MACD
            macd_signal = "neutral"
            if latest_indicators.get("macd", 0) > latest_indicators.get("macd_signal", 0):
                macd_signal = "bullish"
            elif latest_indicators.get("macd", 0) < latest_indicators.get("macd_signal", 0):
                macd_signal = "bearish"
            
            # Formato simplificado para el analizador masivo
            simplified_analysis = {
                "symbol": symbol,
                "rsi": latest_indicators.get("rsi"),
                "macd": {
                    "value": latest_indicators.get("macd"),
                    "signal": macd_signal
                },
                "price": full_analysis.get("last_price"),
                "trend": full_analysis.get("trend_analysis", {}),
                "signals": full_analysis.get("signals", []),
                "patterns": full_analysis.get("patterns", []),
                "recommendation": full_analysis.get("recommendation", {})
            }
            
            return simplified_analysis
            
        except Exception as e:
            return {"error": f"Error en análisis de {symbol}: {str(e)}"}

# Función de prueba
def main():
    """Función de prueba del analizador técnico"""
    analyzer = TechnicalAnalyzer()
    
    # Probar con algunas acciones populares
    test_symbols = ['AAPL', 'NVDA', 'TSLA', 'GOOGL', 'MSFT']
    
    for symbol in test_symbols:
        print(f"\n{'='*50}")
        print(f"ANÁLISIS TÉCNICO DE {symbol}")
        print('='*50)
        
        analysis = analyzer.analyze_stock(symbol)
        
        if "error" in analysis:
            print(f"❌ Error: {analysis['error']}")
            continue
        
        # Mostrar información clave
        indicators = analysis['technical_indicators']
        print(f"💰 Precio actual: ${analysis['last_price']:.2f}")
        print(f"📊 RSI: {indicators['rsi']:.2f}")
        print(f"📈 MACD: {indicators['macd']:.4f}")
        print(f"🎯 Posición BB: {indicators['bb_position']}")
        
        # Mostrar señales activas
        if analysis['signals']:
            print(f"🚨 Señales activas: {', '.join(analysis['signals'])}")
        
        # Mostrar patrones detectados
        if analysis['patterns']:
            print(f"🔍 Patrones detectados: {', '.join(analysis['patterns'])}")
        
        # Mostrar recomendación
        rec = analysis['recommendation']
        print(f"💡 Recomendación: {rec['action']} (Confianza: {rec['confidence']})")
        print(f"📝 Razón: {rec['reason']}")

if __name__ == "__main__":
    main()

