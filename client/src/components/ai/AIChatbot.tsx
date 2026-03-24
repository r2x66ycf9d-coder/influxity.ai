import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trpc } from '@/lib/trpc';
import { Streamdown } from 'streamdown';
import { sanitizeHTML } from '@/lib/sanitize';
import { formatRelativeTime } from '@/lib/timezone';
import { trackAIFeature } from '@/lib/analytics';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatbotProps {
  className?: string;
  placeholder?: string;
  welcomeMessage?: string;
}

/**
 * AI Chatbot component with guardrails for customer support
 * Features: message history, streaming responses, error handling
 */
export function AIChatbot({ 
  className = '', 
  placeholder = 'Ask me anything about Influxity.ai...',
  welcomeMessage = 'Hello! I\'m your AI assistant. How can I help you today?'
}: AIChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data: any) => {
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      trackAIFeature('chatbot', 'message_received', { hasError: data.error });
    },
    onError: (error: unknown) => {
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an issue. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Chat error:', error);
    }
  });

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    trackAIFeature('chatbot', 'message_sent', { messageLength: input.length });
    
    chatMutation.mutate({ 
      message: input.trim()
    });
    
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      <div className="p-4 border-b bg-gradient-to-r from-purple-800 to-purple-900">
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-purple-100">Always here to help</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-purple-700" />
                </div>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-700 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm max-w-none">
                    <Streamdown>{sanitizeHTML(message.content)}</Streamdown>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                <p className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                  {formatRelativeTime(message.timestamp)}
                </p>
              </div>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-amber-600" />
                </div>
              )}
            </div>
          ))}
          
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-purple-700" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin text-purple-700" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            disabled={chatMutation.isPending}
            className="flex-1"
            maxLength={5000}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-purple-700 hover:bg-purple-800"
          >
            {chatMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </Card>
  );
}
