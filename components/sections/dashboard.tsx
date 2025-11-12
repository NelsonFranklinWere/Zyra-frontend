"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { 
  BarChart3, 
  TrendingUp, 
  Zap,
  Brain,
  Clock
} from "lucide-react"

const stats = [
  { label: "Campaigns Active", value: "24", change: "+12%", trend: "up" },
  { label: "Messages Sent", value: "2.4M", change: "+8%", trend: "up" },
  { label: "AI Personas", value: "156", change: "+23%", trend: "up" },
  { label: "Conversion Rate", value: "89.2%", change: "+2%", trend: "up" }
]

export const Dashboard = () => {
  const router = useRouter()

  const handleGenerateCV = () => {
    // Always show mode selection screen when coming from home page
    router.push('/dashboard/ai-tools/cv-builder?select=true')
  }

  return (
    <section className="py-32 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center space-x-2 bg-electric-teal/10 border border-electric-teal/20 rounded-full px-4 py-2 mb-8">
            <BarChart3 className="w-4 h-4 text-electric-teal" />
            <span className="text-sm text-electric-teal font-medium">Marketing Intelligence Dashboard</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-display font-bold mb-8">
            <span className="bg-electric-gradient bg-clip-text text-transparent glow-text">
              Zyra Intelligence Center
            </span>
          </h2>
          
          <p className="text-xl text-soft-silver max-w-3xl mx-auto">
            Monitor your AI-powered marketing campaigns, track Gen Z engagement, and optimize conversion rates in real-time
          </p>
          {/* Top actions - Generate CV button is 2x larger */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button 
              onClick={handleGenerateCV}
              className="px-6 py-4 text-base font-semibold rounded-lg glass-effect border border-white/10 hover:bg-white/10 transition-colors hover:scale-105"
            >
              Generate CV
            </button>
            <button className="px-3 py-2 text-xs rounded-lg bg-electric-gradient text-deep-space font-semibold hover:opacity-90 transition-opacity">
              New Automation
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-10"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass-effect rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-6 border border-soft-silver/10 hover:border-electric-teal/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-electric-gradient rounded-lg sm:rounded-xl flex items-center justify-center neon-glow">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-deep-space" />
                </div>
                <div className="flex items-center text-electric-teal">
                  <span className="text-[10px] sm:text-xs md:text-sm font-medium">{stat.change}</span>
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 ml-0.5 sm:ml-1" />
                </div>
              </div>
              
              <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-electric-teal mb-1 sm:mb-2 leading-tight">{stat.value}</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-soft-silver-dark leading-tight">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Recent Activity + Quick Actions in one row (even on small screens) */}
        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:gap-8 mb-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl p-4 sm:p-6 border border-soft-silver/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg sm:text-xl font-semibold text-soft-silver">Recent Activity</h3>
              <span className="text-[10px] sm:text-xs text-soft-silver-dark">Live</span>
            </div>
            <div className="space-y-3">
              {["Persona analysis completed", "Campaign triggered", "Captions generated"].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs sm:text-sm text-soft-silver">{item}</span>
                  <span className="text-[10px] sm:text-xs text-soft-silver-dark">{i * 3 + 2} min ago</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            viewport={{ once: true }}
            className="glass-effect rounded-2xl p-4 sm:p-6 border border-soft-silver/10"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-neon-coral to-pink-500 rounded-xl flex items-center justify-center coral-glow">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-deep-space" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-neon-coral">Quick Actions</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="glass-effect border border-electric-teal/20 hover:border-electric-teal/40 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 group">
                <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-electric-teal mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-xs sm:text-sm font-medium text-electric-teal">Generate Personas</p>
              </button>
              <button className="glass-effect border border-aurora-purple/20 hover:border-aurora-purple/40 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 group">
                <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-aurora-purple mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-xs sm:text-sm font-medium text-aurora-purple">Create Campaign</p>
              </button>
              <button className="glass-effect border border-neon-coral/20 hover:border-neon-coral/40 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 group">
                <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-neon-coral mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-xs sm:text-sm font-medium text-neon-coral">View Reports</p>
              </button>
              <button className="glass-effect border border-electric-teal/20 hover:border-electric-teal/40 p-3 sm:p-4 rounded-xl text-center transition-all duration-300 group">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-electric-teal mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
                <p className="text-xs sm:text-sm font-medium text-electric-teal">Target Audience</p>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Performance Overview below, full width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="glass-effect rounded-2xl p-4 sm:p-6 border border-soft-silver/10"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-soft-silver">Performance Overview</h3>
            <TrendingUp className="w-4 h-4 text-electric-teal" />
          </div>
          {/* Combined performance card */}
          <div className="p-4 sm:p-5 rounded-xl bg-white/5 border border-white/10">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="flex flex-col items-start">
                <span className="text-[10px] sm:text-xs text-soft-silver-dark">CTR</span>
                <span className="text-lg sm:text-xl font-semibold text-electric-teal">5.8%</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] sm:text-xs text-soft-silver-dark">CVR</span>
                <span className="text-lg sm:text-xl font-semibold text-aurora-purple">2.3%</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] sm:text-xs text-soft-silver-dark">AOV</span>
                <span className="text-lg sm:text-xl font-semibold text-neon-coral">$47</span>
              </div>
              <div className="flex flex-col items-start">
                <span className="text-[10px] sm:text-xs text-soft-silver-dark">ROI</span>
                <span className="text-lg sm:text-xl font-semibold text-soft-silver">3.1x</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
