'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Briefcase, Building2, MapPin, Calendar, BriefcaseIcon, Code, Plus, Trash2, HelpCircle, Sparkles } from 'lucide-react'
import { Experience } from './types'
import { AutocompleteInput } from '@/components/ui/autocomplete-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { inputSuggestions, CACHE_KEYS } from '@/lib/input-suggestions'

interface ExperienceSectionProps {
  data: Experience[]
  onChange: (data: Experience[]) => void
}

const EMPLOYMENT_TYPES = ['Full-time', 'Internship', 'Part-time', 'Contract', 'Freelance']
const INDUSTRIES = [
  'Technology',
  'Education',
  'Banking & Finance',
  'Healthcare',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Government',
  'Non-profit',
  'Entertainment',
  'Other'
]

const fieldTooltips = {
  jobTitle: 'Enter your exact job title or role (e.g., IT Intern, Web Developer, Network Support)',
  company: 'The name of the company or organization you worked for',
  location: 'City and country where you worked (optional)',
  industry: 'The industry sector of the company (helps AI match relevance)',
  employmentType: 'The type of employment arrangement',
  startDate: 'The month and year you started this position',
  endDate: 'The month and year you ended (or "Present" if still working there)',
  responsibilities: 'Describe your main tasks, systems you worked on, and processes you handled. Use bullet points.',
  achievements: 'Key results, metrics, and impact. Include quantifiable outcomes (e.g., "Improved website load time by 40%")',
  toolsTechnologies: 'List the tools, software, programming languages, or technologies you used in this role',
}

const createEmptyExperience = (): Experience => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  jobTitle: '',
  company: '',
  location: '',
  industry: '',
  employmentType: '',
  startDate: '',
  endDate: '',
  responsibilities: '',
  achievements: '',
  toolsTechnologies: '',
})

const generateMonthYearOptions = () => {
  const options = []
  const currentDate = new Date()
  const startYear = currentDate.getFullYear() - 30
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  
  for (let year = currentDate.getFullYear(); year >= startYear; year--) {
    for (let month = 11; month >= 0; month--) {
      options.push(`${months[month]} ${year}`)
    }
  }
  return options
}

const MONTH_YEAR_OPTIONS = generateMonthYearOptions()

