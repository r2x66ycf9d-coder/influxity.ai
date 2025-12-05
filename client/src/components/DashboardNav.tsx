import { Link, useLocation } from "wouter";
import { MessageSquare, Mail, FileText, Sparkles, BarChart3, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const navItems = [
  { path: "/dashboard", label: "AI Chat", icon: MessageSquare },
  { path: "/email-generator", label: "Email Generator", icon: Mail },
  { path: "/sales-copy", label: "Sales Copy", icon: FileText },
  { path: "/content-generator", label: "Content Generator", icon: Sparkles },
  { path: "/data-analysis", label: "Data Analysis", icon: BarChart3 },
];

export function DashboardNav() {
  const [location] = useLocation();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logged out successfully");
      window.location.href = "/";
    },
  });

  return (
    <nav className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <Link href="/">
          <a className="flex items-center gap-2">
            <img src="/logo.png" alt="Influxity" className="h-8 w-8" />
            <span className="font-bold text-lg">Influxity.ai</span>
          </a>
        </Link>
      </div>

      <div className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Link key={item.path} href={item.path}>
              <a
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  );
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-background">
      <DashboardNav />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
