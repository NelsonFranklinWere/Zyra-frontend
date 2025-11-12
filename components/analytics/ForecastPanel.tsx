'use client';

import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { runAnalyticsForecast, AnalyticsForecast } from '@/lib/api/analytics';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface ForecastPanelProps {
  datasetId: string | null;
  domain?: string;
}

const DEFAULT_HORIZON = 3;

export function ForecastPanel({ datasetId, domain }: ForecastPanelProps) {
  const [horizon, setHorizon] = useState<number>(DEFAULT_HORIZON);
  const [metric, setMetric] = useState<string>('');
  const [forecast, setForecast] = useState<AnalyticsForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRun = useMemo(() => Boolean(datasetId && horizon > 0), [datasetId, horizon]);

  const handleGenerate = useCallback(async () => {
    if (!datasetId) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await runAnalyticsForecast(datasetId, {
        horizon,
        metric: metric || undefined,
        domain
      });
      setForecast(response);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate forecast');
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, horizon, metric, domain]);

  return (
    <div className="glass-card border border-zyra-glass-border p-6 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-zyra-electric-violet" />
            <h3 className="text-lg font-semibold text-white">Predictive Outlook</h3>
            {domain && (
              <Badge className="bg-zyra-electric-violet/15 text-zyra-electric-violet border border-zyra-electric-violet/30">
                {domain}
              </Badge>
            )}
          </div>
          <p className="text-sm text-zyra-text-secondary max-w-2xl">
            Forecast the next few periods with Zyra’s signal engine. Understand likely trajectories and confidence before you act.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[150px,1fr,auto]">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-zyra-text-secondary">Horizon (periods)</label>
          <Select
            value={String(horizon)}
            onValueChange={(value) => setHorizon(Number(value) || DEFAULT_HORIZON)}
            disabled={!datasetId || isLoading}
          >
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent className="bg-[#0b0d1a] text-white border-white/10">
              {[3, 6, 9, 12].map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option} periods
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-zyra-text-secondary">Target metric (optional)</label>
          <Input
            value={metric}
            onChange={(event) => setMetric(event.target.value)}
            placeholder="e.g. total_revenue"
            disabled={!datasetId || isLoading}
            className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary"
          />
        </div>
        <div className="flex items-end">
          <Button
            className="w-full md:w-auto flex items-center gap-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80"
            disabled={!canRun || isLoading}
            onClick={handleGenerate}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Forecast
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {!datasetId && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zyra-text-secondary">
          Upload and analyze a dataset to unlock forecasting.
        </div>
      )}

      {forecast && datasetId && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-xl border border-zyra-electric-violet/20 bg-zyra-electric-violet/10 p-4 text-sm text-white/90 flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-zyra-electric-violet" />
              <p>{forecast.forecast_summary}</p>
            </div>
          </motion.div>

          {forecast.forecast_data.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={forecast.forecast_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#B3B7C5" tick={{ fontSize: 12 }} />
                    <YAxis stroke="#B3B7C5" tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ stroke: '#36d1dc', strokeWidth: 1 }} />
                    <Line type="monotone" dataKey="value" stroke="#36d1dc" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {forecast.notes && forecast.notes.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-zyra-text-secondary">Notes</h4>
              <div className="space-y-2 text-sm text-white/80">
                {forecast.notes.map((note, index) => (
                  <div key={`${note}-${index}`} className="rounded-lg border border-white/10 bg-white/5 p-3">
                    {note}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}




