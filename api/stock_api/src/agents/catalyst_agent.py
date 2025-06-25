"""
Agente de Análisis de Catalizadores
Implementa el framework de Catalyst Signals para identificar eventos que pueden generar movimientos significativos
"""

import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Any
import re
import warnings
warnings.filterwarnings('ignore')

class CatalystAgent:
    """
    Agente especializado en identificación de catalizadores de mercado
    Implementa el framework de Catalyst Signals para penny stocks y acciones de pequeña capitalización
    """
    
    def __init__(self):
        # Catalizadores duros (mayor impacto)
        self.hard_catalysts = {
            'fda_news': {
                'keywords': ['fda approval', 'clinical trial', 'drug approval', 'phase 3', 'breakthrough therapy'],
                'impact_score': 90,
                'sector': 'healthcare'
            },
            'earnings_beat': {
                'keywords': ['earnings beat', 'revenue growth', 'profit surge', 'quarterly results'],
                'impact_score': 85,
                'sector': 'all'
            },
            'merger_acquisition': {
                'keywords': ['merger', 'acquisition', 'buyout', 'takeover', 'strategic partnership'],
                'impact_score': 95,
                'sector': 'all'
            },
            'tech_breakthrough': {
                'keywords': ['ai breakthrough', 'quantum computing', 'patent approval', 'innovation'],
                'impact_score': 80,
                'sector': 'technology'
            }
        }
        
        # Catalizadores suaves (impacto moderado)
        self.soft_catalysts = {
            'institutional_interest': {
                'keywords': ['institutional buying', 'hedge fund', 'pension fund', 'analyst coverage'],
                'impact_score': 60,
                'sector': 'all'
            },
            'sector_trends': {
                'keywords': ['sector rotation', 'industry growth', 'regulatory changes', 'government policy'],
                'impact_score': 50,
                'sector': 'all'
            },
            'insider_activity': {
                'keywords': ['insider buying', 'executive purchase', 'board member', 'stock buyback'],
                'impact_score': 55,
                'sector': 'all'
            }
        }
        
        # Criterios para penny stocks
        self.penny_stock_criteria = {
            'max_price': 5.0,  # Precio máximo $5
            'min_market_cap': 50_000_000,  # $50M mínimo
            'max_market_cap': 300_000_000,  # $300M máximo
            'min_volume': 200_000,  # 200K acciones/día mínimo
            'optimal_float': 50_000_000  # 50M acciones float óptimo
        }
        
        # Sectores de alto potencial
        self.high_potential_sectors = {
            'biotechnology': 1.3,
            'artificial_intelligence': 1.2,
            'clean_energy': 1.1,
            'cybersecurity': 1.1,
            'cannabis': 1.0,
            'electric_vehicles': 1.0
        }
    
    def find_catalysts(self, symbol: str) -> Dict:
        """
        Encuentra y analiza catalizadores para una acción específica
        
        Args:
            symbol: Símbolo de la acción
            
        Returns:
            Diccionario con análisis de catalizadores
        """
        print(f"Buscando catalizadores para {symbol}...")
        
        try:
            # Obtener información básica de la empresa
            company_info = self._get_company_info(symbol)
            
            # Verificar si es penny stock
            is_penny_stock = self._is_penny_stock(company_info)
            
            # Buscar catalizadores duros
            hard_catalysts = self._find_hard_catalysts(symbol, company_info)
            
            # Buscar catalizadores suaves
            soft_catalysts = self._find_soft_catalysts(symbol, company_info)
            
            # Analizar criterios técnicos
            technical_criteria = self._analyze_technical_criteria(symbol, company_info)
            
            # Calcular puntuación de catalizador
            catalyst_score = self._calculate_catalyst_score(
                hard_catalysts, soft_catalysts, technical_criteria, is_penny_stock
            )
            
            # Generar recomendación
            recommendation = self._generate_catalyst_recommendation(
                catalyst_score, is_penny_stock, hard_catalysts, soft_catalysts
            )
            
            return {
                'symbol': symbol,
                'timestamp': datetime.now().isoformat(),
                'is_penny_stock': is_penny_stock,
                'company_info': company_info,
                'hard_catalysts': hard_catalysts,
                'soft_catalysts': soft_catalysts,
                'technical_criteria': technical_criteria,
                'catalyst_score': catalyst_score,
                'recommendation': recommendation,
                'potential_upside': self._calculate_potential_upside(catalyst_score, is_penny_stock)
            }
            
        except Exception as e:
            return {
                'symbol': symbol,
                'error': str(e),
                'catalyst_score': 0
            }
    
    def _get_company_info(self, symbol: str) -> Dict:
        """Obtiene información básica de la empresa"""
        # Simular información de empresa (en producción usaríamos APIs reales)
        # Aquí integraríamos con Yahoo Finance, Alpha Vantage, etc.
        
        # Generar datos simulados realistas
        price = np.random.uniform(0.5, 10.0)
        shares_outstanding = np.random.randint(10_000_000, 200_000_000)
        market_cap = price * shares_outstanding
        
        sectors = ['biotechnology', 'technology', 'energy', 'finance', 'healthcare', 'retail']
        sector = np.random.choice(sectors)
        
        return {
            'price': price,
            'market_cap': market_cap,
            'shares_outstanding': shares_outstanding,
            'float': shares_outstanding * np.random.uniform(0.6, 0.9),  # Float típicamente menor
            'sector': sector,
            'avg_volume': np.random.randint(100_000, 5_000_000),
            'beta': np.random.uniform(0.8, 2.5),
            'pe_ratio': np.random.uniform(10, 50) if np.random.random() > 0.3 else None
        }
    
    def _is_penny_stock(self, company_info: Dict) -> bool:
        """Determina si una acción es penny stock según criterios"""
        criteria = self.penny_stock_criteria
        
        price_check = company_info['price'] <= criteria['max_price']
        market_cap_check = (criteria['min_market_cap'] <= 
                           company_info['market_cap'] <= 
                           criteria['max_market_cap'])
        volume_check = company_info['avg_volume'] >= criteria['min_volume']
        
        return price_check and market_cap_check and volume_check
    
    def _find_hard_catalysts(self, symbol: str, company_info: Dict) -> List[Dict]:
        """Busca catalizadores duros"""
        found_catalysts = []
        
        # Simular búsqueda de noticias y eventos
        # En producción integraríamos con APIs de noticias financieras
        
        for catalyst_type, catalyst_data in self.hard_catalysts.items():
            # Verificar si el catalizador es relevante para el sector
            if (catalyst_data['sector'] == 'all' or 
                catalyst_data['sector'] == company_info['sector']):
                
                # Simular probabilidad de encontrar catalizador
                probability = self._get_catalyst_probability(catalyst_type, company_info)
                
                if np.random.random() < probability:
                    catalyst = {
                        'type': catalyst_type,
                        'impact_score': catalyst_data['impact_score'],
                        'description': self._generate_catalyst_description(catalyst_type, symbol),
                        'date_found': datetime.now().isoformat(),
                        'confidence': np.random.choice(['high', 'medium', 'low'], p=[0.3, 0.5, 0.2])
                    }
                    found_catalysts.append(catalyst)
        
        return found_catalysts
    
    def _find_soft_catalysts(self, symbol: str, company_info: Dict) -> List[Dict]:
        """Busca catalizadores suaves"""
        found_catalysts = []
        
        for catalyst_type, catalyst_data in self.soft_catalysts.items():
            # Simular probabilidad de encontrar catalizador suave
            probability = self._get_catalyst_probability(catalyst_type, company_info, is_soft=True)
            
            if np.random.random() < probability:
                catalyst = {
                    'type': catalyst_type,
                    'impact_score': catalyst_data['impact_score'],
                    'description': self._generate_catalyst_description(catalyst_type, symbol),
                    'date_found': datetime.now().isoformat(),
                    'confidence': np.random.choice(['high', 'medium', 'low'], p=[0.2, 0.6, 0.2])
                }
                found_catalysts.append(catalyst)
        
        return found_catalysts
    
    def _analyze_technical_criteria(self, symbol: str, company_info: Dict) -> Dict:
        """Analiza criterios técnicos para penny stocks"""
        criteria = {}
        
        # Analizar float
        float_score = 100
        if company_info['float'] > 100_000_000:
            float_score = 50
        elif company_info['float'] > 50_000_000:
            float_score = 75
        
        criteria['float_analysis'] = {
            'float': company_info['float'],
            'score': float_score,
            'rating': 'excellent' if float_score > 90 else 'good' if float_score > 70 else 'poor'
        }
        
        # Analizar volumen
        volume_score = 100
        if company_info['avg_volume'] < 200_000:
            volume_score = 30
        elif company_info['avg_volume'] < 500_000:
            volume_score = 60
        elif company_info['avg_volume'] < 1_000_000:
            volume_score = 80
        
        criteria['volume_analysis'] = {
            'avg_volume': company_info['avg_volume'],
            'score': volume_score,
            'rating': 'excellent' if volume_score > 90 else 'good' if volume_score > 70 else 'poor'
        }
        
        # Analizar capitalización de mercado
        market_cap_score = 100
        if company_info['market_cap'] > 300_000_000:
            market_cap_score = 60
        elif company_info['market_cap'] < 50_000_000:
            market_cap_score = 40
        
        criteria['market_cap_analysis'] = {
            'market_cap': company_info['market_cap'],
            'score': market_cap_score,
            'rating': 'excellent' if market_cap_score > 90 else 'good' if market_cap_score > 70 else 'poor'
        }
        
        # Puntuación técnica general
        criteria['overall_technical_score'] = (
            float_score * 0.4 + 
            volume_score * 0.4 + 
            market_cap_score * 0.2
        )
        
        return criteria
    
    def _get_catalyst_probability(self, catalyst_type: str, company_info: Dict, is_soft: bool = False) -> float:
        """Calcula probabilidad de encontrar un catalizador específico"""
        base_probability = 0.15 if not is_soft else 0.25
        
        # Ajustar por sector
        sector_multiplier = self.high_potential_sectors.get(company_info['sector'], 0.8)
        
        # Ajustar por tamaño de empresa (empresas más pequeñas = más volátiles)
        if company_info['market_cap'] < 100_000_000:
            size_multiplier = 1.3
        elif company_info['market_cap'] < 200_000_000:
            size_multiplier = 1.1
        else:
            size_multiplier = 0.9
        
        return min(0.8, base_probability * sector_multiplier * size_multiplier)
    
    def _generate_catalyst_description(self, catalyst_type: str, symbol: str) -> str:
        """Genera descripción del catalizador"""
        descriptions = {
            'fda_news': f'{symbol} announces positive Phase 3 clinical trial results',
            'earnings_beat': f'{symbol} reports quarterly earnings beating estimates by 15%',
            'merger_acquisition': f'{symbol} receives acquisition offer from industry leader',
            'tech_breakthrough': f'{symbol} patents breakthrough AI technology',
            'institutional_interest': f'Major hedge fund increases position in {symbol}',
            'sector_trends': f'{symbol} benefits from favorable regulatory changes in sector',
            'insider_activity': f'{symbol} executives increase stock purchases significantly'
        }
        
        return descriptions.get(catalyst_type, f'Positive catalyst identified for {symbol}')
    
    def _calculate_catalyst_score(self, hard_catalysts: List[Dict], 
                                soft_catalysts: List[Dict], 
                                technical_criteria: Dict, 
                                is_penny_stock: bool) -> float:
        """Calcula puntuación total de catalizadores"""
        score = 0
        
        # Puntuación de catalizadores duros
        for catalyst in hard_catalysts:
            confidence_multiplier = {'high': 1.0, 'medium': 0.8, 'low': 0.6}[catalyst['confidence']]
            score += catalyst['impact_score'] * confidence_multiplier
        
        # Puntuación de catalizadores suaves
        for catalyst in soft_catalysts:
            confidence_multiplier = {'high': 1.0, 'medium': 0.8, 'low': 0.6}[catalyst['confidence']]
            score += catalyst['impact_score'] * confidence_multiplier * 0.7  # Peso menor
        
        # Bonus por criterios técnicos
        technical_bonus = technical_criteria['overall_technical_score'] * 0.3
        score += technical_bonus
        
        # Bonus adicional para penny stocks (mayor potencial de volatilidad)
        if is_penny_stock:
            score *= 1.2
        
        return min(100, score)  # Limitar a 100
    
    def _generate_catalyst_recommendation(self, catalyst_score: float, 
                                        is_penny_stock: bool,
                                        hard_catalysts: List[Dict],
                                        soft_catalysts: List[Dict]) -> Dict:
        """Genera recomendación basada en catalizadores"""
        
        # Determinar acción recomendada
        if catalyst_score > 80:
            action = 'STRONG_BUY'
            confidence = 'high'
        elif catalyst_score > 60:
            action = 'BUY'
            confidence = 'medium'
        elif catalyst_score > 40:
            action = 'WATCH'
            confidence = 'medium'
        else:
            action = 'HOLD'
            confidence = 'low'
        
        # Calcular horizonte temporal
        if hard_catalysts:
            time_horizon = '1-7 days'  # Catalizadores duros actúan rápido
        elif soft_catalysts:
            time_horizon = '1-4 weeks'  # Catalizadores suaves toman más tiempo
        else:
            time_horizon = '1-3 months'
        
        # Generar razones
        reasons = []
        if hard_catalysts:
            reasons.append(f"{len(hard_catalysts)} catalizador(es) duro(s) identificado(s)")
        if soft_catalysts:
            reasons.append(f"{len(soft_catalysts)} catalizador(es) suave(s) identificado(s)")
        if is_penny_stock:
            reasons.append("Penny stock con alto potencial de volatilidad")
        
        return {
            'action': action,
            'confidence': confidence,
            'time_horizon': time_horizon,
            'reasons': reasons,
            'risk_level': 'high' if is_penny_stock else 'medium'
        }
    
    def _calculate_potential_upside(self, catalyst_score: float, is_penny_stock: bool) -> Dict:
        """Calcula potencial alcista basado en catalizadores"""
        
        # Potencial base según puntuación
        if catalyst_score > 80:
            base_upside = 0.5  # 50%
        elif catalyst_score > 60:
            base_upside = 0.3  # 30%
        elif catalyst_score > 40:
            base_upside = 0.15  # 15%
        else:
            base_upside = 0.05  # 5%
        
        # Multiplicador para penny stocks
        if is_penny_stock:
            penny_multiplier = 2.0  # Penny stocks pueden tener movimientos más grandes
            max_upside = base_upside * penny_multiplier
        else:
            max_upside = base_upside
        
        # Calcular rangos
        conservative_upside = max_upside * 0.5
        aggressive_upside = max_upside * 1.5
        
        return {
            'conservative': f"{conservative_upside:.1%}",
            'base_case': f"{max_upside:.1%}",
            'aggressive': f"{aggressive_upside:.1%}",
            'timeframe': '1-30 days'
        }

