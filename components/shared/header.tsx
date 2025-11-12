"use client"

import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { createPortal } from "react-dom"
import { 
  Brain, 
  BarChart3, 
  Workflow, 
  MessageSquare,
  Bot,
  Menu,
  X,
  User,
  Sparkles,
  Zap
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import AuthModal from "@/components/auth/auth-modal"

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { user } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure portal target is available
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      // Improve touch behavior on mobile (prevent background scroll/bounce)
      (document.body.style as any).overscrollBehavior = 'contain';
      (document.documentElement.style as any).overscrollBehavior = 'contain';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
      (document.body.style as any).overscrollBehavior = '';
      (document.documentElement.style as any).overscrollBehavior = '';
    };
  }, [isMenuOpen]);

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-nav sticky top-0 z-50 relative"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div 
              className="relative w-10 h-10 rounded-xl overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="absolute inset-0 bg-neon-gradient opacity-90" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-cyber font-bold gradient-text">
                Zyra
              </span>
              <span className="text-xs text-zyra-text-secondary font-medium tracking-wider">
                AI AUTOMATION
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <Bot className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Home</span>
            </Link>
            <Link 
              href="/dashboard" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <BarChart3 className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Dashboard</span>
            </Link>
            <Link 
              href="/automation" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <Workflow className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Automation</span>
            </Link>
            <Link 
              href="/insights" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <Brain className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">Insights</span>
            </Link>
            <Link 
              href="/chat" 
              className="flex items-center space-x-2 px-4 py-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-all duration-300 group"
            >
              <MessageSquare className="w-4 h-4 group-hover:animate-pulse" />
              <span className="font-medium">AI Chat</span>
            </Link>
          </nav>
          
          {/* Desktop User Info / Get Started Button */}
          <div className="hidden lg:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2 text-zyra-text-secondary">
                <User className="w-4 h-4" />
                <span className="font-medium">{user.firstName} {user.lastName}</span>
              </div>
            ) : (
              <motion.button 
                onClick={() => setShowAuthModal(true)}
                className="neon-button flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Get Started</span>
              </motion.button>
            )}
          </div>

          {/* Mobile menu button - AI Modern Style */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative p-3 rounded-xl bg-gradient-to-r from-zyra-electric-violet/20 to-zyra-cyan-blue/20 border border-zyra-electric-violet/30 hover:border-zyra-electric-violet/50 transition-all duration-300 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {/* Animated background glow */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-zyra-electric-violet/0 to-zyra-cyan-blue/0 group-hover:from-zyra-electric-violet/20 group-hover:to-zyra-cyan-blue/20 transition-all duration-300 blur-sm" />
            
            {/* Icon container */}
            <div className="relative z-10 flex flex-col items-center justify-center space-y-1.5 w-6 h-6">
              <motion.span
                className="block h-0.5 w-6 bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue rounded-full"
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 7 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue rounded-full"
                animate={{
                  opacity: isMenuOpen ? 0 : 1,
                  scale: isMenuOpen ? 0 : 1,
                }}
                transition={{ duration: 0.2 }}
              />
              <motion.span
                className="block h-0.5 w-6 bg-gradient-to-r from-zyra-electric-violet to-zyra-cyan-blue rounded-full"
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? -7 : 0,
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              />
            </div>
            
            {/* Pulse effect when open */}
            {isMenuOpen && (
              <motion.div
                className="absolute inset-0 rounded-xl border-2 border-zyra-cyan-blue/50"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}
          </motion.button>
        </div>

        {/* Mobile Navigation - AI Modern Slide-in via Portal to avoid transformed ancestor issues */}
        {mounted && createPortal(
          (
            <AnimatePresence>
              {isMenuOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsMenuOpen(false)}
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] lg:hidden"
                  />

                  {/* Slide-in menu */}
                  <motion.div
                    ref={menuRef}
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200, duration: 0.4 }}
                    onClick={(e) => e.stopPropagation()}
                    className="fixed top-0 right-0 h-screen w-80 max-w-[85vw] z-[9999] lg:hidden"
                    style={{ zIndex: 9999, height: '100vh' }}
                  >
                    <div className="h-full w-full bg-[#0a0e27] backdrop-blur-xl border-l border-zyra-electric-violet/30 shadow-2xl relative overflow-hidden">
                      <div className="relative z-50 h-full flex flex-col min-h-0">
                        <div className="flex-shrink-0 p-6 border-b border-zyra-electric-violet/20">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center">
                                  <Bot className="w-6 h-6 text-white" />
                                </div>
                              </div>
                              <div>
                                <h2 className="text-lg font-cyber font-bold gradient-text">Navigation</h2>
                                <p className="text-xs text-[#cbd5e1]">AI-Powered Menu</p>
                              </div>
                            </div>
                            <motion.button
                              onClick={() => setIsMenuOpen(false)}
                              className="p-2 rounded-lg text-[#cbd5e1] hover:text:white hover:bg-white/5 transition-all duration-300"
                              whileHover={{ rotate: 90, scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <X className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </div>

                        <nav className="flex-1 overflow-y-auto p-4 space-y-3 relative z-50 min-h-0">
                          <Link href="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-4 rounded-xl bg-white/10 hover:bg:white/20 border border-white/20 transition-all duration-200 w-full">
                            <Bot className="w-5 h-5 text-white" />
                            <span className="text-white font-medium text-base">Home</span>
                          </Link>
                          <Link href="/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-4 rounded-xl bg-white/10 hover:bg:white/20 border border:white/20 transition-all duration-200 w-full">
                            <BarChart3 className="w-5 h-5 text-white" />
                            <span className="text:white font-medium text-base">Dashboard</span>
                          </Link>
                          <Link href="/automation" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-4 rounded-xl bg-white/10 hover:bg:white/20 border border:white/20 transition-all duration-200 w-full">
                            <Workflow className="w-5 h-5 text:white" />
                            <span className="text:white font-medium text-base">Automation</span>
                          </Link>
                          <Link href="/insights" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-4 rounded-xl bg-white/10 hover:bg:white/20 border border:white/20 transition-all duration-200 w-full">
                            <Brain className="w-5 h-5 text:white" />
                            <span className="text:white font-medium text-base">Insights</span>
                          </Link>
                          <Link href="/chat" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3 px-4 py-4 rounded-xl bg-white/10 hover:bg:white/20 border border:white/20 transition-all duration-200 w-full">
                            <MessageSquare className="w-5 h-5 text:white" />
                            <span className="text:white font-medium text-base">AI Chat</span>
                          </Link>
                        </nav>
                      </div>

                      {/* Animated background gradient - Behind content */}
                      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-zyra-electric-violet/10 via-transparent to-zyra-cyan-blue/10 animate-pulse" />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          ), document.body)}
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode="login"
      />
    </motion.header>
  )
}
