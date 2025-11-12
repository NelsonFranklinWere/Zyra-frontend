'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { CVStep } from './types'

interface StepProgressProps {
  currentStep: CVStep
  steps: CVStep[]
  stepTitles: Record<CVStep, string>
}

export function StepProgress({ currentStep, steps, stepTitles }: StepProgressProps) {
  const currentIndex = steps.indexOf(currentStep)
  const progress = ((currentIndex + 1) / steps.length) * 100

  return (
    <div className="w-full mb-8">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-zyra-cyan-blue to-zyra-electric-violet rounded-full"
        />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex
          const isCurrent = step === currentStep
          const stepNum = index + 1

          return (
            <div key={step} className="flex-1 flex items-center">
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div className="relative">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                      isCompleted
                        ? 'bg-zyra-cyan-blue border-zyra-cyan-blue'
                        : isCurrent
                        ? 'bg-zyra-electric-violet border-zyra-electric-violet'
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isCurrent ? 'text-white' : 'text-zyra-text-secondary'
                        }`}
                      >
                        {stepNum}
                      </span>
                    )}
                  </motion.div>
                  {isCurrent && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 rounded-full border-2 border-zyra-electric-violet blur-md opacity-50"
                    />
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-zyra-cyan-blue'
                        : 'text-zyra-text-secondary'
                    }`}
                  >
                    {stepTitles[step]}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-2 ${
                    index < currentIndex
                      ? 'bg-zyra-cyan-blue'
                      : 'bg-white/10'
                  }`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Current Step Info */}
      <div className="mt-6 text-center">
        <p className="text-sm text-zyra-text-secondary">
          Step {currentIndex + 1} of {steps.length}: {stepTitles[currentStep]}
        </p>
      </div>
    </div>
  )
}

