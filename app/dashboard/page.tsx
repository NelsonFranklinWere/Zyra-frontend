"use client"

import { Footer } from "@/components/shared/footer"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Zap,
  Brain,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  Download
} from "lucide-react"

const stats = [
  { label: "Active Automations", value: "24", change: "+12%", trend: "up", color: "electric-teal" },
  { label: "Data Processed", value: "2.4K", change: "+8%", trend: "up", color: "aurora-purple" },
  { label: "AI Insights", value: "156", change: "+23%", trend: "up", color: "neon-coral" },
  { label: "Success Rate", value: "98.7%", change: "+2%", trend: "up", color: "electric-teal" }
]

const recentActivities = [
  { action: "Data analysis completed", time: "2 min ago", status: "success", type: "analysis" },
  { action: "Workflow automation triggered", time: "5 min ago", status: "success", type: "automation" },
  { action: "AI insight generated", time: "8 min ago", status: "success", type: "ai" },
  { action: "Email automation failed", time: "12 min ago", status: "error", type: "automation" },
  { action: "New data source uploaded", time: "15 min ago", status: "success", type: "data" },
  { action: "Workflow template created", time: "20 min ago", status: "success", type: "template" }
]

const quickActions = [
  { icon: Brain, label: "AI Analysis", color: "electric-teal", action: "analyze" },
  { icon: Clock, label: "Schedule Task", color: "aurora-purple", action: "schedule" },
  { icon: BarChart3, label: "View Reports", color: "neon-coral", action: "reports" },
  { icon: Zap, label: "New Workflow", color: "electric-teal", action: "workflow" }
]

