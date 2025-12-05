import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { Loader2, Send, Plus, MessageSquare } from "lucide-react";
import { Streamdown } from "streamdown";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { DashboardLayout } from "@/components/DashboardNav";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const { data: conversations, refetch: refetchConversations } = trpc.chat.getConversations.useQuery(undefined, {
    enabled: !!user,
  });

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { conversationId: currentConversationId! },
    { enabled: !!currentConversationId }
  );

  const createConversation = trpc.chat.createConversation.useMutation({
    onSuccess: data => {
      setCurrentConversationId(data.conversationId);
      refetchConversations();
      toast.success("New conversation started");
    },
  });

  const sendMessage = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      setMessage("");
      setIsSending(false);
    },
    onError: () => {
      toast.error("Failed to send message");
      setIsSending(false);
    },
  });

  const handleNewConversation = () => {
    createConversation.mutate({ title: "New Conversation" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !currentConversationId) return;

    setIsSending(true);
    sendMessage.mutate({
      conversationId: currentConversationId,
      message: message.trim(),
    });
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
      <div className="flex h-screen">
        {/* Conversation Sidebar */}
        <div className="w-64 border-r border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <Button onClick={handleNewConversation} className="w-full" disabled={createConversation.isPending}>
              {createConversation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              New Chat
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {conversations?.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setCurrentConversationId(conv.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentConversationId === conv.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate text-sm">{conv.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border p-4 bg-card/30">
            <h1 className="text-xl font-semibold">AI Business Assistant</h1>
            <p className="text-sm text-muted-foreground">Ask me anything about your business</p>
          </div>

          {currentConversationId ? (
            <>
              <ScrollArea className="flex-1 p-4">
                <div className="max-w-3xl mx-auto space-y-6">
                  {messages?.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <Card
                        className={`p-4 max-w-[80%] ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
                        }`}
                      >
                        {msg.role === "assistant" ? (
                          <Streamdown>{msg.content}</Streamdown>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                        )}
                      </Card>
                    </div>
                  ))}
                  {isSending && (
                    <div className="flex justify-start">
                      <Card className="p-4 bg-card">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      </Card>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className="border-t border-border p-4 bg-card/30">
                <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto">
                  <div className="flex gap-2">
                    <Textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[60px] max-h-[200px]"
                      onKeyDown={e => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                    />
                    <Button type="submit" size="icon" disabled={!message.trim() || !currentConversationId || isSending}>
                      {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-4">
              <div>
                <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Start a Conversation</h2>
                <p className="text-muted-foreground mb-6">Click "New Chat" to begin talking with your AI assistant</p>
                <Button onClick={handleNewConversation} disabled={createConversation.isPending}>
                  {createConversation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Start New Chat
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
