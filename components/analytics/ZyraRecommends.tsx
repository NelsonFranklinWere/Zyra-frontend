'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AnalyticsRecommendations,
  fetchAnalyticsRecommendations
} from '@/lib/api/analytics';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

interface ZyraRecommendsProps {
  datasetId: string | null;
  domain?: string;
}

export function ZyraRecommends({ datasetId, domain }: ZyraRecommendsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<AnalyticsRecommendations | null>(null);

  const hasDataset = Boolean(datasetId);
  const hasData = useMemo(() => Boolean(payload), [payload]);

  const loadRecommendations = useCallback(async () => {
    if (!datasetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchAnalyticsRecommendations(datasetId, domain);
      setPayload(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to load Zyra recommendations');
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, domain]);

  useEffect(() => {
    if (!datasetId) {
      setPayload(null);
      return;
    }
    loadRecommendations();
  }, [datasetId, loadRecommendations]);

  if (!hasDataset) {
    return (
      <div className="glass-card border border-zyra-glass-border p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-zyra-electric-violet" />
          <div>
            <h3 className="text-lg font-semibold text-white">Zyra Recommends</h3>
            <p className="text-sm text-zyra-text-secondary">
              Upload and analyze a dataset to unlock personalized growth actions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card border border-zyra-glass-border p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-zyra-electric-violet" />
            <h3 className="text-lg font-semibold text-white">Zyra Recommends</h3>
            {domain && (
              <Badge className="bg-zyra-electric-violet/15 text-zyra-electric-violet border border-zyra-electric-violet/30">
                {domain}
              </Badge>
            )}
          </div>
          <p className="text-sm text-zyra-text-secondary max-w-2xl">
            AI-distilled guidance tailored to your dataset. Zyra scans trends, diagnoses issues, and tells you what to do next.
          </p>
        </div>
        <Button
          variant="outline"
          className="ml-auto flex items-center gap-2 border-zyra-electric-violet/40 text-white hover:bg-zyra-electric-violet/10"
          onClick={loadRecommendations}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {isLoading ? 'Refreshing' : 'Refresh'}
        </Button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {isLoading && !hasData ? (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6 text-sm text-zyra-text-secondary">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Generating tailored recommendations…</span>
        </div>
      ) : null}

      {payload && !isLoading && (
        <div className="space-y-5">
          {payload.summary && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-zyra-electric-violet/20 bg-zyra-electric-violet/10 p-5 text-sm text-white"
            >
              <div className="flex items-start gap-3">
                <TrendingUp className="mt-0.5 h-5 w-5 text-zyra-electric-violet" />
                <p className="leading-relaxed">{payload.summary}</p>
              </div>
            </motion.div>
          )}

          {payload.insights.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zyra-text-secondary">
                Key Signals
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {payload.insights.map((insight, index) => (
                  <motion.div
                    key={`${insight}-${index}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/90"
                  >
                    {insight}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {payload.recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zyra-text-secondary">
                Recommended Actions
              </h4>
              <div className="space-y-3">
                {payload.recommendations.map((recommendation, index) => (
                  <motion.div
                    key={`${recommendation}-${index}`}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border border-zyra-cyan-blue/30 bg-zyra-cyan-blue/10 p-4 text-sm text-white/90"
                  >
                    {recommendation}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {payload.predicted_outcomes.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold uppercase tracking-wide text-zyra-text-secondary">
                Predicted Outcomes
              </h4>
              <div className="space-y-2">
                {payload.predicted_outcomes.map((outcome, index) => (
                  <motion.div
                    key={`${outcome}-${index}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/80"
                  >
                    {outcome}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!payload && !isLoading && !error && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-sm text-zyra-text-secondary">
          Run Zyra Analytics AI to generate tailored action items for this dataset.
        </div>
      )}
    </div>
  );
}
