"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  Bot,
  Brain,
  MessageSquare,
  Send,
  Sparkles,
  X,
  Zap
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { sendChatMessage, type ChatMetadata } from "@/lib/api/ai";
import { useAIAssistant, type AIModule } from "@/contexts/ai-assistant-context";

interface AssistantMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  module: AIModule;
  metadata?: ChatMetadata;
}

interface PromptButton {
  id: string;
  label: string;
  prompt: string;
  module: AIModule;
  icon?: LucideIcon;
  description?: string;
}

const MODULE_TO_MODE: Record<AIModule, "general" | "cv" | "social" | "analysis"> = {
  general: "general",
  resume: "cv",
  social: "social",
  analysis: "analysis",
  insights: "analysis"
};

const SERVICE_ACTIONS: PromptButton[] = [
  {
    id: "service-cv",
    label: "Resume AI",
    prompt: "Help me craft or improve a professional CV tailored to my target role.",
    module: "resume",
    icon: Brain,
    description: "Create standout CVs"
  },
  {
    id: "service-social",
    label: "Social AI",
    prompt: "Generate an engaging social media campaign plan for this week.",
    module: "social",
    icon: MessageSquare,
    description: "Cross-platform content"
  },
  {
    id: "service-automation",
    label: "WhatsApp Automations",
    prompt: "Set up a WhatsApp automation flow for capturing and nurturing new leads.",
    module: "general",
    icon: Zap,
    description: "Smart messaging workflows"
  },
  {
    id: "service-analytics",
    label: "Analytics AI",
    prompt: "Analyze my latest performance dataset and highlight key insights.",
    module: "analysis",
    icon: Activity,
    description: "Data-driven decisions"
  }
];

