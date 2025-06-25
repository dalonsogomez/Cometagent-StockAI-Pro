"""
Analizador Optimizado por Lotes - Horizontes Temporales
Procesa todas las acciones en lotes pequeños para mejor manejo de memoria y tiempo
"""

import pandas as pd
import json
import time
from datetime import datetime
import sys
import os
from time_horizon_analyzer import TimeHorizonAnalyzer

class BatchTimeHorizonAnalyzer:
    def __init__(self, csv_file_path, batch_size=50):
        self.csv_file_path = csv_file_path
        self.batch_size = batch_size
        self.all_results = []
        
    def analyze_in_batches(self):
        """Analiza todas las acciones en lotes pequeños"""
        # Cargar datos
        df = pd.read_csv(self.csv_file_path)
        total_stocks = len(df)
        total_batches = (total_stocks + self.batch_size - 1) // self.batch_size
        
        print(f"🔬 Iniciando análisis por lotes:")
        print(f"📊 Total de acciones: {total_stocks}")
        print(f"📦 Tamaño del lote: {self.batch_size}")
        print(f"🔄 Total de lotes: {total_batches}")
        print("="*60)
        
        start_time = time.time()
        
        for batch_num in range(total_batches):
            batch_start = batch_num * self.batch_size
            batch_end = min(batch_start + self.batch_size, total_stocks)
            
            print(f"\n🔍 Procesando lote {batch_num + 1}/{total_batches}")
            print(f"📈 Acciones {batch_start + 1} a {batch_end}")
            
            # Crear analizador para este lote
            analyzer = TimeHorizonAnalyzer(self.csv_file_path)
            
            # Analizar solo este lote
            batch_results = analyzer.analyze_all_stocks(
                limit=self.batch_size, 
                start_from=batch_start
            )
            
            # Agregar resultados
            if batch_results:
                self.all_results.extend(batch_results)
            
            # Estadísticas del lote
            valid_batch = [r for r in batch_results if 'error' not in r] if batch_results else []
            print(f"✅ Lote completado: {len(valid_batch)} éxitos de {len(batch_results) if batch_results else 0}")
            
            # Guardar progreso cada 3 lotes
            if (batch_num + 1) % 3 == 0:
                self.save_intermediate_results(batch_num + 1, total_batches)
            
            # Pausa entre lotes para no sobrecargar APIs
            if batch_num < total_batches - 1:  # No pausar en el último lote
                print("⏳ Pausa de 30 segundos entre lotes...")
                time.sleep(30)
        
        total_time = time.time() - start_time
        print(f"\n🎉 Análisis completo terminado en {total_time/60:.1f} minutos")
        
        return self.all_results
    
    def save_intermediate_results(self, current_batch, total_batches):
        """Guarda resultados intermedios"""
        filename = f"progress_batch_{current_batch}_of_{total_batches}.json"
        filepath = f"/workspaces/Cometagent-StockAI-Pro/{filename}"
        
        progress_data = {
            'timestamp': datetime.now().isoformat(),
            'progress': f"{current_batch}/{total_batches}",
            'total_analyzed': len(self.all_results),
            'successful': len([r for r in self.all_results if 'error' not in r]),
            'results': self.all_results
        }
        
        with open(filepath, 'w') as f:
            json.dump(progress_data, f, indent=2)
        
        print(f"💾 Progreso guardado en: {filename}")
    
    def save_final_results(self):
        """Guarda los resultados finales con análisis completo"""
        if not self.all_results:
            print("❌ No hay resultados para guardar")
            return
        
        # Crear analizador temporal para usar sus métodos de análisis
        temp_analyzer = TimeHorizonAnalyzer(self.csv_file_path)
        temp_analyzer.results = self.all_results
        
        # Usar el método de guardado del analizador principal
        filepath = temp_analyzer.save_results('complete_time_horizon_analysis.json')
        
        # También mostrar resumen
        temp_analyzer.print_summary()
        
        return filepath

def quick_test_batch():
    """Prueba rápida con las primeras 10 acciones"""
    print("🧪 PRUEBA RÁPIDA - 10 ACCIONES")
    print("="*40)
    
    csv_file = "/workspaces/Cometagent-StockAI-Pro/lightyear_stocks_complete_numbered.csv"
    analyzer = TimeHorizonAnalyzer(csv_file)
    
    results = analyzer.analyze_all_stocks(limit=10)
    analyzer.print_summary()
    analyzer.save_results('test_10_stocks.json')
    
    print("✅ Prueba completada!")

def main():
    """Función principal para el análisis por lotes"""
    csv_file = "/workspaces/Cometagent-StockAI-Pro/lightyear_stocks_complete_numbered.csv"
    
    print("🚀 ANALIZADOR POR LOTES - HORIZONTES TEMPORALES")
    print("="*60)
    print("📅 Corto Plazo: Máximo 21 días")
    print("📈 Largo Plazo: Máximo 3 meses (90 días)")
    print("")
    
    # Preguntar por el tipo de análisis
    print("Opciones disponibles:")
    print("1. 🧪 Prueba rápida (10 acciones)")
    print("2. 📊 Análisis completo (1228 acciones)")
    print("3. 🔍 Análisis personalizado")
    
    try:
        choice = input("\nSelecciona una opción (1-3): ").strip()
        
        if choice == "1":
            quick_test_batch()
        
        elif choice == "2":
            print("\n⚠️  ANÁLISIS COMPLETO SELECCIONADO")
            print("🕐 Tiempo estimado: 60-90 minutos")
            print("📦 Se procesará en lotes de 50 acciones")
            
            confirm = input("¿Continuar? (s/n): ").strip().lower()
            if confirm in ['s', 'si', 'yes', 'y']:
                batch_analyzer = BatchTimeHorizonAnalyzer(csv_file, batch_size=50)
                results = batch_analyzer.analyze_in_batches()
                batch_analyzer.save_final_results()
            else:
                print("❌ Análisis cancelado")
        
        elif choice == "3":
            try:
                limit = int(input("¿Cuántas acciones analizar? "))
                batch_size = int(input("¿Tamaño del lote? (recomendado 25-50): "))
                
                if limit > 0 and batch_size > 0:
                    print(f"\n🔍 Analizando {limit} acciones en lotes de {batch_size}")
                    
                    batch_analyzer = BatchTimeHorizonAnalyzer(csv_file, batch_size=batch_size)
                    # Modificar para analizar solo el número solicitado
                    analyzer = TimeHorizonAnalyzer(csv_file)
                    results = analyzer.analyze_all_stocks(limit=limit)
                    analyzer.print_summary()
                    analyzer.save_results(f'custom_analysis_{limit}_stocks.json')
                else:
                    print("❌ Valores inválidos")
            except ValueError:
                print("❌ Por favor ingresa números válidos")
        
        else:
            print("❌ Opción inválida")
    
    except KeyboardInterrupt:
        print("\n\n❌ Análisis interrumpido por el usuario")
    except Exception as e:
        print(f"\n❌ Error durante el análisis: {e}")

if __name__ == "__main__":
    main()
