import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { trackAIFeature } from '@/lib/analytics';

interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'textarea';
  value: string;
  aiSuggestion?: string;
  validated?: boolean;
}

interface AIFormAssistantProps {
  title?: string;
  fields: FormField[];
  onFieldChange: (name: string, value: string) => void;
  onSubmit: (data: Record<string, string>) => void;
  className?: string;
}

/**
 * AI-powered form assistant with auto-fill and validation
 * Features: smart suggestions, field validation, auto-complete
 */
export function AIFormAssistant({
  title = 'Smart Form',
  fields,
  onFieldChange,
  onSubmit,
  className = ''
}: AIFormAssistantProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);

  const handleAISuggest = async (fieldName: string) => {
    setIsProcessing(true);
    trackAIFeature('form_assistant', 'suggestion_requested', { field: fieldName });
    
    // Simulate AI suggestion (replace with actual API call)
    setTimeout(() => {
      const suggestions: Record<string, string> = {
        company: 'Acme Corporation',
        email: 'john.doe@acme.com',
        phone: '+1 (555) 123-4567',
        message: 'I\'m interested in learning more about your AI automation solutions for small businesses.'
      };
      
      const suggestion = suggestions[fieldName];
      if (suggestion) {
        onFieldChange(fieldName, suggestion);
      }
      setIsProcessing(false);
    }, 1000);
  };

  const validateField = (field: FormField): boolean => {
    if (!field.value) return false;
    
    switch (field.type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);
      case 'tel':
        return /^[\d\s\-\+\(\)]+$/.test(field.value);
      default:
        return field.value.length >= 2;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = fields.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {} as Record<string, string>);
    
    trackAIFeature('form_assistant', 'form_submitted', { 
      fieldCount: fields.length,
      aiEnabled 
    });
    onSubmit(data);
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAiEnabled(!aiEnabled)}
          className={aiEnabled ? 'border-purple-700 text-purple-700' : ''}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          AI {aiEnabled ? 'On' : 'Off'}
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => {
          const isValid = validateField(field);
          
          return (
            <div key={field.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={field.name} className="text-sm font-medium">
                  {field.label}
                </Label>
                {field.value && (
                  <Badge variant={isValid ? 'default' : 'destructive'} className="text-xs">
                    {isValid ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Valid
                      </>
                    ) : (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        Invalid
                      </>
                    )}
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {field.type === 'textarea' ? (
                  <Textarea
                    id={field.name}
                    value={field.value}
                    onChange={(e) => onFieldChange(field.name, e.target.value)}
                    className="flex-1"
                    rows={4}
                  />
                ) : (
                  <Input
                    id={field.name}
                    type={field.type}
                    value={field.value}
                    onChange={(e) => onFieldChange(field.name, e.target.value)}
                    className="flex-1"
                  />
                )}
                
                {aiEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAISuggest(field.name)}
                    disabled={isProcessing}
                    className="flex-shrink-0"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              {field.aiSuggestion && (
                <p className="text-xs text-purple-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI Suggestion: {field.aiSuggestion}
                </p>
              )}
            </div>
          );
        })}

        <Button 
          type="submit" 
          className="w-full bg-purple-700 hover:bg-purple-800"
          disabled={!fields.every(validateField)}
        >
          Submit
        </Button>
      </form>

      {aiEnabled && (
        <p className="text-xs text-gray-500 mt-4 text-center">
          AI assistance is enabled. Click the <Sparkles className="w-3 h-3 inline" /> icon for smart suggestions.
        </p>
      )}
    </Card>
  );
}
