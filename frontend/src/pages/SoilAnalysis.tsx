import { useState } from "react";
import Navigation from "@/components/Navigation";
import VoiceInput from "@/components/VoiceInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Download, Sprout, AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import soilImage from "@/assets/soil-analysis.jpg";
import { toast } from "@/components/ui/use-toast"; // adjust import if needed

const SoilAnalysis = () => {
  const { t } = useLanguage();
  const url = import.meta.env.VITE_BACKEND_URL;
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [fileToSend, setFileToSend] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setFileToSend(file);
    }
  };

  const handleAnalyze = async () => {
    if (!fileToSend) return;
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", fileToSend);

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${url}/soil/analyze`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token || ""}`,
        },
        body: formData,
      });
      const data = await response.json();
      console.log("Analysis response:", data);
      if (response.ok) {
        setAnalysis(data);
      } else {
        toast({
          variant: "destructive",
          title: data.error || "Failed to analyze file"
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: err.message || "Failed to analyze file. Please try again."
      });
    }
    setIsAnalyzing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">{t('soil.title')}</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('soil.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                {t('soil.upload')}
              </CardTitle>
              <CardDescription>
                {t('soil.title')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                  id="soil-upload"
                />
                <label htmlFor="soil-upload" className="cursor-pointer">
                  <div className="space-y-3">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                    <div>
                      <p className="text-sm font-medium">{t('soil.uploadPrompt')}</p>

                    </div>
                  </div>
                </label>
              </div>

              {uploadedFile && (
                <div className="p-4 bg-secondary rounded-lg">
                  <p className="text-sm font-medium">{t('soil.uploadedFile')} : {uploadedFile.name}</p>
                  <p className="text-xs text-muted-foreground">

                  </p>
                  <Button
                    variant="success"
                    className="mt-4"
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? t('soil.analyzing') : t('soil.analyze')}
                  </Button>
                </div>
              )}


            </CardContent>
          </Card>

          {/* Analysis Results */}
          <Card className="animate-slide-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="h-5 w-5 text-success" />
                {t('soil.recommendations')}
              </CardTitle>
              <CardDescription>
                {t('soil.aiAnalysis')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzing ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-sm font-medium">{t('soil.analyzing')}</p>
                 
                </div>
              ) : analysis && analysis.soilReport ? (
                <>
                  {/* Check for valid soil report */}
                  {analysis.soilReport.isSoilReport === false && (
                    <>
                      {toast({
                        variant: "destructive",
                        title: "Please upload a valid soil report"
                      })}
                    </>
                  )}
                  <div className="space-y-6">
                    {/* Soil Report Summary */}
                    <div className="p-4 bg-primary/10 rounded-lg">
                      <div className="font-semibold mb-2">{t('soil.reportSummary') || "Report Summary"}</div>
                      <div className="text-base">{analysis.soilReport.summary}</div>
                    </div>

                    {/* Soil Properties */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-muted-foreground">{t('soil.soilType') || "Soil Type"}</div>
                        <div className="font-medium">{analysis.soilReport.soilType}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t('soil.PH') || "pH"}</div>
                        <div className="font-medium">{analysis.soilReport.pH}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t('soil.organicMatter') || "Organic Matter"}</div>
                        <div className="font-medium">{analysis.soilReport.organicMatter}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground">{t('soil.moisture') || "Moisture"}</div>
                        <div className="font-medium">{analysis.soilReport.moisture}</div>
                      </div>
                    </div>

                    {/* Nutrients */}
                    <div>
                      <div className="font-semibold mb-1">{t('soil.nutrients') || "Nutrients"}</div>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-secondary px-2 py-1 rounded text-xs">N: {analysis.soilReport.nutrients?.N}</span>
                        <span className="bg-secondary px-2 py-1 rounded text-xs">P: {analysis.soilReport.nutrients?.P}</span>
                        <span className="bg-secondary px-2 py-1 rounded text-xs">K: {analysis.soilReport.nutrients?.K}</span>
                        {Array.isArray(analysis.soilReport.nutrients?.micronutrients) && analysis.soilReport.nutrients.micronutrients.length > 0 && (
                          <span className="bg-secondary px-2 py-1 rounded text-xs">
                            {t('soil.micronutrients') || "Micronutrients"}: {analysis.soilReport.nutrients.micronutrients.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Heavy Metals */}
                    <div>
                      <div className="font-semibold mb-1">{t('soil.heavyMetals') || "Heavy Metals"}</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(analysis.soilReport.heavyMetals || {}).map(([metal, value]: [string, any]) => (
                          <span key={metal} className="bg-destructive/10 px-2 py-1 rounded text-xs">
                            {metal}: {typeof value === "object" && value !== null ? Object.values(value).join(', ') : String(value)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Issues */}
                    {Array.isArray(analysis.soilReport.issues) && analysis.soilReport.issues.length > 0 && (
                      <div>
                        <div className="font-semibold mb-1">{t('soil.issues') || "Issues"}</div>
                        <ul className="list-disc list-inside text-sm">
                          {analysis.soilReport.issues.map((issue: string, idx: number) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Recommendations */}
                    <div>
                      <h4 className="font-semibold mb-2">{t('soil.recommendations') || "Recommendations"}</h4>
                      <ul className="list-disc list-inside text-sm space-y-1">
                        {Array.isArray(analysis.solution?.improvementTips) &&
                          analysis.solution.improvementTips.map((tip: string, idx: number) => (
                            <li key={idx}>{tip}</li>
                          ))}
                      </ul>
                    </div>

                    {/* Suitable Crops */}
                    <div>
                      <h4 className="font-semibold mb-2">{t('soil.suitableCrops') || "Suitable Crops"}</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(analysis.solution?.recommendedCrops) &&
                          analysis.solution.recommendedCrops.map((crop: string) => (
                            <span
                              key={crop}
                              className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                            >
                              {crop}
                            </span>
                          ))}
                      </div>
                    </div>
                    {/* Create Project Button */}
                    <div>
                      <Button
                        className="mt-4"
                        onClick={async () => {
                          setIsCreatingProject(true);
                          const token = localStorage.getItem("token");
                          try {
                            const res = await fetch(`${import.meta.env.BACKEND_URL}/project/create`, {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${token || ""}`,
                              },
                              body: JSON.stringify({
                                report: analysis
                              }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              toast({
                                title: t("auth.signupSuccess") || "Signup successful!",
                                description: "Signup successful",
                                className: "bg-green-500 text-white",
                              });
                            } else {
                              toast({
                                variant: "destructive",
                                title: data.error || "Failed to create project"
                              });
                            }
                          } catch (err: any) {
                            toast({
                              variant: "destructive",
                              title: err.message || "Failed to create project"
                            });
                          }
                          setIsCreatingProject(false);
                        }}
                        disabled={isCreatingProject}
                      >
                        {isCreatingProject ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                            </svg>
                            {t('common.projectCreating') || "Creating project..."}
                          </span>
                        ) : (
                          t('soil.createProject')
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <img
                    src={soilImage}
                    alt="Soil Analysis"
                    className="w-32 h-32 object-cover rounded-lg mx-auto mb-4 opacity-50"
                  />
                  <p className="text-muted-foreground">{t('soil.noFile')}</p>
                </div>
              )}
              {analysis && analysis.error && (
                <div className="text-center py-8 text-destructive">
                  {analysis.error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};


export default SoilAnalysis;
