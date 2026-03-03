import React, { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext"; // changed import

const Projects = () => {
  const { t } = useLanguage(); // changed hook
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const url = import.meta.env.BACKEND_URL || "http://localhost:4000";

  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${url}/project/`, {
          headers: { Authorization: `Bearer ${token || ""}` }
        });
        const data = await res.json();
        setProjects(data.projects || []);
      } catch {
        setProjects([]);
      }
      setLoading(false);
    };
    fetchProjects();
  }, []);

  const renderBudget = (budget: any) => (
    <div className="grid grid-cols-2 gap-2 text-sm mb-2">
      {budget &&
        Object.entries(budget)
          .filter(([key]) => key !== "total")
          .map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="capitalize">{t(key)}</span>
            
            </div>
          ))}
      {budget && (
        <div className="flex justify-between font-bold border-t pt-2 col-span-2">
          <span>{t("Total")}</span>
          <span>{budget.total}</span>
        </div>
      )}
    </div>
  );

  const renderStep = (step: any, idx: number) => (
    <div key={idx} className="mb-4 p-3 border rounded-lg bg-muted">
      <div className="font-semibold mb-1">
        {t(step.stage)}{" "}
        <span className="text-xs text-muted-foreground">
          ({step.duration})
        </span>
      </div>
      {step.fertilizers && Array.isArray(step.fertilizers) && (
        <div className="mb-1">
          <span className="font-medium text-xs">{t("Fertilizers")}:</span>
          <ul className="list-disc list-inside ml-4">
            {step.fertilizers.map((f: any, i: number) => (
              <li key={i} className="text-xs">
                {f.name} - {f.dosage} ({t(f.applicationMethod)}, {f.timing})
              </li>
            ))}
          </ul>
        </div>
      )}
      <ul className="list-disc list-inside ml-4 text-sm">
        {step.tasks &&
          Array.isArray(step.tasks) &&
          step.tasks.map((task: string, i: number) => <li key={i}>{t(task)}</li>)}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">{t("Crop.Projects")}</h1>
        </div>
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="animate-spin h-5 w-5" /> {t("Loading projects...")}
          </div>
        ) : (
          <div className="space-y-6">
            {projects.length === 0 && (
              <div className="text-muted-foreground text-center">
                {t("No projects found.")}
              </div>
            )}
            {projects.map((project) => {
              const cropPlan = project.plan?.cropPlan;
              if (!cropPlan) return null;
              return (
                <Card
                  key={project._id}
                  className="animate-fade-in hover:shadow-medium transition-shadow"
                >
                  <CardHeader
                    className="cursor-pointer flex flex-row items-center justify-between"
                    onClick={() =>
                      setExpanded(expanded === project._id ? null : project._id)
                    }
                  >
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        {t(cropPlan.crop)}
                        <span className="text-base text-muted-foreground">
                          ({t(cropPlan.variety)})
                        </span>
                      </CardTitle>
                      <CardDescription>
                        <span className="font-medium">{t("Duration")}:</span>{" "}
                        {cropPlan.totalDuration}
                        <span className="mx-2">|</span>
                        <span className="font-medium">{t("Budget")}:</span>{" "}
                        {cropPlan.budget?.total}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="icon">
                      {expanded === project._id ? <ChevronUp /> : <ChevronDown />}
                    </Button>
                  </CardHeader>
                  {expanded === project._id && (
                    <CardContent>
                      <div className="mb-4">
                        <div className="font-semibold mb-1">{t("Budget")}</div>
                        {renderBudget(cropPlan.budget)}
                      </div>
                      <div className="mb-4">
                        <div className="font-semibold mb-1">{t("Steps")}</div>
                        {Array.isArray(cropPlan.steps) &&
                          cropPlan.steps.map(renderStep)}
                      </div>
                      <div className="mb-4">
                        <div className="font-semibold mb-1">
                          {t("Organic Amendments")}
                        </div>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          {Array.isArray(cropPlan.organicAmendments) &&
                            cropPlan.organicAmendments.map(
                              (item: string, i: number) => (
                                <li key={i}>{t(item)}</li>
                              )
                            )}
                        </ul>
                      </div>
                      <div className="mb-4">
                        <div className="font-semibold mb-1">{t("Micronutrients")}</div>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          {Array.isArray(cropPlan.micronutrients) &&
                            cropPlan.micronutrients.map(
                              (item: string, i: number) => (
                                <li key={i}>{t(item)}</li>
                              )
                            )}
                        </ul>
                      </div>
                      <div className="mb-4">
                        <div className="font-semibold mb-1">
                          {t("Safety & Environmental Tips")}
                        </div>
                        <ul className="list-disc list-inside ml-4 text-sm">
                          {Array.isArray(cropPlan.safetyAndEnvironmentalTips) &&
                            cropPlan.safetyAndEnvironmentalTips.map(
                              (item: string, i: number) => (
                                <li key={i}>{t(item)}</li>
                              )
                            )}
                        </ul>
                      </div>
                      <div className="mb-4">
                        <div className="font-semibold mb-1">{t("Notes")}</div>
                        <div className="text-sm">{t(cropPlan.notes)}</div>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};


export default Projects;
