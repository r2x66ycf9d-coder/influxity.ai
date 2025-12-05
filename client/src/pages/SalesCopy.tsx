import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check, Sparkles } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useLocation } from "wouter";

type CopyType = "headline" | "cta" | "description" | "product";

export default function SalesCopy() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [type, setType] = useState<CopyType>("headline");
  const [product, setProduct] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [generatedCopy, setGeneratedCopy] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: history } = trpc.salesCopy.getHistory.useQuery(undefined, { enabled: !!user });

  const generateCopy = trpc.salesCopy.generate.useMutation({
    onSuccess: data => {
      setGeneratedCopy(data.content);
      toast.success("Sales copy generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate sales copy");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product.trim()) {
      toast.error("Please describe your product");
      return;
    }
    generateCopy.mutate({ type, product, targetAudience });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
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

  const copyTypeLabels: Record<CopyType, string> = {
    headline: "Headlines (5 variations)",
    cta: "Call-to-Action Phrases (5 variations)",
    description: "Product Description",
    product: "Complete Product Copy",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Sales Copy Generator</h1>
          </div>
          <p className="text-muted-foreground">Create compelling, conversion-focused copy that drives sales</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label>Copy Type</Label>
                <Select value={type} onValueChange={value => setType(value as CopyType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(copyTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product/Service</Label>
                <Input
                  value={product}
                  onChange={e => setProduct(e.target.value)}
                  placeholder="Describe your product or service..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Target Audience (Optional)</Label>
                <Input
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  placeholder="Who is this for? (e.g., small business owners, millennials...)"
                />
              </div>

              <Button type="submit" className="w-full" disabled={generateCopy.isPending || !product.trim()}>
                {generateCopy.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Sales Copy"
                )}
              </Button>
            </form>
          </Card>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Generated Copy</h2>
                {generatedCopy && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
              {generatedCopy ? (
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{generatedCopy}</Streamdown>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated sales copy will appear here</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* History Section */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Sales Copy</h2>
          {history && history.length > 0 ? (
            <div className="space-y-4">
              {history.slice(0, 5).map(item => (
                <Card key={item.id} className="p-4 bg-card/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-sm font-medium">{item.prompt}</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-3">{item.content}</div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No sales copy generated yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
