'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Send, User, Loader2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import apiClient from '@/lib/api-client'

interface Message {
  role: 'ai' | 'user'
  content: string
  timestamp: Date
}

type ConversationHistoryItem = {
  role: 'ai' | 'user'
  content: string
}

type InterviewContext = {
  careerLevel?: string
  field?: string
  missingFields?: string[]
}

interface AIInterviewConversationProps {
  onComplete: (data: any) => void
  initialData?: any
  interviewType: 'comprehensive' | 'quick'
}

const WELCOME_MESSAGES = {
  comprehensive: `Hi! I'm Cursor, your AI CV coach. I'll ask you questions about your background, experience, skills, and projects to build an exceptional CV. Let's start! 🚀

First, which role are you aiming for?`,
  quick: `Quick CV builder activated! I'll ask essential questions to get you started quickly.`
}

const FALLBACK_QUESTIONS: Record<string, string> = {
  welcome: "Hi! I'm your AI CV coach. What role are you aiming for?",
  fullName: "What's your full name as you want it on your CV?",
  email: "What's your professional email address?",
  phone: "What's your phone number? (Include country code if relevant)",
  location: "Where are you located? (City and country)",
  linkedin: "Do you have a LinkedIn profile URL? (You can reply with \"skip\")",
  portfolio: "Share a GitHub, portfolio, or personal website if you have one. Reply with \"skip\" otherwise.",
  experience1: "Tell me about your most recent role. Include title, company, location, employment type, and start year.",
  experience1_responsibilities: "List 3-4 key responsibilities you held in that role.",
  experience1_achievements: "Share 2-3 measurable achievements from that role (e.g., metrics, outcomes).",
  experience1_tech: "Which tools or technologies did you use in that role?",
  experience_more: "Do you have another role to add? Reply with yes or no.",
  education: "Tell me about your education: institution, qualification, major, and study period.",
  certifications: "List any certifications or courses (or reply with \"none\").",
  skills: "List your main technical and soft skills, separated by commas.",
  projects: "Describe 1-2 notable projects, including impact and technologies (or reply with \"none\").",
  availability: "When are you available to start a new role?",
}

const normalizeResponse = (value: string) => value.trim()

const buildConversationHistory = (messages: Message[]): ConversationHistoryItem[] =>
  messages.map(({ role, content }) => ({ role, content }))

const getExperienceIndex = (step: string) => {
  const match = step.match(/^experience(\d+)/)
  if (!match) return null
  const idx = parseInt(match[1], 10) - 1
  return Number.isNaN(idx) ? null : idx
}

const updateCollectedDataForStep = (step: string, response: string, previousData: any) => {
  const value = normalizeResponse(response)
  const data = { ...previousData }

  switch (step) {
    case 'welcome':
      return { ...data, desiredRole: value }
    case 'fullName':
      return { ...data, fullName: value }
    case 'email':
      return { ...data, email: value }
    case 'phone':
      return { ...data, phone: value }
    case 'location':
      return { ...data, location: value }
    case 'linkedin':
      if (value.toLowerCase() === 'skip') return data
      return { ...data, linkedin: value }
    case 'portfolio':
      if (value.toLowerCase() === 'skip') return data
      return { ...data, portfolio: value }
    case 'experience1':
    case 'experience2': {
      const idx = getExperienceIndex(step)
      if (idx === null) return data
      const experiences = [...(data.experiences || [])]
      experiences[idx] = {
        ...(experiences[idx] || {}),
        summary: value,
      }
      return { ...data, experiences }
    }
    default: {
      const idx = getExperienceIndex(step)
      if (idx !== null) {
        const experiences = [...(data.experiences || [])]
        const entry = { ...(experiences[idx] || {}) }

        if (step.endsWith('_responsibilities')) {
          entry.responsibilities = value
        } else if (step.endsWith('_achievements')) {
          entry.achievements = value
        } else if (step.endsWith('_tech')) {
          entry.technologies = value
        }

        experiences[idx] = entry
        return { ...data, experiences }
      }

      if (step === 'certifications') {
        if (value.toLowerCase() === 'none') {
          const { certifications, ...rest } = data
          return rest
        }
        return { ...data, certifications: value }
      }

      if (step === 'skills') {
        return { ...data, skills: value }
      }

      if (step === 'projects') {
        if (value.toLowerCase() === 'none') {
          const { projects, ...rest } = data
          return rest
        }
        return { ...data, projects: value }
      }

      if (step === 'education') {
        return { ...data, education: value }
      }

      if (step === 'availability') {
        return { ...data, availability: value }
      }

      return data
    }
  }
}

const getFallbackQuestion = (step: string) =>
  FALLBACK_QUESTIONS[step] || 'Thanks! Could you share a bit more detail so I can capture it accurately?'

