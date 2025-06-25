"""
Sistema de Predicción Multi-Temporal para Acciones
Implementa modelos de machine learning para predicciones a diferentes horizontes temporales
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import StandardScaler, MinMaxScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split, TimeSeriesSplit
import warnings
warnings.filterwarnings('ignore')

class MultiTemporalPredictor:
    """
    Predictor multi-temporal que genera predicciones a corto, mediano y largo plazo
    """
    
    def __init__(self):
        self.models = {
            'short_term': {  # 1-7 días
                'rf': RandomForestRegressor(n_estimators=100, random_state=42),
                'gb': GradientBoostingRegressor(n_estimators=100, random_state=42),
                'lr': LinearRegression()
            },
            'medium_term': {  # 1-4 semanas
                'rf': RandomForestRegressor(n_estimators=150, random_state=42),
                'gb': GradientBoostingRegressor(n_estimators=150, random_state=42),
                'lr': LinearRegression()
            },
            'long_term': {  # 1-6 meses
                'rf': RandomForestRegressor(n_estimators=200, random_state=42),
                'gb': GradientBoostingRegressor(n_estimators=200, random_state=42),
                'lr': LinearRegression()
            }
        }
        
        self.scalers = {
            'short_term': StandardScaler(),
            'medium_term': StandardScaler(),
            'long_term': StandardScaler()
        }
        
        self.feature_importance = {}
        self.model_performance = {}
        
    def create_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crea características técnicas para el modelo de predicción
        
        Args:
            df: DataFrame con datos OHLCV e indicadores técnicos
            
        Returns:
            DataFrame con características para ML
        """
        features_df = df.copy()
        
        # Características de precio
        features_df['price_change_1d'] = df['close'].pct_change(1)
        features_df['price_change_3d'] = df['close'].pct_change(3)
        features_df['price_change_5d'] = df['close'].pct_change(5)
        features_df['price_change_10d'] = df['close'].pct_change(10)
        
        # Características de volumen
        features_df['volume_sma_5'] = df['volume'].rolling(5).mean()
        features_df['volume_sma_20'] = df['volume'].rolling(20).mean()
        features_df['volume_ratio'] = df['volume'] / features_df['volume_sma_20']
        
        # Características de volatilidad
        features_df['volatility_5d'] = df['close'].rolling(5).std()
        features_df['volatility_20d'] = df['close'].rolling(20).std()
        features_df['volatility_ratio'] = features_df['volatility_5d'] / features_df['volatility_20d']
        
        # Características de rango
        features_df['high_low_ratio'] = df['high'] / df['low']
        features_df['close_open_ratio'] = df['close'] / df['open']
        
        # Características de medias móviles
        for period in [5, 10, 20, 50]:
            sma_col = f'sma_{period}'
            if sma_col in df.columns:
                features_df[f'price_to_{sma_col}'] = df['close'] / df[sma_col]
                features_df[f'{sma_col}_slope'] = df[sma_col].diff(5)
        
        # Características de indicadores técnicos
        if 'rsi' in df.columns:
            features_df['rsi_normalized'] = (df['rsi'] - 50) / 50
            features_df['rsi_change'] = df['rsi'].diff(1)
        
        if 'macd' in df.columns and 'macd_signal' in df.columns:
            features_df['macd_histogram'] = df['macd'] - df['macd_signal']
            features_df['macd_signal_cross'] = np.where(
                (df['macd'] > df['macd_signal']) & (df['macd'].shift(1) <= df['macd_signal'].shift(1)), 1,
                np.where((df['macd'] < df['macd_signal']) & (df['macd'].shift(1) >= df['macd_signal'].shift(1)), -1, 0)
            )
        
        if 'bb_upper' in df.columns and 'bb_lower' in df.columns:
            features_df['bb_position'] = (df['close'] - df['bb_lower']) / (df['bb_upper'] - df['bb_lower'])
            features_df['bb_width'] = (df['bb_upper'] - df['bb_lower']) / df['close']
        
        # Características temporales
        features_df['day_of_week'] = features_df.index.dayofweek
        features_df['month'] = features_df.index.month
        features_df['quarter'] = features_df.index.quarter
        
        # Características de momentum
        features_df['momentum_5d'] = df['close'] / df['close'].shift(5) - 1
        features_df['momentum_10d'] = df['close'] / df['close'].shift(10) - 1
        features_df['momentum_20d'] = df['close'] / df['close'].shift(20) - 1
        
        return features_df
    
    def create_targets(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Crea variables objetivo para diferentes horizontes temporales
        
        Args:
            df: DataFrame con datos de precios
            
        Returns:
            DataFrame con targets
        """
        targets_df = pd.DataFrame(index=df.index)
        
        # Targets de retorno
        targets_df['return_1d'] = df['close'].shift(-1) / df['close'] - 1
        targets_df['return_3d'] = df['close'].shift(-3) / df['close'] - 1
        targets_df['return_5d'] = df['close'].shift(-5) / df['close'] - 1
        targets_df['return_10d'] = df['close'].shift(-10) / df['close'] - 1
        targets_df['return_20d'] = df['close'].shift(-20) / df['close'] - 1
        
        # Targets de precio
        targets_df['price_1d'] = df['close'].shift(-1)
        targets_df['price_3d'] = df['close'].shift(-3)
        targets_df['price_5d'] = df['close'].shift(-5)
        targets_df['price_10d'] = df['close'].shift(-10)
        targets_df['price_20d'] = df['close'].shift(-20)
        
        # Targets de dirección (clasificación)
        targets_df['direction_1d'] = np.where(targets_df['return_1d'] > 0, 1, 0)
        targets_df['direction_3d'] = np.where(targets_df['return_3d'] > 0, 1, 0)
        targets_df['direction_5d'] = np.where(targets_df['return_5d'] > 0, 1, 0)
        targets_df['direction_10d'] = np.where(targets_df['return_10d'] > 0, 1, 0)
        targets_df['direction_20d'] = np.where(targets_df['return_20d'] > 0, 1, 0)
        
        return targets_df
    
    def prepare_data(self, features_df: pd.DataFrame, targets_df: pd.DataFrame, 
                    horizon: str) -> tuple:
        """
        Prepara datos para entrenamiento según el horizonte temporal
        
        Args:
            features_df: DataFrame con características
            targets_df: DataFrame con targets
            horizon: 'short_term', 'medium_term', o 'long_term'
            
        Returns:
            Tupla con datos preparados (X, y)
        """
        # Seleccionar características relevantes
        feature_cols = [col for col in features_df.columns 
                       if not col.startswith(('return_', 'price_', 'direction_')) 
                       and not features_df[col].isna().all()]
        
        X = features_df[feature_cols].copy()
        
        # Seleccionar target según horizonte
        if horizon == 'short_term':
            y = targets_df['return_5d'].copy()  # 5 días
        elif horizon == 'medium_term':
            y = targets_df['return_10d'].copy()  # 10 días
        else:  # long_term
            y = targets_df['return_20d'].copy()  # 20 días
        
        # Eliminar filas con valores nulos
        valid_idx = ~(X.isna().any(axis=1) | y.isna())
        X = X[valid_idx]
        y = y[valid_idx]
        
        # Rellenar valores nulos restantes
        X = X.fillna(method='ffill').fillna(method='bfill')
        
        return X, y
    
    def train_models(self, features_df: pd.DataFrame, targets_df: pd.DataFrame) -> dict:
        """
        Entrena modelos para todos los horizontes temporales
        
        Args:
            features_df: DataFrame con características
            targets_df: DataFrame con targets
            
        Returns:
            Diccionario con métricas de rendimiento
        """
        performance = {}
        
        for horizon in ['short_term', 'medium_term', 'long_term']:
            print(f"Entrenando modelos para {horizon}...")
            
            # Preparar datos
            X, y = self.prepare_data(features_df, targets_df, horizon)
            
            if len(X) < 50:  # Verificar que hay suficientes datos
                print(f"Datos insuficientes para {horizon}: {len(X)} muestras")
                continue
            
            # Dividir datos temporalmente
            split_idx = int(len(X) * 0.8)
            X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
            y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
            
            # Escalar características
            X_train_scaled = self.scalers[horizon].fit_transform(X_train)
            X_test_scaled = self.scalers[horizon].transform(X_test)
            
            horizon_performance = {}
            
            # Entrenar cada modelo
            for model_name, model in self.models[horizon].items():
                try:
                    # Entrenar modelo
                    model.fit(X_train_scaled, y_train)
                    
                    # Predicciones
                    y_pred_train = model.predict(X_train_scaled)
                    y_pred_test = model.predict(X_test_scaled)
                    
                    # Métricas
                    train_mse = mean_squared_error(y_train, y_pred_train)
                    test_mse = mean_squared_error(y_test, y_pred_test)
                    train_mae = mean_absolute_error(y_train, y_pred_train)
                    test_mae = mean_absolute_error(y_test, y_pred_test)
                    train_r2 = r2_score(y_train, y_pred_train)
                    test_r2 = r2_score(y_test, y_pred_test)
                    
                    horizon_performance[model_name] = {
                        'train_mse': train_mse,
                        'test_mse': test_mse,
                        'train_mae': train_mae,
                        'test_mae': test_mae,
                        'train_r2': train_r2,
                        'test_r2': test_r2
                    }
                    
                    # Importancia de características (solo para modelos basados en árboles)
                    if hasattr(model, 'feature_importances_'):
                        feature_importance = dict(zip(X.columns, model.feature_importances_))
                        self.feature_importance[f"{horizon}_{model_name}"] = feature_importance
                    
                    print(f"  {model_name}: Test R² = {test_r2:.4f}, Test MAE = {test_mae:.4f}")
                    
                except Exception as e:
                    print(f"  Error entrenando {model_name}: {str(e)}")
                    horizon_performance[model_name] = {'error': str(e)}
            
            performance[horizon] = horizon_performance
        
        self.model_performance = performance
        return performance
    
    def predict(self, features_df: pd.DataFrame, horizon: str = 'all') -> dict:
        """
        Genera predicciones para el horizonte especificado
        
        Args:
            features_df: DataFrame con características actuales
            horizon: 'short_term', 'medium_term', 'long_term', o 'all'
            
        Returns:
            Diccionario con predicciones
        """
        predictions = {}
        
        horizons = [horizon] if horizon != 'all' else ['short_term', 'medium_term', 'long_term']
        
        for h in horizons:
            if h not in self.models:
                continue
                
            # Preparar características
            feature_cols = [col for col in features_df.columns 
                           if not col.startswith(('return_', 'price_', 'direction_')) 
                           and not features_df[col].isna().all()]
            
            X = features_df[feature_cols].iloc[-1:].copy()  # Última fila
            X = X.fillna(method='ffill').fillna(method='bfill')
            
            try:
                # Escalar características
                X_scaled = self.scalers[h].transform(X)
                
                horizon_predictions = {}
                
                # Predicción con cada modelo
                for model_name, model in self.models[h].items():
                    try:
                        pred = model.predict(X_scaled)[0]
                        horizon_predictions[model_name] = pred
                    except Exception as e:
                        horizon_predictions[model_name] = f"Error: {str(e)}"
                
                # Ensemble (promedio de predicciones válidas)
                valid_preds = [p for p in horizon_predictions.values() if isinstance(p, (int, float))]
                if valid_preds:
                    horizon_predictions['ensemble'] = np.mean(valid_preds)
                    horizon_predictions['ensemble_std'] = np.std(valid_preds)
                
                predictions[h] = horizon_predictions
                
            except Exception as e:
                predictions[h] = {'error': str(e)}
        
        return predictions
    
    def get_prediction_confidence(self, predictions: dict) -> dict:
        """
        Calcula la confianza de las predicciones basada en la consistencia entre modelos
        
        Args:
            predictions: Diccionario con predicciones
            
        Returns:
            Diccionario con niveles de confianza
        """
        confidence = {}
        
        for horizon, horizon_preds in predictions.items():
            if 'error' in horizon_preds:
                confidence[horizon] = 'low'
                continue
            
            # Obtener predicciones válidas
            valid_preds = [p for k, p in horizon_preds.items() 
                          if k not in ['ensemble', 'ensemble_std'] and isinstance(p, (int, float))]
            
            if len(valid_preds) < 2:
                confidence[horizon] = 'low'
                continue
            
            # Calcular consistencia
            std_dev = np.std(valid_preds)
            mean_pred = np.mean(valid_preds)
            
            # Coeficiente de variación
            cv = abs(std_dev / mean_pred) if mean_pred != 0 else float('inf')
            
            # Determinar confianza
            if cv < 0.1:
                confidence[horizon] = 'high'
            elif cv < 0.3:
                confidence[horizon] = 'medium'
            else:
                confidence[horizon] = 'low'
        
        return confidence
    
    def generate_trading_signals(self, predictions: dict, current_price: float) -> dict:
        """
        Genera señales de trading basadas en las predicciones
        
        Args:
            predictions: Diccionario con predicciones
            current_price: Precio actual de la acción
            
        Returns:
            Diccionario con señales de trading
        """
        signals = {}
        
        for horizon, horizon_preds in predictions.items():
            if 'error' in horizon_preds or 'ensemble' not in horizon_preds:
                signals[horizon] = {'signal': 'HOLD', 'confidence': 'low', 'reason': 'Predicción no disponible'}
                continue
            
            predicted_return = horizon_preds['ensemble']
            predicted_price = current_price * (1 + predicted_return)
            
            # Umbrales para señales
            strong_buy_threshold = 0.05  # 5%
            buy_threshold = 0.02  # 2%
            sell_threshold = -0.02  # -2%
            strong_sell_threshold = -0.05  # -5%
            
            # Determinar señal
            if predicted_return > strong_buy_threshold:
                signal = 'STRONG_BUY'
            elif predicted_return > buy_threshold:
                signal = 'BUY'
            elif predicted_return < strong_sell_threshold:
                signal = 'STRONG_SELL'
            elif predicted_return < sell_threshold:
                signal = 'SELL'
            else:
                signal = 'HOLD'
            
            # Calcular precio objetivo
            target_price = predicted_price
            
            # Calcular stop loss (basado en volatilidad histórica)
            stop_loss_pct = 0.05  # 5% por defecto
            if predicted_return > 0:
                stop_loss = current_price * (1 - stop_loss_pct)
            else:
                stop_loss = current_price * (1 + stop_loss_pct)
            
            signals[horizon] = {
                'signal': signal,
                'predicted_return': predicted_return,
                'predicted_price': predicted_price,
                'target_price': target_price,
                'stop_loss': stop_loss,
                'confidence': self.get_prediction_confidence({horizon: horizon_preds})[horizon]
            }
        
        return signals

# Función de prueba
def test_predictor():
    """Función para probar el predictor multi-temporal"""
    import sys
    sys.path.append('/home/ubuntu/stock_recommendation_system/backend')
    from technical_analyzer import TechnicalAnalyzer
    
    analyzer = TechnicalAnalyzer()
    predictor = MultiTemporalPredictor()
    
    # Obtener datos de una acción
    symbol = "AAPL"
    print(f"Probando predictor con {symbol}...")
    
    # Obtener análisis técnico completo
    analysis = analyzer.analyze_stock(symbol, interval="1d", range_period="2y")
    
    if "error" in analysis:
        print(f"Error: {analysis['error']}")
        return
    
    df = analysis['data']
    
    # Crear características y targets
    features_df = predictor.create_features(df)
    targets_df = predictor.create_targets(df)
    
    print(f"Características creadas: {features_df.shape}")
    print(f"Targets creados: {targets_df.shape}")
    
    # Entrenar modelos
    performance = predictor.train_models(features_df, targets_df)
    
    print("\n=== Rendimiento de Modelos ===")
    for horizon, models in performance.items():
        print(f"\n{horizon.upper()}:")
        for model_name, metrics in models.items():
            if 'error' not in metrics:
                print(f"  {model_name}: R² = {metrics['test_r2']:.4f}, MAE = {metrics['test_mae']:.4f}")
    
    # Generar predicciones
    predictions = predictor.predict(features_df)
    
    print(f"\n=== Predicciones para {symbol} ===")
    current_price = df['close'].iloc[-1]
    print(f"Precio actual: ${current_price:.2f}")
    
    for horizon, preds in predictions.items():
        if 'ensemble' in preds:
            predicted_return = preds['ensemble']
            predicted_price = current_price * (1 + predicted_return)
            print(f"\n{horizon.upper()}:")
            print(f"  Retorno predicho: {predicted_return:.2%}")
            print(f"  Precio predicho: ${predicted_price:.2f}")
            print(f"  Desviación estándar: {preds.get('ensemble_std', 0):.4f}")
    
    # Generar señales de trading
    signals = predictor.generate_trading_signals(predictions, current_price)
    
    print(f"\n=== Señales de Trading ===")
    for horizon, signal_data in signals.items():
        print(f"\n{horizon.upper()}:")
        print(f"  Señal: {signal_data['signal']}")
        print(f"  Confianza: {signal_data['confidence']}")
        if 'predicted_return' in signal_data:
            print(f"  Retorno esperado: {signal_data['predicted_return']:.2%}")
            print(f"  Precio objetivo: ${signal_data['target_price']:.2f}")
            print(f"  Stop loss: ${signal_data['stop_loss']:.2f}")

if __name__ == "__main__":
    test_predictor()

