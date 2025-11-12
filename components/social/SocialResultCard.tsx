'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Copy, RefreshCw, Save, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialEngineDiagnostics, SocialPostResponse } from '@/lib/api/social';
import toast from 'react-hot-toast';

interface SocialResultCardProps {
  result: SocialPostResponse | null;
  postId?: string;
  isFavorite?: boolean;
  onRegenerate: () => void;
  onSave: (postId: string) => Promise<void>;
  onCopy?: () => void;
  warnings?: string[];
  score?: number;
  diagnostics?: SocialEngineDiagnostics | null;
  discoveryNote?: string | null;
}

export function SocialResultCard({
  result,
  postId,
  isFavorite,
  onRegenerate,
  onSave,
  onCopy,
  warnings,
  score,
  diagnostics,
  discoveryNote
}: SocialResultCardProps) {
  const platformBadge = useMemo(() => {
    if (!result) return null;
    return (
      <Badge variant="outline" className="border-zyra-glass-border text-zyra-text-secondary capitalize">
        {result.platform}
      </Badge>
    );
  }, [result]);

  if (!result) {
    return (
      <div className="glass-card border border-dashed border-white/10 p-6 text-center text-zyra-text-secondary">
        Enter your brand details to generate social content.
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result.post_caption);
    toast.success('Caption copied to clipboard');
    onCopy?.();
  };

  const handleSave = async () => {
    if (!postId) return;
    await onSave(postId);
  };

  const engineDiagnostics = useMemo<SocialEngineDiagnostics | null>(() => {
    if (!result && !diagnostics) {
      return null;
    }
    const source = result?.engines || diagnostics;
    if (!source) return null;
    const normalized = {
      brand_summary: source.brand_summary ?? '',
      trend_signals: source.trend_signals ?? '',
      creative_angle: source.creative_angle ?? '',
      visual_direction: source.visual_direction ?? '',
      engagement_plan: source.engagement_plan ?? ''
    };
    const hasContent = Object.values(normalized).some((value) => value.trim().length > 0);
    return hasContent ? normalized : null;
  }, [result, diagnostics]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border border-zyra-glass-border p-6 space-y-6"
    >
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          {platformBadge}
          <Badge variant="outline" className="border-zyra-glass-border text-zyra-text-secondary">
            Tone: {result.tone}
          </Badge>
          <Badge variant="outline" className="border-zyra-glass-border text-zyra-text-secondary">
            Goal: {result.content_goal}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Caption
          </Button>
          <Button variant="outline" size="sm" onClick={onRegenerate}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Regenerate
          </Button>
          <Button variant={isFavorite ? 'default' : 'outline'} size="sm" onClick={handleSave} disabled={!postId}>
            <Save className="w-4 h-4 mr-2" />
            {isFavorite ? 'Saved' : 'Save to Library'}
          </Button>
        </div>
      </div>

      <div className="space-y-4" aria-live="polite">
        {discoveryNote && (
          <section className="rounded-lg border border-zyra-electric-violet/40 bg-zyra-electric-violet/10 p-4">
            <p className="text-sm text-zyra-text-secondary">{discoveryNote}</p>
          </section>
        )}
        <section>
          <h3 className="text-lg font-semibold text-white mb-2">Caption</h3>
          <p className="text-zyra-text-secondary whitespace-pre-wrap">{result.post_caption}</p>
        </section>

        <section>
          <h3 className="text-lg font-semibold text-white mb-2">Hashtags</h3>
          <div className="flex flex-wrap gap-2">
            {result.hashtags.map((tag) => (
              <Badge key={tag} className="bg-white/10 text-white">
                {tag}
              </Badge>
            ))}
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Image Idea</h4>
            <p className="text-zyra-text-secondary">{result.image_idea}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Call to Action</h4>
            <p className="text-zyra-text-secondary">{result.cta}</p>
          </div>
        </section>

        <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h4 className="text-sm font-semibold text-white mb-1">Suggested Post Time</h4>
            <p className="text-zyra-text-secondary">{result.suggested_post_time}</p>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share plan
          </Button>
        </section>

        {engineDiagnostics && (
          <section
            aria-label="AI strategy breakdown"
            className="rounded-xl border border-white/10 bg-white/5 p-4"
          >
            <h3 className="text-lg font-semibold text-white mb-3">Strategy Breakdown</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Brand Summary</h4>
                <p className="text-zyra-text-secondary text-sm">{engineDiagnostics.brand_summary}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Trend Signals</h4>
                <p className="text-zyra-text-secondary text-sm">{engineDiagnostics.trend_signals}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Creative Angle</h4>
                <p className="text-zyra-text-secondary text-sm">{engineDiagnostics.creative_angle}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">Visual Direction</h4>
                <p className="text-zyra-text-secondary text-sm">{engineDiagnostics.visual_direction}</p>
              </div>
              <div className="md:col-span-2">
                <h4 className="text-sm font-semibold text-white mb-1">Engagement Plan</h4>
                <p className="text-zyra-text-secondary text-sm">{engineDiagnostics.engagement_plan}</p>
              </div>
            </div>
          </section>
        )}
      </div>

      {(warnings?.length || score !== undefined) && (
        <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 p-4 space-y-2">
          {score !== undefined && (
            <p className="text-sm text-yellow-300">Quality score: {score}</p>
          )}
          {warnings?.map((warning) => (
            <p key={warning} className="text-sm text-yellow-200">
              • {warning}
            </p>
          ))}
        </div>
      )}
    </motion.div>
  );
}

