'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { AnalyticsChat } from '@/components/analytics/AnalyticsChat';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function AnalyticsChatPage() {
  const params = useSearchParams();
  const datasetId = params.get('dataset');
  const domain = params.get('domain') || undefined;

  const heading = useMemo(() => {
    if (!datasetId) return 'Connect a dataset to start chatting';
    return `Chat with Dataset ${datasetId.slice(0, 8)}`;
  }, [datasetId]);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge className="bg-zyra-cyan-blue/15 text-zyra-cyan-blue border border-zyra-cyan-blue/30">
                Analytics AI Chat
              </Badge>
            </div>
            <h1 className="text-3xl font-cyber font-bold gradient-text">Conversational Intelligence</h1>
            <p className="text-sm text-zyra-text-secondary max-w-3xl">
              Ask natural-language questions about your data. Zyra detects the metric, selects the right visual, and explains the signal in context.
            </p>
          </div>
          <div className="text-xs text-zyra-text-secondary">
            Need a dataset?{' '}
            <Link href="/dashboard/ai-tools/analytics" className="text-zyra-cyan-blue hover:underline">
              Run Analytics AI first
            </Link>
          </div>
        </div>
      </motion.div>

      <AnalyticsChat datasetId={datasetId} domain={domain} />
    </div>
  );
}




