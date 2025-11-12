"use client";

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Send,
  Upload,
  Download,
  ThumbsUp,
  ThumbsDown,
  Bot,
  User,
  FileText,
  Database,
  Sparkles,
  Copy,
  Share2
} from "lucide-react";
import {
  sendChatMessage,
  uploadFileForChat
} from "@/lib/api/ai";
import { useAIAssistant } from "@/contexts/ai-assistant-context";
import {
  useAIAssistant,
  type AIModule
} from "@/contexts/ai-assistant-context";

type ChatMode = "general" | "cv" | "social" | "analysis";

interface MessageMetadata {
  confidence?: number;
  suggestedFollowups?: string[];
  references?: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "analysis" | "insight" | "action_plan" | "file";
  metadata?: MessageMetadata;
  feedback?: "positive" | "negative" | null;
}

interface ChatContext {
  tenantId?: string;
  dataset?: string;
  product?: string;
  model?: string;
  temperature?: number;
}

const ERROR_MESSAGE =
  "Sorry, Zyra AI is busy right now. Please try again shortly.";

const MODULE_TO_MODE: Record<AIModule, ChatMode> = {
  general: "general",
  resume: "cv",
  social: "social",
  insights: "analysis",
  analysis: "analysis"
};

const MODE_TO_MODULE: Record<ChatMode, AIModule> = {
  general: "general",
  cv: "resume",
  social: "social",
  analysis: "analysis"
};