export function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof Experience, string>>>>({})

  // Ensure at least one experience entry exists
  useEffect(() => {
    if (data.length === 0) {
      onChange([createEmptyExperience()])
    }
  }, [data.length, onChange])

  const handleAddExperience = () => {
    onChange([...data, createEmptyExperience()])
  }

  const handleRemoveExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id))
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
  }

  const handleChange = (id: string, field: keyof Experience, value: string) => {
    const updated = data.map(exp =>
      exp.id === id ? { ...exp, [field]: value } : exp
    )
    onChange(updated)

    // Track suggestions for common fields
    if (field === 'jobTitle' && value.trim()) {
      inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_JOB_TITLES, value)
    } else if (field === 'company' && value.trim()) {
      inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_COMPANIES, value)
    } else if (field === 'location' && value.trim()) {
      inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_LOCATIONS, value)
    }

    if (errors[id]?.[field]) {
      setErrors({
        ...errors,
        [id]: { ...errors[id], [field]: undefined }
      })
    }
  }

  const handleBlur = (id: string, field: keyof Experience, value: string) => {
    let error = ''

    switch (field) {
      case 'jobTitle':
        // Job title is optional - only validate if company is also empty
        const exp = data.find(e => e.id === id)
        if (!value.trim() && (!exp?.company?.trim())) {
          error = 'Either job title or company name is required'
        }
        break
      case 'company':
        // Company is optional - only validate if job title is also empty
        const exp2 = data.find(e => e.id === id)
        if (!value.trim() && (!exp2?.jobTitle?.trim())) {
          error = 'Either company name or job title is required'
        }
        break
      case 'startDate':
        // Start date is optional
        break
      case 'endDate':
        // End date is optional
        break
    }

    if (error) {
      setErrors({
        ...errors,
        [id]: { ...errors[id], [field]: error }
      })
    } else {
      // Clear error if validation passes
      if (errors[id]?.[field]) {
        setErrors({
          ...errors,
          [id]: { ...errors[id], [field]: undefined }
        })
      }
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
              Work Experience
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Add your professional work experience. Include roles, responsibilities, achievements, and the technologies you used.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="popLayout">
              {data.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-zyra-cyan-blue" />
                      Experience Entry {index + 1}
                    </h3>
                    {data.length > 1 && (
                      <Button
                        onClick={() => handleRemoveExperience(experience.id)}
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
                    {/* Job Title */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`jobTitle-${experience.id}`} className="text-sm font-medium text-white">
                          Job Title <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.jobTitle}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <BriefcaseIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <AutocompleteInput
                          id={`jobTitle-${experience.id}`}
                          suggestionsKey="SUGGESTIONS_JOB_TITLES"
                          value={experience.jobTitle}
                          onChange={(e) => handleChange(experience.id, 'jobTitle', e.target.value)}
                          onValueChange={(value) => {
                            if (value.trim()) {
                              inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_JOB_TITLES, value)
                            }
                          }}
                          onSelect={(value) => handleChange(experience.id, 'jobTitle', value)}
                          onBlur={(e) => handleBlur(experience.id, 'jobTitle', e.target.value)}
                          placeholder="Your job title (e.g., Software Engineer)"
                          maxSuggestions={8}
                          className={cn(
                            'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                            'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                            errors[experience.id]?.jobTitle && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                          )}
                        />
                      </div>
                      {errors[experience.id]?.jobTitle && (
                        <p className="text-sm text-red-400">{errors[experience.id].jobTitle}</p>
                      )}
                    </motion.div>

                    {/* Company Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`company-${experience.id}`} className="text-sm font-medium text-white">
                          Company Name <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.company}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <AutocompleteInput
                          id={`company-${experience.id}`}
                          suggestionsKey="SUGGESTIONS_COMPANIES"
                          value={experience.company}
                          onChange={(e) => handleChange(experience.id, 'company', e.target.value)}
                          onValueChange={(value) => {
                            if (value.trim()) {
                              inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_COMPANIES, value)
                            }
                          }}
                          onSelect={(value) => handleChange(experience.id, 'company', value)}
                          onBlur={(e) => handleBlur(experience.id, 'company', e.target.value)}
                          placeholder="Your company name"
                          maxSuggestions={8}
                          className={cn(
                            'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                            'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                            errors[experience.id]?.company && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                          )}
                        />
                      </div>
                      {errors[experience.id]?.company && (
                        <p className="text-sm text-red-400">{errors[experience.id].company}</p>
                      )}
                    </motion.div>

                    {/* Location */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`location-${experience.id}`} className="text-sm font-medium text-white">
                          Location
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.location}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <AutocompleteInput
                          id={`location-${experience.id}`}
                          suggestionsKey="SUGGESTIONS_LOCATIONS"
                          value={experience.location}
                          onChange={(e) => handleChange(experience.id, 'location', e.target.value)}
                          onValueChange={(value) => {
                            if (value.trim()) {
                              inputSuggestions.add(CACHE_KEYS.SUGGESTIONS_LOCATIONS, value)
                            }
                          }}
                          onSelect={(value) => handleChange(experience.id, 'location', value)}
                          onBlur={(e) => handleBlur(experience.id, 'location', e.target.value)}
                          placeholder="City, Country (e.g., Nairobi, Kenya)"
                          maxSuggestions={8}
                          className={cn(
                            'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                            'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                            errors[experience.id]?.location && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                          )}
                        />
                      </div>
                    </motion.div>

                    {/* Industry */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`industry-${experience.id}`} className="text-sm font-medium text-white">
                          Industry
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.industry}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={experience.industry}
                        onValueChange={(value) => handleChange(experience.id, 'industry', value)}
                      >
                        <SelectTrigger
                          className="bg-white/5 border-white/10 text-white focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20"
                        >
                          <SelectValue placeholder="Your industry" />
                        </SelectTrigger>
                        <SelectContent className="bg-zyra-dark border-white/10">
                          {INDUSTRIES.map((industry) => (
                            <SelectItem key={industry} value={industry} className="text-white focus:bg-zyra-electric-violet/20">
                              {industry}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Employment Type */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`employmentType-${experience.id}`} className="text-sm font-medium text-white">
                          Employment Type
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.employmentType}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select
                        value={experience.employmentType}
                        onValueChange={(value) => handleChange(experience.id, 'employmentType', value)}
                      >
                        <SelectTrigger
                          className="bg-white/5 border-white/10 text-white focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20"
                        >
                          <SelectValue placeholder="Your employment type" />
                        </SelectTrigger>
                        <SelectContent className="bg-zyra-dark border-white/10">
                          {EMPLOYMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type} className="text-white focus:bg-zyra-electric-violet/20">
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>

                    {/* Start Date - End Date */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.25 }}
                      className="space-y-4 md:col-span-2"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Label className="text-sm font-medium text-white">
                          Duration <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.startDate} - {fieldTooltips.endDate}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                          <Select
                            value={experience.startDate}
                            onValueChange={(value) => handleChange(experience.id, 'startDate', value)}
                          >
                            <SelectTrigger
                              className={cn(
                                'pl-10 bg-white/5 border-white/10 text-white',
                                'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                                errors[experience.id]?.startDate && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              )}
                            >
                              <SelectValue placeholder="Start date" />
                            </SelectTrigger>
                            <SelectContent className="bg-zyra-dark border-white/10 max-h-[200px]">
                              {MONTH_YEAR_OPTIONS.map((date) => (
                                <SelectItem key={date} value={date} className="text-white focus:bg-zyra-electric-violet/20">
                                  {date}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                          <Select
                            value={experience.endDate}
                            onValueChange={(value) => handleChange(experience.id, 'endDate', value)}
                          >
                            <SelectTrigger
                              className={cn(
                                'pl-10 bg-white/5 border-white/10 text-white',
                                'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                                errors[experience.id]?.endDate && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              )}
                            >
                              <SelectValue placeholder="End date or Present" />
                            </SelectTrigger>
                            <SelectContent className="bg-zyra-dark border-white/10 max-h-[200px]">
                              <SelectItem value="Present" className="text-white focus:bg-zyra-electric-violet/20">
                                Present
                              </SelectItem>
                              {MONTH_YEAR_OPTIONS.map((date) => (
                                <SelectItem key={date} value={date} className="text-white focus:bg-zyra-electric-violet/20">
                                  {date}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {(errors[experience.id]?.startDate || errors[experience.id]?.endDate) && (
                        <p className="text-sm text-red-400">
                          {errors[experience.id].startDate || errors[experience.id].endDate}
                        </p>
                      )}
                    </motion.div>
                  </div>

                  {/* Roles & Responsibilities */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`responsibilities-${experience.id}`} className="text-sm font-medium text-white">
                          Roles & Responsibilities
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.responsibilities}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                    <Textarea
                      id={`responsibilities-${experience.id}`}
                      value={experience.responsibilities}
                      onChange={(e) => handleChange(experience.id, 'responsibilities', e.target.value)}
                      placeholder="Your main tasks, systems you worked on, and processes you handled. Use bullet points for better formatting..."
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                    />
                  </motion.div>

                  {/* Key Achievements */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.35 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`achievements-${experience.id}`} className="text-sm font-medium text-white">
                          Key Achievements <span className="text-zyra-text-secondary text-xs font-normal">(Include metrics & impact)</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.achievements}</p>
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
                    <Textarea
                      id={`achievements-${experience.id}`}
                      value={typeof experience.achievements === 'string' 
                        ? experience.achievements 
                        : experience.achievements.map(a => typeof a === 'string' ? a : a.text).join('\n')}
                      onChange={(e) => handleChange(experience.id, 'achievements', e.target.value)}
                      placeholder="Your key results, metrics, and impact (e.g., 'Improved website load time by 40%', 'Led team of 5 developers')..."
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                    />
                  </motion.div>

                  {/* Tools / Technologies Used */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.4 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`toolsTechnologies-${experience.id}`} className="text-sm font-medium text-white">
                        Tools / Technologies Used
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="inline-flex items-center justify-center">
                            <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm">{fieldTooltips.toolsTechnologies}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <Code className="absolute left-3 top-3 w-5 h-5 text-zyra-text-secondary z-10" />
                      <Textarea
                        id={`toolsTechnologies-${experience.id}`}
                        value={experience.toolsTechnologies}
                        onChange={(e) => handleChange(experience.id, 'toolsTechnologies', e.target.value)}
                        placeholder="Your tools, software, programming languages, or technologies (e.g., React, Node.js, MySQL, Docker, AWS)..."
                        rows={3}
                        className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Experience Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: data.length * 0.1 }}
            >
              <Button
                onClick={handleAddExperience}
                variant="outline"
                className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Experience Entry
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

