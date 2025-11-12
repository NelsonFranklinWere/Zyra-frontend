'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { TopBar } from '@/components/dashboard/top-bar'
import { FloatingAssistant } from '@/components/dashboard/floating-assistant'
import { useAuth } from '@/contexts/auth-context'
import { AIAssistantProvider } from '@/contexts/ai-assistant-context'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // On desktop, sidebar should be visible by default
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { user } = useAuth()

  const handleSidebarClose = () => {
    if (typeof window !== 'undefined') {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches
      if (isDesktop) {
        return
      }
    }
    setSidebarOpen(false)
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zyra-gradient flex items-center justify-center">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-cyber font-bold gradient-text mb-4">
            Access Denied
          </h2>
          <p className="text-zyra-text-secondary">
            Please log in to access the dashboard
          </p>
        </div>
      </div>
    )
  }

  return (
    <AIAssistantProvider>
    <div className="min-h-screen bg-zyra-gradient">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-zyra-electric-violet/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-zyra-cyan-blue/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-zyra-violet/10 rounded-full blur-3xl" />
      </div>

      {/* Main Layout */}
      <div className="relative z-10 flex h-screen">
        {/* Floating Nav Toggle (mobile) */}
        <motion.button
          onClick={() => setSidebarOpen((prev) => !prev)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="lg:hidden fixed left-3 top-20 z-40 p-2 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 backdrop-blur-md"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
        >
          {sidebarOpen ? (
            <ChevronLeft className="w-5 h-5 text-white" />
          ) : (
            <ChevronRight className="w-5 h-5 text-white" />
          )}
        </motion.button>
        {/* Sidebar - Always visible on desktop, toggleable on mobile */}
        <motion.aside
          initial={false}
          animate={{ 
            x: sidebarOpen ? 0 : -300, 
            opacity: sidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            fixed lg:translate-x-0 lg:opacity-100
            inset-y-0 left-0 z-30 w-64 
            glass-sidebar border-r border-zyra-glass-border
            flex-shrink-0`}
        >
          <Sidebar onClose={handleSidebarClose} />
        </motion.aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
          {/* Top Bar - Always visible on desktop */}
          <div className="relative z-10">
            <TopBar 
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              user={user}
            />
          </div>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAssistant />
    </div>
    </AIAssistantProvider>
  )
}
