import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check, FileText } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/DashboardNav";

type ContentType = "email_campaign" | "landing_page" | "social_media" | "blog_post" | "product_launch" | "case_study" | "faq";

export default function ContentGenerator() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [type, setType] = useState<ContentType>("landing_page");
  const [topic, setTopic] = useState("");
  const [details, setDetails] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: history } = trpc.content.getHistory.useQuery({ type }, { enabled: !!user });

  const generateContent = trpc.content.generate.useMutation({
    onSuccess: data => {
      setGeneratedContent(data.content);
      toast.success("Content generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate content");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please provide a topic");
      return;
    }
    generateContent.mutate({ type, topic, details });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
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

  const contentTypeLabels: Record<ContentType, string> = {
    email_campaign: "Email Campaign (5-email sequence)",
    landing_page: "Landing Page Copy",
    social_media: "Social Media Calendar (7 days)",
    blog_post: "Blog Post",
    product_launch: "Product Launch Announcement",
    case_study: "Customer Case Study",
    faq: "FAQ Section",
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Content Generator</h1>
          </div>
          <p className="text-muted-foreground">Create professional content for any marketing need with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={type} onValueChange={value => setType(value as ContentType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Topic</Label>
                <Input
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  placeholder="What is this content about?"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Additional Details (Optional)</Label>
                <Textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Add any specific requirements, target audience, key points to include..."
                  className="min-h-[150px]"
                />
              </div>

              <Button type="submit" className="w-full" disabled={generateContent.isPending || !topic.trim()}>
                {generateContent.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </form>
          </Card>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Generated Content</h2>
                {generatedContent && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
              {generatedContent ? (
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{generatedContent}</Streamdown>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated content will appear here</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* History Section */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Content</h2>
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
            <div className="text-center py-8 text-muted-foreground">No content generated yet</div>
          )}
        </Card>
      </div>
    </div>
  );
}
