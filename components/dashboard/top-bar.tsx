'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut,
  Menu,
  Zap,
  Brain,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface TopBarProps {
  onMenuClick: () => void
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    avatarUrl?: string
  }
}

export function TopBar({ onMenuClick, user }: TopBarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 })
  const { logout } = useAuth()
  const userMenuButtonRef = useRef<HTMLButtonElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)

  // Ensure portal target is available
  useEffect(() => {
    setMounted(true)
  }, [])

  // Calculate menu position when opened
  useEffect(() => {
    const updatePosition = () => {
      if (showUserMenu && userMenuButtonRef.current) {
        const buttonRect = userMenuButtonRef.current.getBoundingClientRect()
        setMenuPosition({
          top: buttonRect.bottom + 8,
          right: window.innerWidth - buttonRect.right
        })
      }
    }

    updatePosition()
    
    // Update position on scroll and resize
    if (showUserMenu) {
      window.addEventListener('scroll', updatePosition, true)
      window.addEventListener('resize', updatePosition)
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true)
        window.removeEventListener('resize', updatePosition)
      }
    }
  }, [showUserMenu])

  // Close user menu when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserMenu) {
        if (
          userMenuRef.current && 
          !userMenuRef.current.contains(event.target as Node) &&
          userMenuButtonRef.current &&
          !userMenuButtonRef.current.contains(event.target as Node)
        ) {
          setShowUserMenu(false)
        }
      }
      if (showNotifications && notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showUserMenu) setShowUserMenu(false)
        if (showNotifications) setShowNotifications(false)
      }
    }

    if (showUserMenu || showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [showUserMenu, showNotifications])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-nav border-b border-zyra-glass-border"
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Button */}
          <motion.button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Menu className="w-5 h-5" />
          </motion.button>

          {/* Search Bar */}
          <div className="relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zyra-text-secondary" />
              <input
                type="text"
                placeholder="Search automations, AI tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-80 pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          {/* AI Status Indicator */}
          <div className="hidden lg:flex items-center space-x-2 px-3 py-2 rounded-lg bg-zyra-electric-violet/10 border border-zyra-electric-violet/20">
            <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-pulse" />
            <span className="text-sm text-zyra-text-secondary">AI Core</span>
          </div>

          {/* Quick Actions */}
          <div className="hidden lg:flex items-center space-x-2">
            <motion.button
              className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
            </motion.button>
            <motion.button
              className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Brain className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-2 rounded-lg transition-colors ${
                showNotifications
                  ? 'text-white bg-white/10'
                  : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-zyra-electric-violet rounded-full animate-pulse" />
            </motion.button>

            {/* Notifications Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-full mt-2 w-80 glass-card p-4 rounded-xl border border-zyra-glass-border shadow-2xl z-50"
                  style={{ 
                    background: 'rgba(10, 14, 39, 0.95)',
                    backdropFilter: 'blur(20px)'
                  }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-zyra-cyan-blue/10 border border-zyra-cyan-blue/20">
                      <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">AI Automation Complete</p>
                        <p className="text-xs text-zyra-text-secondary">WhatsApp workflow executed successfully</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 rounded-lg bg-zyra-electric-violet/10 border border-zyra-electric-violet/20">
                      <div className="w-2 h-2 bg-zyra-electric-violet rounded-full" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">New Insight Available</p>
                        <p className="text-xs text-zyra-text-secondary">Data analysis completed for Q4</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <motion.button
              ref={userMenuButtonRef}
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all duration-200 ${
                showUserMenu 
                  ? 'bg-white/10 text-white border border-zyra-electric-violet/50' 
                  : 'text-zyra-text-secondary hover:text-white hover:bg-white/5'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full border-2 border-zyra-electric-violet/50 shadow-lg shadow-zyra-electric-violet/20"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  showUserMenu
                    ? 'bg-zyra-electric-violet/30 border-2 border-zyra-electric-violet/50'
                    : 'bg-zyra-electric-violet/20 border border-zyra-electric-violet/30'
                }`}>
                  <User className="w-4 h-4" />
                </div>
              )}
              <div className="hidden lg:block text-left">
                <div className="text-sm font-medium text-white">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-xs text-zyra-text-secondary">
                  {user.email}
                </div>
              </div>
              <ChevronDown 
                className={`w-4 h-4 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} 
              />
            </motion.button>

            {/* User Dropdown - Rendered via Portal */}
            {mounted && createPortal(
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    {/* Backdrop */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setShowUserMenu(false)}
                      className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                      style={{ pointerEvents: 'auto' }}
                    />
                    {/* Dropdown Menu */}
                    <motion.div
                      ref={userMenuRef}
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="fixed w-72 glass-card p-2 rounded-xl border border-zyra-glass-border shadow-2xl z-[9999]"
                      style={{ 
                        top: `${menuPosition.top}px`,
                        right: `${menuPosition.right}px`,
                        background: 'rgba(10, 14, 39, 0.98)',
                        backdropFilter: 'blur(20px)',
                        boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4), 0 0 0 1px rgba(139, 92, 246, 0.2)'
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-zyra-glass-border mb-2">
                        <div className="flex items-center space-x-3">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={user.firstName}
                              className="w-10 h-10 rounded-full border-2 border-zyra-electric-violet/50"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zyra-electric-violet/20 border-2 border-zyra-electric-violet/50 flex items-center justify-center">
                              <User className="w-5 h-5 text-zyra-electric-violet" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-zyra-text-secondary truncate">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Link
                          href="/dashboard/profile"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/10 transition-all duration-200 group"
                        >
                          <div className="p-1.5 rounded-lg bg-zyra-cyan-blue/10 group-hover:bg-zyra-cyan-blue/20 transition-colors">
                            <User className="w-4 h-4 text-zyra-cyan-blue" />
                          </div>
                          <span className="font-medium">My Profile</span>
                        </Link>
                        <Link
                          href="/dashboard/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/10 transition-all duration-200 group"
                        >
                          <div className="p-1.5 rounded-lg bg-zyra-electric-violet/10 group-hover:bg-zyra-electric-violet/20 transition-colors">
                            <Settings className="w-4 h-4 text-zyra-electric-violet" />
                          </div>
                          <span className="font-medium">Settings</span>
                        </Link>
                        <div className="border-t border-zyra-glass-border my-2" />
                        <button
                          onClick={() => {
                            setShowUserMenu(false)
                            logout()
                          }}
                          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 group"
                        >
                          <div className="p-1.5 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                            <LogOut className="w-4 h-4 text-red-400" />
                          </div>
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>,
              document.body
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
