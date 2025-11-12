'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Users,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Eye,
  Download,
  RefreshCw,
  Filter,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAIAssistant, type AIModule, type AIRecommendation } from '@/contexts/ai-assistant-context';

interface Insight {
  id: string;
  title: string;
  description: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  category: 'performance' | 'engagement' | 'revenue' | 'users';
  timestamp: string;
  priority: 'high' | 'medium' | 'low';
  prompt: string;
  module: AIModule;
}

interface ChartData {
  name: string;
  value: number;
  color: string;
}

const chartData: ChartData[] = [
  { name: 'Mobile', value: 45, color: '#8B5CF6' },
  { name: 'Desktop', value: 35, color: '#06B6D4' },
  { name: 'Tablet', value: 20, color: '#10B981' }
];

const categoryIcons = {
  performance: Activity,
  engagement: Users,
  revenue: DollarSign,
  users: Target
};

const categoryColors = {
  performance: 'text-blue-400',
  engagement: 'text-green-400',
  revenue: 'text-purple-400',
  users: 'text-orange-400'
};

const priorityColors = {
  high: 'text-red-400',
  medium: 'text-yellow-400',
  low: 'text-green-400'
};

const MODULE_OPTIONS: { id: AIModule; label: string }[] = [
  { id: 'resume', label: 'Resume AI' },
  { id: 'social', label: 'Social AI' },
  { id: 'insights', label: 'Business Insights' },
  { id: 'analysis', label: 'Analytics AI' },
  { id: 'general', label: 'General' }
];

