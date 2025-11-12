'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Code, Tag, Plus, Trash2, HelpCircle, Sparkles } from 'lucide-react'
import { Skill } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { inputSuggestions, CACHE_KEYS } from '@/lib/input-suggestions'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface SkillsSectionProps {
  data: Skill[]
  onChange: (data: Skill[]) => void
}

const CATEGORIES = ['Technical', 'Analytical', 'Soft Skill']
const PROFICIENCY_LEVELS = ['Beginner', 'Intermediate', 'Expert']

const fieldTooltips = {
  name: 'Enter the skill name (e.g., React, Node.js, MySQL, Leadership, Data Analysis)',
  category: 'Select the category that best describes this skill',
  proficiency: 'Your level of proficiency with this skill',
  yearsOfExperience: 'How many years of experience you have with this skill (optional)',
  relevance: 'This will be auto-suggested by AI based on your job goals (optional)',
}

const createEmptySkill = (): Skill => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: '',
  category: '',
  proficiency: '',
  yearsOfExperience: 0,
  relevance: '',
})

export function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof Skill, string>>>>({})
  const [tagInput, setTagInput] = useState<Record<string, string>>({})

  // Ensure at least one skill entry exists
  useEffect(() => {
    if (data.length === 0) {
      onChange([createEmptySkill()])
    }
  }, [data.length, onChange])

  const handleAddSkill = () => {
    onChange([...data, createEmptySkill()])
  }

  const handleRemoveSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id))
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
    const newTagInput = { ...tagInput }
    delete newTagInput[id]
    setTagInput(newTagInput)
  }

  const handleChange = (id: string, field: keyof Skill, value: string) => {
    const updated = data.map(skill =>
      skill.id === id ? { ...skill, [field]: value } : skill
    )
    onChange(updated)

    // Track skill suggestions
    if (field === 'name' && value.trim()) {
      inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_SKILLS, value)
    }

    if (errors[id]?.[field]) {
      setErrors({
        ...errors,
        [id]: { ...errors[id], [field]: undefined }
      })
    }
  }

  const handleTagInputKeyDown = (id: string, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput[id]?.trim()) {
      e.preventDefault()
      handleChange(id, 'name', tagInput[id].trim())
      setTagInput({ ...tagInput, [id]: '' })
    }
  }

  const handleBlur = (id: string, field: keyof Skill, value: string) => {
    let error = ''

    switch (field) {
      case 'name':
        if (!value.trim()) {
          error = 'Skill name is required'
        }
        break
      case 'category':
        if (!value) {
          error = 'Category is required'
        }
        break
      case 'proficiency':
        if (!value) {
          error = 'Proficiency level is required'
        }
        break
    }

    if (error) {
      setErrors({
        ...errors,
        [id]: { ...errors[id], [field]: error }
      })
    }
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
              Skills
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Showcase your strengths. Include technical, analytical, and soft skills with proficiency levels.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="popLayout">
              {data.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Code className="w-5 h-5 text-zyra-cyan-blue" />
                      Skill Entry {index + 1}
                    </h3>
                    {data.length > 1 && (
                      <Button
                        onClick={() => handleRemoveSkill(skill.id)}
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
                    {/* Skill Name (Tag Input) */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2 md:col-span-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`skillName-${skill.id}`} className="text-sm font-medium text-white">
                          Skill Name <span className="text-red-400">*</span>
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
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`skillName-${skill.id}`}
                          value={skill.name || tagInput[skill.id] || ''}
                          onChange={(e) => {
                            setTagInput({ ...tagInput, [skill.id]: e.target.value })
                            handleChange(skill.id, 'name', e.target.value)
                          }}
                          onBlur={(e) => handleBlur(skill.id, 'name', skill.name || e.target.value)}
                          onKeyDown={(e) => handleTagInputKeyDown(skill.id, e)}
                          placeholder="Your skill name (press Enter to confirm)"
                          className={cn(
                            'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                            'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                            errors[skill.id]?.name && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                          )}
                        />
                      </div>
                      {errors[skill.id]?.name && (
                        <p className="text-sm text-red-400">{errors[skill.id].name}</p>
                      )}
                    </motion.div>

                    {/* Category */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`category-${skill.id}`} className="text-sm font-medium text-white">
                          Category <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.category}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={skill.category}
                        onValueChange={(value) => handleChange(skill.id, 'category', value)}
                      >
                        <SelectTrigger
                          className={cn(
                            'bg-white/5 border-white/10 text-white',
                            'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                            errors[skill.id]?.category && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          )}
                        >
                          <SelectValue placeholder="Your skill category" />
                        </SelectTrigger>
                        <SelectContent className="bg-zyra-dark border-white/10">
                          {CATEGORIES.map((category) => (
                            <SelectItem key={category} value={category} className="text-white focus:bg-zyra-electric-violet/20">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors[skill.id]?.category && (
                        <p className="text-sm text-red-400">{errors[skill.id].category}</p>
                      )}
                    </motion.div>

                    {/* Proficiency Level */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`proficiency-${skill.id}`} className="text-sm font-medium text-white">
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
                        value={skill.proficiency}
                        onValueChange={(value) => handleChange(skill.id, 'proficiency', value)}
                      >
                        <SelectTrigger
                          className={cn(
                            'bg-white/5 border-white/10 text-white',
                            'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                            errors[skill.id]?.proficiency && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                          )}
                        >
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
                      {errors[skill.id]?.proficiency && (
                        <p className="text-sm text-red-400">{errors[skill.id].proficiency}</p>
                      )}
                    </motion.div>

                    {/* Years of Experience (Optional) */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`years-${skill.id}`} className="text-sm font-medium text-white">
                          Years of Experience
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.yearsOfExperience}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        id={`years-${skill.id}`}
                        type="number"
                        min="0"
                        max="50"
                        value={skill.yearsOfExperience}
                        onChange={(e) => handleChange(skill.id, 'yearsOfExperience', e.target.value)}
                        placeholder="Your years of experience"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                      />
                    </motion.div>

                    {/* Relevance (Auto-suggested by AI) */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`relevance-${skill.id}`} className="text-sm font-medium text-white">
                            Relevance
                          </Label>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button type="button" className="inline-flex items-center justify-center">
                                <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-sm">{fieldTooltips.relevance}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
                        >
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Suggest
                        </Button>
                      </div>
                      <Input
                        id={`relevance-${skill.id}`}
                        value={skill.relevance}
                        onChange={(e) => handleChange(skill.id, 'relevance', e.target.value)}
                        placeholder="Auto-suggested relevance based on job goals"
                        className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        disabled
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Skill Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: data.length * 0.1 }}
            >
              <Button
                onClick={handleAddSkill}
                variant="outline"
                className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Skill
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

