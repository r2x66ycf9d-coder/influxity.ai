/**
 * Influxity Admin — Leads Dashboard
 * Private page at /admin/leads for Sean to view all audit leads
 * Shows audit_leads.json + recover_leads.json with filtering and export
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  RefreshCw,
  Users,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Mail,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Filter,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type LeadStatus =
  | "audit_run"
  | "checkout_initiated"
  | "paid"
  | "onboarded"
  | "unknown";

interface Lead {
  email: string;
  storeUrl?: string;
  timestamp: string;
  source?: string;
  status?: LeadStatus;
  stripeSessionId?: string;
  name?: string;
}

const STATUS_COLORS: Record<string, string> = {
  paid: "text-green-400 border-green-500/40 bg-green-500/10",
  onboarded: "text-purple-400 border-purple-500/40 bg-purple-500/10",
  checkout_initiated: "text-yellow-400 border-yellow-500/40 bg-yellow-500/10",
  audit_run: "text-blue-400 border-blue-500/40 bg-blue-500/10",
  unknown: "text-muted-foreground border-border/40 bg-card/40",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  paid: <CheckCircle className="h-3 w-3" />,
  onboarded: <CheckCircle className="h-3 w-3" />,
  checkout_initiated: <DollarSign className="h-3 w-3" />,
  audit_run: <TrendingUp className="h-3 w-3" />,
  unknown: <Clock className="h-3 w-3" />,
};

export default function AdminLeads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const leadsQuery = trpc.admin.getLeads.useQuery(undefined, {
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  const leads: Lead[] = leadsQuery.data?.leads ?? [];

  // Derived stats
  const totalLeads = leads.length;
  const auditLeads = leads.filter((l) => l.source?.includes("audit")).length;
  const paidLeads = leads.filter((l) => l.status === "paid").length;
  const checkoutLeads = leads.filter(
    (l) => l.status === "checkout_initiated"
  ).length;

  // Filtered leads
  const filtered = leads.filter((l) => {
    const matchSearch =
      !search ||
      l.email.toLowerCase().includes(search.toLowerCase()) ||
      (l.storeUrl || "").toLowerCase().includes(search.toLowerCase()) ||
      (l.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "all" || (l.status || "unknown") === statusFilter;
    const matchSource =
      sourceFilter === "all" ||
      (l.source || "").includes(sourceFilter);
    return matchSearch && matchStatus && matchSource;
  });

  const handleExport = () => {
    if (!leads.length) {
      toast.error("No leads to export.");
      return;
    }
    const headers = ["Email", "Store URL", "Name", "Source", "Status", "Timestamp", "Stripe Session"];
    const rows = leads.map((l) => [
      l.email,
      l.storeUrl || "",
      l.name || "",
      l.source || "",
      l.status || "unknown",
      l.timestamp,
      l.stripeSessionId || "",
    ]);
    const csv = [headers, ...rows]
      .map((r) => r.map((v) => `"${v}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `influxity-leads-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${leads.length} leads to CSV.`);
  };

  const formatDate = (ts: string) => {
    try {
      return new Date(ts).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return ts;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/90 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/">
              <img src="/logo.png" alt="Influxity.ai" className="h-9 w-auto" />
            </a>
            <span className="text-border/60 text-sm">/</span>
            <Badge
              variant="outline"
              className="text-xs font-semibold border-primary/40 text-primary bg-primary/10 px-2 py-0.5"
            >
              Admin · Leads
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => leadsQuery.refetch()}
              disabled={leadsQuery.isFetching}
              className="border-border/60 text-sm gap-2"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${leadsQuery.isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white font-semibold gap-2"
            >
              <Download className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">Lead Intelligence Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            All audit requests, recover leads, and newsletter subscribers in one place.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Leads",
              value: totalLeads,
              icon: <Users className="h-4 w-4 text-purple-400" />,
              color: "text-purple-400",
            },
            {
              label: "Audit Requests",
              value: auditLeads,
              icon: <ShoppingBag className="h-4 w-4 text-blue-400" />,
              color: "text-blue-400",
            },
            {
              label: "Checkout Started",
              value: checkoutLeads,
              icon: <DollarSign className="h-4 w-4 text-yellow-400" />,
              color: "text-yellow-400",
            },
            {
              label: "Paid Customers",
              value: paidLeads,
              icon: <CheckCircle className="h-4 w-4 text-green-400" />,
              color: "text-green-400",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-card border border-border/40 rounded-xl p-5 flex flex-col gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                {stat.icon}
              </div>
              <div className={`text-3xl font-black ${stat.color}`}>
                {leadsQuery.isLoading ? "—" : stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search email, store, or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-background/60 border-border/60"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-background border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Statuses</option>
            <option value="audit_run">Audit Run</option>
            <option value="checkout_initiated">Checkout Started</option>
            <option value="paid">Paid</option>
            <option value="onboarded">Onboarded</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-background border border-border/60 rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
          >
            <option value="all">All Sources</option>
            <option value="audit">Recover Audit</option>
            <option value="newsletter">Newsletter</option>
            <option value="recover">Recover Page</option>
          </select>
        </div>

        {/* Leads Table */}
        <div className="bg-card border border-border/40 rounded-xl overflow-hidden">
          {leadsQuery.isLoading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" />
              Loading leads...
            </div>
          ) : leadsQuery.isError ? (
            <div className="flex items-center justify-center py-20 text-red-400 gap-2">
              <XCircle className="h-5 w-5" />
              Failed to load leads. Check server connection.
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Users className="h-8 w-8 opacity-30" />
              <p className="text-sm">
                {leads.length === 0
                  ? "No leads yet. Run an audit on /recover to generate your first lead."
                  : "No leads match your current filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-background/60">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">
                      Store / Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">
                      Source
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered
                    .sort(
                      (a, b) =>
                        new Date(b.timestamp).getTime() -
                        new Date(a.timestamp).getTime()
                    )
                    .map((lead, i) => {
                      const status = lead.status || "unknown";
                      return (
                        <tr
                          key={i}
                          className="border-b border-border/20 hover:bg-card/60 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground truncate max-w-[200px]">
                                {lead.email}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="text-muted-foreground truncate max-w-[180px]">
                              {lead.storeUrl || lead.name || (
                                <span className="opacity-40">—</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
                            <span className="text-xs text-muted-foreground">
                              {lead.source || "—"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-semibold border rounded-full px-2 py-0.5 ${STATUS_COLORS[status] || STATUS_COLORS.unknown}`}
                            >
                              {STATUS_ICONS[status] || STATUS_ICONS.unknown}
                              {status.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden lg:table-cell">
                            <span className="text-xs text-muted-foreground">
                              {formatDate(lead.timestamp)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              <div className="px-4 py-3 border-t border-border/20 text-xs text-muted-foreground">
                Showing {filtered.length} of {leads.length} leads · Auto-refreshes every 30s
              </div>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href="/revenue"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <TrendingUp className="h-3.5 w-3.5" /> Revenue Dashboard
          </a>
          <a
            href="/recover"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Recover Page
          </a>
          <a
            href="/pricing"
            className="text-sm text-primary hover:underline flex items-center gap-1"
          >
            <DollarSign className="h-3.5 w-3.5" /> Pricing
          </a>
        </div>
      </main>
    </div>
  );
}
