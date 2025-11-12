'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  uploadAnalyticsDataset,
  analyzeAnalyticsDataset,
  fetchAnalyticsReport,
  fetchAnalyticsVisuals,
  AnalyticsReport
} from '@/lib/api/analytics';
import { DataUpload } from './DataUpload';
import { InsightCards } from './InsightCards';
import { TrendCharts } from './TrendCharts';
import { ZyraRecommends } from './ZyraRecommends';
import { ForecastPanel } from './ForecastPanel';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

interface AnalyticsDashboardProps {
  onDatasetReady?: (datasetId: string) => void;
}

export function AnalyticsDashboard({ onDatasetReady }: AnalyticsDashboardProps) {
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [report, setReport] = useState<AnalyticsReport | null>(null);
  const [charts, setCharts] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const summary = useMemo(() => report?.insight?.summary_text ?? null, [report]);
  const domainHint = useMemo(() => {
    const metadata = report?.dataset?.metadata as Record<string, any> | undefined;
    if (!metadata) return undefined;
    return (
      metadata.profileCategory ||
      metadata.category ||
      metadata.data_type ||
      metadata.domain ||
      metadata?.profile?.category ||
      undefined
    );
  }, [report]);

  const handleUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const dataset = await uploadAnalyticsDataset(file);
        setDatasetId(dataset.id);
        toast.success('Dataset uploaded. Run analysis to generate insights.');
        onDatasetReady?.(dataset.id);
      } catch (error: any) {
        toast.error(error.message || 'Failed to upload dataset');
      } finally {
        setIsUploading(false);
      }
    },
    [onDatasetReady]
  );

  const runAnalysis = useCallback(async () => {
    if (!datasetId) {
      toast.error('Upload a dataset first.');
      return;
    }
    setIsAnalyzing(true);
    toast.loading('Analyzing dataset with Zyra Analytics AI...', { id: 'analytics-run' });
    try {
      await analyzeAnalyticsDataset(datasetId);
      toast.success('Analysis complete!', { id: 'analytics-run' });
      const freshReport = await fetchAnalyticsReport(datasetId);
      setReport(freshReport);
      const visuals = await fetchAnalyticsVisuals(datasetId);
      setCharts(visuals);
    } catch (error: any) {
      toast.error(error.message || 'Analysis failed', { id: 'analytics-run' });
    } finally {
      setIsAnalyzing(false);
    }
  }, [datasetId]);

  useEffect(() => {
    if (!datasetId) return;
    const loadExisting = async () => {
      try {
        const existingReport = await fetchAnalyticsReport(datasetId);
        setReport(existingReport);
        if (existingReport.insight) {
          const visuals = await fetchAnalyticsVisuals(datasetId);
          setCharts(visuals);
        }
      } catch (error) {
        // dataset may not have insights yet – ignore
      }
    };
    loadExisting();
  }, [datasetId]);

  return (
    <div className="space-y-6">
      <DataUpload onUpload={handleUpload} isUploading={isUploading} />

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-cyber font-bold text-white">Analytics Summary</h2>
          <p className="text-sm text-zyra-text-secondary">
            Upload your dataset, run Zyra Analytics AI, and get growth-ready insights instantly.
          </p>
        </div>
        <Button
          disabled={!datasetId || isAnalyzing}
          onClick={runAnalysis}
          className="flex items-center gap-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <InsightCards
          keyMetrics={report?.insight?.key_metrics ?? null}
          insights={report?.insight?.insights ?? []}
          recommendations={report?.insight?.recommendations ?? []}
          summaryText={summary ?? undefined}
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <ZyraRecommends datasetId={datasetId} domain={domainHint} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <ForecastPanel datasetId={datasetId} domain={domainHint} />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <TrendCharts charts={charts} />
      </motion.div>
    </div>
  );
}