# Función de prueba
def test_catalyst_agent():
    """Función para probar el agente de catalizadores"""
    agent = CatalystAgent()
    
    symbols = ["AAPL", "TSLA", "NVDA", "PLTR", "AMC"]  # Mix de large cap y penny stocks
    
    for symbol in symbols:
        print(f"\n=== Análisis de Catalizadores para {symbol} ===")
        
        analysis = agent.find_catalysts(symbol)
        
        if 'error' not in analysis:
            print(f"Es penny stock: {analysis['is_penny_stock']}")
            print(f"Puntuación de catalizador: {analysis['catalyst_score']:.1f}/100")
            print(f"Recomendación: {analysis['recommendation']['action']}")
            print(f"Confianza: {analysis['recommendation']['confidence']}")
            print(f"Horizonte temporal: {analysis['recommendation']['time_horizon']}")
            
            # Catalizadores encontrados
            hard_count = len(analysis['hard_catalysts'])
            soft_count = len(analysis['soft_catalysts'])
            print(f"Catalizadores duros: {hard_count}")
            print(f"Catalizadores suaves: {soft_count}")
            
            # Potencial alcista
            upside = analysis['potential_upside']
            print(f"Potencial alcista: {upside['conservative']} - {upside['aggressive']}")
            
            # Criterios técnicos
            tech_score = analysis['technical_criteria']['overall_technical_score']
            print(f"Puntuación técnica: {tech_score:.1f}/100")
            
        else:
            print(f"Error: {analysis['error']}")

if __name__ == "__main__":
    test_catalyst_agent()

