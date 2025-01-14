"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Send, Plus, Bookmark, Menu, Loader2 } from "lucide-react"
import Image from "next/image"
import { useChat } from "@/hooks/use-chat"
import { useToast } from "@/hooks/use-toast"

const suggestedQuestions = [
  "will I get the job at the dealership",
  "Should I invest in crypto",
  "Is it a good time to call Jessica?",
  "What are Jack's intentions about me?",
  "what period would be best to start a business?"
]

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const [showSidebar, setShowSidebar] = useState(false)
  const { messages, loading, error, sendMessage } = useChat()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!message.trim() || loading) return
    
    try {
      const currentMessage = message
      setMessage("")
      await sendMessage(currentMessage)
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to send message",
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar - Only visible on desktop or when toggled on mobile */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-[#020817] flex-col justify-between transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Image
              src="/astrogenieorange.png"
              alt="AstroGenie Logo"
              width={40}
              height={40}
            />
            <span className="text-white font-semibold">ASTROGENIE</span>
          </div>
          <p className="text-sm text-gray-400">
            Your AI-powered Agent for personalized guidance and insights
          </p>
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Birth Chart Information</h3>
            <p className="text-sm text-gray-400 mb-4">
              Complete your birth chart information to get personalized insights
            </p>
            <Button 
              variant="outline" 
              className="w-full bg-[#D15200]/10 text-[#D15200] hover:bg-[#D15200]/20 border-[#D15200]/20"
            >
              Set Up Birth Chart
            </Button>
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-500">© 2024 Astrogenie.ai. All rights reserved.</p>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white dark:bg-[#020817]">
        {/* Chat Header - Mobile */}
        <header className="md:hidden p-4 border-b">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-2">
              <Image
                src="/astrogenieorange.png"
                alt="AstroGenie Logo"
                width={32}
                height={32}
              />
              <span className="font-semibold">ASTROGENIE</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Plus className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex",
                  msg.isUser ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-4",
                    msg.isUser
                      ? "bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white"
                      : "bg-gray-100 dark:bg-gray-800"
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}

            {/* Suggested Questions - Show only when no messages */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-8">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 
                             rounded-full px-4 py-2 text-sm transition-colors"
                    onClick={() => setMessage(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Invisible element for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="max-w-4xl mx-auto flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask me anything"
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={loading}
            />
            <Button 
              onClick={handleSend}
              className="bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white hover:opacity-90"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  )
}
