'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { Badge } from '@/components/ui/badge';
import { Bot, Activity, FileBarChart } from 'lucide-react';

export default function AnalyticsAIPage() {
  const [activeDatasetId, setActiveDatasetId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-zyra-electric-violet/20 text-zyra-electric-violet border border-zyra-electric-violet/40">
                Analytics AI
              </Badge>
            </div>
            <h1 className="text-3xl md:text-4xl font-cyber font-bold gradient-text">
              Data Insights & Business Intelligence
            </h1>
            <p className="text-zyra-text-secondary max-w-3xl mt-3">
              Transform raw spreadsheets into executive-grade dashboards. Zyra cleans your data, surfaces
              growth opportunities, and prescribes next steps in natural language.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zyra-electric-violet/20 border border-zyra-electric-violet/40">
              <Bot className="h-6 w-6 text-zyra-electric-violet" />
            </div>
            <div>
              <p className="text-sm text-zyra-text-secondary">Active dataset</p>
              <p className="text-lg text-white font-semibold">
                {activeDatasetId ? `#${activeDatasetId.slice(0, 8)}` : 'None loaded'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="glass-card border border-zyra-glass-border p-4">
            <div className="flex items-center gap-3">
              <FileBarChart className="h-6 w-6 text-zyra-electric-violet" />
              <div>
                <h3 className="text-sm font-semibold text-white">Smart Data Prep</h3>
                <p className="text-xs text-zyra-text-secondary">
                  Auto-cleans nulls, normalizes formats, and tags columns.
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card border border-zyra-glass-border p-4">
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-zyra-cyan-blue" />
              <div>
                <h3 className="text-sm font-semibold text-white">Realtime KPI tracking</h3>
                <p className="text-xs text-zyra-text-secondary">
                  Revenue, retention, acquisition and campaign performance in one view.
                </p>
              </div>
            </div>
          </div>
          <div className="glass-card border border-zyra-glass-border p-4">
            <div className="flex items-center gap-3">
              <Bot className="h-6 w-6 text-zyra-cyan-blue" />
              <div>
                <h3 className="text-sm font-semibold text-white">Plain-language guidance</h3>
                <p className="text-xs text-zyra-text-secondary">
                  Zyra explains the “why” behind the numbers and prescribes next steps.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <AnalyticsDashboard onDatasetReady={setActiveDatasetId} />
    </div>
  );
}