export function FloatingAssistant() {
  const {
    activeModule,
    recommendations,
    queuedPrompt,
    consumeQueuedPrompt
  } = useAIAssistant();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>(() => [
    {
      id: 1,
      role: "assistant",
      content:
        "Hi! I'm Zyra, your AI operations partner. I can update settings, configure automations, or run analytics—what would you like to do?",
      timestamp: new Date(),
      module: activeModule
    }
  ]);
  const messagesRef = useRef<AssistantMessage[]>(messages);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      setIsDesktop(event.matches);
    };

    handleChange(mediaQuery);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange as (ev: MediaQueryListEvent) => void);
    } else {
      mediaQuery.addListener(handleChange as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange as (ev: MediaQueryListEvent) => void);
      } else {
        mediaQuery.removeListener(handleChange as (this: MediaQueryList, ev: MediaQueryListEvent) => void);
      }
    };
  }, []);

  const sendMessage = useCallback(
    async (content: string, moduleOverride?: AIModule) => {
      const trimmed = content.trim();
      if (!trimmed) return;

      const targetModule = moduleOverride ?? activeModule;
      const userMessage: AssistantMessage = {
        id: Date.now(),
        role: "user",
        content: trimmed,
        timestamp: new Date(),
        module: targetModule
      };

      setMessages(prev => [...prev, userMessage]);
      setInputValue("");
      setIsTyping(true);

      const history = [...messagesRef.current, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      try {
        const response = await sendChatMessage({
          message: trimmed,
          mode: MODULE_TO_MODE[targetModule],
          context: {},
          history
        });

        const assistantMessage: AssistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content: response.content,
          timestamp: new Date(),
          module: targetModule,
          metadata: response.metadata
        };
        setMessages(prev => [...prev, assistantMessage]);
      } catch (error: any) {
        const fallback: AssistantMessage = {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error?.message ||
            "Something went wrong. Please try again or adjust your request.",
          timestamp: new Date(),
          module: targetModule
        };
        setMessages(prev => [...prev, fallback]);
      } finally {
        setIsTyping(false);
      }
    },
    [activeModule]
  );

  useEffect(() => {
    if (!queuedPrompt) return;

    if (queuedPrompt.autoSend) {
      sendMessage(queuedPrompt.prompt, queuedPrompt.module);
    } else {
      setInputValue(queuedPrompt.prompt);
    }
    consumeQueuedPrompt();
  }, [queuedPrompt, consumeQueuedPrompt, sendMessage]);

  const serviceActions = useMemo(() => {
    return SERVICE_ACTIONS.filter(action => {
      if (activeModule === "general") return true;
      if (activeModule === "insights" && action.module === "analysis") return true;
      return action.module === activeModule;
    });
  }, [activeModule]);

  const recommendationPrompts = useMemo<PromptButton[]>(
    () =>
      recommendations.map(rec => ({
        id: rec.id,
        label: rec.title,
        prompt: rec.prompt,
        module: rec.module ?? activeModule,
        icon: Sparkles,
        description: rec.description
      })),
    [recommendations, activeModule]
  );

  const buttonPositionClass = isDesktop ? "bottom-[9rem] right-6" : "bottom-6 right-4";

  const handlePromptSelect = (prompt: string, module?: AIModule) => {
    sendMessage(prompt, module);
  };

  const marqueeItems = useMemo(() => {
    if (serviceActions.length === 0) {
      return [];
    }
    return [...serviceActions, ...serviceActions];
  }, [serviceActions]);

  const hasUserConversation = useMemo(
    () => messages.some(message => message.role === "user"),
    [messages]
  );

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(prev => !prev)}
        className={`fixed ${buttonPositionClass} z-50 w-14 h-14 bg-zyra-electric-violet rounded-full shadow-2xl flex items-center justify-center text-white hover:bg-zyra-electric-violet/90 transition-colors`}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 0 0 rgba(139, 92, 246, 0.4)",
            "0 0 0 10px rgba(139, 92, 246, 0)",
            "0 0 0 0 rgba(139, 92, 246, 0)"
          ]
        }}
        transition={{
          boxShadow: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <Bot className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {isDesktop ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="fixed bottom-[13rem] right-6 z-40 w-96 h-[480px] glass-card rounded-2xl border border-zyra-glass-border overflow-hidden"
              >
                <ChatWindow
                  messages={messages}
                  isTyping={isTyping}
                  inputValue={inputValue}
                  setInputValue={setInputValue}
                  onSend={() => sendMessage(inputValue)}
                  onClose={() => setIsOpen(false)}
                  variant="desktop"
                  onPromptSelect={handlePromptSelect}
                  serviceActions={serviceActions}
                  recommendedPrompts={recommendationPrompts}
                />
              </motion.div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40 bg-black"
                  onClick={() => setIsOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  transition={{ type: "spring", stiffness: 220, damping: 22 }}
                  className="fixed inset-0 z-50 flex flex-col bg-zyra-gradient"
                >
                  <ChatWindow
                    messages={messages}
                    isTyping={isTyping}
                    inputValue={inputValue}
                    setInputValue={setInputValue}
                    onSend={() => sendMessage(inputValue)}
                    onClose={() => setIsOpen(false)}
                    variant="mobile"
                    onPromptSelect={handlePromptSelect}
                    serviceActions={serviceActions}
                    recommendedPrompts={recommendationPrompts}
                  />
                </motion.div>
              </>
            )}
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface ChatWindowProps {
  messages: AssistantMessage[];
  isTyping: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  onSend: () => void;
  onClose: () => void;
  variant: "desktop" | "mobile";
  onPromptSelect: (prompt: string, module?: AIModule) => void;
  serviceActions: PromptButton[];
  recommendedPrompts: PromptButton[];
}

function ChatWindow({
  messages,
  isTyping,
  inputValue,
  setInputValue,
  onSend,
  onClose,
  variant,
  onPromptSelect,
  serviceActions,
  recommendedPrompts
}: ChatWindowProps) {
  const containerClass =
    variant === "desktop"
      ? "flex h-full flex-col"
      : "flex flex-1 flex-col backdrop-blur-xl bg-black/10";

  const marqueeItems = useMemo(() => {
    if (serviceActions.length === 0) {
      return [];
    }
    return [...serviceActions, ...serviceActions];
  }, [serviceActions]);

  const hasUserConversation = useMemo(
    () => messages.some(message => message.role === "user"),
    [messages]
  );

  return (
    <>
      <div className={containerClass}>
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-black/15">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zyra-electric-violet/30 border border-zyra-electric-violet/40 flex items-center justify-center">
              <Bot className="w-5 h-5 text-zyra-electric-violet" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Zyra Assistant</h3>
              <p className="text-xs text-zyra-text-secondary">
                Conversational AI for automations, analytics, and content
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(message => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-xl ${
                  message.role === "user"
                    ? "bg-zyra-electric-violet/20 border border-zyra-electric-violet/30"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                <p className="text-sm text-white">{message.content}</p>
                <p className="text-xs text-zyra-text-secondary mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
                {message.metadata && (
                  <MessageMetadata
                    metadata={message.metadata}
                    onPromptSelect={prompt => onPromptSelect(prompt, message.module)}
                  />
                )}
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-zyra-cyan-blue rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                  <span className="text-xs text-zyra-text-secondary">Zyra is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-4 border-t border-white/10 space-y-3">
          {!hasUserConversation && serviceActions.length > 0 && (
            <div>
              <p className="text-xs text-zyra-text-secondary mb-2 uppercase tracking-wide">Assistant services</p>
              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5">
                <div className="flex items-stretch gap-3 py-3 px-2 zyra-service-marquee">
                  {marqueeItems.map((action, index) => (
                    <button
                      key={`${action.id}-${index}`}
                      onClick={() => onPromptSelect(action.prompt, action.module)}
                      className="min-w-[200px] flex items-start gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-left hover:bg-white/15 transition-colors"
                    >
                      <div className="p-2 rounded-lg bg-zyra-electric-violet/10">
                        {action.icon ? (
                          <action.icon className="h-5 w-5 text-zyra-electric-violet" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-zyra-electric-violet" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-white">{action.label}</p>
                        {action.description && (
                          <p className="text-xs text-zyra-text-secondary">{action.description}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!hasUserConversation && recommendedPrompts.length > 0 && (
            <div>
              <p className="text-xs text-zyra-text-secondary mb-2 uppercase tracking-wide">Recommended</p>
              <div className="flex flex-wrap gap-2">
                {recommendedPrompts.map(rec => (
                  <button
                    key={rec.id}
                    onClick={() => onPromptSelect(rec.prompt, rec.module)}
                    className="inline-flex items-center gap-1 rounded-full border border-zyra-electric-violet/40 bg-zyra-electric-violet/10 px-3 py-1 text-xs text-zyra-electric-violet hover:bg-zyra-electric-violet/20 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    {rec.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputValue}
              onChange={event => setInputValue(event.target.value)}
              onKeyDown={event => {
                if (event.key === "Enter") onSend();
              }}
              placeholder="Ask Zyra anything..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-zyra-cyan-blue focus:ring-2 focus:ring-zyra-cyan-blue/20 transition-colors text-white placeholder-zyra-text-secondary"
            />
            <motion.button
              onClick={onSend}
              disabled={!inputValue.trim()}
              className="p-2 rounded-lg bg-zyra-electric-violet text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zyra-electric-violet/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .zyra-service-marquee {
          width: max-content;
          animation: zyra-service-marquee 36s linear infinite reverse;
        }

        @keyframes zyra-service-marquee {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </>
  );
}

function MessageMetadata({
  metadata,
  onPromptSelect
}: {
  metadata: ChatMetadata;
  onPromptSelect: (prompt: string) => void;
}) {
  const confidence =
    typeof metadata.confidence === "number"
      ? `${Math.round(metadata.confidence * 100)}% confidence`
      : null;

  return (
    <div className="mt-2 space-y-2">
      {confidence && (
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-zyra-text-secondary">
          {confidence}
        </span>
      )}

      {metadata.references && metadata.references.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {metadata.references.map(reference => (
            <span
              key={reference}
              className="inline-flex items-center rounded-full bg-white/5 px-2 py-1 text-[10px] text-zyra-text-secondary"
            >
              {reference}
            </span>
          ))}
        </div>
      )}

      {metadata.suggestedFollowups && metadata.suggestedFollowups.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metadata.suggestedFollowups.map(followup => (
            <button
              key={followup}
              onClick={() => onPromptSelect(followup)}
              className="rounded-full border border-zyra-electric-violet/30 bg-zyra-electric-violet/10 px-3 py-1 text-xs text-zyra-electric-violet hover:bg-zyra-electric-violet/20 transition-colors"
            >
              {followup}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