export default function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ChatContext>({});
  const {
    activeModule,
    setActiveModule,
    queuePrompt,
    queuedPrompt,
    consumeQueuedPrompt,
    recommendations
  } = useAIAssistant();
  const [selectedMode, setSelectedMode] = useState<ChatMode>(MODULE_TO_MODE[activeModule] ?? "general");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const mapped = MODULE_TO_MODE[activeModule] ?? "general";
    setSelectedMode(mapped);
  }, [activeModule]);

  const prefersReducedMotion = useMemo(() => {
    if (typeof window === "undefined") {
      return false;
    }
    return window
      .matchMedia("(prefers-reduced-motion: reduce)")
      .matches;
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const conversationHistory = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.content
      })),
    [messages]
  );

  const getModeIcon = (mode: ChatMode | string) => {
    switch (mode) {
      case "cv":
        return <FileText className="w-4 h-4" />;
      case "social":
        return <Share2 className="w-4 h-4" />;
      case "analysis":
        return <Database className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getModeDescription = (mode: ChatMode | string) => {
    switch (mode) {
      case "cv":
        return "CV Builder & Career Advice";
      case "social":
        return "Social Media Content";
      case "analysis":
        return "Data Analysis";
      default:
        return "General AI Assistant";
    }
  };

  const contextChips = useMemo(() => {
    const chips: { label: string; value: string }[] = [
      { label: "Mode", value: getModeDescription(selectedMode) }
    ];
    if (context.dataset) {
      chips.push({ label: "Dataset", value: context.dataset });
    }
    if (context.product) {
      chips.push({ label: "Product", value: context.product });
    }
    return chips;
  }, [context.dataset, context.product, selectedMode]);

  const renderMetadata = (message: Message) => {
    if (!message.metadata) {
      return null;
    }

    const {
      confidence,
      suggestedFollowups,
      references
    } = message.metadata;

    if (
      typeof confidence === "undefined" &&
      !suggestedFollowups?.length &&
      !references?.length
    ) {
      return null;
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2 ml-10">
        {typeof confidence === "number" && (
          <Badge
            variant="outline"
            className="text-zyra-text-secondary border-zyra-glass-border"
          >
            Confidence {(confidence * 100).toFixed(0)}%
          </Badge>
        )}
        {suggestedFollowups?.slice(0, 3).map((followup, index) => (
          <Button
            key={`${message.id}-followup-${index}`}
            variant="ghost"
            size="sm"
            className="text-zyra-cyan-blue hover:text-white hover:bg-zyra-cyan-blue/20"
            onClick={() => setInput(followup)}
          >
            {followup}
          </Button>
        ))}
        {references?.slice(0, 3).map((reference, index) => (
          <Badge
            key={`${message.id}-reference-${index}`}
            variant="outline"
            className="text-zyra-text-secondary border-zyra-glass-border"
          >
            {reference}
          </Badge>
        ))}
      </div>
    );
  };

  const appendAssistantMessage = useCallback((content: string, metadata?: MessageMetadata, type?: Message["type"]) => {
    const assistantMessage: Message = {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content,
      timestamp: new Date(),
      type,
      metadata
    };
    setMessages((prev) => [...prev, assistantMessage]);
  }, []);

  const sendMessage = useCallback(
    async (content: string, opts?: { mode?: ChatMode; skipUserEcho?: boolean }) => {
      const mode = opts?.mode ?? selectedMode;
      if (!opts?.skipUserEcho) {
        const userMessage: Message = {
          id: `${Date.now()}-user`,
          role: "user",
          content,
          timestamp: new Date()
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      setLoading(true);
      try {
        const data = await sendChatMessage({
          message: content,
          mode,
          context,
          history: conversationHistory
        });

        appendAssistantMessage(
          data.content,
          data.metadata,
          data.type as Message["type"]
        );
      } catch (error) {
        console.error("Error sending message:", error);
        appendAssistantMessage(ERROR_MESSAGE);
      } finally {
        setLoading(false);
      }
    },
    [appendAssistantMessage, context, conversationHistory, selectedMode]
  );

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || loading) {
      return;
    }
    const text = input;
    setInput("");
    await sendMessage(text);
  }, [input, loading, sendMessage]);

  const handleExternalPrompt = useCallback(
    async (prompt: string, module: AIModule) => {
      const mappedMode = MODULE_TO_MODE[module] ?? selectedMode;
      await sendMessage(prompt, { mode: mappedMode, skipUserEcho: false });
    },
    [sendMessage, selectedMode]
  );

  useEffect(() => {
    if (!queuedPrompt) return;
    handleExternalPrompt(queuedPrompt.prompt, queuedPrompt.module).finally(() => {
      consumeQueuedPrompt();
      router.push("/dashboard/ai/chat");
    });
  }, [queuedPrompt, consumeQueuedPrompt, handleExternalPrompt, router]);

  const handleFileUpload = useCallback(
    async (file: File) => {
      try {
        const data = await uploadFileForChat({ file, context });

        const fileMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          content: `Uploaded file: ${file.name}`,
          timestamp: new Date(),
          type: "file",
          metadata: {
            fileName: file.name,
            fileSize: file.size
          }
        };

        setMessages((prev) => [...prev, fileMessage]);

        appendAssistantMessage(
          data.analysis ||
            "File received. I’ll factor it into my next answers.",
          undefined,
          "analysis"
        );
      } catch (error) {
        console.error("Error uploading file:", error);
        appendAssistantMessage(ERROR_MESSAGE);
      }
    },
    [appendAssistantMessage, context]
  );

  const handleFeedback = async (
    messageId: string,
    feedback: "positive" | "negative"
  ) => {
    try {
      await fetch("/api/ai/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId, feedback })
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId ? { ...msg, feedback } : msg
        )
      );
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleDownloadResponse = async (messageId: string) => {
    try {
      const response = await fetch(`/api/ai/download/${messageId}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zyra-response-${messageId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading response:", error);
    }
  };

  const handlePromptClick = (prompt: string, module?: AIModule) => {
    if (module) {
      queuePrompt(prompt, { module, autoSend: true });
      return;
    }
    setInput(prompt);
  };

  const modeOptions: ChatMode[] = ["general", "cv", "social", "analysis"];

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <Link
              href="/dashboard"
              className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
              title="Back to Dashboard"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-zyra-cyan-blue">
              AI Chat Assistant
            </h1>
          </div>
          <p className="text-zyra-text-secondary">
            Chat with Zyra&apos;s AI to get insights, generate content,
            and analyze your data
          </p>
        </div>
        <Link
          href="/"
          className="p-2 rounded-lg text-zyra-text-secondary hover:text-white hover:bg-white/5 transition-colors"
          title="Go to Home"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card className="glass-card h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-zyra-cyan-blue flex items-center">
                  <Bot className="w-5 h-5 mr-2" />
                  Zyra AI Assistant
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-500">
                    Online
                  </Badge>
                </div>
              </div>
              {contextChips.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {contextChips.map((chip) => (
                    <Badge
                      key={`${chip.label}-${chip.value}`}
                      variant="outline"
                      className="border-zyra-glass-border bg-zyra-glass text-zyra-text-secondary"
                    >
                      <span className="font-medium text-zyra-text-primary mr-1">
                        {chip.label}:
                      </span>
                      {chip.value}
                    </Badge>
                  ))}
                </div>
              )}
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <div
                className="flex-1 overflow-y-auto p-6 space-y-4"
                aria-live="polite"
                role="log"
              >
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 20 }
                      }
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 1, y: 0 }
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: -20 }
                      }
                      className={`flex ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] ${
                          message.role === "user" ? "order-2" : "order-1"
                        }`}
                      >
                        <div
                          className={`flex items-start space-x-2 ${
                            message.role === "user"
                              ? "flex-row-reverse space-x-reverse"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? "bg-zyra-cyan-blue text-white"
                                : "bg-zyra-electric-violet text-white"
                            }`}
                          >
                            {message.role === "user" ? (
                              <User className="w-4 h-4" />
                            ) : (
                              <Bot className="w-4 h-4" />
                            )}
                          </div>
                          <div
                            className={`rounded-lg p-4 ${
                              message.role === "user"
                                ? "bg-zyra-cyan-blue text-white"
                                : "bg-zyra-glass border border-zyra-glass-border"
                            }`}
                          >
                            <div className="whitespace-pre-wrap">
                              {message.content}
                            </div>
                            <div
                              className={`text-xs mt-2 ${
                                message.role === "user"
                                  ? "text-blue-100"
                                  : "text-zyra-text-secondary"
                              }`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>

                        {message.role === "assistant" && (
                          <div className="flex items-center space-x-2 mt-2 ml-10">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopyMessage(message.content)}
                              className="text-zyra-text-secondary hover:text-zyra-cyan-blue"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                handleDownloadResponse(message.id)
                              }
                              className="text-zyra-text-secondary hover:text-zyra-cyan-blue"
                            >
                              <Download className="w-3 h-3" />
                            </Button>
                            <div className="flex items-center space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleFeedback(message.id, "positive")
                                }
                                className={`text-zyra-text-secondary hover:text-green-500 ${
                                  message.feedback === "positive"
                                    ? "text-green-500"
                                    : ""
                                }`}
                              >
                                <ThumbsUp className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleFeedback(message.id, "negative")
                                }
                                className={`text-zyra-text-secondary hover:text-red-500 ${
                                  message.feedback === "negative"
                                    ? "text-red-500"
                                    : ""
                                }`}
                              >
                                <ThumbsDown className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {message.role === "assistant" && renderMetadata(message)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {loading && (
                  <motion.div
                    initial={
                      prefersReducedMotion ? { opacity: 0 } : { opacity: 0 }
                    }
                    animate={
                      prefersReducedMotion ? { opacity: 1 } : { opacity: 1 }
                    }
                    className="flex justify-start"
                  >
                    <div className="flex items-start space-x-2">
                      <div className="w-8 h-8 rounded-full bg-zyra-electric-violet text-white flex items-center justify-center">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-zyra-glass border border-zyra-glass-border rounded-lg p-4">
                        <div className="flex items-center space-x-2">
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
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-zyra-glass-border p-4">
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask me anything... I can help with CV generation, social media content, data analysis, and more!"
                      className="min-h-[60px] max-h-[120px] resize-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col space-y-2">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      accept=".pdf,.doc,.docx,.txt,.csv,.xlsx"
                    />
                    <label htmlFor="file-upload">
                      <Button
                        size="sm"
                        variant="outline"
                        className="cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </label>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!input.trim() || loading}
                      className="neon-button"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-zyra-cyan-blue">
                Chat Modes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {modeOptions.map((mode) => (
                <Button
                  key={mode}
                  variant={
                    selectedMode === mode ? "default" : "outline"
                  }
                  className={`w-full justify-start ${
                    selectedMode === mode
                      ? "bg-zyra-cyan-blue text-white"
                      : "text-zyra-text-secondary hover:text-zyra-cyan-blue"
                  }`}
                  onClick={() => {
                    setSelectedMode(mode);
                    setActiveModule(MODE_TO_MODULE[mode]);
                  }}
                >
                  {getModeIcon(mode)}
                  <span className="ml-2">
                    {getModeDescription(mode)}
                  </span>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg text-zyra-cyan-blue">
                Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-zyra-text-secondary">
                  Active Dataset
                </label>
                <select
                  className="w-full mt-1 p-2 border border-zyra-glass-border rounded-lg bg-zyra-glass text-zyra-text-primary"
                  value={context.dataset || ""}
                  onChange={(e) =>
                    setContext({
                      ...context,
                      dataset: e.target.value || undefined
                    })
                  }
                >
                  <option value="">Select dataset...</option>
                  <option value="customers">Customer Data</option>
                  <option value="sales">Sales Data</option>
                  <option value="marketing">Marketing Data</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-zyra-text-secondary">
                  Product Focus
                </label>
                <select
                  className="w-full mt-1 p-2 border border-zyra-glass-border rounded-lg bg-zyra-glass text-zyra-text-primary"
                  value={context.product || ""}
                  onChange={(e) =>
                    setContext({
                      ...context,
                      product: e.target.value || undefined
                    })
                  }
                >
                  <option value="">Select product...</option>
                  <option value="saas">SaaS Platform</option>
                  <option value="ecommerce">E-commerce</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg text-zyra-cyan-blue">
                  Suggested Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {recommendations.map((rec) => (
                  <Button
                    key={rec.id}
                    variant="outline"
                    className="w-full justify-start text-zyra-text-secondary hover:text-zyra-cyan-blue"
                    onClick={() => handlePromptClick(rec.prompt, rec.module)}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {rec.title}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

