import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useLocation } from "wouter";

type AnalysisType = "sales" | "customer_behavior" | "operational_efficiency" | "roi" | "competitive" | "growth";

export default function DataAnalysis() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [type, setType] = useState<AnalysisType>("sales");
  const [data, setData] = useState("");
  const [context, setContext] = useState("");
  const [analysisResult, setAnalysisResult] = useState<{ insights: string; recommendations: string } | null>(null);

  const { data: history } = trpc.analysis.getHistory.useQuery({ type }, { enabled: !!user });

  const analyzeData = trpc.analysis.analyze.useMutation({
    onSuccess: data => {
      setAnalysisResult(data);
      toast.success("Analysis complete!");
    },
    onError: () => {
      toast.error("Failed to analyze data");
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.trim()) {
      toast.error("Please provide data to analyze");
      return;
    }
    analyzeData.mutate({ type, data, context });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    setLocation("/");
    return null;
  }

  const analysisTypeLabels: Record<AnalysisType, string> = {
    sales: "Sales Analysis",
    customer_behavior: "Customer Behavior Segmentation",
    operational_efficiency: "Operational Efficiency",
    roi: "ROI Calculation",
    competitive: "Competitive Analysis",
    growth: "Growth Recommendations",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Data Analysis</h1>
          </div>
          <p className="text-muted-foreground">Get AI-powered insights and recommendations from your business data</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6">
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-2">
                <Label>Analysis Type</Label>
                <Select value={type} onValueChange={value => setType(value as AnalysisType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(analysisTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Data to Analyze</Label>
                <Textarea
                  value={data}
                  onChange={e => setData(e.target.value)}
                  placeholder="Paste your data here (CSV, JSON, or plain text)..."
                  className="min-h-[200px] font-mono text-sm"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Context (Optional)</Label>
                <Textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Provide any additional context about your data or specific questions you want answered..."
                  className="min-h-[100px]"
                />
              </div>

              <Button type="submit" className="w-full" disabled={analyzeData.isPending || !data.trim()}>
                {analyzeData.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Analyze Data"
                )}
              </Button>
            </form>
          </Card>

          {/* Results Section */}
          <div className="space-y-6">
            {analysisResult ? (
              <>
                <Card className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Analysis Results</h2>
                  </div>
                  <div className="prose prose-invert max-w-none">
                    <Streamdown>{analysisResult.insights}</Streamdown>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="p-6">
                <div className="text-center py-12 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your analysis results will appear here</p>
                  <p className="text-sm mt-2">Paste your data and click "Analyze Data" to get started</p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* History Section */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          {history && history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 5).map(item => (
                <Card key={item.id} className="p-4 bg-card/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium">{analysisTypeLabels[item.analysisType]}</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.insights}</div>
                  {item.recommendations && (
                    <div className="text-xs text-primary">
                      <strong>Recommendations:</strong> {item.recommendations.substring(0, 100)}...
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No analyses performed yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
