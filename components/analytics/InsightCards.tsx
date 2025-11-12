'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Star, Activity } from 'lucide-react';

interface InsightCardsProps {
  keyMetrics?: Record<string, unknown> | null;
  insights?: Array<{ title: string; detail: string; confidence: string }>;
  recommendations?: Array<{ action: string; expected_impact: string; priority: string }>;
  summaryText?: string;
}

const confidenceIcon = (confidence: string) => {
  switch (confidence) {
    case 'high':
      return <TrendingUp className="h-4 w-4 text-emerald-400" />;
    case 'medium':
      return <Activity className="h-4 w-4 text-amber-400" />;
    default:
      return <TrendingDown className="h-4 w-4 text-red-400" />;
  }
};

export function InsightCards({
  keyMetrics,
  insights,
  recommendations,
  summaryText
}: InsightCardsProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 space-y-4"
      >
        <Card className="glass-card border border-zyra-glass-border p-5">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Target className="h-5 w-5 text-zyra-cyan-blue" />
            Summary
          </h3>
          <p className="text-sm text-zyra-text-secondary whitespace-pre-line">
            {summaryText ?? 'Run an analysis to generate the executive summary.'}
          </p>
        </Card>

        <Card className="glass-card border border-zyra-glass-border p-5 space-y-3">
          <h3 className="text-lg font-semibold text-white">Key Metrics</h3>
          {keyMetrics ? (
            <div className="space-y-2">
              {Object.entries(keyMetrics).map(([key, value]) => {
                if (key === 'custom_metrics' && Array.isArray(value)) {
                  return value.map((metric) => (
                    <div key={metric.name} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm text-white font-medium">{metric.name}</p>
                        <p className="text-xs text-zyra-text-secondary">{metric.description}</p>
                      </div>
                      <span className="text-sm text-zyra-cyan-blue font-semibold">
                        {metric.value}
                      </span>
                    </div>
                  ));
                }

                if (value === null || value === undefined || value === '') return null;
                const formattedKey = key.replace(/_/g, ' ');
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm capitalize text-zyra-text-secondary">{formattedKey}</span>
                    <span className="text-sm text-white font-semibold">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zyra-text-secondary">
              KPIs will appear once analysis is complete.
            </p>
          )}
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 space-y-4"
      >
        <Card className="glass-card border border-zyra-glass-border p-5">
          <h3 className="text-lg font-semibold text-white mb-3">Insights</h3>
          <div className="space-y-3">
            {insights && insights.length > 0 ? (
              insights.map((insight) => (
                <div key={insight.title} className="rounded-lg border border-white/10 p-3 bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{insight.title}</p>
                    <Badge variant="outline" className="bg-white/5 text-xs text-zyra-text-secondary">
                      {insight.confidence}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-zyra-text-secondary">{insight.detail}</p>
                  <div className="mt-2">{confidenceIcon(insight.confidence)}</div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zyra-text-secondary">Insights will be generated after analysis.</p>
            )}
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="lg:col-span-1 space-y-4"
      >
        <Card className="glass-card border border-zyra-glass-border p-5">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-zyra-electric-violet" />
            Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations && recommendations.length > 0 ? (
              recommendations.map((item) => (
                <div key={item.action} className="rounded-lg border border-white/10 p-3 bg-white/5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-white">{item.action}</p>
                    <Badge variant="outline" className="bg-white/5 text-xs text-zyra-text-secondary">
                      {item.priority} priority
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-zyra-text-secondary">{item.expected_impact}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-zyra-text-secondary">Recommendations will appear after analysis.</p>
            )}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

