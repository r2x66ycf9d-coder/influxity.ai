import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Loader2, Copy, Check, Mail } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/DashboardNav";

type EmailType = "sales" | "support" | "marketing" | "followup";
type Tone = "professional" | "friendly" | "casual";

export default function EmailGenerator() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [type, setType] = useState<EmailType>("sales");
  const [tone, setTone] = useState<Tone>("professional");
  const [context, setContext] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [copied, setCopied] = useState(false);

  const { data: history } = trpc.email.getHistory.useQuery({ type }, { enabled: !!user });

  const generateEmail = trpc.email.generate.useMutation({
    onSuccess: data => {
      setGeneratedEmail(data.content);
      toast.success("Email generated successfully!");
    },
    onError: () => {
      toast.error("Failed to generate email");
    },
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context.trim()) {
      toast.error("Please provide context for the email");
      return;
    }
    generateEmail.mutate({ type, context, tone });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedEmail);
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

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6">
      <div className="container max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Email Generator</h1>
          </div>
          <p className="text-muted-foreground">Generate professional emails for any purpose with AI</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="p-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label>Email Type</Label>
                <Select value={type} onValueChange={value => setType(value as EmailType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Email</SelectItem>
                    <SelectItem value="support">Support Email</SelectItem>
                    <SelectItem value="marketing">Marketing Email</SelectItem>
                    <SelectItem value="followup">Follow-up Email</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={value => setTone(value as Tone)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Context</Label>
                <Textarea
                  value={context}
                  onChange={e => setContext(e.target.value)}
                  placeholder="Describe what the email should be about..."
                  className="min-h-[200px]"
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={generateEmail.isPending || !context.trim()}>
                {generateEmail.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Email"
                )}
              </Button>
            </form>
          </Card>

          {/* Output Section */}
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Generated Email</h2>
                {generatedEmail && (
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                )}
              </div>
              {generatedEmail ? (
                <div className="prose prose-invert max-w-none">
                  <Streamdown>{generatedEmail}</Streamdown>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Your generated email will appear here</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* History Section */}
        <Card className="mt-6 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Emails</h2>
          <Tabs value={type} onValueChange={value => setType(value as EmailType)}>
            <TabsList>
              <TabsTrigger value="sales">Sales</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
              <TabsTrigger value="marketing">Marketing</TabsTrigger>
              <TabsTrigger value="followup">Follow-up</TabsTrigger>
            </TabsList>
            <TabsContent value={type} className="mt-4">
              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.slice(0, 5).map(item => (
                    <Card key={item.id} className="p-4 bg-card/50">
                      <div className="text-sm text-muted-foreground mb-2">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-medium mb-2">{item.prompt}</div>
                      <div className="text-sm text-muted-foreground line-clamp-2">{item.content}</div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No emails generated yet</div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      </div>
    </DashboardLayout>
  );
}
