import pandas as pd
import json
import os

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dataset_path = os.path.join(base_dir, 'En_Iyi_Model_ve_Veri', 'en_iyi_dataset_passmarkli.csv')
    
    if not os.path.exists(dataset_path):
        print(f"Dataset bulunamadi: {dataset_path}")
        return

    df = pd.read_csv(dataset_path)

    # NaN veya boş değerleri filtreleyip temiz bir liste dönen yardımcı fonksiyon
    def safe_unique(col_name):
        items = df[col_name].dropna().unique()
        return sorted([str(x) for x in items if str(x).strip() != '' and str(x) != 'nan'])

    # CPU Eşleştirmeleri (String CPU Adı -> Float PassMark)
    cpu_df = df[['CPU Modeli', 'CPU_PassMark']].dropna().drop_duplicates(subset=['CPU Modeli'])
    cpu_map = {str(row['CPU Modeli']): float(row['CPU_PassMark']) for _, row in cpu_df.iterrows()}

    # GPU Eşleştirmeleri (String GPU Adı -> Float PassMark)
    gpu_df = df[['GPU Modeli', 'GPU_PassMark_G3D']].dropna().drop_duplicates(subset=['GPU Modeli'])
    gpu_map = {str(row['GPU Modeli']): float(row['GPU_PassMark_G3D']) for _, row in gpu_df.iterrows()}

    # Frontend için gerekli olan JSON (opsiyonlar)
    frontend_options = {
        'brands': safe_unique('Marka'),
        'purposes': safe_unique('GENEL BİLGİLER - Ürün Amacı'),
        'cpus': safe_unique('CPU Modeli'),
        'gpus': safe_unique('GPU Modeli'),
        'rams': sorted(list(df['RAM Boyutu'].dropna().unique())),
        'screen_sizes': sorted(list(df['Ekran Boyutu'].dropna().unique())),
        'refresh_rates': sorted(list(df['Yenileme Hz'].dropna().unique()))
    }

    # Çıktı yolları
    data_dir = os.path.join(base_dir, 'app', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    options_path = os.path.join(data_dir, 'options.json')
    passmark_map_path = os.path.join(base_dir, 'scripts', 'passmark_map.json')

    # Frontend JSON kaydet
    with open(options_path, 'w', encoding='utf-8') as f:
        json.dump(frontend_options, f, ensure_ascii=False, indent=2)

    # Backend JSON kaydet
    backend_map = {
        'cpu_map': cpu_map,
        'gpu_map': gpu_map
    }
    with open(passmark_map_path, 'w', encoding='utf-8') as f:
        json.dump(backend_map, f, ensure_ascii=False, indent=2)

    print(f"Basariyla olusturuldu: {options_path}")
    print(f"Basariyla olusturuldu: {passmark_map_path}")

if __name__ == "__main__":
    main()
