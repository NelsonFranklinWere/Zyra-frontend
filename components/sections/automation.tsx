"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Brain,
  MessageSquare,
  TrendingUp,
  FileText,
  Briefcase
} from "lucide-react"

interface Automation {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'error' | 'completed'
  execution_count: number
  success_count: number
  error_count: number
  last_executed: string
  next_execution: string | null
  workflow_config: {
    n8n_workflow_id: string
    campaign_id: string
    persona_id: string
    channels: string[]
    schedule: any
  }
}

const mockAutomations: Automation[] = []

export const Automation = () => {
  const router = useRouter()
  const [automations, setAutomations] = useState<Automation[]>(mockAutomations)
  const [selectedAutomation, setSelectedAutomation] = useState<Automation | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const handleBuildCV = () => {
    // Always show mode selection screen when coming from home page
    router.push('/dashboard/ai-tools/cv-builder?select=true')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-electric-teal'
      case 'paused': return 'text-aurora-purple'
      case 'error': return 'text-neon-coral'
      case 'completed': return 'text-soft-silver'
      default: return 'text-soft-silver-dark'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="w-4 h-4" />
      case 'paused': return <Pause className="w-4 h-4" />
      case 'error': return <AlertCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getSuccessRate = (automation: Automation) => {
    if (automation.execution_count === 0) return 0
    return Math.round((automation.success_count / automation.execution_count) * 100)
  }

  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center space-x-2 bg-electric-teal/10 border border-electric-teal/20 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-electric-teal" />
            <span className="text-sm text-electric-teal font-medium">Marketing Automation</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
              Zyra Automation Hub
            </span>
          </h2>
          
          <p className="text-xl text-soft-silver max-w-3xl mx-auto">
            Create, manage, and monitor AI-powered marketing automations that reach the right audience at the right time
          </p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-16"
        >
          <div className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-electric-teal/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-electric-gradient rounded-lg sm:rounded-xl flex items-center justify-center neon-glow">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-deep-space" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-electric-teal leading-tight">{automations.length}</span>
            </div>
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-electric-teal mb-0.5 sm:mb-1 leading-tight">Active Automations</h3>
            <p className="text-[10px] sm:text-xs text-soft-silver-dark leading-tight">Running campaigns</p>
          </div>

          <div className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-aurora-purple/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-aurora-gradient rounded-lg sm:rounded-xl flex items-center justify-center aurora-glow">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-deep-space" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-aurora-purple leading-tight">
                {automations.reduce((sum, a) => sum + a.execution_count, 0)}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-aurora-purple mb-0.5 sm:mb-1 leading-tight">Messages Sent</h3>
            <p className="text-[10px] sm:text-xs text-soft-silver-dark leading-tight">Total executions</p>
          </div>

          <div className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-neon-coral/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-r from-neon-coral to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center coral-glow">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-deep-space" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-neon-coral leading-tight">
                {Math.round(automations.reduce((sum, a) => sum + getSuccessRate(a), 0) / automations.length)}%
              </span>
            </div>
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-neon-coral mb-0.5 sm:mb-1 leading-tight">Success Rate</h3>
            <p className="text-[10px] sm:text-xs text-soft-silver-dark leading-tight">Average performance</p>
          </div>

          <div className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-electric-teal/20">
            <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-electric-gradient rounded-lg sm:rounded-xl flex items-center justify-center neon-glow">
                <Brain className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-deep-space" />
              </div>
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-electric-teal leading-tight">
                {automations.filter(a => a.status === 'active').length}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm md:text-base lg:text-lg font-semibold text-electric-teal mb-0.5 sm:mb-1 leading-tight">AI Active</h3>
            <p className="text-[10px] sm:text-xs text-soft-silver-dark leading-tight">Intelligent campaigns</p>
          </div>
        </motion.div>

        {/* Automation List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {automations.map((automation, index) => (
            <motion.div
              key={automation.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="glass-effect rounded-2xl p-8 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    automation.status === 'active' ? 'bg-electric-gradient neon-glow' :
                    automation.status === 'paused' ? 'bg-aurora-gradient aurora-glow' :
                    automation.status === 'error' ? 'bg-gradient-to-r from-neon-coral to-pink-500 coral-glow' :
                    'bg-soft-silver/20'
                  }`}>
                    {getStatusIcon(automation.status)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-soft-silver mb-1">{automation.name}</h3>
                    <p className="text-sm text-soft-silver-dark">{automation.description}</p>
                  </div>
                </div>
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${
                  automation.status === 'active' ? 'border-electric-teal/30 bg-electric-teal/10' :
                  automation.status === 'paused' ? 'border-aurora-purple/30 bg-aurora-purple/10' :
                  automation.status === 'error' ? 'border-neon-coral/30 bg-neon-coral/10' :
                  'border-soft-silver/30 bg-soft-silver/10'
                }`}>
                  <span className={`text-xs font-medium ${getStatusColor(automation.status)}`}>
                    {automation.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-electric-teal mb-1">{automation.execution_count}</div>
                  <div className="text-sm text-soft-silver-dark">Executions</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-aurora-purple mb-1">{getSuccessRate(automation)}%</div>
                  <div className="text-sm text-soft-silver-dark">Success Rate</div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-soft-silver-dark">Channels</span>
                  <div className="flex space-x-2">
                    {automation.workflow_config.channels.map((channel, idx) => (
                      <span key={idx} className="px-2 py-1 bg-electric-teal/10 text-electric-teal text-xs rounded-full">
                        {channel}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-soft-silver-dark">Last Executed</span>
                  <span className="text-sm text-soft-silver">{formatDate(automation.last_executed)}</span>
                </div>
                {automation.next_execution && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-soft-silver-dark">Next Execution</span>
                    <span className="text-sm text-soft-silver">{formatDate(automation.next_execution)}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <button className="flex-1 bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-sm px-4 py-2 rounded-xl font-semibold">
                  <Play className="w-4 h-4 mr-2 inline" />
                  Execute
                </button>
                <button className="flex-1 glass-effect border border-aurora-purple/30 text-aurora-purple hover:bg-aurora-purple/10 text-sm px-4 py-2 rounded-xl font-semibold">
                  <Settings className="w-4 h-4 mr-2 inline" />
                  Configure
                </button>
                <button className="glass-effect border border-soft-silver/30 text-soft-silver hover:bg-soft-silver/10 p-2 rounded-xl">
                  <BarChart3 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CV Builder Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="glass-effect rounded-2xl p-12 border border-electric-teal/20 max-w-4xl mx-auto">
            <div className="w-20 h-20 bg-electric-gradient rounded-3xl flex items-center justify-center mb-8 mx-auto neon-glow">
              <Briefcase className="w-10 h-10 text-deep-space" />
            </div>
            
            <h3 className="text-3xl font-display font-bold text-electric-teal mb-4">
              Ready to find your next job?
            </h3>
            
            <p className="text-lg text-soft-silver mb-4 max-w-2xl mx-auto font-medium">
              Today's HR departments leverage advanced AI algorithms to screen and rank CVs for job fitment. Are you maximizing your competitive advantage with Zyra's industry-leading CV generation platform?
            </p>
            
            <p className="text-base text-soft-silver-dark mb-8 max-w-2xl mx-auto">
              Transform your career trajectory with our enterprise-grade, ATS-optimized CV builder. Powered by cutting-edge AI technology, Zyra delivers professionally crafted resumes that outperform traditional formats, ensuring maximum visibility with recruiters and hiring managers. Gain a strategic edge in today's competitive job market.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={handleBuildCV}
                className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow text-lg px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Build Your CV
              </button>
              <button 
                onClick={handleBuildCV}
                className="glass-effect border border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 text-lg px-8 py-4 rounded-xl font-semibold"
              >
                View CV Examples
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
