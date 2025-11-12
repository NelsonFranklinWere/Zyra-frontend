'use client'

import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Save } from 'lucide-react'

interface StepNavigationProps {
  onPrevious: () => void
  onNext: () => void
  canGoPrevious: boolean
  canGoNext: boolean
  onSaveDraft?: () => void
  isLastStep?: boolean
}

export function StepNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  onSaveDraft,
  isLastStep = false,
}: StepNavigationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky bottom-0 left-0 right-0 bg-zyra-gradient border-t border-white/10 p-6 mt-8"
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Save Draft Button */}
        {onSaveDraft && (
          <motion.button
            onClick={onSaveDraft}
            className="flex items-center space-x-2 px-4 py-2 text-zyra-text-secondary hover:text-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </motion.button>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center space-x-4 ml-auto">
          {canGoPrevious && (
            <motion.button
              onClick={onPrevious}
              className="flex items-center space-x-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5" />
              <span>Previous</span>
            </motion.button>
          )}

          <motion.button
            onClick={onNext}
            disabled={!canGoNext}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
              canGoNext
                ? 'bg-gradient-to-r from-zyra-cyan-blue to-zyra-electric-violet hover:opacity-90 text-white'
                : 'bg-white/5 text-zyra-text-secondary cursor-not-allowed'
            }`}
            whileHover={canGoNext ? { scale: 1.02 } : {}}
            whileTap={canGoNext ? { scale: 0.98 } : {}}
          >
            <span>{isLastStep ? 'Review CV' : 'Next'}</span>
            {!isLastStep && <ChevronRight className="w-5 h-5" />}
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

