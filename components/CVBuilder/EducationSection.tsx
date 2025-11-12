'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraduationCap, Building2, Calendar, Award, BookOpen, Sparkles, Plus, Trash2, HelpCircle } from 'lucide-react'
import { Education } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'

interface EducationSectionProps {
  data: Education[]
  onChange: (data: Education[]) => void
}

const QUALIFICATIONS = [
  'Certificate',
  'Diploma',
  'Associate Degree',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Other'
]

const currentYear = new Date().getFullYear()
const YEARS = Array.from({ length: 50 }, (_, i) => currentYear - i).map(String)

const fieldTooltips = {
  institution: 'Enter the full name of your educational institution',
  course: 'Enter your major, course of study, or field of specialization',
  qualification: 'Select your qualification level (e.g., Bachelor\'s, Diploma)',
  startYear: 'The year you started this program',
  endYear: 'The year you completed or expect to complete this program',
  gpa: 'Your Grade Point Average (optional - only include if it strengthens your profile)',
  honors: 'Any honors, distinctions, or special recognition received (optional)',
  achievements: 'Key projects, research, publications, or notable achievements during your studies',
}

const createEmptyEducation = (): Education => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  institution: '',
  course: '',
  qualification: '',
  startYear: '',
  endYear: '',
  gpa: '',
  honors: '',
  achievements: '',
})

