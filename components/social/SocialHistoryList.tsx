'use client';

import { motion } from 'framer-motion';
import { Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SocialHistoryItem } from '@/lib/api/social';
import clsx from 'clsx';

interface SocialHistoryListProps {
  items: SocialHistoryItem[];
  onSelect: (item: SocialHistoryItem) => void;
}

export function SocialHistoryList({ items, onSelect }: SocialHistoryListProps) {
  if (!items.length) {
    return (
      <div className="glass-card border border-dashed border-white/10 p-4 text-sm text-zyra-text-secondary">
        Generated posts will appear here. Keep creating content!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-card border border-zyra-glass-border p-4 hover:bg-white/5 transition-colors cursor-pointer"
          onClick={() => onSelect(item)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize border-zyra-glass-border text-zyra-text-secondary">
                  {item.platform}
                </Badge>
                <span className="text-xs text-zyra-text-secondary">
                  Goal: {item.content_goal}
                </span>
              </div>
              <p className="text-sm text-zyra-text-secondary line-clamp-2">
                {item.output.post_caption}
              </p>
              {item.diagnostics?.brand_summary && (
                <p className="text-xs text-zyra-text-secondary/80 line-clamp-2">
                  Strategy: {item.diagnostics.brand_summary}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                {item.output.hashtags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className="bg-white/10 text-white text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center text-xs text-zyra-text-secondary gap-1">
                <Clock className="w-3 h-3" />
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                disabled
                aria-label={item.is_favorite ? 'Saved' : 'Not saved'}
                className={clsx(
                  'text-zyra-text-secondary hover:text-red-400 hover:bg-white/5',
                  item.is_favorite && 'text-red-400'
                )}
              >
                <Heart className="w-4 h-4" fill={item.is_favorite ? 'currentColor' : 'none'} />
              </Button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

