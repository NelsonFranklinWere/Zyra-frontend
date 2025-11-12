'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Linkedin, Github, Globe, Sparkles, HelpCircle } from 'lucide-react'
import { PersonalInfo } from './types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface PersonalInfoSectionProps {
  data: PersonalInfo
  onChange: (data: PersonalInfo) => void
}

const fieldTooltips: Record<keyof PersonalInfo, string> = {
  fullName: 'Enter your full legal name as you want it to appear on your CV',
  title: 'Your professional headline (e.g., Software Engineer | Frontend Developer | Data Analyst)',
  email: 'Use a professional email address. This is how employers will contact you',
  phoneNumber: 'Include country code for international opportunities (e.g., +254 712 345 678)',
  location: 'City and country (e.g., Nairobi, Kenya)',
  linkedin: 'Your LinkedIn profile URL helps employers view your professional network',
  github: 'Your GitHub or portfolio URL to showcase your work',
  portfolio: 'Link to your portfolio or personal website (optional)',
  aboutMe: 'Tell us about yourself — your background, strengths, values, and what makes you unique in your field',
}

export function PersonalInfoSection({ data, onChange }: PersonalInfoSectionProps) {
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalInfo, string>>>({})
  const [isRefining, setIsRefining] = useState(false)

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateURL = (url: string): boolean => {
    if (!url) return true // Optional field
    try {
      new URL(url.startsWith('http') ? url : `https://${url}`)
      return true
    } catch {
      return false
    }
  }

  const handleChange = (field: keyof PersonalInfo, value: string) => {
    const newData = { ...data, [field]: value }
    onChange(newData)

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
  }

  const handleBlur = (field: keyof PersonalInfo, value: string) => {
    // Clear error when validation passes
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined })
    }
    let error = ''

    switch (field) {
      case 'fullName':
        if (!value) {
          error = 'Full name is required'
        }
        break
      case 'title':
        // Professional title is optional
        break
      case 'email':
        if (!value) {
          error = 'Email is required'
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email address'
        }
        break
      case 'phoneNumber':
        // Phone number is optional
        break
      case 'linkedin':
        if (value && !validateURL(value)) {
          error = 'Please enter a valid URL'
        }
        break
      case 'github':
        if (value && !validateURL(value)) {
          error = 'Please enter a valid URL'
        }
        break
      case 'portfolio':
        if (value && !validateURL(value)) {
          error = 'Please enter a valid URL'
        }
        break
    }

    if (error) {
      setErrors({ ...errors, [field]: error })
    }
  }

  const handleRefineWithAI = async () => {
    if (!data.aboutMe) {
      setErrors({ ...errors, aboutMe: 'Please enter some text first' })
      return
    }

    setIsRefining(true)
    // TODO: Replace with actual AI API call
    // Placeholder function for AI refinement
    setTimeout(() => {
      const refined = `Professional ${data.aboutMe} with a proven track record of excellence.`
      onChange({ ...data, aboutMe: refined })
      setIsRefining(false)
    }, 1500)
  }

  const fields = [
    {
      id: 'fullName' as const,
      label: 'Full Name',
      icon: User,
      placeholder: 'Your name',
      required: true,
    },
    {
      id: 'title' as const,
      label: 'Professional Headline',
      icon: User,
      placeholder: 'e.g., Software Engineer | Frontend Developer | Data Analyst',
      required: true,
    },
    {
      id: 'email' as const,
      label: 'Email',
      icon: Mail,
      placeholder: 'Your email',
      type: 'email',
      required: true,
    },
    {
      id: 'phoneNumber' as const,
      label: 'Phone Number',
      icon: Phone,
      placeholder: '+254700000000',
      required: true,
    },
    {
      id: 'location' as const,
      label: 'City & Country',
      icon: MapPin,
      placeholder: 'e.g., Nairobi, Kenya',
      required: false,
    },
    {
      id: 'linkedin' as const,
      label: 'LinkedIn Profile',
      icon: Linkedin,
      placeholder: 'https://linkedin.com/in/...',
      required: false,
    },
    {
      id: 'github' as const,
      label: 'GitHub Profile',
      icon: Github,
      placeholder: 'https://github.com/...',
      required: false,
    },
    {
      id: 'portfolio' as const,
      label: 'Portfolio / Personal Website',
      icon: Globe,
      placeholder: 'https://yourportfolio.site',
      required: false,
    },
  ]

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
              Personal Information
            </CardTitle>
            <CardDescription className="text-base text-zyra-text-secondary">
              Let's start with your basic details. This information will appear at the top of your CV.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {fields.map((field) => {
                const Icon = field.icon
                const value = data[field.id]
                const error = errors[field.id]
                const tooltip = fieldTooltips[field.id]

                return (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: fields.indexOf(field) * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <Label htmlFor={field.id} className="text-sm font-medium text-white">
                        {field.label}
                        {field.required && <span className="text-red-400 ml-1">*</span>}
                      </Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            type="button"
                            className="inline-flex items-center justify-center"
                          >
                            <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-xs">
                          <p className="text-sm">{tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zyra-text-secondary z-10" />
                      <Input
                        id={field.id}
                        type={field.type || 'text'}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        onBlur={(e) => handleBlur(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={cn(
                          'pl-10 bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                          'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                          error && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                        )}
                      />
                    </div>
                    {error && (
                      <p className="text-sm text-red-400">{error}</p>
                    )}
                  </motion.div>
                )
              })}
            </div>

            {/* About Me Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="aboutMe" className="text-sm font-medium text-white">
                    Professional Summary / Bio
                    <span className="text-zyra-text-secondary text-xs font-normal ml-2">
                      (Tell us about yourself)
                    </span>
                  </Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className="inline-flex items-center justify-center">
                        <HelpCircle className="h-4 w-4 text-zyra-text-secondary hover:text-white transition-colors" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-xs">
                      <p className="text-sm">{fieldTooltips.aboutMe}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button
                  onClick={handleRefineWithAI}
                  disabled={isRefining || !data.aboutMe}
                  variant="outline"
                  size="sm"
                  className={cn(
                    'bg-zyra-electric-violet/20 text-zyra-electric-violet hover:bg-zyra-electric-violet/30',
                    'border-zyra-electric-violet/30',
                    (isRefining || !data.aboutMe) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Sparkles className={cn('w-4 h-4 mr-2', isRefining && 'animate-spin')} />
                  {isRefining ? 'Refining...' : 'Refine with AI'}
                </Button>
              </div>
              <Textarea
                id="aboutMe"
                value={data.aboutMe}
                onChange={(e) => handleChange('aboutMe', e.target.value)}
                placeholder="Tell us about yourself — your background, strengths, values, and what makes you unique in your field..."
                rows={6}
                className={cn(
                  'bg-white/5 border-white/10 text-white placeholder:text-zyra-text-secondary',
                  'focus-visible:border-zyra-cyan-blue focus-visible:ring-zyra-cyan-blue/20',
                  errors.aboutMe && 'border-red-500 focus-visible:border-red-500 focus-visible:ring-red-500/20'
                )}
              />
              {errors.aboutMe && (
                <p className="text-sm text-red-400">{errors.aboutMe}</p>
              )}
              <p className="text-xs text-zyra-text-secondary">
                {data.aboutMe.length} characters
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </TooltipProvider>
  )
}
