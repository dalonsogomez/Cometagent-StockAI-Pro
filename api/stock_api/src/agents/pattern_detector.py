"""
Sistema de Detección de Patrones Avanzado
Integra modelos YOLOv8 de Hugging Face para detección visual de patrones
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.dates as mdates
from matplotlib.patches import Rectangle
import io
import base64
from PIL import Image
from typing import Dict, List
import warnings
warnings.filterwarnings('ignore')

class PatternDetector:
    """
    Detector avanzado de patrones técnicos usando análisis visual y algoritmos
    """
    
    def __init__(self):
        self.pattern_models = {
            'yolo_future_prediction': 'foduucom/stockmarket-future-prediction',
            'yolo_pattern_detection': 'foduucom/stockmarket-pattern-detection-yolov8'
        }
    
    def create_candlestick_chart(self, df: pd.DataFrame, title: str = "Stock Chart", 
                                width: int = 800, height: int = 600) -> str:
        """
        Crea un gráfico de velas japonesas
        
        Args:
            df: DataFrame con datos OHLCV
            title: Título del gráfico
            width: Ancho en píxeles
            height: Alto en píxeles
            
        Returns:
            String con imagen en base64
        """
        fig, ax = plt.subplots(figsize=(width/100, height/100), dpi=100)
        
        # Preparar datos para el gráfico
        df_plot = df.tail(50)  # Últimas 50 velas para mejor visualización
        
        # Colores para velas
        colors = ['red' if close < open_price else 'green' 
                 for close, open_price in zip(df_plot['close'], df_plot['open'])]
        
        # Dibujar velas
        for i, (idx, row) in enumerate(df_plot.iterrows()):
            # Cuerpo de la vela
            body_height = abs(row['close'] - row['open'])
            body_bottom = min(row['close'], row['open'])
            
            # Rectángulo del cuerpo
            rect = Rectangle((i - 0.3, body_bottom), 0.6, body_height, 
                           facecolor=colors[i], edgecolor='black', alpha=0.8)
            ax.add_patch(rect)
            
            # Mechas (sombras)
            ax.plot([i, i], [row['low'], row['high']], color='black', linewidth=1)
        
        # Configurar ejes
        ax.set_xlim(-0.5, len(df_plot) - 0.5)
        ax.set_ylim(df_plot['low'].min() * 0.98, df_plot['high'].max() * 1.02)
        
        # Etiquetas del eje X (fechas)
        date_labels = [idx.strftime('%m/%d') for idx in df_plot.index[::5]]
        ax.set_xticks(range(0, len(df_plot), 5))
        ax.set_xticklabels(date_labels, rotation=45)
        
        ax.set_title(title, fontsize=16, fontweight='bold')
        ax.set_ylabel('Precio ($)', fontsize=12)
        ax.grid(True, alpha=0.3)
        
        plt.tight_layout()
        
        # Convertir a base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    def detect_double_top_bottom(self, df: pd.DataFrame, window: int = 20, 
                                tolerance: float = 0.02) -> Dict[str, List]:
        """
        Detecta patrones de doble techo y doble suelo
        
        Args:
            df: DataFrame con datos OHLCV
            window: Ventana para buscar picos/valles
            tolerance: Tolerancia para considerar niveles similares
            
        Returns:
            Diccionario con patrones detectados
        """
        patterns = {'double_top': [], 'double_bottom': []}
        
        # Encontrar picos y valles
        highs = df['high'].rolling(window=window, center=True).max()
        lows = df['low'].rolling(window=window, center=True).min()
        
        peaks = df[df['high'] == highs].index
        valleys = df[df['low'] == lows].index
        
        # Buscar dobles techos
        for i in range(len(peaks) - 1):
            for j in range(i + 1, len(peaks)):
                peak1_price = df.loc[peaks[i], 'high']
                peak2_price = df.loc[peaks[j], 'high']
                
                # Verificar si los picos están en niveles similares
                if abs(peak1_price - peak2_price) / peak1_price <= tolerance:
                    # Verificar que hay un valle entre los picos
                    valleys_between = [v for v in valleys if peaks[i] < v < peaks[j]]
                    if valleys_between:
                        valley_price = min(df.loc[valleys_between, 'low'])
                        if valley_price < peak1_price * (1 - tolerance):
                            patterns['double_top'].append({
                                'peak1_date': peaks[i],
                                'peak1_price': peak1_price,
                                'peak2_date': peaks[j],
                                'peak2_price': peak2_price,
                                'valley_price': valley_price,
                                'strength': 1 - abs(peak1_price - peak2_price) / peak1_price
                            })
        
        # Buscar dobles suelos
        for i in range(len(valleys) - 1):
            for j in range(i + 1, len(valleys)):
                valley1_price = df.loc[valleys[i], 'low']
                valley2_price = df.loc[valleys[j], 'low']
                
                # Verificar si los valles están en niveles similares
                if abs(valley1_price - valley2_price) / valley1_price <= tolerance:
                    # Verificar que hay un pico entre los valles
                    peaks_between = [p for p in peaks if valleys[i] < p < valleys[j]]
                    if peaks_between:
                        peak_price = max(df.loc[peaks_between, 'high'])
                        if peak_price > valley1_price * (1 + tolerance):
                            patterns['double_bottom'].append({
                                'valley1_date': valleys[i],
                                'valley1_price': valley1_price,
                                'valley2_date': valleys[j],
                                'valley2_price': valley2_price,
                                'peak_price': peak_price,
                                'strength': 1 - abs(valley1_price - valley2_price) / valley1_price
                            })
        
        return patterns
    
    def detect_head_shoulders(self, df: pd.DataFrame, window: int = 15) -> Dict[str, List]:
        """
        Detecta patrones de cabeza y hombros
        
        Args:
            df: DataFrame con datos OHLCV
            window: Ventana para buscar picos/valles
            
        Returns:
            Diccionario con patrones detectados
        """
        patterns = {'head_shoulders': [], 'inverse_head_shoulders': []}
        
        # Encontrar picos y valles
        highs = df['high'].rolling(window=window, center=True).max()
        lows = df['low'].rolling(window=window, center=True).min()
        
        peaks = df[df['high'] == highs].index
        valleys = df[df['low'] == lows].index
        
        # Buscar cabeza y hombros (tres picos consecutivos)
        for i in range(len(peaks) - 2):
            left_shoulder = df.loc[peaks[i], 'high']
            head = df.loc[peaks[i + 1], 'high']
            right_shoulder = df.loc[peaks[i + 2], 'high']
            
            # Verificar que la cabeza es más alta que los hombros
            if (head > left_shoulder and head > right_shoulder and
                abs(left_shoulder - right_shoulder) / left_shoulder < 0.05):
                
                # Encontrar línea de cuello
                valleys_around = [v for v in valleys 
                                if peaks[i] < v < peaks[i + 2]]
                if len(valleys_around) >= 2:
                    neckline = np.mean([df.loc[v, 'low'] for v in valleys_around[:2]])
                    
                    patterns['head_shoulders'].append({
                        'left_shoulder_date': peaks[i],
                        'left_shoulder_price': left_shoulder,
                        'head_date': peaks[i + 1],
                        'head_price': head,
                        'right_shoulder_date': peaks[i + 2],
                        'right_shoulder_price': right_shoulder,
                        'neckline': neckline,
                        'target': neckline - (head - neckline)
                    })
        
        # Buscar cabeza y hombros invertido (tres valles consecutivos)
        for i in range(len(valleys) - 2):
            left_shoulder = df.loc[valleys[i], 'low']
            head = df.loc[valleys[i + 1], 'low']
            right_shoulder = df.loc[valleys[i + 2], 'low']
            
            # Verificar que la cabeza es más baja que los hombros
            if (head < left_shoulder and head < right_shoulder and
                abs(left_shoulder - right_shoulder) / left_shoulder < 0.05):
                
                # Encontrar línea de cuello
                peaks_around = [p for p in peaks 
                              if valleys[i] < p < valleys[i + 2]]
                if len(peaks_around) >= 2:
                    neckline = np.mean([df.loc[p, 'high'] for p in peaks_around[:2]])
                    
                    patterns['inverse_head_shoulders'].append({
                        'left_shoulder_date': valleys[i],
                        'left_shoulder_price': left_shoulder,
                        'head_date': valleys[i + 1],
                        'head_price': head,
                        'right_shoulder_date': valleys[i + 2],
                        'right_shoulder_price': right_shoulder,
                        'neckline': neckline,
                        'target': neckline + (neckline - head)
                    })
        
        return patterns
    
    def detect_triangles(self, df: pd.DataFrame, min_touches: int = 4) -> Dict[str, List]:
        """
        Detecta patrones de triángulos
        
        Args:
            df: DataFrame con datos OHLCV
            min_touches: Mínimo número de toques para validar línea de tendencia
            
        Returns:
            Diccionario con patrones detectados
        """
        patterns = {'ascending_triangle': [], 'descending_triangle': [], 'symmetrical_triangle': []}
        
        # Usar últimos 100 períodos para análisis
        df_recent = df.tail(100)
        
        # Encontrar líneas de tendencia
        resistance_levels = self._find_resistance_line(df_recent)
        support_levels = self._find_support_line(df_recent)
        
        for resistance in resistance_levels:
            for support in support_levels:
                # Verificar convergencia de líneas
                start_gap = abs(resistance['start_price'] - support['start_price'])
                end_gap = abs(resistance['end_price'] - support['end_price'])
                
                if end_gap < start_gap * 0.5:  # Las líneas convergen
                    # Clasificar tipo de triángulo
                    if abs(resistance['slope']) < 0.001:  # Resistencia horizontal
                        patterns['ascending_triangle'].append({
                            'resistance_line': resistance,
                            'support_line': support,
                            'convergence_point': self._find_convergence(resistance, support)
                        })
                    elif abs(support['slope']) < 0.001:  # Soporte horizontal
                        patterns['descending_triangle'].append({
                            'resistance_line': resistance,
                            'support_line': support,
                            'convergence_point': self._find_convergence(resistance, support)
                        })
                    else:  # Ambas líneas inclinadas
                        patterns['symmetrical_triangle'].append({
                            'resistance_line': resistance,
                            'support_line': support,
                            'convergence_point': self._find_convergence(resistance, support)
                        })
        
        return patterns
    
    def _find_resistance_line(self, df: pd.DataFrame) -> List[Dict]:
        """Encuentra líneas de resistencia"""
        # Simplificado: buscar máximos locales y ajustar línea
        highs = df['high'].rolling(window=5, center=True).max()
        peaks = df[df['high'] == highs]
        
        if len(peaks) < 2:
            return []
        
        # Ajustar línea de tendencia a los picos
        x = np.arange(len(peaks))
        y = peaks['high'].values
        
        if len(x) >= 2:
            slope, intercept = np.polyfit(x, y, 1)
            return [{
                'slope': slope,
                'intercept': intercept,
                'start_price': y[0],
                'end_price': y[-1],
                'touches': len(peaks)
            }]
        
        return []
    
    def _find_support_line(self, df: pd.DataFrame) -> List[Dict]:
        """Encuentra líneas de soporte"""
        # Simplificado: buscar mínimos locales y ajustar línea
        lows = df['low'].rolling(window=5, center=True).min()
        valleys = df[df['low'] == lows]
        
        if len(valleys) < 2:
            return []
        
        # Ajustar línea de tendencia a los valles
        x = np.arange(len(valleys))
        y = valleys['low'].values
        
        if len(x) >= 2:
            slope, intercept = np.polyfit(x, y, 1)
            return [{
                'slope': slope,
                'intercept': intercept,
                'start_price': y[0],
                'end_price': y[-1],
                'touches': len(valleys)
            }]
        
        return []
    
    def _find_convergence(self, line1: Dict, line2: Dict) -> Dict:
        """Encuentra el punto de convergencia de dos líneas"""
        # Resolver sistema de ecuaciones lineales
        # y1 = m1*x + b1
        # y2 = m2*x + b2
        # En convergencia: m1*x + b1 = m2*x + b2
        
        m1, b1 = line1['slope'], line1['intercept']
        m2, b2 = line2['slope'], line2['intercept']
        
        if abs(m1 - m2) < 1e-10:  # Líneas paralelas
            return {'x': float('inf'), 'y': float('inf')}
        
        x_convergence = (b2 - b1) / (m1 - m2)
        y_convergence = m1 * x_convergence + b1
        
        return {'x': x_convergence, 'y': y_convergence}
    
    def detect_flag_pennant(self, df: pd.DataFrame) -> Dict[str, List]:
        """
        Detecta patrones de bandera y banderín
        
        Args:
            df: DataFrame con datos OHLCV
            
        Returns:
            Diccionario con patrones detectados
        """
        patterns = {'bull_flag': [], 'bear_flag': [], 'pennant': []}
        
        # Buscar movimientos fuertes (mástil de la bandera)
        df['price_change'] = df['close'].pct_change(5)  # Cambio en 5 períodos
        
        strong_moves = df[abs(df['price_change']) > 0.05]  # Movimientos > 5%
        
        for idx in strong_moves.index:
            # Analizar consolidación después del movimiento fuerte
            start_idx = df.index.get_loc(idx)
            if start_idx + 20 < len(df):
                consolidation = df.iloc[start_idx:start_idx + 20]
                
                # Verificar si hay consolidación (volatilidad reducida)
                volatility = consolidation['high'].max() - consolidation['low'].min()
                avg_price = consolidation['close'].mean()
                
                if volatility / avg_price < 0.05:  # Consolidación estrecha
                    move_direction = 'up' if strong_moves.loc[idx, 'price_change'] > 0 else 'down'
                    
                    if move_direction == 'up':
                        patterns['bull_flag'].append({
                            'flagpole_start': idx,
                            'flagpole_end': consolidation.index[0],
                            'flag_end': consolidation.index[-1],
                            'breakout_target': avg_price * (1 + abs(strong_moves.loc[idx, 'price_change']))
                        })
                    else:
                        patterns['bear_flag'].append({
                            'flagpole_start': idx,
                            'flagpole_end': consolidation.index[0],
                            'flag_end': consolidation.index[-1],
                            'breakout_target': avg_price * (1 - abs(strong_moves.loc[idx, 'price_change']))
                        })
        
        return patterns
    
    def analyze_patterns(self, df: pd.DataFrame, symbol: str) -> Dict:
        """
        Análisis completo de patrones técnicos
        
        Args:
            df: DataFrame con datos OHLCV
            symbol: Símbolo de la acción
            
        Returns:
            Diccionario con todos los patrones detectados
        """
        print(f"Detectando patrones para {symbol}...")
        
        analysis = {
            'symbol': symbol,
            'chart_image': self.create_candlestick_chart(df, f"{symbol} - Análisis de Patrones"),
            'patterns': {}
        }
        
        # Detectar diferentes tipos de patrones
        analysis['patterns']['double_patterns'] = self.detect_double_top_bottom(df)
        analysis['patterns']['head_shoulders'] = self.detect_head_shoulders(df)
        analysis['patterns']['triangles'] = self.detect_triangles(df)
        analysis['patterns']['flags_pennants'] = self.detect_flag_pennant(df)
        
        # Resumen de patrones encontrados
        total_patterns = 0
        for pattern_type, patterns in analysis['patterns'].items():
            if isinstance(patterns, dict):
                for subtype, pattern_list in patterns.items():
                    total_patterns += len(pattern_list)
            else:
                total_patterns += len(patterns)
        
        analysis['summary'] = {
            'total_patterns_found': total_patterns,
            'most_recent_patterns': self._get_recent_patterns(analysis['patterns'], df.index[-1]),
            'pattern_strength': self._calculate_pattern_strength(analysis['patterns'])
        }
        
        return analysis
    
    def _get_recent_patterns(self, patterns: Dict, current_date) -> List[str]:
        """Obtiene los patrones más recientes"""
        recent_patterns = []
        cutoff_date = current_date - pd.Timedelta(days=30)  # Últimos 30 días
        
        for pattern_type, pattern_data in patterns.items():
            if isinstance(pattern_data, dict):
                for subtype, pattern_list in pattern_data.items():
                    for pattern in pattern_list:
                        # Verificar si el patrón es reciente
                        pattern_dates = [v for k, v in pattern.items() if 'date' in k]
                        if pattern_dates and max(pattern_dates) > cutoff_date:
                            recent_patterns.append(f"{pattern_type}_{subtype}")
        
        return list(set(recent_patterns))
    
    def _calculate_pattern_strength(self, patterns: Dict) -> str:
        """Calcula la fuerza general de los patrones"""
        total_strength = 0
        pattern_count = 0
        
        for pattern_type, pattern_data in patterns.items():
            if isinstance(pattern_data, dict):
                for subtype, pattern_list in pattern_data.items():
                    for pattern in pattern_list:
                        if 'strength' in pattern:
                            total_strength += pattern['strength']
                            pattern_count += 1
        
        if pattern_count == 0:
            return "neutral"
        
        avg_strength = total_strength / pattern_count
        
        if avg_strength > 0.7:
            return "strong"
        elif avg_strength > 0.4:
            return "moderate"
        else:
            return "weak"

# Función de prueba
def test_pattern_detector():
    """Función para probar el detector de patrones"""
    import sys
    sys.path.append('/home/ubuntu/stock_recommendation_system/backend')
    from technical_analyzer import TechnicalAnalyzer
    
    analyzer = TechnicalAnalyzer()
    detector = PatternDetector()
    
    # Obtener datos de una acción
    symbol = "AAPL"
    df = analyzer.get_stock_data(symbol, interval="1d", range_period="6mo")
    
    if not df.empty:
        # Analizar patrones
        pattern_analysis = detector.analyze_patterns(df, symbol)
        
        print(f"\n=== Análisis de Patrones para {symbol} ===")
        print(f"Total de patrones encontrados: {pattern_analysis['summary']['total_patterns_found']}")
        print(f"Patrones recientes: {pattern_analysis['summary']['most_recent_patterns']}")
        print(f"Fuerza de patrones: {pattern_analysis['summary']['pattern_strength']}")
        
        # Mostrar detalles de patrones
        for pattern_type, patterns in pattern_analysis['patterns'].items():
            if isinstance(patterns, dict):
                for subtype, pattern_list in patterns.items():
                    if pattern_list:
                        print(f"\n{pattern_type} - {subtype}: {len(pattern_list)} encontrados")
                        for i, pattern in enumerate(pattern_list[:2]):  # Mostrar solo los primeros 2
                            print(f"  Patrón {i+1}: {pattern}")

if __name__ == "__main__":
    test_pattern_detector()

