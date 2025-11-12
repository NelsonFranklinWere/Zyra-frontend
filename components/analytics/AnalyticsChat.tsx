'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AnalyticsQueryResponse,
  runAnalyticsQuery
} from '@/lib/api/analytics';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  AlertTriangle,
  BarChart3,
  LineChartIcon,
  MessageSquarePlus,
  PieChart,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

interface AnalyticsChatProps {
  datasetId: string | null;
  domain?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: AnalyticsQueryResponse;
}

const chartPalette = ['#7b5cff', '#36d1dc', '#ff7eb6', '#ffd166', '#4cc9f0'];

export function AnalyticsChat({ datasetId, domain }: AnalyticsChatProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    });
  }, []);

  const canAsk = useMemo(() => Boolean(datasetId && question.trim()), [datasetId, question]);

  const handleSend = useCallback(async () => {
    if (!datasetId || !question.trim()) return;
    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question.trim()
    };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion('');
    setIsSending(true);
    setError(null);
    scrollToBottom();

    try {
      const response = await runAnalyticsQuery(datasetId, userMessage.content, domain);
      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: response.insight,
        data: response
      };
      setMessages((prev) => [...prev, assistantMessage]);
      scrollToBottom();
    } catch (err: any) {
      setError(err?.message || 'Failed to interpret analytics question.');
    } finally {
      setIsSending(false);
    }
  }, [datasetId, domain, question, scrollToBottom]);

  const renderChart = (payload: AnalyticsQueryResponse) => {
    if (!payload.visual_data || payload.visual_data.length === 0) {
      return null;
    }

    const xKey = payload.x_key || Object.keys(payload.visual_data[0])[0];
    const yKey = payload.y_key || Object.keys(payload.visual_data[0]).find((key) => key !== xKey) || xKey;

    switch (payload.chart_type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={payload.visual_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xKey} stroke="#B3B7C5" tick={{ fontSize: 12 }} />
              <YAxis stroke="#B3B7C5" tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(123,92,255,0.08)' }} />
              <Line type="monotone" dataKey={yKey} stroke="#7b5cff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={payload.visual_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xKey} stroke="#B3B7C5" tick={{ fontSize: 12 }} />
              <YAxis stroke="#B3B7C5" tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: 'rgba(123,92,255,0.08)' }} />
              <Bar dataKey={yKey} fill="#36d1dc" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={payload.visual_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey={xKey} stroke="#B3B7C5" tick={{ fontSize: 12 }} />
              <YAxis stroke="#B3B7C5" tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ stroke: '#7b5cff', strokeWidth: 1 }} />
              <Area
                type="monotone"
                dataKey={yKey}
                stroke="#7b5cff"
                fill="url(#area-gradient)"
                strokeWidth={2}
              />
              <defs>
                <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7b5cff" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#7b5cff" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={260}>
            <RePieChart>
              <Tooltip />
              <Pie data={payload.visual_data} dataKey={yKey} nameKey={xKey} cx="50%" cy="50%" outerRadius={90}>
                {payload.visual_data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={chartPalette[index % chartPalette.length]} />
                ))}
              </Pie>
            </RePieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case 'line':
      case 'area':
        return <LineChartIcon className="h-4 w-4" />;
      case 'bar':
        return <BarChart3 className="h-4 w-4" />;
      case 'pie':
        return <PieChart className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  const emptyState = !messages.length;

  return (
    <div className="glass-card border border-zyra-glass-border p-6 space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5 text-zyra-cyan-blue" />
            <h3 className="text-lg font-semibold text-white">Conversational Analytics</h3>
            {domain && (
              <Badge className="bg-zyra-cyan-blue/15 text-zyra-cyan-blue border border-zyra-cyan-blue/30">
                {domain}
              </Badge>
            )}
          </div>
          <p className="text-sm text-zyra-text-secondary max-w-2xl">
            Ask data-aware questions. Zyra interprets your dataset, surfaces the right visual and explains the signal in seconds.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div
        ref={listRef}
        className="max-h-[420px] space-y-4 overflow-y-auto rounded-xl border border-white/5 bg-white/5 p-4"
      >
        {emptyState && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-zyra-text-secondary">
            Try questions like “Show me monthly revenue growth”, “Compare sales in Nairobi vs Mombasa”, or “Which product had the highest returns?”.
          </div>
        )}

        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-4 ${
              message.role === 'user'
                ? 'border-zyra-electric-violet/40 bg-zyra-electric-violet/10'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zyra-text-secondary mb-2">
              {message.role === 'user' ? 'You' : 'Zyra'}
            </div>
            <p className="text-sm text-white/90 leading-relaxed">{message.content}</p>

            {message.data && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 text-xs text-zyra-text-secondary uppercase tracking-wide">
                  {renderIcon(message.data.chart_type)}
                  <span>{message.data.metric}</span>
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                  {renderChart(message.data) || (
                    <p className="text-xs text-zyra-text-secondary">
                      No chart to display for this response.
                    </p>
                  )}
                </div>
                {message.data.suggested_followups && message.data.suggested_followups.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {message.data.suggested_followups.map((followup, index) => (
                      <button
                        key={`${followup}-${index}`}
                        onClick={() => setQuestion(followup)}
                        className="rounded-full border border-zyra-cyan-blue/40 bg-zyra-cyan-blue/10 px-3 py-1 text-xs text-zyra-cyan-blue hover:bg-zyra-cyan-blue/20 transition-colors"
                      >
                        <Sparkles className="mr-1 inline h-3 w-3" />
                        {followup}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <Input
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder={datasetId ? 'Ask Zyra about your data...' : 'Upload and analyze a dataset first'}
          disabled={!datasetId || isSending}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (canAsk) handleSend();
            }
          }}
          className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary"
        />
        <Button
          onClick={handleSend}
          disabled={!canAsk || isSending}
          className="flex items-center gap-2 bg-zyra-cyan-blue hover:bg-zyra-cyan-blue/80"
        >
          {isSending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Ask Zyra
        </Button>
      </div>
    </div>
  );
}