export default function DashboardPage() {
  const [range, setRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [perf, setPerf] = useState({
    ctr: 0,
    cvr: 0,
    aov: 0,
    roi: 0,
    automationSuccess: 0,
    dataProcessing: 0,
    aiAccuracy: 0,
  })

  useEffect(() => {
    let ignore = false
    const fetchPerformance = async () => {
      try {
        const res = await fetch(`/api/performance?range=${range}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to load performance')
        const data = await res.json()
        if (ignore) return
        setPerf({
          ctr: data.ctr ?? 0,
          cvr: data.cvr ?? 0,
          aov: data.aov ?? 0,
          roi: data.roi ?? 0,
          automationSuccess: data.automationSuccess ?? 0,
          dataProcessing: data.dataProcessing ?? 0,
          aiAccuracy: data.aiAccuracy ?? 0,
        })
      } catch (e) {
        // Fallback demo values per range
        const demo: Record<typeof range, typeof perf> = {
          '7d': { ctr: 5.8, cvr: 2.3, aov: 47, roi: 3.1, automationSuccess: 90, dataProcessing: 80, aiAccuracy: 95 },
          '30d': { ctr: 6.2, cvr: 2.6, aov: 49, roi: 3.4, automationSuccess: 88, dataProcessing: 82, aiAccuracy: 94 },
          '90d': { ctr: 5.4, cvr: 2.1, aov: 45, roi: 2.9, automationSuccess: 86, dataProcessing: 78, aiAccuracy: 93 },
        }
        if (!ignore) setPerf(demo[range])
      }
    }
    fetchPerformance()
    return () => { ignore = true }
  }, [range])

  return (
    <div className="min-h-screen bg-zyra-gradient">
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                  <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
                    Dashboard
                  </span>
                </h1>
                <p className="text-xl text-soft-silver">
                  Your intelligent automation command center
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="glass-effect border border-electric-teal/30 text-electric-teal hover:bg-electric-teal/10 px-3 py-2 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 flex items-center space-x-2">
                  <Download className="w-4 h-4 md:w-5 md:h-5" />
                  <span>Export Data</span>
                </button>
                <button className="bg-electric-gradient hover:scale-105 transition-all duration-300 neon-glow px-3 py-2 md:px-5 md:py-3 rounded-xl text-xs md:text-sm font-semibold flex items-center space-x-2">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  <span>New Automation</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-10"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-effect rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300">
                <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-${stat.color}-gradient rounded-lg md:rounded-xl flex items-center justify-center neon-glow`}>
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-deep-space" />
                  </div>
                  <div className="flex items-center text-electric-teal">
                    <span className="text-[10px] sm:text-xs md:text-sm font-medium">{stat.change}</span>
                    <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                  </div>
                </div>
                
                <h3 className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-${stat.color} mb-1 sm:mb-2 leading-tight`}>{stat.value}</h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-soft-silver-dark leading-tight">{stat.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Recent Activity + Quick Actions in one row on small screens */}
          <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
            {/* Activity Feed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="glass-effect rounded-2xl p-4 sm:p-6 border border-soft-silver/10"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-aurora-gradient rounded-xl flex items-center justify-center aurora-glow">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-deep-space" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-aurora-purple">Recent Activity</h3>
                </div>
                <button className="text-soft-silver hover:text-electric-teal transition-colors duration-300">
                  <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="space-y-3 max-h-72 overflow-y-auto">
            {recentActivities.map((activity) => (
                  <motion.div
                key={activity.action + activity.time}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                    className="flex items-center space-x-3 p-3 rounded-xl bg-deep-space-light/50 hover:bg-deep-space-light/70 transition-colors duration-300"
                  >
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-electric-teal/20' : 'bg-neon-coral/20'
                    }`}>
                      {activity.status === 'success' ? (
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-electric-teal" />
                      ) : (
                        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-neon-coral" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-soft-silver text-xs sm:text-sm font-medium">{activity.action}</p>
                      <p className="text-soft-silver-dark text-[10px] sm:text-xs">{activity.time}</p>
                    </div>
                    
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      activity.type === 'ai' ? 'bg-electric-teal/20 text-electric-teal' :
                      activity.type === 'automation' ? 'bg-aurora-purple/20 text-aurora-purple' :
                      activity.type === 'data' ? 'bg-neon-coral/20 text-neon-coral' :
                      'bg-soft-silver/20 text-soft-silver'
                    }`}>
                      {activity.type}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="glass-effect rounded-2xl p-4 sm:p-6 border border-soft-silver/10"
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-deep-space" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-neon-coral">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.label}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`glass-effect border border-${action.color}/20 hover:border-${action.color}/40 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 group`}
                  >
                    <action.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${action.color} mx-auto mb-2 group-hover:scale-110 transition-transform duration-300`} />
                    <p className={`text-xs sm:text-sm font-medium text-${action.color}`}>{action.label}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* (Removed) First Performance Overview card - merged into the charts section below */}

          {/* Performance Overview (Charts + KPIs) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="glass-effect rounded-2xl p-8 border border-soft-silver/10"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-electric-gradient rounded-xl flex items-center justify-center neon-glow">
                  <BarChart3 className="w-5 h-5 text-deep-space" />
                </div>
                <h3 className="text-2xl font-semibold text-electric-teal">Performance Overview</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setRange('7d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${range === '7d' ? 'bg-electric-teal/10 text-electric-teal' : 'text-soft-silver hover:text-electric-teal'}`}
                >
                  7 Days
                </button>
                <button
                  onClick={() => setRange('30d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${range === '30d' ? 'bg-electric-teal/10 text-electric-teal' : 'text-soft-silver hover:text-electric-teal'}`}
                >
                  30 Days
                </button>
                <button
                  onClick={() => setRange('90d')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${range === '90d' ? 'bg-electric-teal/10 text-electric-teal' : 'text-soft-silver hover:text-electric-teal'}`}
                >
                  90 Days
                </button>
              </div>
            </div>
            {/* Row 1: Automation metrics in a row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-deep-space-light" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                            strokeDasharray="251.2" strokeDashoffset={`${251.2 - (perf.automationSuccess / 100) * 251.2}`} className="text-electric-teal" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-electric-teal">{perf.automationSuccess}%</span>
                  </div>
                </div>
                <p className="text-soft-silver font-medium">Automation Success</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-deep-space-light" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                            strokeDasharray="251.2" strokeDashoffset={`${251.2 - (perf.dataProcessing / 100) * 251.2}`} className="text-aurora-purple" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-aurora-purple">{perf.dataProcessing}%</span>
                  </div>
                </div>
                <p className="text-soft-silver font-medium">Data Processing</p>
              </div>
              
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 relative">
                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-deep-space-light" />
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="8" fill="none" 
                            strokeDasharray="251.2" strokeDashoffset={`${251.2 - (perf.aiAccuracy / 100) * 251.2}`} className="text-neon-coral" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-neon-coral">{perf.aiAccuracy}%</span>
                  </div>
                </div>
                <p className="text-soft-silver font-medium">AI Accuracy</p>
              </div>
            </div>

            {/* Row 2: KPIs from the first card */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-[10px] sm:text-xs text-soft-silver-dark">CTR</span>
                  <span className="text-lg sm:text-xl font-semibold text-electric-teal">{perf.ctr}%</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] sm:text-xs text-soft-silver-dark">CVR</span>
                  <span className="text-lg sm:text-xl font-semibold text-aurora-purple">{perf.cvr}%</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] sm:text-xs text-soft-silver-dark">AOV</span>
                  <span className="text-lg sm:text-xl font-semibold text-neon-coral">${perf.aov}</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-[10px] sm:text-xs text-soft-silver-dark">ROI</span>
                  <span className="text-lg sm:text-xl font-semibold text-soft-silver">{perf.roi}x</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}

