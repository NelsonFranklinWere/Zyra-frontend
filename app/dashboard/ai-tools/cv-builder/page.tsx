'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Zap, Bot, CheckCircle, ArrowLeft } from 'lucide-react'
import { StepProgress } from '@/components/CVBuilder/StepProgress'
import { StepNavigation } from '@/components/CVBuilder/StepNavigation'
import { PersonalInfoSection } from '@/components/CVBuilder/PersonalInfoSection'
import { EducationSection } from '@/components/CVBuilder/EducationSection'
import { ExperienceSection } from '@/components/CVBuilder/ExperienceSection'
import { SkillsSection } from '@/components/CVBuilder/SkillsSection'
import { ProjectsSection } from '@/components/CVBuilder/ProjectsSection'
import { CertificationsSection } from '@/components/CVBuilder/CertificationsSection'
import { LanguagesSection } from '@/components/CVBuilder/LanguagesSection'
import { ReferencesSection } from '@/components/CVBuilder/ReferencesSection'
import { AIInterviewConversation } from '@/components/CVBuilder/AIInterviewConversation'
import { CVPreview } from '@/components/CVBuilder/CVPreview'
import { CVStep, CVData } from '@/components/CVBuilder/types'
import { Button } from '@/components/ui/button'
import apiClient from '@/lib/api-client'
import toast from 'react-hot-toast'
import { cache, CACHE_KEYS } from '@/lib/cache'
import { useRouter } from 'next/navigation'
import { useAIAssistant, type AIRecommendation } from '@/contexts/ai-assistant-context'

const STEPS: CVStep[] = [
  'personal',
  'education',
  'experience',
  'skills',
  'projects',
  'certifications',
  'languages',
  'references',
  'review',
]

const STEP_TITLES: Record<CVStep, string> = {
  personal: 'Personal',
  education: 'Education',
  experience: 'Experience',
  skills: 'Skills',
  projects: 'Projects',
  certifications: 'Certifications',
  languages: 'Languages',
  references: 'References',
  review: 'Review',
  'ai-interview': 'AI Interview',
}

