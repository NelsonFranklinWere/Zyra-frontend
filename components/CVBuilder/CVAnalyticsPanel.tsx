'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  Target,
  FileText,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Users,
  Lightbulb,
  ArrowRight
} from 'lucide-react'
import { CVData } from './types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface CVStrength {
  score: number // 0-100
  level: 'Excellent' | 'Strong' | 'Good' | 'Needs Improvement' | 'Incomplete'
  color: string
}

interface Suggestion {
  id: string
  type: 'critical' | 'warning' | 'enhancement' | 'optional'
  category: string
  title: string
  description: string
  action?: string
}

interface AnalyticsResult {
  strength: CVStrength
  suggestions: Suggestion[]
  professionalSummary: string
  missingSections: string[]
  atsScore: number
}

interface CVAnalyticsPanelProps {
  cvData: CVData
  onGenerateSummary?: () => Promise<string>
}

// Mock AI function - Replace with actual API call
const generateProfessionalSummary = async (cvData: CVData): Promise<string> => {
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  const { profile, experience, education, skills } = cvData
  const hasExperience = experience.length > 0
  const hasEducation = education.length > 0
  const hasSkills = skills.length > 0

  if (!hasExperience && !hasEducation && !hasSkills) {
    return "Complete your CV sections to generate a professional summary."
  }

  const experienceText = hasExperience 
    ? `With ${experience.length} ${experience.length === 1 ? 'year' : 'years'} of experience`
    : ''
  const educationText = hasEducation && education[0]
    ? `holding a ${education[0].qualification || 'degree'} in ${education[0].course || 'their field'}`
    : ''
  const skillsText = hasSkills && skills.length > 0
    ? `specializing in ${skills.slice(0, 3).map(s => s.name).join(', ')}`
    : ''

  return `${experienceText} ${educationText} ${skillsText}, ${profile.fullName || 'a dedicated professional'} brings a strong foundation and passion for excellence. Ready to contribute to innovative projects and drive impactful results.`.trim()
}

const calculateCVStrength = (cvData: CVData): CVStrength => {
  let score = 0
  let maxScore = 0

  // Personal Info (15 points)
  maxScore += 15
  if (cvData.profile.fullName) score += 3
  if (cvData.profile.email) score += 3
  if (cvData.profile.phoneNumber) score += 2
  if (cvData.profile.location) score += 2
  if (cvData.profile.aboutMe) score += 5

  // Education (20 points)
  maxScore += 20
  if (cvData.education.length > 0) {
    score += Math.min(cvData.education.length * 5, 15)
    const hasComplete = cvData.education.some(e => 
      e.institution && e.course && e.qualification && e.startYear && e.endYear
    )
    if (hasComplete) score += 5
  }

  // Experience (30 points)
  maxScore += 30
  if (cvData.experience.length > 0) {
    score += Math.min(cvData.experience.length * 8, 20)
    const hasComplete = cvData.experience.some(e => 
      e.jobTitle && e.company && e.startDate && e.endDate && e.responsibilities
    )
    if (hasComplete) score += 10
  }

  // Skills (15 points)
  maxScore += 15
  if (cvData.skills.length > 0) {
    score += Math.min(cvData.skills.length * 2, 10)
    const hasCategories = cvData.skills.some(s => s.category && s.proficiency)
    if (hasCategories) score += 5
  }

  // Projects (10 points)
  maxScore += 10
  if (cvData.projects.length > 0) {
    score += Math.min(cvData.projects.length * 3, 8)
    const hasComplete = cvData.projects.some(p => p.title && p.description && p.techStack?.length > 0)
    if (hasComplete) score += 2
  }

  // Certifications (5 points)
  maxScore += 5
  if (cvData.certifications.length > 0) {
    score += Math.min(cvData.certifications.length * 2, 5)
  }

  // Languages (3 points)
  maxScore += 3
  if (cvData.languages.length > 0) {
    score += Math.min(cvData.languages.length, 3)
  }

  // References (2 points)
  maxScore += 2
  if (cvData.references.length > 0) {
    score += Math.min(cvData.references.length, 2)
  }

  const percentage = Math.round((score / maxScore) * 100)
  
  let level: CVStrength['level'] = 'Incomplete'
  let color = 'text-red-400'

  if (percentage >= 90) {
    level = 'Excellent'
    color = 'text-green-400'
  } else if (percentage >= 75) {
    level = 'Strong'
    color = 'text-green-300'
  } else if (percentage >= 60) {
    level = 'Good'
    color = 'text-yellow-400'
  } else if (percentage >= 40) {
    level = 'Needs Improvement'
    color = 'text-orange-400'
  }

  return { score: percentage, level, color }
}

