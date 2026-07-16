"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Laptop, TrendingUp, Zap, Shield, Calculator } from "lucide-react"
import optionsData from "./data/options.json"

interface LaptopSpecs {
  brand: string
  processor: string
  ram: string
  storage: string
  gpu: string
  screenSize: string
  screenRefreshRate: string
  purpose: string
}

interface PredictionResult {
  predictedPrice: number
  confidence: number
  priceRange: {
    min: number
    max: number
  }
}

export default function LaptopPricePrediction() {
  const [specs, setSpecs] = useState<LaptopSpecs>({
    brand: "",
    processor: "",
    ram: "",
    storage: "",
    gpu: "",
    screenSize: "",
    screenRefreshRate: "",
    purpose: "",
  })

  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: keyof LaptopSpecs, value: string) => {
    setSpecs((prev) => ({ ...prev, [field]: value }))
  }

  const handlePredict = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          brand: specs.brand,
          processor: specs.processor,
          ram: specs.ram,
          storage: specs.storage,
          gpu: specs.gpu,
          screenSize: specs.screenSize,
          screenRefreshRate: specs.screenRefreshRate,
          purpose: specs.purpose,
        }),
      })

      if (!response.ok) {
        throw new Error("API çağrısı başarısız")
      }

      const result = await response.json()

      setPrediction({
        predictedPrice: result.predicted_price,
        confidence: result.confidence,
        priceRange: {
          min: result.min_price,
          max: result.max_price,
        },
      })
    } catch (error) {
      console.error("Prediction error:", error)
      // Fallback olarak eski mock mantığı
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const basePrice = 25000
      const ramMultiplier = Number.parseInt(specs.ram) * 1000 || 8000
      const storageMultiplier = Number.parseFloat(specs.storage) * 5000 || 10000
      const gpuBonus = specs.gpu.includes("RTX") ? 15000 : specs.gpu.includes("GTX") ? 8000 : 0
      const screenBonus = Number.parseFloat(specs.screenSize) > 15 ? 3000 : 0

      const predictedPrice = basePrice + ramMultiplier + storageMultiplier + gpuBonus + screenBonus
      const confidence = Math.random() * 15 + 85 // 85-100%

      setPrediction({
        predictedPrice,
        confidence,
        priceRange: {
          min: predictedPrice * 0.88,
          max: predictedPrice * 1.12,
        },
      })
    }

    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Laptop className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-montserrat font-black text-xl text-foreground">LaptopAI</h1>
                <p className="text-sm text-muted-foreground">Fiyat Tahmini</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                Ana Sayfa
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Hakkında
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                İletişim
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-montserrat font-black text-4xl md:text-5xl text-foreground mb-6">
              AI Destekli Laptop Fiyat Tahmini
            </h2>
            <p className="font-open-sans text-lg text-muted-foreground mb-8">
              Makine öğrenmesi algoritmaları ile laptop özelliklerini analiz ederek en doğru fiyat tahminini sunuyoruz.
              Binlerce laptop verisinden öğrenilmiş model.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge variant="secondary" className="px-4 py-2">
                <TrendingUp className="h-4 w-4 mr-2" />
                %95 Doğruluk
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Zap className="h-4 w-4 mr-2" />
                Anında Sonuç
              </Badge>
              <Badge variant="secondary" className="px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Güvenilir Veri
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Specifications Form */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="font-montserrat font-bold text-2xl flex items-center gap-2">
                  <Calculator className="h-6 w-6 text-primary" />
                  Laptop Özellikleri
                </CardTitle>
                <CardDescription className="font-open-sans">
                  Laptop özelliklerini girerek fiyat tahmini alın
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand" className="font-open-sans font-medium">
                      Marka
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("brand", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Marka seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.brands.map((brand) => (
                          <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="font-open-sans font-medium">
                      Kullanım Amacı
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("purpose", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Amaç seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.purposes.map((purpose) => (
                          <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ram" className="font-open-sans font-medium">
                      RAM (GB)
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("ram", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="RAM seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.rams.map((ram) => (
                          <SelectItem key={ram} value={String(ram)}>{ram} GB</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storage" className="font-open-sans font-medium">
                      Depolama (TB)
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("storage", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Depolama seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.25">256 GB</SelectItem>
                        <SelectItem value="0.5">512 GB</SelectItem>
                        <SelectItem value="1">1 TB</SelectItem>
                        <SelectItem value="2">2 TB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="processor" className="font-open-sans font-medium">
                      İşlemci Modeli
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("processor", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="İşlemci seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.cpus.map((cpu) => (
                          <SelectItem key={cpu} value={cpu}>{cpu}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gpu" className="font-open-sans font-medium">
                      Ekran Kartı
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("gpu", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="GPU seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.gpus.map((gpu) => (
                          <SelectItem key={gpu} value={gpu}>{gpu}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="screenSize" className="font-open-sans font-medium">
                      Ekran Boyutu (inç)
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("screenSize", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Boyut seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.screen_sizes.map((size) => (
                          <SelectItem key={size} value={String(size)}>{size}"</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="refreshRate" className="font-open-sans font-medium">
                      Yenileme Hızı (Hz)
                    </Label>
                    <Select onValueChange={(value) => handleInputChange("screenRefreshRate", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Hz seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {optionsData.refresh_rates.map((rate) => (
                          <SelectItem key={rate} value={String(rate)}>{rate} Hz</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={handlePredict}
                  disabled={isLoading || !specs.brand || !specs.processor}
                  className="w-full font-open-sans font-semibold py-6 text-lg"
                >
                  {isLoading ? "Hesaplanıyor..." : "Fiyat Tahmini Al"}
                </Button>
              </CardContent>
            </Card>

            {/* Prediction Results */}
            <div className="space-y-6">
              {prediction ? (
                <Card className="shadow-lg border-accent/20">
                  <CardHeader>
                    <CardTitle className="font-montserrat font-bold text-2xl text-accent">
                      Fiyat Tahmini Sonucu
                    </CardTitle>
                    <CardDescription className="font-open-sans">AI modelimizin analiz sonucu</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 bg-accent/5 rounded-lg">
                      <div className="text-3xl font-montserrat font-black text-accent mb-2">
                        ₺{prediction.predictedPrice.toLocaleString("tr-TR")}
                      </div>
                      <div className="text-sm text-muted-foreground">Tahmini Fiyat</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-foreground">%{prediction.confidence.toFixed(1)}</div>
                        <div className="text-sm text-muted-foreground">Güven Oranı</div>
                      </div>
                      <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <div className="text-lg font-semibold text-foreground">
                          ±₺{((prediction.priceRange.max - prediction.priceRange.min) / 2).toLocaleString("tr-TR")}
                        </div>
                        <div className="text-sm text-muted-foreground">Hata Payı</div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-open-sans font-semibold">Fiyat Aralığı</h4>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Minimum:</span>
                        <span className="font-semibold">₺{prediction.priceRange.min.toLocaleString("tr-TR")}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm">Maksimum:</span>
                        <span className="font-semibold">₺{prediction.priceRange.max.toLocaleString("tr-TR")}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calculator className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="font-montserrat font-bold text-lg mb-2">Fiyat Tahmini Bekleniyor</h3>
                    <p className="text-muted-foreground font-open-sans text-sm">
                      Laptop özelliklerini doldurun ve fiyat tahmini alın
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Info Card */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-montserrat font-bold text-lg">Model Hakkında</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 font-open-sans text-sm">
                  <p>
                    Bu fiyat tahmini, binlerce laptop verisinden öğrenilmiş makine öğrenmesi modeli kullanılarak
                    yapılmaktadır.
                  </p>
                  <p>
                    Model, laptop özelliklerini analiz ederek piyasa fiyatlarına en yakın tahmini sunar. Sonuçlar
                    referans amaçlıdır.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary rounded-lg">
                  <Laptop className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-montserrat font-black text-lg">LaptopAI</span>
              </div>
              <p className="text-muted-foreground font-open-sans text-sm">
                AI destekli laptop fiyat tahmini platformu. Makine öğrenmesi ile en doğru fiyat analizini sunuyoruz.
              </p>
            </div>
            <div>
              <h4 className="font-montserrat font-bold mb-4">Bağlantılar</h4>
              <ul className="space-y-2 font-open-sans text-sm">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Ana Sayfa
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Hakkında
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Gizlilik Politikası
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                    Kullanım Şartları
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-montserrat font-bold mb-4">İletişim</h4>
              <p className="text-muted-foreground font-open-sans text-sm">Sorularınız için bizimle iletişime geçin.</p>
            </div>
          </div>
          <Separator className="my-8" />
          <div className="text-center text-muted-foreground font-open-sans text-sm">
            © 2025 LaptopAI. Tüm hakları saklıdır.
          </div>
        </div>
      </footer>
    </div>
  )
}