const initialCVData: CVData = {
  profile: {
    fullName: '',
    email: '',
    phoneNumber: '',
    location: '',
    linkedin: '',
    portfolio: '',
    aboutMe: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  references: [],
}

// Interview data type
interface InterviewData {
  fullName?: string
  email?: string
  phone?: string
  location?: string
  interviewType?: string
  [key: string]: unknown
}

// Transform AI interview data to CV format
const transformInterviewDataToCV = (interviewData: InterviewData): Partial<CVData> => {
  return {
    profile: {
      fullName: interviewData.fullName || '',
      email: interviewData.email || '',
      phoneNumber: interviewData.phone || '',
      location: interviewData.location || '',
      aboutMe: '',
      title: '',
      linkedin: typeof interviewData.linkedin === 'string' ? interviewData.linkedin : '',
      portfolio: typeof interviewData.portfolio === 'string' ? interviewData.portfolio : '',
      github: '',
    },
    experience: Array.isArray(interviewData.experiences) ? interviewData.experiences : [],
    education: Array.isArray(interviewData.education) ? interviewData.education : [],
    skills: Array.isArray(interviewData.skills) 
      ? interviewData.skills 
      : typeof interviewData.skills === 'string'
      ? interviewData.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [],
    projects: Array.isArray(interviewData.projects) ? interviewData.projects : [],
    certifications: Array.isArray(interviewData.certifications) ? interviewData.certifications : [],
  }
}

export default function CVBuilderPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'manual' | 'ai-interview' | null>(null)
  const [currentStep, setCurrentStep] = useState<CVStep>('personal')
  const [cvData, setCvData] = useState<CVData>(initialCVData)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [hasAutoEnhanced, setHasAutoEnhanced] = useState(false)
  const { setActiveModule, setRecommendations, queuePrompt } = useAIAssistant()

  useEffect(() => {
    setActiveModule('resume')
  }, [setActiveModule])

  // Load from cache on mount
  useEffect(() => {
    const saved = cache.get<CVData>(CACHE_KEYS.CV_DRAFT)
    const savedMode = cache.get<string>(CACHE_KEYS.CV_MODE)
    
    if (saved) {
      setCvData(saved)
    }
    
    // Check URL params for mode override
    const urlParams = new URLSearchParams(window.location.search)
    const continueMode = urlParams.get('continue')
    const forceSelect = urlParams.get('select')
    
    if (forceSelect === 'true') {
      // Force show selection screen (e.g., from home page button)
      setMode(null)
      cache.remove(CACHE_KEYS.CV_MODE)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (continueMode === 'true' && savedMode && (savedMode === 'manual' || savedMode === 'ai-interview')) {
      // User wants to continue where they left off
      setMode(savedMode as 'manual' | 'ai-interview')
    } else {
      // Default: Always show selection screen on first visit
      // Only restore mode if user explicitly continues (via continue=true param)
      setMode(null)
    }
  }, [])

  // Save to cache whenever data or mode changes
  useEffect(() => {
    cache.set(CACHE_KEYS.CV_DRAFT, cvData, {
      expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
  }, [cvData])

  useEffect(() => {
    if (mode) {
      cache.set(CACHE_KEYS.CV_MODE, mode, {
        expiresIn: 30 * 24 * 60 * 60 * 1000, // 30 days
      })
    }
  }, [mode])

  // Handle AI interview completion
  const handleAIInterviewComplete = async (data: InterviewData) => {
    try {
      setIsEnhancing(true)
      toast.loading('Enhancing your CV with AI...', { id: 'enhance' })
      
      // Transform interview data to CV format
      const transformedData = transformInterviewDataToCV(data)
      
      // Send to AI enhancement API
      const result = await apiClient.enhanceCV(transformedData)
      
      toast.dismiss('enhance')
      if (result.success && result.data) {
        setCvData(result.data as CVData)
        setMode('manual')
        
        // Cache AI insights
        cache.set(CACHE_KEYS.CV_AI_INSIGHTS, result.data, {
          expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days
        })
        
        toast.success('CV enhanced successfully!')
        queuePrompt(
          `Provide a concise hiring manager summary and improvement checklist for the following CV data:\n\n${JSON.stringify(
            result.data,
            null,
            2
          ).slice(0, 3000)}`,
          { module: 'resume' }
        )
        router.push('/dashboard/ai/chat')
      }
    } catch (error) {
      toast.dismiss('enhance')
      const errorMessage = error instanceof Error ? error.message : 'Failed to enhance CV'
      toast.error(errorMessage)
    } finally {
      setIsEnhancing(false)
    }
  }

  const currentStepIndex = STEPS.indexOf(currentStep)

  const cvSnapshot = useMemo(() => {
    const snapshot = {
      profile: cvData.profile,
      experience: cvData.experience.slice(0, 3),
      skills: cvData.skills.slice(0, 12),
      projects: cvData.projects.slice(0, 2)
    }
    return JSON.stringify(snapshot, null, 2).slice(0, 3500)
  }, [cvData])

  const resumeRecommendations = useMemo<AIRecommendation[]>(() => {
    return [
      {
        id: 'resume-summary',
        title: 'Generate CV executive summary',
        description: 'Ask Zyra for a recruiter-ready overview using the current draft.',
        prompt: `Write a sharp, recruiter-facing executive summary for this CV data:\n\n${cvSnapshot}`
      },
      {
        id: 'resume-keywords',
        title: 'Optimize keywords for ATS',
        description: 'Identify missing role-aligned keywords and suggest additions.',
        prompt: `Audit the following CV for ATS keywords. List gaps and propose keyword-rich bullet points:\n\n${cvSnapshot}`
      },
      {
        id: 'resume-story',
        title: 'Create interview talking points',
        description: 'Turn the CV into compelling talking points for interviews.',
        prompt: `Using this CV snapshot, craft five impact-driven interview talking points with quantifiable proof:\n\n${cvSnapshot}`
      }
    ]
  }, [cvSnapshot])

  useEffect(() => {
    setRecommendations(resumeRecommendations, 'resume')
  }, [resumeRecommendations, setRecommendations])

  // Auto-enhance CV when reaching review step
  useEffect(() => {
    if (currentStep === 'review' && !hasAutoEnhanced) {
      // Check if we have minimum required data
      const hasMinimumData = cvData.profile.fullName || 
                             cvData.experience.length > 0 || 
                             cvData.education.length > 0 || 
                             cvData.skills.length > 0

      if (!hasMinimumData) {
        // Don't auto-enhance if there's no data
        return
      }

      const autoEnhance = async () => {
        setIsEnhancing(true)
        setHasAutoEnhanced(true)
        toast.loading('Automatically enhancing your CV with AI...', { id: 'auto-enhance-cv' })
        
        try {
          const result = await apiClient.enhanceCV(cvData)
          toast.dismiss('auto-enhance-cv')
          
          if (result.success && result.data) {
            setCvData(result.data as CVData)
            
            // Show warnings if any
            const warnings = result.warnings || []
            if (warnings.length > 0) {
              console.warn('CV enhancement warnings:', warnings)
              toast(`CV enhanced with ${warnings.length} warning(s). Check console for details.`, { 
                duration: 5000,
                icon: '⚠️'
              })
            }
            
            // Check if certifications were preserved
            const certsPreserved = result.certifications_preserved || false
            const hasOriginalCerts = cvData.certifications && cvData.certifications.length > 0
            const enhancedData = result.data as CVData
            const hasEnhancedCerts = enhancedData?.certifications && enhancedData.certifications.length > 0
            
            if (hasOriginalCerts && !hasEnhancedCerts) {
              toast.error('Certifications were not preserved in enhancement. Your original data is safe.', { duration: 6000 })
            } else if (hasOriginalCerts && certsPreserved) {
              toast.success('CV enhanced! Certifications preserved. ✨', { duration: 4000 })
            } else {
              toast.success('CV automatically enhanced with AI insights! ✨', { duration: 4000 })
            }
          } else {
            const errorMsg = result.message || 'Failed to enhance CV'
            toast.error(errorMsg, { duration: 5000 })
            setHasAutoEnhanced(false) // Allow retry
            console.error('CV enhancement failed:', result)
          }
        } catch (error: unknown) {
          toast.dismiss('auto-enhance-cv')
          const errorMessage = error instanceof Error ? error.message : 'Failed to enhance CV'
          toast.error(errorMessage, { duration: 5000 })
          console.error('CV enhancement error:', error)
          setHasAutoEnhanced(false) // Allow retry
        } finally {
          setIsEnhancing(false)
        }
      }

      // Small delay to let the UI render first
      const timer = setTimeout(() => {
        autoEnhance()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [currentStep, hasAutoEnhanced, cvData])

  // Reset auto-enhance flag when leaving review step (so it can auto-enhance again on next visit)
  useEffect(() => {
    if (currentStep !== 'review') {
      setHasAutoEnhanced(false)
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentStepIndex + 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(STEPS[currentStepIndex - 1])
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleSaveDraft = () => {
    localStorage.setItem('cv-builder-draft', JSON.stringify(cvData))
    // TODO: Show toast notification
    alert('Draft saved successfully!')
  }

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'personal':
        // Only name and email are required
        return !!(
          cvData.profile.fullName &&
          cvData.profile.email
        )
      case 'education':
        // Allow empty education array, but if entries exist, only institution OR course is required
        if (cvData.education.length === 0) return true
        return cvData.education.every(edu =>
          (edu.institution?.trim() || edu.course?.trim())
        )
      case 'experience':
        // Allow empty experience array, but if entries exist, only company OR role is required
        if (cvData.experience.length === 0) return true
        return cvData.experience.every(exp =>
          (exp.company?.trim() || exp.jobTitle?.trim())
        )
      case 'skills':
        // Skills are optional
        return true
      case 'projects':
        // Projects are optional, but if projects exist, they must have descriptions
        if (cvData.projects.length === 0) return true
        return cvData.projects.every(proj => 
          proj.description?.trim() && proj.description.trim().length >= 20
        )
      case 'certifications':
        // Certifications are optional
        return true
      // TODO: Add validation for other steps
      default:
        return true
    }
  }

  const canGoNext = validateCurrentStep()

  // Mode selection screen
  if (!mode) {
    return (
      <div className="min-h-screen py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 text-center"
          >
            <h1 className="text-4xl font-cyber font-bold gradient-text mb-4">
              AI CV Builder
            </h1>
            <p className="text-zyra-text-secondary text-lg mb-8">
              Choose how you'd like to build your CV
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* AI Interview Mode */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer h-full"
                onClick={() => setMode('ai-interview')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">AI Interview Mode</h3>
                    <p className="text-sm text-zyra-text-secondary">Guided conversation</p>
                  </div>
                </div>
                <p className="text-zyra-text-secondary mb-6">
                  Let our AI interviewer ask you questions and extract deep, structured information to build an exceptional CV. Perfect if you prefer a guided approach.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-sm">Quick Start</span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">AI-Powered</span>
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm">Guided</span>
                </div>
                <Button className="w-full bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start AI Interview
                </Button>
              </div>
            </motion.div>

            {/* Manual Mode */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="glass-card p-8 rounded-2xl border border-white/10 hover:border-cyan-500/50 transition-all cursor-pointer h-full"
                onClick={() => setMode('manual')}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Manual Mode</h3>
                    <p className="text-sm text-zyra-text-secondary">Fill forms yourself</p>
                  </div>
                </div>
                <p className="text-zyra-text-secondary mb-6">
                  Build your CV step-by-step by filling out organized forms. You have full control over each section and can save drafts.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 rounded-full text-sm">Full Control</span>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm">Step-by-Step</span>
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">Flexible</span>
                </div>
                <Button className="w-full bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Start Building
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Function to reset mode and show selection screen
  const resetMode = () => {
    setMode(null)
    cache.remove(CACHE_KEYS.CV_MODE)
    // Update URL to remove mode param
    window.history.replaceState({}, '', window.location.pathname)
  }

  // AI Interview Mode
  if (mode === 'ai-interview') {
    return (
      <div className="min-h-screen pb-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              onClick={resetMode}
              className="mb-4 text-zyra-text-secondary hover:text-white flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Change Mode
            </Button>
            <h1 className="text-4xl font-cyber font-bold gradient-text mb-2">
              AI Interview Mode
            </h1>
            <p className="text-zyra-text-secondary">
              Let's build your professional CV through conversation
            </p>
          </motion.div>

          <div className="glass-card rounded-2xl border border-white/10 h-[600px] overflow-hidden">
            <AIInterviewConversation
              onComplete={handleAIInterviewComplete}
              interviewType="comprehensive"
            />
          </div>
        </div>
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoSection
            data={cvData.profile}
            onChange={(data) =>
              setCvData({ ...cvData, profile: data })
            }
          />
        )
      case 'education':
        return (
          <EducationSection
            data={cvData.education}
            onChange={(data) => setCvData({ ...cvData, education: data })}
          />
        )
      case 'experience':
        return (
          <ExperienceSection
            data={cvData.experience}
            onChange={(data) => setCvData({ ...cvData, experience: data })}
          />
        )
      case 'skills':
        return (
          <SkillsSection
            data={cvData.skills}
            onChange={(data) => setCvData({ ...cvData, skills: data })}
          />
        )
      case 'projects':
        return (
          <ProjectsSection
            data={cvData.projects}
            onChange={(data) => setCvData({ ...cvData, projects: data })}
          />
        )
      case 'certifications':
        return (
          <CertificationsSection
            data={cvData.certifications}
            onChange={(data) => setCvData({ ...cvData, certifications: data })}
          />
        )
      case 'languages':
        return (
          <LanguagesSection
            data={cvData.languages}
            onChange={(data) => setCvData({ ...cvData, languages: data })}
          />
        )
      case 'references':
        return (
          <ReferencesSection
            data={cvData.references}
            onChange={(data) => setCvData({ ...cvData, references: data })}
          />
        )
      case 'review':
        return (
          <div className="space-y-6">
            {/* Auto-enhancement indicator */}
            {isEnhancing && (
              <div className="glass-card p-6 rounded-xl border border-zyra-electric-violet/30 bg-zyra-electric-violet/5">
                <div className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-zyra-electric-violet"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Automatically Enhancing Your CV with AI ✨</h3>
                    <p className="text-sm text-zyra-text-secondary">
                      Generating professional summary, skill analysis, and career insights...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Manual re-enhance option (only if already enhanced and not currently enhancing) */}
            {cvData.ai_insights && !isEnhancing && (
              <div className="glass-card p-6 rounded-xl border border-zyra-electric-violet/30 bg-zyra-electric-violet/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">Re-enhance Your CV with AI</h3>
                    <p className="text-zyra-text-secondary">
                      Update your CV with latest AI insights based on your current data
                    </p>
                    <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Previously enhanced - click to refresh with latest data
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      setIsEnhancing(true)
                      toast.loading('Re-enhancing your CV with AI...', { id: 're-enhance-cv' })
                      try {
                        const result = await apiClient.enhanceCV(cvData)
                        toast.dismiss('re-enhance-cv')
                        if (result.success && result.data) {
                          setCvData(result.data as CVData)
                          
                          // Check certifications
                          const hasOriginalCerts = cvData.certifications && cvData.certifications.length > 0
                          const enhancedData = result.data as CVData
                          const hasEnhancedCerts = enhancedData?.certifications && enhancedData.certifications.length > 0
                          const certsPreserved = result.certifications_preserved || false
                          
                          if (hasOriginalCerts && !hasEnhancedCerts) {
                            toast.error('Certifications were not preserved. Your original data is safe.', { duration: 6000 })
                          } else if (hasOriginalCerts && certsPreserved) {
                            toast.success('CV re-enhanced! Certifications preserved. ✨', { duration: 4000 })
                          } else {
                            toast.success('CV re-enhanced successfully with latest AI insights! ✨', { duration: 4000 })
                          }
                          
                          // Show warnings if any
                          if (result.warnings && result.warnings.length > 0) {
                            console.warn('CV re-enhancement warnings:', result.warnings)
                          }
                        } else {
                          toast.error(result.message || 'Failed to enhance CV', { duration: 5000 })
                          console.error('CV re-enhancement failed:', result)
                        }
                      } catch (error) {
                        toast.dismiss('re-enhance-cv')
                        const errorMessage = error instanceof Error ? error.message : 'Failed to enhance CV'
                        toast.error(errorMessage, { duration: 5000 })
                        console.error('CV re-enhancement error:', error)
                      } finally {
                        setIsEnhancing(false)
                      }
                    }}
                    disabled={isEnhancing}
                    className="px-6 py-3 bg-zyra-electric-violet hover:bg-zyra-electric-violet/80 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isEnhancing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Re-enhance with AI
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Success indicator */}
            {cvData.ai_insights && !isEnhancing && (
              <div className="glass-card p-4 rounded-xl border border-green-500/30 bg-green-500/5">
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">CV Enhanced with AI Insights ✨</span>
                </div>
              </div>
            )}

            {/* CV Preview */}
            <CVPreview cvData={cvData} />
          </div>
        )
      default:
        return (
          <div className="text-center py-20">
            <p className="text-zyra-text-secondary">This section is being built...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={resetMode}
            className="mb-4 text-zyra-text-secondary hover:text-white flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Change Mode
          </Button>
          <h1 className="text-4xl font-cyber font-bold gradient-text mb-2">
            AI CV Builder
          </h1>
          <p className="text-zyra-text-secondary">
            Create a professional CV with AI-powered suggestions and guidance
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => {
                queuePrompt(
                  `Provide a detailed critique and enhancement plan for this CV draft:\n\n${cvSnapshot}`,
                  { module: 'resume' }
                )
                router.push('/dashboard/ai/chat')
              }}
              className="border-zyra-electric-violet/40 text-zyra-electric-violet hover:bg-zyra-electric-violet/10"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Zyra for Feedback
            </Button>
          </div>
        </motion.div>

        {/* Progress Indicator */}
        <StepProgress
          currentStep={currentStep}
          steps={STEPS}
          stepTitles={STEP_TITLES}
        />

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="glass-card p-8 rounded-2xl border border-white/10"
        >
          {renderStepContent()}
        </motion.div>

        {/* Navigation */}
        <StepNavigation
          onPrevious={handlePrevious}
          onNext={handleNext}
          canGoPrevious={currentStepIndex > 0}
          canGoNext={canGoNext}
          onSaveDraft={handleSaveDraft}
          isLastStep={currentStepIndex === STEPS.length - 1}
        />
      </div>
    </div>
  )
}