const generateSuggestions = (cvData: CVData, strength: CVStrength): Suggestion[] => {
  const suggestions: Suggestion[] = []

  // Critical suggestions
  if (!cvData.profile.fullName || !cvData.profile.email) {
    suggestions.push({
      id: 'personal-critical',
      type: 'critical',
      category: 'Personal Information',
      title: 'Missing Essential Contact Information',
      description: 'Add your full name and email address. These are required for employers to contact you.',
      action: 'Complete Personal Info section'
    })
  }

  if (cvData.education.length === 0) {
    suggestions.push({
      id: 'education-critical',
      type: 'critical',
      category: 'Education',
      title: 'No Education Entries',
      description: 'Add at least one education entry. Most employers require educational background.',
      action: 'Add Education entry'
    })
  }

  if (cvData.experience.length === 0 && cvData.projects.length === 0) {
    suggestions.push({
      id: 'experience-critical',
      type: 'critical',
      category: 'Experience',
      title: 'No Work Experience or Projects',
      description: 'Add work experience or projects to showcase your skills and achievements.',
      action: 'Add Experience or Projects'
    })
  }

  // Warning suggestions
  if (!cvData.profile.aboutMe || cvData.profile.aboutMe.length < 50) {
    suggestions.push({
      id: 'summary-warning',
      type: 'warning',
      category: 'Summary',
      title: 'Professional Summary Too Short',
      description: 'Add a compelling professional summary (2-4 lines) highlighting your key strengths and career goals.',
      action: 'Enhance About Me section'
    })
  }

  if (cvData.skills.length < 5) {
    suggestions.push({
      id: 'skills-warning',
      type: 'warning',
      category: 'Skills',
      title: 'Limited Skills Listed',
      description: 'Add more relevant skills (technical, soft skills) to improve your CV visibility.',
      action: 'Add More Skills'
    })
  }

  if (cvData.experience.length > 0) {
    const hasAchievements = cvData.experience.some(e => {
      if (Array.isArray(e.achievements)) {
        return e.achievements.length > 0
      }
      return e.achievements && typeof e.achievements === 'string' && e.achievements.trim().length > 0
    })
    if (!hasAchievements) {
      suggestions.push({
        id: 'achievements-warning',
        type: 'warning',
        category: 'Experience',
        title: 'Missing Key Achievements',
        description: 'Add quantifiable achievements to your work experience (e.g., "Increased sales by 30%").',
        action: 'Add Achievements to Experience'
      })
    }
  }

  // Enhancement suggestions
  if (cvData.certifications.length === 0) {
    suggestions.push({
      id: 'certifications-enhancement',
      type: 'enhancement',
      category: 'Certifications',
      title: 'Add Professional Certifications',
      description: 'Certifications demonstrate continuous learning and expertise in your field.',
      action: 'Add Certifications'
    })
  }

  if (cvData.languages.length === 0) {
    suggestions.push({
      id: 'languages-enhancement',
      type: 'enhancement',
      category: 'Languages',
      title: 'Include Language Proficiency',
      description: 'Listing languages can be valuable, especially for international roles.',
      action: 'Add Languages'
    })
  }

  if (cvData.projects.length < 2 && cvData.experience.length > 0) {
    suggestions.push({
      id: 'projects-enhancement',
      type: 'enhancement',
      category: 'Projects',
      title: 'Showcase More Projects',
      description: 'Projects demonstrate practical application of skills and problem-solving ability.',
      action: 'Add More Projects'
    })
  }

  // ATS optimization
  if (strength.score < 70) {
    suggestions.push({
      id: 'ats-enhancement',
      type: 'enhancement',
      category: 'ATS Optimization',
      title: 'Optimize for ATS Systems',
      description: 'Use relevant keywords, standard formatting, and complete all sections for better ATS compatibility.',
      action: 'Review ATS Best Practices'
    })
  }

  return suggestions
}

