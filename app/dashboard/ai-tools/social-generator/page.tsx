'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SocialResultCard } from '@/components/social/SocialResultCard';
import { SocialHistoryList } from '@/components/social/SocialHistoryList';
import {
  generateSocialPost,
  fetchSocialHistory,
  markSocialFavorite,
  SocialEngineDiagnostics,
  SocialHistoryItem,
  SocialPostResponse
} from '@/lib/api/social';
import { useAIAssistant, type AIRecommendation } from '@/contexts/ai-assistant-context';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

const PLATFORMS = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'threads', label: 'Threads' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' }
];

const TONES = ['Professional', 'Friendly', 'Luxury', 'Motivational', 'Playful'];
const GOALS = ['Engagement', 'Selling', 'Attracting'];
const BRAND_CATEGORIES = ['Corporate', 'Business', 'Startup', 'Personal Brand', 'Agency', 'Non-profit'];

interface FormState {
  platform: string;
  brandName: string;
  brandCategory: string;
  targetAudience: string;
  tone: string;
  contentGoal: string;
  theme: string;
  contentType: string;
}

const INITIAL_FORM: FormState = {
  platform: 'linkedin',
  brandName: '',
  brandCategory: 'Business',
  targetAudience: '',
  tone: 'Friendly',
  contentGoal: 'Engagement',
  theme: '',
  contentType: 'Promotional'
};

