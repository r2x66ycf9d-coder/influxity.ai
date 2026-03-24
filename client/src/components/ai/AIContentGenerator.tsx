import { useState } from 'react';
import { Wand2, Copy, Download, RefreshCw, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { trackAIFeature } from '@/lib/analytics';
import { toast } from 'sonner';

type ContentType = 'marketing' | 'social' | 'product' | 'email';

interface AIContentGeneratorProps {
  className?: string;
}

/**
 * AI Content Generator for marketing copy, social media, and product descriptions
 * Features: multiple content types, regeneration, copy to clipboard
 */
export function AIContentGenerator({ className = '' }: AIContentGeneratorProps) {
  const [contentType, setContentType] = useState<ContentType>('marketing');
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const contentTemplates = {
    marketing: 'Describe your product or service and target audience...',
    social: 'What do you want to share on social media?',
    product: 'Describe the product features and benefits...',
    email: 'What\'s the purpose of this email?'
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    trackAIFeature('content_generator', 'generate', {
      contentType,
      tone,
      length,
      promptLength: prompt.length
    });

    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
      const samples = {
        marketing: `Transform Your Business with AI-Powered Automation

Discover how Influxity.ai helps small businesses streamline operations, boost productivity, and scale effortlessly. Our intelligent automation platform handles repetitive tasks so you can focus on what matters most—growing your business.

✨ Key Benefits:
• Save 20+ hours per week on routine tasks
• Reduce operational costs by up to 40%
• Scale your business without scaling your team
• Get actionable insights from your data

Join thousands of businesses already transforming their operations with Influxity.ai.`,
        
        social: `🚀 Exciting news! We're revolutionizing small business automation with AI.

Say goodbye to repetitive tasks and hello to productivity! 

✅ Smart automation
✅ Real-time insights
✅ Easy integration

Ready to transform your workflow? Learn more at influxity.ai

#AI #Automation #SmallBusiness #Productivity`,
        
        product: `Influxity.ai - AI-Powered Business Automation Platform

Streamline your operations with our comprehensive suite of AI tools designed specifically for small businesses.

Features:
• Intelligent Chatbot - 24/7 customer support automation
• Smart Scheduler - AI-optimized meeting coordination
• Content Generator - Marketing copy in seconds
• Lead Qualification - Automated prospect scoring
• Voice AI - Speech-to-text transcription

Perfect for: Small businesses, startups, and growing teams looking to maximize efficiency without hiring additional staff.

Pricing: Starting at $49/month with a 14-day free trial.`,
        
        email: `Subject: Unlock Your Business Potential with AI Automation

Hi [Name],

Are you spending too much time on repetitive tasks instead of growing your business?

Influxity.ai helps small businesses like yours automate routine operations, freeing up your time to focus on strategic growth.

Here's what you can achieve:
• Automate customer support with our AI chatbot
• Schedule meetings intelligently with timezone handling
• Generate marketing content in seconds
• Qualify leads automatically

We're offering a 14-day free trial—no credit card required.

Ready to transform your workflow?

[Start Free Trial]

Best regards,
The Influxity.ai Team`
      };

      setGeneratedContent(samples[contentType]);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast.success('Copied to clipboard!');
    trackAIFeature('content_generator', 'copy', { contentType });
    
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${contentType}-content-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    trackAIFeature('content_generator', 'download', { contentType });
    toast.success('Downloaded!');
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Wand2 className="w-6 h-6 text-purple-700" />
        <h3 className="text-2xl font-bold text-gray-800">AI Content Generator</h3>
      </div>

      <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)} className="mb-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="product">Product</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Content Prompt</Label>
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={contentTemplates[contentType]}
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="length">Length</Label>
            <Select value={length} onValueChange={setLength}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="long">Long</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full bg-purple-700 hover:bg-purple-700"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>

        {generatedContent && (
          <div className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <Label>Generated Content</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans">
                {generatedContent}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