const INSIGHT_LIBRARY: Record<AIModule, Insight[]> = {
  general: [
    {
      id: 'general-engagement',
      title: 'Engagement trending upward',
      description: 'Daily active users increased by 18% compared to last week.',
      value: '1,982',
      change: 18.1,
      trend: 'up',
      category: 'engagement',
      timestamp: '1 hour ago',
      priority: 'high',
      module: 'general',
      prompt: 'Analyse why user engagement increased by 18% this week and suggest three experiments to sustain the momentum.'
    },
    {
      id: 'general-conversion',
      title: 'Checkout conversion dip',
      description: 'Conversion rate decreased by 2.4% following the pricing update.',
      value: '3.6%',
      change: -2.4,
      trend: 'down',
      category: 'performance',
      timestamp: '3 hours ago',
      priority: 'medium',
      module: 'general',
      prompt: 'Diagnose the 2.4% conversion drop after our pricing update and craft a remediation plan.'
    }
  ],
  resume: [
    {
      id: 'resume-summary',
      title: 'Profile summary opportunity',
      description: 'Your CV lacks a role-focused summary that highlights impact metrics.',
      value: '0 summaries',
      change: -100,
      trend: 'down',
      category: 'performance',
      timestamp: 'Just now',
      priority: 'high',
      module: 'resume',
      prompt: 'Create a results-driven professional summary highlighting leadership, technical depth, and measurable impact for this CV.'
    },
    {
      id: 'resume-keywords',
      title: 'Missing ATS keywords',
      description: 'Detected 6 high-value keywords absent from the experience section.',
      value: '6 keywords',
      change: -6,
      trend: 'down',
      category: 'performance',
      timestamp: '5 minutes ago',
      priority: 'high',
      module: 'resume',
      prompt: 'List missing ATS keywords for this CV and suggest where to integrate them with quantifiable bullet points.'
    },
    {
      id: 'resume-interview',
      title: 'Interview prep insight',
      description: 'Top achievements can become behavioural stories for leadership interviews.',
      value: '3 stories',
      change: 12,
      trend: 'up',
      category: 'engagement',
      timestamp: '15 minutes ago',
      priority: 'medium',
      module: 'resume',
      prompt: 'Transform the candidate’s top achievements into three STAR-format interview stories.'
    }
  ],
  social: [
    {
      id: 'social-engagement',
      title: 'Reels outperforming static posts',
      description: 'Video content drives 2.1x higher engagement on Instagram this week.',
      value: '2.1x lift',
      change: 110,
      trend: 'up',
      category: 'engagement',
      timestamp: '45 minutes ago',
      priority: 'high',
      module: 'social',
      prompt: 'Generate a three-part Reels narrative arc tailored to our current campaign with hooks, beats, and CTA.'
    },
    {
      id: 'social-hashtags',
      title: 'Hashtag mix fatigue',
      description: 'Repeated hashtags have plateaued reach; explore emerging niche tags.',
      value: 'Reach stagnant',
      change: -8,
      trend: 'down',
      category: 'performance',
      timestamp: '2 hours ago',
      priority: 'medium',
      module: 'social',
      prompt: 'Curate a refreshed hashtag cluster blending macro and niche tags for the next post, explaining rationale.'
    },
    {
      id: 'social-timing',
      title: 'Prime posting window',
      description: 'Highest conversions observed at 7:30 PM for LinkedIn thought leadership posts.',
      value: '7:30 PM',
      change: 14,
      trend: 'up',
      category: 'revenue',
      timestamp: 'Yesterday',
      priority: 'low',
      module: 'social',
      prompt: 'Design a LinkedIn post optimised for 7:30 PM publishing, including hook, value stack, and CTA.'
    }
  ],
  insights: [
    {
      id: 'insights-retention',
      title: 'Retention cohort alert',
      description: 'Week-4 retention for cohort April-2025 is down 9% vs. average.',
      value: '-9%',
      change: -9,
      trend: 'down',
      category: 'users',
      timestamp: '30 minutes ago',
      priority: 'high',
      module: 'insights',
      prompt: 'Investigate the -9% retention dip for the April-2025 cohort and outline three targeted retention experiments.'
    },
    {
      id: 'insights-ltv',
      title: 'LTV growth opportunity',
      description: 'Upsell campaigns lifted customer lifetime value by 14% in enterprise segment.',
      value: '+14%',
      change: 14,
      trend: 'up',
      category: 'revenue',
      timestamp: '6 hours ago',
      priority: 'high',
      module: 'insights',
      prompt: 'Propose a follow-up upsell playbook leveraging the 14% LTV increase across adjacent segments.'
    }
  ],
  analysis: [
    {
      id: 'analysis-forecast',
      title: 'Forecast variance',
      description: 'Current pipeline coverage is 0.8x versus 1.2x target for next quarter.',
      value: '0.8x coverage',
      change: -33,
      trend: 'down',
      category: 'revenue',
      timestamp: '10 minutes ago',
      priority: 'high',
      module: 'analysis',
      prompt: 'Evaluate the revenue pipeline gap (0.8x vs 1.2x) and recommend corrective actions with projected impact.'
    },
    {
      id: 'analysis-satisfaction',
      title: 'NPS rising steadily',
      description: 'Customer satisfaction improved by 6 points after onboarding revamp.',
      value: '+6 NPS',
      change: 6,
      trend: 'up',
      category: 'users',
      timestamp: '1 day ago',
      priority: 'medium',
      module: 'analysis',
      prompt: 'Turn the onboarding improvements into a case study outline and list additional optimisations to reach +10 NPS.'
    }
  ]
};

