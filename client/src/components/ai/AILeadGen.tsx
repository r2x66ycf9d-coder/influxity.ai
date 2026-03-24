import { useState } from 'react';
import { Target, TrendingUp, CheckCircle, XCircle, Clock, Sparkles, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { trackAIFeature } from '@/lib/analytics';
import { formatRelativeTime } from '@/lib/timezone';

type LeadStatus = 'hot' | 'warm' | 'cold';
type LeadScore = 'A' | 'B' | 'C' | 'D';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  score: number;
  grade: LeadScore;
  status: LeadStatus;
  source: string;
  lastActivity: Date;
  interests: string[];
  aiInsights: string;
}

interface AILeadGenProps {
  className?: string;
}

/**
 * AI-powered lead generation and qualification system
 * Features: automatic scoring, qualification, prioritization
 */
export function AILeadGen({ className = '' }: AILeadGenProps) {
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@techcorp.com',
      company: 'TechCorp Inc.',
      score: 92,
      grade: 'A',
      status: 'hot',
      source: 'Website Form',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000),
      interests: ['AI Automation', 'Enterprise'],
      aiInsights: 'High engagement, viewed pricing 3 times, downloaded whitepaper'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'mchen@startupco.io',
      company: 'StartupCo',
      score: 78,
      grade: 'B',
      status: 'warm',
      source: 'LinkedIn',
      lastActivity: new Date(Date.now() - 24 * 60 * 60 * 1000),
      interests: ['Small Business', 'CRM'],
      aiInsights: 'Moderate interest, fits ideal customer profile, budget concerns'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily@growthventures.com',
      company: 'Growth Ventures',
      score: 65,
      grade: 'C',
      status: 'warm',
      source: 'Webinar',
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      interests: ['Marketing Automation'],
      aiInsights: 'Early stage research, needs nurturing, high potential'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200';
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getGradeColor = (grade: LeadScore) => {
    switch (grade) {
      case 'A': return 'bg-green-600';
      case 'B': return 'bg-amber-600';
      case 'C': return 'bg-yellow-600';
      case 'D': return 'bg-gray-600';
    }
  };

  const filteredLeads = leads
    .filter(lead => filterStatus === 'all' || lead.status === filterStatus)
    .filter(lead => 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => b.score - a.score);

  const handleQualify = (leadId: string) => {
    trackAIFeature('lead_gen', 'qualify', { leadId });
    // Implement qualification logic
  };

  const handleReject = (leadId: string) => {
    trackAIFeature('lead_gen', 'reject', { leadId });
    setLeads(leads.filter(l => l.id !== leadId));
  };

  const stats = {
    total: leads.length,
    hot: leads.filter(l => l.status === 'hot').length,
    avgScore: Math.round(leads.reduce((sum, l) => sum + l.score, 0) / leads.length)
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-700" />
          <h3 className="text-2xl font-bold text-gray-800">Lead Intelligence</h3>
          <Badge variant="secondary">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Qualified
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Leads</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
            <Target className="w-8 h-8 text-purple-700" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hot Leads</p>
              <p className="text-2xl font-bold text-red-600">{stats.hot}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-green-600">{stats.avgScore}</p>
            </div>
            <Sparkles className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leads</SelectItem>
              <SelectItem value="hot">Hot</SelectItem>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="cold">Cold</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead) => (
          <Card key={lead.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex gap-4 flex-1">
                <div className={`w-12 h-12 rounded-full ${getGradeColor(lead.grade)} flex items-center justify-center text-white font-bold text-xl flex-shrink-0`}>
                  {lead.grade}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-800">{lead.name}</h4>
                    <Badge className={`${getStatusColor(lead.status)} border`}>
                      {lead.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Score: {lead.score}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <p>{lead.company} • {lead.email}</p>
                    <p className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      Last activity: {formatRelativeTime(lead.lastActivity)}
                      <span className="text-gray-400">•</span>
                      Source: {lead.source}
                    </p>
                  </div>

                  <div className="flex gap-2 mb-3">
                    {lead.interests.map((interest, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-900 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span><strong>AI Insights:</strong> {lead.aiInsights}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  size="sm"
                  onClick={() => handleQualify(lead.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Qualify
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(lead.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <Card className="p-12 text-center">
          <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No leads found matching your criteria</p>
        </Card>
      )}
    </div>
  );
}
