import { useState } from "react";
import Navigation from "@/components/Navigation";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, AlertTriangle, Download, Bug, CheckCircle, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import diseaseImage from "@/assets/disease-detection.jpg";
import jsPDF from "jspdf";
// @ts-ignore
import html2pdf from "html2pdf.js";

const DiseaseDetection = () => {
  const { t } = useLanguage();
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detection, setDetection] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const url = import.meta.env.VITE_BACKEND_URL;

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileToSend(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileToSend) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", fileToSend);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${url}/disease/diagnose`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        body: formData,
      });
      const data = await response.json();
      console.log("API Response:", data);
      if (response.ok) {
        setDetection(data);
      } else {
        alert(data.error || "Failed to analyze image");
      }
    } catch (err: any) {
      alert(err.message || "Failed to analyze image. Please try again.");
    }
    setIsAnalyzing(false);
  };

  const capturePhoto = () => {
    // Simulate camera capture
    alert("Camera functionality would be implemented here for mobile devices");
  };

  const handleDownloadReport = () => {
    // Clone the report node and remove the buttons before exporting
    const reportElement = document.getElementById("treatment-report");
    if (!reportElement) return;

    // Clone the node to avoid mutating the visible DOM
    const clone = reportElement.cloneNode(true) as HTMLElement;
    // Remove any buttons inside the clone
    clone.querySelectorAll("button").forEach(btn => btn.remove());

    // Create a temporary container for html2pdf
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(clone);
    document.body.appendChild(tempDiv);

    html2pdf()
      .set({
        margin: 0.5,
        filename: "treatment-report.pdf",
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      })
      .from(clone)
      .save()
      .then(() => {
        document.body.removeChild(tempDiv);
      });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">{t('disease.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('disease.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5 text-primary" />
                {t('disease.upload')}
              </CardTitle>
              <CardDescription>
                {t('disease.title')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!uploadedImage && (
                <div className="grid grid-cols-1  gap-4">
                
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload">
                    <Button
                      variant="outline"
                      className="h-64 w-full flex-col space-y-2"
                      asChild
                    >
                      <div>
                        <Upload className="h-6 w-6" />
                        <span>{t('disease.upload')}</span>
                      </div>
                    </Button>
                  </label>
                </div>
              </div>
              )}
              

              {uploadedImage && (
                <div className="space-y-3">
                  <img
                    src={uploadedImage}
                    alt="Uploaded crop"
                    className="w-full h-48 object-cover rounded-lg border"
                  />
                  <p className="text-sm text-muted-foreground text-center">
                    {t('disease.uploadSuccess')}
                  </p>
                  <Button
                    variant="success"
                    className="w-full"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? t('disease.detecting') : t('disease.analyze')}
                  </Button>
                </div>
              )}

              
            </CardContent>
          </Card>

          {/* Detection Results */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-destructive" />
                {t('disease.diagnosis')}
              </CardTitle>
              <CardDescription>
                {t('disease.guide')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-medium">{t('disease.detecting')}</p>
                  <p className="text-xs text-muted-foreground">{t('disease.detecting')}</p>
                </div>
              ) : detection && detection.diagnosis ? (
                <>
                  {/* Check for valid disease image */}
                  {detection.diagnosis.isDiseaseImage === false && (
                    <>
                      {alert("Please upload a valid image")}
                    </>
                  )}
                  <div className="space-y-6" id="treatment-report">
                    {/* Disease Identification */}
                    <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-semibold text-destructive">{detection.diagnosis.disease}</h3>
                        <span className="text-sm font-medium bg-destructive/20 text-destructive px-2 py-1 rounded">
                          {detection.diagnosis.confidence}% {t('disease.confident')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('disease.detectedIn')}: {detection.diagnosis.cropType} • {t('disease.severity')}: {detection.diagnosis.severity}
                      </p>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        {t('disease.observedSymptoms')}
                      </h4>
                      <div className="space-y-2">
                        {Array.isArray(detection.diagnosis.symptoms) &&
                          detection.diagnosis.symptoms.map((symptom: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-warning rounded-full mt-2 flex-shrink-0" />
                              <p className="text-sm">{symptom}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Immediate Treatment */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        {t('disease.treatment')}
                      </h4>
                      <div className="space-y-2">
                        {Array.isArray(detection.diagnosis.treatment?.immediate) &&
                          detection.diagnosis.treatment.immediate.map((action: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{action}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Preventive Treatment */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        {t('disease.preventiveTips')}
                      </h4>
                      <div className="space-y-2">
                        {Array.isArray(detection.diagnosis.treatment?.preventive) &&
                          detection.diagnosis.treatment.preventive.map((tip: string, index: number) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                              <p className="text-sm">{tip}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Recommended Products */}
                    <div>
                      <h4 className="font-semibold mb-3">{t('disease.recommendedProducts')}</h4>
                      <div className="space-y-3">
                        {Array.isArray(detection.diagnosis.products) &&
                          detection.diagnosis.products.map((product: any, index: number) => (
                            <div key={index} className="p-3 bg-secondary rounded-lg">
                              <p className="font-medium text-sm">{product.name}</p>
                              <p className="text-xs text-muted-foreground">{t('disease.dosage')}: {product.dosage}</p>
                            </div>
                          ))}
                      </div>
                    </div>

                    {/* Nutrient Recommendations */}
                    {Array.isArray(detection.diagnosis.nutrientRecommendations) && detection.diagnosis.nutrientRecommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">{t('disease.nutrientRecommendations')}</h4>
                        <div className="flex flex-wrap gap-2">
                          {detection.diagnosis.nutrientRecommendations.map((nutrient: string, idx: number) => (
                            <span key={idx} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                              {nutrient}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pesticide Recommendations */}
                    {Array.isArray(detection.diagnosis.pesticideRecommendations) && detection.diagnosis.pesticideRecommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">{t('disease.pesticideRecommendations')}</h4>
                        <ul className="list-disc list-inside text-sm">
                          {detection.diagnosis.pesticideRecommendations.map((rec: string, idx: number) => (
                            <li key={idx}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recovery Timeline */}
                    <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium text-success">{t('disease.expectedRecovery')}</span>
                      </div>
                      <p className="text-sm">{detection.diagnosis.expectedRecovery}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleDownloadReport}
                      >
                        <Download className="h-4 w-4" />
                        {t('disease.treatmentReport')}
                      </Button>
                      
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <img
                    src={diseaseImage}
                    alt="Disease Detection"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">{t('disease.noImage')}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default DiseaseDetection;
