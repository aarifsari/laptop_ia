import pandas as pd
import numpy as np
from catboost import CatBoostRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import os

def main():
    print("[v0] Yeni CatBoost Modeli Eğitimi Başlıyor...")
    
    # Veri seti yolu
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    csv_path = os.path.join(base_dir, "En_Iyi_Model_ve_Veri", "en_iyi_dataset_passmarkli.csv")
    
    if not os.path.exists(csv_path):
        print(f"HATA: Veri seti bulunamadı -> {csv_path}")
        return

    # Veriyi yükle
    df = pd.read_csv(csv_path)
    
    # Kullanılacak özellikler (Frontend ile tam uyumlu)
    features = [
        "GPU_PassMark_G3D", 
        "CPU_PassMark", 
        "RAM Boyutu", 
        "Ekran Boyutu", 
        "Çözünürlük X", 
        "Çözünürlük Y", 
        "Yenileme Hz", 
        "Marka", 
        "Dokunmatik Ekran", 
        "GENEL BİLGİLER - Ürün Amacı"
    ]
    target = "price"

    # Gerekli kolonların olduğundan emin ol
    for col in features + [target]:
        if col not in df.columns:
            print(f"HATA: {col} kolonu veri setinde yok!")
            return

    # Sadece ilgili özellikleri al ve eksik verileri temizle
    data = df[features + [target]].copy()
    data = data.dropna(subset=[target])
    
    # Eksik sayısal verileri ortanca ile doldur
    numeric_features = ["GPU_PassMark_G3D", "CPU_PassMark", "RAM Boyutu", "Ekran Boyutu", "Çözünürlük X", "Çözünürlük Y", "Yenileme Hz"]
    for col in numeric_features:
        data[col] = pd.to_numeric(data[col], errors='coerce')
        data[col] = data[col].fillna(data[col].median())
        
    # Kategorik verilerdeki eksikleri doldur ve string'e çevir
    cat_features_indices = []
    categorical_cols = ["Marka", "GENEL BİLGİLER - Ürün Amacı", "Dokunmatik Ekran"]
    
    for i, col in enumerate(features):
        if col in categorical_cols:
            cat_features_indices.append(i)
            data[col] = data[col].fillna("Bilinmiyor").astype(str)

    X = data[features]
    y = data[target]

    print(f"Toplam Veri Sayısı: {len(data)}")

    # Eğitim ve test seti ayır
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

    # CatBoost modelini tanımla
    model = CatBoostRegressor(
        iterations=1000,
        learning_rate=0.05,
        depth=8,
        eval_metric='MAE',
        random_seed=42,
        cat_features=cat_features_indices,
        verbose=100
    )

    # Eğit
    model.fit(
        X_train, y_train,
        eval_set=(X_test, y_test),
        early_stopping_rounds=100
    )

    # Performans
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)

    print("\n[v0] Model Performansı:")
    print(f"Mean Absolute Error (MAE): {mae:.2f} TL")
    print(f"R² Score: {r2:.4f}")

    # Modeli kaydet
    model_save_path = os.path.join(base_dir, "final_catboost_model.cbm")
    model.save_model(model_save_path)
    print(f"\n[v0] Model başarıyla kaydedildi: {model_save_path}")

if __name__ == "__main__":
    main()