export function EducationSection({ data, onChange }: EducationSectionProps) {
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof Education, string>>>>({})

  // Ensure at least one education entry exists
  useEffect(() => {
    if (data.length === 0) {
      onChange([createEmptyEducation()])
    }
  }, [data.length, onChange])

  const handleAddEducation = () => {
    onChange([...data, createEmptyEducation()])
  }

  const handleRemoveEducation = (id: string) => {
    onChange(data.filter(edu => edu.id !== id))
    // Remove errors for deleted entry
    const newErrors = { ...errors }
    delete newErrors[id]
    setErrors(newErrors)
  }

  const handleChange = (id: string, field: keyof Education, value: string) => {
    const updated = data.map(edu =>
      edu.id === id ? { ...edu, [field]: value } : edu
    )
    onChange(updated)

    // Clear error when user starts typing
    if (errors[id]?.[field]) {
      setErrors({
        ...errors,
        [id]: { ...errors[id], [field]: undefined }
      })
    }
  }

  const handleBlur = (id: string, field: keyof Education, value: string) => {
    let error = ''

    switch (field) {
      case 'institution':
        // Institution is optional - only validate if course is also empty
        const edu = data.find(e => e.id === id)
        if (!value.trim() && (!edu?.course?.trim())) {
          error = 'Either institution or course is required'
        }
        break
      case 'course':
        // Course is optional - only validate if institution is also empty
        const edu2 = data.find(e => e.id === id)
        if (!value.trim() && (!edu2?.institution?.trim())) {
          error = 'Either course or institution is required'
        }
        break
      case 'qualification':
        // Qualification is optional
        break
      case 'startYear':
        // Start year is optional
        break
      case 'endYear':
        // End year is optional, but validate if both are provided
        const edu3 = data.find(e => e.id === id)
        if (value && edu3?.startYear && 
            parseInt(value) < parseInt(edu3.startYear)) {
          error = 'End year should be after start year'
        }
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
              Education
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Add your educational background. Include your academic foundation, timeline, and achievements.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <AnimatePresence mode="popLayout">
              {data.map((education, index) => (
                <motion.div
                  key={education.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6 relative z-0"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-zyra-cyan-blue" />
                      Education Entry {index + 1}
                    </h3>
                    {data.length > 1 && (
                      <Button
                        onClick={() => handleRemoveEducation(education.id)}
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
                    {/* Institution Name */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`institution-${education.id}`} className="text-sm font-medium text-white">
                          Institution Name <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.institution}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`institution-${education.id}`}
                          value={education.institution}
                          onChange={(e) => handleChange(education.id, 'institution', e.target.value)}
                          onBlur={(e) => handleBlur(education.id, 'institution', e.target.value)}
                          placeholder="Your institution name"
                          className={cn(
                            'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                            'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                            errors[education.id]?.institution && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                          )}
                        />
                      </div>
                      {errors[education.id]?.institution && (
                        <p className="text-sm text-red-400">{errors[education.id].institution}</p>
                      )}
                    </motion.div>

                    {/* Course / Major */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.05 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`course-${education.id}`} className="text-sm font-medium text-white">
                          Course / Major <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.course}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`course-${education.id}`}
                          value={education.course}
                          onChange={(e) => handleChange(education.id, 'course', e.target.value)}
                          onBlur={(e) => handleBlur(education.id, 'course', e.target.value)}
                          placeholder="Your course or major"
                          className={cn(
                            'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                            'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                            errors[education.id]?.course && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                          )}
                        />
                      </div>
                      {errors[education.id]?.course && (
                        <p className="text-sm text-red-400">{errors[education.id].course}</p>
                      )}
                    </motion.div>

                    {/* Qualification */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.1 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`qualification-${education.id}`} className="text-sm font-medium text-white">
                          Qualification <span className="text-red-400">*</span>
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.qualification}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative z-[100]">
                        <Select
                          value={education.qualification}
                          onValueChange={(value) => handleChange(education.id, 'qualification', value)}
                        >
                          <SelectTrigger
                            className={cn(
                              'bg-white/5 border-white/10 text-white',
                              'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                              errors[education.id]?.qualification && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                            )}
                          >
                            <SelectValue placeholder="Your qualification" />
                          </SelectTrigger>
                          <SelectContent className="bg-zyra-dark border-white/10 z-[9999]">
                            {QUALIFICATIONS.map((qual) => (
                              <SelectItem key={qual} value={qual} className="text-white focus:bg-zyra-electric-violet/20 cursor-pointer">
                                {qual}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {errors[education.id]?.qualification && (
                        <p className="text-sm text-red-400">{errors[education.id].qualification}</p>
                      )}
                    </motion.div>

                    {/* Start Year - End Year */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.15 }}
                      className="space-y-4"
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
                            <p className="text-sm">{fieldTooltips.startYear} - {fieldTooltips.endYear}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                          <Select
                            value={education.startYear}
                            onValueChange={(value) => handleChange(education.id, 'startYear', value)}
                          >
                            <SelectTrigger
                              className={cn(
                                'pl-10 bg-white/5 border-white/10 text-white',
                                'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                                errors[education.id]?.startYear && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              )}
                            >
                              <SelectValue placeholder="Start year" />
                            </SelectTrigger>
                            <SelectContent className="bg-zyra-dark border-white/10 max-h-[200px]">
                              {YEARS.map((year) => (
                                <SelectItem key={year} value={year} className="text-white focus:bg-zyra-electric-violet/20">
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                          <Select
                            value={education.endYear}
                            onValueChange={(value) => handleChange(education.id, 'endYear', value)}
                          >
                            <SelectTrigger
                              className={cn(
                                'pl-10 bg-white/5 border-white/10 text-white',
                                'focus:border-zyra-cyan-blue focus:ring-zyra-cyan-blue/20',
                                errors[education.id]?.endYear && 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                              )}
                            >
                              <SelectValue placeholder="End year" />
                            </SelectTrigger>
                            <SelectContent className="bg-zyra-dark border-white/10 max-h-[200px]">
                              {YEARS.map((year) => (
                                <SelectItem key={year} value={year} className="text-white focus:bg-zyra-electric-violet/20">
                                  {year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {(errors[education.id]?.startYear || errors[education.id]?.endYear) && (
                        <p className="text-sm text-red-400">
                          {errors[education.id].startYear || errors[education.id].endYear}
                        </p>
                      )}
                    </motion.div>

                    {/* GPA (Optional) */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`gpa-${education.id}`} className="text-sm font-medium text-white">
                          GPA / Honors
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button type="button" className="inline-flex items-center justify-center">
                              <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="text-sm">{fieldTooltips.gpa} - {fieldTooltips.honors}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                        <Input
                          id={`gpa-${education.id}`}
                          value={education.gpa}
                          onChange={(e) => handleChange(education.id, 'gpa', e.target.value)}
                          placeholder="Your GPA (e.g., 3.8/4.0) or honors"
                          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* Key Achievements (Optional) */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 + 0.25 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`achievements-${education.id}`} className="text-sm font-medium text-white">
                        Key Achievements or Projects
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
                    <Textarea
                      id={`achievements-${education.id}`}
                      value={education.achievements}
                      onChange={(e) => handleChange(education.id, 'achievements', e.target.value)}
                      placeholder="Your key achievements, projects, research, or notable accomplishments during your studies..."
                      rows={3}
                      className="bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20"
                    />
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Add Education Button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: data.length * 0.1 }}
            >
              <Button
                onClick={handleAddEducation}
                variant="outline"
                className="w-full bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30 border-zyra-electric-violet/30"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Education Entry
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}

