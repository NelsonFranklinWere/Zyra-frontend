'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Languages, Plus, Trash2, HelpCircle } from 'lucide-react'
import { Language } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface LanguagesSectionProps {
  data: Language[]
  onChange: (data: Language[]) => void
}

const PROFICIENCY_LEVELS = ['Basic', 'Intermediate', 'Fluent', 'Native']

const fieldTooltips = {
  name: 'Enter the language name',
  proficiency: 'Your proficiency level in this language',
}

const createEmptyLanguage = (): Language => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: '',
  proficiency: 'Basic',
})

export function LanguagesSection({ data, onChange }: LanguagesSectionProps) {
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof Language, string>>>>({})

  useEffect(() => {
    if (data.length === 0) {
      onChange([createEmptyLanguage()])
    }
  }, [data.length, onChange])

  const handleAddLanguage = () => {
    onChange([...data, createEmptyLanguage()])
  }

  const handleRemoveLanguage = (id: string) => {
    onChange(data.filter(lang => lang.id !== id))
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
  }

  const handleChange = (id: string, field: keyof Language, value: string) => {
    const updated = data.map(lang =>
      lang.id === id ? { ...lang, [field]: value } : lang
    )
    onChange(updated)
  }

  return (
    <TooltipProvider>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="space-y-6"
      >
        <Card className="bg-transparent border-white/10">
          <CardHeader>
            <CardTitle className="text-3xl font-cyber font-bold gradient-text">
              Languages
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              List the languages you speak and your proficiency level in each.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="popLayout">
              {data.map((language, index) => (
                <motion.div
                  key={language.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Languages className="w-5 h-5 text-zyra-cyan-blue" />
                      Language Entry {index + 1}
                    </h3>
                    {data.length > 1 && (
                      <Button
                        onClick={() => handleRemoveLanguage(language.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Language Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`name-${language.id}`} className="text-sm font-medium text-white">
                          Language Name <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id={`name-${language.id}`}
                        value={language.name}
                        onChange={(e) => handleChange(language.id, 'name', e.target.value)}
                        placeholder="Your language name"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                      />
                    </motion.div>

                    {/* Proficiency Level */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`proficiency-${language.id}`} className="text-sm font-medium text-white">
                          Proficiency Level <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.proficiency}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={language.proficiency}
                        onValueChange={(value) => handleChange(language.id, 'proficiency', value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20">
                          <SelectValue placeholder="Your proficiency level" />
                        </SelectTrigger>
                        <SelectContent className="bg-zyra-dark border-white/10">
                          {PROFICIENCY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level} className="text-white focus:bg-zyra-electric-violet/20">
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Language Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: data.length * 0.1 }}
            >
              <Button
                onClick={handleAddLanguage}
                variant="outline"
                className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Language
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

