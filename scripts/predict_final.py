import sys
import json
import os
import numpy as np
import pandas as pd

def main():
    try:
        from catboost import CatBoostRegressor
        
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        model_path = os.path.join(base_dir, 'final_catboost_model.cbm')
        map_path = os.path.join(base_dir, 'scripts', 'passmark_map.json')
        
        if not os.path.exists(model_path):
            print(json.dumps({"error": "Model dosyaları bulunamadı. Lütfen önce modeli eğitin."}))
            return

        model = CatBoostRegressor()
        model.load_model(model_path)

        # Passmark map'i yükle
        cpu_map = {}
        gpu_map = {}
        if os.path.exists(map_path):
            with open(map_path, 'r', encoding='utf-8') as f:
                maps = json.load(f)
                cpu_map = maps.get('cpu_map', {})
                gpu_map = maps.get('gpu_map', {})

        if len(sys.argv) > 1:
            specs = json.loads(sys.argv[1])
        else:
            print(json.dumps({"error": "Parametre eksik"}))
            return
        
        # Gelen orijinal string işlemci ve ekran kartı
        raw_cpu = specs.get("processor", "")
        raw_gpu = specs.get("gpu", "")
        
        # Eğer PassMark skorunu JSON'dan bulamazsak ortalama değer ata
        cpu_passmark = float(cpu_map.get(raw_cpu, 15000.0))
        gpu_passmark = float(gpu_map.get(raw_gpu, 8000.0))

        purpose_str = str(specs.get("purpose", "Genel Kullanım"))
        brand_str = str(specs.get("brand", "Lenovo"))

        features_dict = {
            "GPU_PassMark_G3D": gpu_passmark,
            "CPU_PassMark": cpu_passmark,
            "RAM Boyutu": float(specs.get("ram", 16.0)),
            "Ekran Boyutu": float(specs.get("screenSize", 15.6)),
            "Çözünürlük X": float(specs.get("resolutionX", 1920.0)),
            "Çözünürlük Y": float(specs.get("resolutionY", 1080.0)),
            "Yenileme Hz": float(specs.get("screenRefreshRate", 60.0)),
            "Marka": brand_str,
            "Dokunmatik Ekran": "False",
            "GENEL BİLGİLER - Ürün Amacı": purpose_str
        }

        features_df = pd.DataFrame([features_dict])

        predicted_price = float(model.predict(features_df)[0])
        predicted_price = max(1000.0, predicted_price)

        confidence = min(95.0, 75.0 + (predicted_price / 10000.0))
        
        margin = predicted_price * 0.12
        min_price = predicted_price - margin
        max_price = predicted_price + margin

        result = {
            "predicted_price": round(predicted_price, 2),
            "confidence": round(confidence, 1),
            "min_price": round(min_price, 2),
            "max_price": round(max_price, 2)
        }

        print(json.dumps(result))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()