export default function InsightsPage() {
  const router = useRouter();
  const { activeModule, setActiveModule, queuePrompt, recommendations, setRecommendations } = useAIAssistant();
  const [selectedModule, setSelectedModule] = useState<AIModule>(activeModule);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (activeModule === 'general') {
      setActiveModule('insights');
      setSelectedModule('insights');
    } else {
      setSelectedModule(activeModule);
    }
  }, [activeModule, setActiveModule]);

  useEffect(() => {
    const insightRecs: AIRecommendation[] =
      INSIGHT_LIBRARY[selectedModule]?.slice(0, 3).map((item) => ({
        id: `${item.id}-rec`,
        title: item.title,
        description: item.description,
        prompt: item.prompt,
        module: selectedModule
      })) ?? [];
    setRecommendations(insightRecs, selectedModule);
  }, [selectedModule, setRecommendations]);

  const moduleInsights = useMemo(() => INSIGHT_LIBRARY[selectedModule] ?? [], [selectedModule]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const handleExportData = () => {
    console.log('Exporting insights data...');
  };

  const filteredInsights = moduleInsights.filter(
    (insight) => selectedCategory === 'all' || insight.category === selectedCategory
  );

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-cyber font-bold gradient-text mb-2">AI Insights</h1>
          <p className="text-zyra-text-secondary">Data-driven insights tuned to your active AI workspace</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MODULE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  setActiveModule(option.id);
                  setSelectedModule(option.id);
                }}
                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                  selectedModule === option.id
                    ? 'border-zyra-electric-violet bg-zyra-electric-violet/10 text-white'
                    : 'border-white/10 text-zyra-text-secondary hover:text-white hover:border-white/20'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <motion.button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>

          <motion.button
            onClick={handleExportData}
            className="flex items-center space-x-2 px-4 py-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-xl transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-zyra-text-secondary" />
          <span className="text-sm text-zyra-text-secondary">Filter by:</span>
        </div>

        <select
          value={selectedTimeRange}
          onChange={(e) => setSelectedTimeRange(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
        >
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white"
        >
          <option value="all">All Categories</option>
          <option value="performance">Performance</option>
          <option value="engagement">Engagement</option>
          <option value="revenue">Revenue</option>
          <option value="users">Users</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Total Insights</p>
              <p className="text-2xl font-bold text-white">{moduleInsights.length}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-zyra-electric-violet" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">High Priority</p>
              <p className="text-2xl font-bold text-red-400">
                {moduleInsights.filter((insight) => insight.priority === 'high').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Positive Trends</p>
              <p className="text-2xl font-bold text-green-400">
                {moduleInsights.filter((insight) => insight.trend === 'up').length}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zyra-text-secondary text-sm">Avg. Change</p>
              <p className="text-2xl font-bold text-white">
                {moduleInsights.length
                  ? (moduleInsights.reduce((sum, insight) => sum + insight.change, 0) / moduleInsights.length).toFixed(
                      1
                    )
                  : 0}
                %
              </p>
            </div>
            <Activity className="w-8 h-8 text-zyra-cyan-blue" />
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xl font-semibold text-white">Recent Insights</h3>
          <div className="space-y-3">
            {filteredInsights.map((insight, index) => {
              const CategoryIcon = categoryIcons[insight.category];
              const categoryColor = categoryColors[insight.category];
              const priorityColor = priorityColors[insight.priority];

              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 rounded-xl bg-white/5">
                        <CategoryIcon className={`w-6 h-6 ${categoryColor}`} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-semibold text-white">{insight.title}</h4>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColor} bg-white/5`}>
                            {insight.priority}
                          </div>
                        </div>

                        <p className="text-zyra-text-secondary text-sm mb-3">{insight.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl font-bold text-white">{insight.value}</span>
                            <div className={`flex items-center space-x-1 ${getTrendColor(insight.trend)}`}>
                              {getTrendIcon(insight.trend)}
                              <span className="text-sm font-medium">
                                {insight.change > 0 ? '+' : ''}
                                {insight.change}%
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-zyra-text-secondary">{insight.timestamp}</span>
                            <motion.button
                              className="p-1 rounded text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                queuePrompt(insight.prompt, { module: selectedModule });
                                router.push('/dashboard/ai/chat');
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Device Distribution</h3>
            <div className="space-y-3">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-white font-medium">{item.name}</span>
                  </div>
                  <span className="text-zyra-text-secondary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Page Load Time</span>
                <span className="text-white font-medium">1.2s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Bounce Rate</span>
                <span className="text-white font-medium">32%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Conversion Rate</span>
                <span className="text-white font-medium">2.4%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zyra-text-secondary">Session Duration</span>
                <span className="text-white font-medium">4m 32s</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">AI Recommendations</h3>
              <div className="flex items-center gap-2 text-zyra-text-secondary text-xs">
                <Zap className="w-4 h-4 text-zyra-cyan-blue" />
                Active: {selectedModule}
              </div>
            </div>
            {recommendations.length === 0 && (
              <p className="text-sm text-zyra-text-secondary">
                Activate a module to discover tailored recommendations.
              </p>
            )}
            {recommendations.map((rec) => (
              <button
                key={rec.id}
                className="w-full text-left p-3 rounded-lg border border-white/10 hover:border-zyra-electric-violet/40 hover:bg-white/5 transition-colors"
                onClick={() => {
                  queuePrompt(rec.prompt, { module: rec.module ?? selectedModule });
                  router.push('/dashboard/ai/chat');
                }}
              >
                <div className="flex items-center gap-2 mb-1 text-white">
                  <CheckCircle className="w-4 h-4 text-zyra-cyan-blue" />
                  <span className="text-sm font-semibold">{rec.title}</span>
                </div>
                <p className="text-xs text-zyra-text-secondary">{rec.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