const getFallbackNextStep = (step: string) => {
  if (step === 'welcome') return 'fullName'
  if (step === 'fullName') return 'email'
  if (step === 'email') return 'phone'
  if (step === 'phone') return 'location'
  if (step === 'location') return 'linkedin'
  if (step === 'linkedin') return 'portfolio'
  if (step === 'portfolio') return 'experience1'
  if (step === 'experience1') return 'experience1_responsibilities'
  if (step === 'experience1_responsibilities') return 'experience1_achievements'
  if (step === 'experience1_achievements') return 'experience1_tech'
  if (step === 'experience1_tech') return 'experience_more'
  if (step === 'experience_more') return 'education'
  if (step === 'education') return 'skills'
  if (step === 'skills') return 'projects'
  if (step === 'projects') return 'availability'
  if (step === 'availability') return 'processing'
  return step
}

export function AIInterviewConversation({ onComplete, initialData, interviewType }: AIInterviewConversationProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [currentStep, setCurrentStep] = useState('welcome')
  const [collectedData, setCollectedData] = useState<any>({})
  const [interviewContext, setInterviewContext] = useState<InterviewContext | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add welcome message
    const welcomeMsg: Message = {
      role: 'ai',
      content: WELCOME_MESSAGES[interviewType],
      timestamp: new Date()
    }
    setMessages([welcomeMsg])
    setCurrentStep('welcome')
    setIsComplete(false)
  }, [interviewType])

  useEffect(() => {
    if (initialData) {
      setCollectedData(initialData)
    }
  }, [initialData])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || isThinking || isComplete) return

    const userMessage: Message = {
      role: 'user',
      content: trimmed,
      timestamp: new Date()
    }

    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setInput('')
    setIsThinking(true)

    const updatedData = updateCollectedDataForStep(currentStep, trimmed, collectedData)
    setCollectedData(updatedData)

    const history = buildConversationHistory(nextMessages).slice(-10)

    try {
      const response = await apiClient.generateInterviewQuestion({
        collectedData: updatedData,
        conversationHistory: history,
        currentStep,
        interviewType
      })

      if (!response.success) {
        throw new Error(response.message || 'Failed to generate interview question')
      }

      const aiMessage: Message = {
        role: 'ai',
        content: response.question,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
      setInterviewContext(response.context || null)
      setCurrentStep(response.nextStep || currentStep)

      if (response.nextStep === 'processing') {
        setIsComplete(true)
        toast.success('Interview complete! Generating your tailored CV.')
        onComplete({
          ...updatedData,
          interviewType,
          context: response.context,
          completedAt: new Date().toISOString()
        })
      }
    } catch (error) {
      console.error('AI interview question generation failed', error)
      toast.error('Using guided prompts while AI reconnects.')

      const fallbackQuestion = getFallbackQuestion(currentStep)
      const fallbackNextStep = getFallbackNextStep(currentStep)

      setMessages(prev => [
        ...prev,
        {
          role: 'ai',
          content: fallbackQuestion,
          timestamp: new Date()
        }
      ])

      setCurrentStep(fallbackNextStep)

      if (fallbackNextStep === 'processing') {
        setIsComplete(true)
        toast.success('Interview complete! Generating your tailored CV.')
        onComplete({
          ...updatedData,
          interviewType,
          completedAt: new Date().toISOString()
        })
      }
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-4"
        aria-live="polite"
        role="log"
      >
        {interviewContext && (
          <div className="flex flex-wrap gap-2 text-xs text-white/60">
            {interviewContext.careerLevel && (
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                Career level: {interviewContext.careerLevel}
              </span>
            )}
            {interviewContext.field && (
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1 capitalize">
                Focus: {interviewContext.field.replace('-', ' ')}
              </span>
            )}
            {interviewContext.missingFields && interviewContext.missingFields.length > 0 && (
              <span className="rounded-full bg-white/5 border border-white/10 px-3 py-1">
                Next targets: {interviewContext.missingFields.slice(0, 2).join(', ')}
              </span>
            )}
          </div>
        )}

        <AnimatePresence>
          {messages.map((message, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-white" />
                </div>
              )}
              
              <Card className={cn(
                'max-w-[80%] p-4',
                message.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                  : 'bg-white/5 border-white/10 text-white'
              )}>
                <p className="whitespace-pre-wrap">{message.content}</p>
              </Card>

              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
            <Card className="p-4 bg-white/5 border-white/10">
              <p className="text-white/60 italic">Thinking...</p>
            </Card>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4">
        <div className="flex gap-3 items-center">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Type your response..."
            disabled={isThinking || isComplete}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isThinking || isComplete}
            size="icon"
            className="bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

