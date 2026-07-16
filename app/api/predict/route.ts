import { type NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const specs = await request.json();

    // Mapping frontend specs to Python model expected features
    const modelSpecs = {
      processor: specs.processor,
      gpu: specs.gpu,
      ram: Number(specs.ram) || 16.0,
      screenSize: Number(specs.screenSize) || 15.6,
      resolutionX: 1920, // Default
      resolutionY: 1080,
      screenRefreshRate: Number(specs.screenRefreshRate) || 60.0,
      brand: specs.brand || "Lenovo",
      purpose: specs.purpose || "Genel Kullanım"
    };

    // Python script path
    const scriptPath = path.join(process.cwd(), "scripts", "predict_final.py");
    
    // Execute Python script
    const jsonArgs = JSON.stringify(modelSpecs);
    // Escape quotes for command line
    const escapedArgs = jsonArgs.replace(/"/g, '\\"');
    const command = `python "${scriptPath}" "${escapedArgs}"`;

    try {
      const { stdout, stderr } = await execAsync(command);
      
      if (stderr && !stdout) {
        console.error("Python script stderr:", stderr);
        return NextResponse.json({ error: "Fiyat tahmini yapılırken hata oluştu" }, { status: 500 });
      }

      // Parse JSON from python script output
      const prediction = JSON.parse(stdout.trim());
      
      if (prediction.error) {
         console.error("Python model error:", prediction.error);
         return NextResponse.json({ error: prediction.error }, { status: 500 });
      }

      return NextResponse.json(prediction);
    } catch (execError: any) {
      console.error("Exec error:", execError);
      
      // Fallback for missing model files
      if (execError.stdout && execError.stdout.includes("Model dosyaları bulunamadı")) {
         return NextResponse.json({ error: "Model henüz eğitilmedi. Lütfen önce 'python son_hazirlik.py' komutunu çalıştırarak modeli eğitin." }, { status: 500 });
      }
      
      return NextResponse.json({ error: "Python scripti çalıştırılamadı." }, { status: 500 });
    }
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json({ error: "İstek işlenirken hata oluştu" }, { status: 500 });
  }
}
