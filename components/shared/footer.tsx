"use client"

import { motion } from "framer-motion"
import { Brain, Github, Twitter, Linkedin } from "lucide-react"

export const Footer = () => {
  return (
    <footer className="relative bg-deep-space border-t border-electric-teal/20">
      <div className="container mx-auto px-4 py-16">
        {/* Brand Section - Above the three columns */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-electric-gradient rounded-lg flex items-center justify-center neon-glow">
              <Brain className="w-5 h-5 text-deep-space" />
            </div>
            <span className="text-2xl font-display font-bold bg-electric-gradient bg-clip-text text-transparent glow-text">
              Zyra
            </span>
          </div>
          <p className="text-soft-silver-dark mb-6 max-w-2xl mx-auto">
            The future of intelligent automation. Connect data, automate workflows, and unlock insights with AI.
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="w-10 h-10 bg-electric-teal/10 border border-electric-teal/20 rounded-lg flex items-center justify-center hover:bg-electric-teal/20 transition-colors duration-300">
              <Github className="w-5 h-5 text-electric-teal" />
            </a>
            <a href="#" className="w-10 h-10 bg-aurora-purple/10 border border-aurora-purple/20 rounded-lg flex items-center justify-center hover:bg-aurora-purple/20 transition-colors duration-300">
              <Twitter className="w-5 h-5 text-aurora-purple" />
            </a>
            <a href="#" className="w-10 h-10 bg-neon-coral/10 border border-neon-coral/20 rounded-lg flex items-center justify-center hover:bg-neon-coral/20 transition-colors duration-300">
              <Linkedin className="w-5 h-5 text-neon-coral" />
            </a>
          </div>
        </motion.div>

        {/* Three Columns: Product, Company, Support */}
        <div className="grid grid-cols-3 gap-4 sm:gap-6 md:gap-8 lg:gap-12">
          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-electric-teal mb-3 sm:mb-4 md:mb-6">Product</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="/#features" className="text-xs sm:text-sm text-soft-silver-dark hover:text-electric-teal transition-colors duration-300">Features</a></li>
              <li><a href="/#pricing" className="text-xs sm:text-sm text-soft-silver-dark hover:text-electric-teal transition-colors duration-300">Pricing</a></li>
              <li><a href="/docs" className="text-xs sm:text-sm text-soft-silver-dark hover:text-electric-teal transition-colors duration-300">Documentation</a></li>
              <li><a href="/docs/api" className="text-xs sm:text-sm text-soft-silver-dark hover:text-electric-teal transition-colors duration-300">API Reference</a></li>
              <li><a href="/dashboard/settings/integrations" className="text-xs sm:text-sm text-soft-silver-dark hover:text-electric-teal transition-colors duration-300">Integrations</a></li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-aurora-purple mb-3 sm:mb-4 md:mb-6">Company</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="/#about" className="text-xs sm:text-sm text-soft-silver-dark hover:text-aurora-purple transition-colors duration-300">About</a></li>
              <li><a href="/blog" className="text-xs sm:text-sm text-soft-silver-dark hover:text-aurora-purple transition-colors duration-300">Blog</a></li>
              <li><a href="/#careers" className="text-xs sm:text-sm text-soft-silver-dark hover:text-aurora-purple transition-colors duration-300">Careers</a></li>
              <li><a href="/#press" className="text-xs sm:text-sm text-soft-silver-dark hover:text-aurora-purple transition-colors duration-300">Press</a></li>
              <li><a href="/#partners" className="text-xs sm:text-sm text-soft-silver-dark hover:text-aurora-purple transition-colors duration-300">Partners</a></li>
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <h4 className="text-sm sm:text-base md:text-lg font-semibold text-neon-coral mb-3 sm:mb-4 md:mb-6">Support</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li><a href="/docs" className="text-xs sm:text-sm text-soft-silver-dark hover:text-neon-coral transition-colors duration-300">Help Center</a></li>
              <li><a href="/contact" className="text-xs sm:text-sm text-soft-silver-dark hover:text-neon-coral transition-colors duration-300">Contact</a></li>
              <li><a href="/#status" className="text-xs sm:text-sm text-soft-silver-dark hover:text-neon-coral transition-colors duration-300">Status</a></li>
              <li><a href="/#community" className="text-xs sm:text-sm text-soft-silver-dark hover:text-neon-coral transition-colors duration-300">Community</a></li>
              <li><a href="/#security" className="text-xs sm:text-sm text-soft-silver-dark hover:text-neon-coral transition-colors duration-300">Security</a></li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="border-t border-soft-silver/10 mt-12 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-soft-silver-dark mb-4 md:mb-0">
              &copy; 2025 Zyra. All rights reserved. Built for the future of automation.
            </p>
            <div className="flex items-center space-x-6">
              <a href="/legal/privacy" className="text-soft-silver-dark hover:text-electric-teal transition-colors duration-300 text-sm">Privacy Policy</a>
              <a href="/legal/terms" className="text-soft-silver-dark hover:text-electric-teal transition-colors duration-300 text-sm">Terms of Service</a>
              <a href="/legal/cookies" className="text-soft-silver-dark hover:text-electric-teal transition-colors duration-300 text-sm">Cookie Settings</a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