const getMissingSections = (cvData: CVData): string[] => {
  const missing: string[] = []
  
  if (!cvData.profile.fullName || !cvData.profile.email) {
    missing.push('Personal Information')
  }
  if (cvData.education.length === 0) missing.push('Education')
  if (cvData.experience.length === 0 && cvData.projects.length === 0) {
    missing.push('Experience or Projects')
  }
  if (cvData.skills.length === 0) missing.push('Skills')
  
  return missing
}

export function CVAnalyticsPanel({ cvData, onGenerateSummary }: CVAnalyticsPanelProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [professionalSummary, setProfessionalSummary] = useState<string>('')
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null)

  const strength = useMemo(() => calculateCVStrength(cvData), [cvData])
  const suggestions = useMemo(() => generateSuggestions(cvData, strength), [cvData, strength])
  const missingSections = useMemo(() => getMissingSections(cvData), [cvData])
  const atsScore = useMemo(() => {
    // Calculate ATS score based on completeness and keywords
    let score = strength.score * 0.8 // Base score from completeness
    if (cvData.skills.length >= 5) score += 10
    if (cvData.experience.length >= 2) score += 5
    if (cvData.profile.aboutMe && cvData.profile.aboutMe.length >= 100) score += 5
    return Math.min(Math.round(score), 100)
  }, [cvData, strength])

  useEffect(() => {
    setAnalytics({
      strength,
      suggestions,
      professionalSummary,
      missingSections,
      atsScore
    })
  }, [strength, suggestions, professionalSummary, missingSections, atsScore])

  const handleGenerateSummary = async () => {
    setIsGenerating(true)
    try {
      const summary = onGenerateSummary 
        ? await onGenerateSummary()
        : await generateProfessionalSummary(cvData)
      setProfessionalSummary(summary)
    } catch (error) {
      console.error('Failed to generate summary:', error)
      setProfessionalSummary('Failed to generate summary. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const getIconForCategory = (category: string) => {
    const icons: Record<string, any> = {
      'Personal Information': FileText,
      'Education': GraduationCap,
      'Experience': Briefcase,
      'Skills': Code,
      'Projects': Code,
      'Certifications': Award,
      'Languages': Languages,
      'Summary': FileText,
      'ATS Optimization': Target,
      'References': Users
    }
    return icons[category] || Lightbulb
  }

  const getTypeStyles = (type: Suggestion['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          icon: 'text-red-400',
          badge: 'bg-red-500/20 text-red-400'
        }
      case 'warning':
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/30',
          icon: 'text-yellow-400',
          badge: 'bg-yellow-500/20 text-yellow-400'
        }
      case 'enhancement':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30',
          icon: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-400'
        }
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/30',
          icon: 'text-gray-400',
          badge: 'bg-gray-500/20 text-gray-400'
        }
    }
  }

  return (
    <div className="space-y-6">
      {/* CV Strength Meter */}
      <Card className="glass-card border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">CV Strength</h3>
              <p className="text-sm text-zyra-text-secondary">Overall completeness and quality</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${strength.color}`}>{strength.score}%</div>
            <div className={`text-sm font-medium ${strength.color}`}>{strength.level}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative h-4 bg-zyra-dark/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength.score}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              strength.score >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
              strength.score >= 75 ? 'bg-gradient-to-r from-green-400 to-green-500' :
              strength.score >= 60 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
              strength.score >= 40 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
              'bg-gradient-to-r from-red-400 to-red-500'
            }`}
          />
        </div>

        {/* Section Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Personal', complete: !!cvData.profile.fullName && !!cvData.profile.email },
            { label: 'Education', complete: cvData.education.length > 0 },
            { label: 'Experience', complete: cvData.experience.length > 0 || cvData.projects.length > 0 },
            { label: 'Skills', complete: cvData.skills.length > 0 }
          ].map((section, idx) => (
            <div key={idx} className="flex items-center space-x-2">
              {section.complete ? (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span className="text-sm text-zyra-text-secondary">{section.label}</span>
            </div>
          ))}
        </div>

        {/* ATS Score */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-zyra-cyan-blue" />
              <span className="text-sm font-medium text-white">ATS Compatibility</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-zyra-cyan-blue">{atsScore}%</span>
              <p className="text-xs text-zyra-text-secondary">Optimized for ATS</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Professional Summary */}
      <Card className="glass-card border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-5 h-5 text-zyra-electric-violet" />
            <h3 className="text-lg font-bold text-white">Professional Summary</h3>
          </div>
          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="bg-zyra-electric-violet hover:bg-zyra-electric-violet/90 text-white"
            size="sm"
          >
            {isGenerating ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
        {professionalSummary ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-zyra-dark/50 rounded-lg border border-zyra-cyan-blue/20"
          >
            <p className="text-zyra-text-secondary leading-relaxed">{professionalSummary}</p>
          </motion.div>
        ) : (
          <div className="p-4 bg-zyra-dark/30 rounded-lg border border-white/5">
            <p className="text-sm text-zyra-text-secondary text-center">
              Click "Generate with AI" to create a professional summary based on your CV data
            </p>
          </div>
        )}
      </Card>

      {/* AI Suggestions */}
      <Card className="glass-card border-white/10 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Brain className="w-5 h-5 text-zyra-cyan-blue" />
          <h3 className="text-lg font-bold text-white">AI-Powered Suggestions</h3>
          <span className="px-2 py-1 text-xs font-medium bg-zyra-cyan-blue/20 text-zyra-cyan-blue rounded-full">
            {suggestions.length}
          </span>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-zyra-text-secondary">Excellent! Your CV looks complete.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {suggestions.map((suggestion, idx) => {
                const styles = getTypeStyles(suggestion.type)
                const Icon = getIconForCategory(suggestion.category)
                
                return (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`p-4 rounded-lg border ${styles.bg}`}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${styles.icon}`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${styles.badge}`}>
                            {suggestion.type === 'critical' ? 'Critical' :
                             suggestion.type === 'warning' ? 'Important' :
                             suggestion.type === 'enhancement' ? 'Enhancement' : 'Optional'}
                          </span>
                          <span className="text-xs text-zyra-text-secondary">{suggestion.category}</span>
                        </div>
                        <h4 className="text-white font-semibold mb-1">{suggestion.title}</h4>
                        <p className="text-sm text-zyra-text-secondary mb-2">{suggestion.description}</p>
                        {suggestion.action && (
                          <div className="flex items-center space-x-1 text-xs text-zyra-cyan-blue">
                            <span>{suggestion.action}</span>
                            <ArrowRight className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </Card>

      {/* Missing Sections */}
      {missingSections.length > 0 && (
        <Card className="glass-card border-red-500/30 bg-red-500/5 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">Missing Sections</h3>
          </div>
          <div className="space-y-2">
            {missingSections.map((section, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-sm text-zyra-text-secondary">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                <span>{section}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}