export default function SocialGeneratorPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SocialPostResponse | null>(null);
  const [postId, setPostId] = useState<string | undefined>(undefined);
  const [history, setHistory] = useState<SocialHistoryItem[]>([]);
  const [warnings, setWarnings] = useState<string[] | undefined>(undefined);
  const [score, setScore] = useState<number | undefined>(undefined);
  const [lastPayload, setLastPayload] = useState<FormState | null>(null);
  const [diagnostics, setDiagnostics] = useState<SocialEngineDiagnostics | null>(null);
  const [discoveryNote, setDiscoveryNote] = useState<string | null>(null);
  const { setActiveModule, setRecommendations } = useAIAssistant();

  useEffect(() => {
    setActiveModule('social');
  }, [setActiveModule]);

  useEffect(() => {
    const baseRecs: AIRecommendation[] = [
      {
        id: 'social-variations',
        title: 'Request caption variations',
        description: 'Ask Zyra for three tonal variations of the current concept.',
        prompt: result
          ? `Generate three alternative captions with matching hashtags for the following concept while preserving intent:\n\n${result.post_caption}`
          : 'Generate three alternative social media captions for our latest campaign.'
      },
      {
        id: 'social-calendar',
        title: 'Build a posting calendar',
        description: 'Create a 7-day content calendar focusing on this campaign.',
        prompt: `Design a seven-day social media calendar for ${form.brandName || 'our brand'} on ${form.platform}, maximising ${form.contentGoal.toLowerCase()} with varied content types.`
      },
      {
        id: 'social-audience',
        title: 'Deepen audience targeting',
        description: 'Get messaging angles tuned to our target audience.',
        prompt: `Craft audience-specific messaging angles for ${form.targetAudience || 'our core audience'} promoting ${form.theme || 'our current offer'} on ${form.platform}.`
      }
    ];
    setRecommendations(baseRecs, 'social');
  }, [form.brandName, form.contentGoal, form.platform, form.targetAudience, form.theme, result, setRecommendations]);

  const loadHistory = useCallback(async () => {
    try {
      const data = await fetchSocialHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleChange =
    (field: keyof FormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const submit = async (payloadOverride?: FormState) => {
    const payload = payloadOverride ?? form;
    if (!payload.contentGoal || !payload.platform) {
      toast.error('Platform and content goal are required');
      return;
    }

    setLoading(true);
    setWarnings(undefined);
    setScore(undefined);
    setDiagnostics(null);
    setDiscoveryNote(null);

    try {
      const response = await generateSocialPost({
        platform: payload.platform,
        brandName: payload.brandName,
        brandCategory: payload.brandCategory,
        targetAudience: payload.targetAudience,
        tone: payload.tone,
        contentGoal: payload.contentGoal,
        theme: payload.theme,
        contentType: payload.contentType
      });

      setResult(response.data);
      setPostId(response.postId);
      setWarnings(response.warnings);
      setScore(response.score);
      setLastPayload(payload);
      setDiagnostics(response.diagnostics ?? response.data.engines ?? null);
      setDiscoveryNote(
        `Zyra scanned live ${payload.platform} trends, fused them with your ${payload.brandCategory.toLowerCase()} brand DNA, and generated a post built to elevate your ${payload.contentGoal.toLowerCase()} results.`
      );
      toast.success('Social post generated');
      await loadHistory();
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate content');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = () => {
    if (lastPayload) {
      submit(lastPayload);
    } else {
      submit();
    }
  };

  const handleSave = async (id: string) => {
    try {
      await markSocialFavorite(id, true);
      toast.success('Saved to library');
      await loadHistory();
    } catch (error: any) {
      toast.error(error.message || 'Unable to save');
    }
  };

  const handleSelectHistory = (item: SocialHistoryItem) => {
    setResult(item.output);
    setPostId(item.id);
    setWarnings(undefined);
    setScore(undefined);
    setDiagnostics(item.diagnostics ?? item.output.engines ?? null);
    setDiscoveryNote(
      `This strategy reflects the earlier trend scan and brand memory synergy Zyra prepared for ${item.platform}.`
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-cyber font-bold gradient-text mb-2">
            Social AI Generator
          </h1>
          <p className="text-zyra-text-secondary max-w-2xl">
            Generate platform-optimized captions, hashtags, and visual ideas powered by Zyra’s brand intelligence.
          </p>
        </div>
        <Button
          onClick={() => submit()}
          disabled={loading}
          className="flex items-center gap-2 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80"
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </Button>
      </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        className="glass-card border border-zyra-glass-border p-6 space-y-6"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Platform</label>
            <Select
              value={form.platform}
              onValueChange={(value) => setForm((prev) => ({ ...prev, platform: value }))}
            >
              <SelectTrigger className="w-full rounded-xl border border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select platform" />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Tone</label>
            <Select
              value={form.tone}
              onValueChange={(value) => setForm((prev) => ({ ...prev, tone: value }))}
            >
              <SelectTrigger className="w-full rounded-xl border border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {TONES.map((tone) => (
                  <SelectItem key={tone} value={tone}>
                    {tone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Content Goal</label>
            <Select
              value={form.contentGoal}
              onValueChange={(value) => setForm((prev) => ({ ...prev, contentGoal: value }))}
            >
              <SelectTrigger className="w-full rounded-xl border border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {GOALS.map((goal) => (
                  <SelectItem key={goal} value={goal}>
                    {goal}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
      </div>

          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Content Type</label>
            <input
              value={form.contentType}
              onChange={handleChange('contentType')}
              placeholder="Promotional, Educational, Announcement..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-zyra-text-secondary focus:outline-none focus:ring-2 focus:ring-zyra-electric-violet/60"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Brand Name or Niche</label>
            <input
              value={form.brandName}
              onChange={handleChange('brandName')}
              placeholder="Nelson Shoes, Fintech SaaS, Yoga Instructors..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-zyra-text-secondary focus:outline-none focus:ring-2 focus:ring-zyra-electric-violet/60"
            />
                    </div>
          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Brand Category / SEO Focus</label>
            <Select
              value={form.brandCategory}
              onValueChange={(value) => setForm((prev) => ({ ...prev, brandCategory: value }))}
            >
              <SelectTrigger className="w-full rounded-xl border border-white/10 bg-white/5 text-white">
                <SelectValue placeholder="Select brand category" />
              </SelectTrigger>
              <SelectContent>
                {BRAND_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                        </div>
          <div className="space-y-2">
            <label className="text-sm text-zyra-text-secondary">Target Audience</label>
            <input
              value={form.targetAudience}
              onChange={handleChange('targetAudience')}
              placeholder="Gen Z professionals, Busy parents, Tech founders..."
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-zyra-text-secondary focus:outline-none focus:ring-2 focus:ring-zyra-electric-violet/60"
            />
          </div>
            </div>
            
        <div className="space-y-2">
          <label className="text-sm text-zyra-text-secondary">Theme / Product Spotlight</label>
                <textarea
            value={form.theme}
            onChange={handleChange('theme')}
                  rows={4}
            placeholder="Launch of AirFlex sneakers with shock-absorb sole..."
            className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 text-white placeholder:text-zyra-text-secondary focus:outline-none focus:ring-2 focus:ring-zyra-electric-violet/60"
                />
              </div>

        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => setForm(INITIAL_FORM)} disabled={loading}>
            Reset
          </Button>
          <Button onClick={() => submit()} disabled={loading} className="bg-zyra-electric-violet hover:bg-zyra-electric-violet/80">
            {loading ? 'Generating...' : 'Generate Post'}
          </Button>
                  </div>
      </motion.div>

      <SocialResultCard
        result={result}
        postId={postId}
        isFavorite={history.find((item) => item.id === postId)?.is_favorite}
        onRegenerate={handleRegenerate}
        onSave={handleSave}
        warnings={warnings}
        score={score}
        diagnostics={diagnostics}
        discoveryNote={discoveryNote}
      />

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Generations</h2>
          <span className="text-sm text-zyra-text-secondary">
            Automatically stored in your content library
          </span>
              </div>
        <SocialHistoryList items={history} onSelect={handleSelectHistory} />
      </motion.section>
    </div>
  );
}

