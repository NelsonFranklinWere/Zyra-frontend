'use client';

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const palette = ['#8B5CF6', '#06B6D4', '#10B981', '#F97316', '#F59E0B', '#EC4899', '#22D3EE'];

interface ChartDescriptor {
  id: string;
  type: 'line' | 'bar' | 'pie';
  title: string;
  xKey: string;
  yKey?: string;
  data: Array<Record<string, any>>;
}

interface TrendChartsProps {
  charts: ChartDescriptor[];
}

export function TrendCharts({ charts }: TrendChartsProps) {
  if (!charts || charts.length === 0) {
    return (
      <Card className="glass-card border border-zyra-glass-border p-6 text-sm text-zyra-text-secondary">
        Visualizations will appear once Zyra has analysed your dataset.
      </Card>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {charts.map((chart, index) => (
        <motion.div
          key={chart.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="glass-card border border-zyra-glass-border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{chart.title}</h3>
              <Badge variant="outline" className="bg-white/5 text-zyra-text-secondary text-xs">
                {chart.type} chart
              </Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                {chart.type === 'line' && chart.yKey ? (
                  <LineChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={chart.xKey} stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip wrapperStyle={{ backgroundColor: '#1f2933', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Line type="monotone" dataKey={chart.yKey} stroke="#8B5CF6" strokeWidth={2} dot={false} />
                  </LineChart>
                ) : null}
                {chart.type === 'bar' && chart.yKey ? (
                  <BarChart data={chart.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey={chart.xKey} stroke="rgba(255,255,255,0.6)" />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
                    <Tooltip wrapperStyle={{ backgroundColor: '#1f2933', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Bar dataKey={chart.yKey} radius={[8, 8, 0, 0]} fill="#06B6D4" />
                  </BarChart>
                ) : null}
                {chart.type === 'pie' ? (
                  <PieChart>
                    <Pie
                      data={chart.data}
                      outerRadius={80}
                      dataKey={chart.yKey || 'value'}
                      nameKey={chart.xKey}
                    >
                      {chart.data.map((_entry, idx) => (
                        <Cell key={`slice-${idx}`} fill={palette[idx % palette.length]} />
                      ))}
                    </Pie>
                    <Tooltip wrapperStyle={{ backgroundColor: '#1f2933', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                  </PieChart>
                ) : null}
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

