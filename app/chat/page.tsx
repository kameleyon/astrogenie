"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Send, Plus, Bookmark, Menu, Loader2, User } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useChat } from "@/hooks/use-chat"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

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
  const [userEmail, setUserEmail] = useState("")
  const [birthChart, setBirthChart] = useState<{
    sun_sign: string | null;
    moon_sign: string | null;
    ascendant: string | null;
    human_design_type: string | null;
    life_path_number: string | null;
    cardology_card: string | null;
  } | null>(null)
  const { messages, loading, error, sendMessage } = useChat()
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUserEmail(session.user.email || "")
        
        // Fetch birth chart info
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('sun_sign, moon_sign, ascendant, human_design_type, life_path_number, cardology_card')
          .eq('id', session.user.id)
          .single()

        if (!error && profile) {
          setBirthChart(profile)
        }
      }
    }

    fetchUserData()
  }, [])

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
    <div className="max-h-screen flex flex-col">
      <div className="flex flex-1">
        {/* Slim Sidebar */}
        <aside className={cn(
          "min-h-[calc(100vh-7.5rem)] fixed inset-y-0 left-0 z-50 w-16 bg-white/5 flex flex-col items-center py-4 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          showSidebar ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col items-center space-y-6">
            <Image
              src="/astrogenieorange.png"
              alt="AstroGenie Logo"
              width={32}
              height={32}
            />
            <Link href="/birth-chart">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5 text-gray-400" />
              </Button>
            </Link>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon">
              <Bookmark className="h-5 w-5 text-gray-400" />
            </Button>
          </div>
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Mobile Header */}
          <header className="md:hidden bg-gradient-to-r from-[#D15200] to-[#FFA600] p-4 text-white">
            <div className="flex justify-between items-center">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setShowSidebar(!showSidebar)}
                className="text-white"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-3xl font-medium text-white/80">
                Hello {userEmail ? userEmail.split('@')[0] : 'User'}
              </h1>
            </div>
          </header>

          {/* Main content area */}
          <div className="flex flex-col md:flex-row flex-1 gap-4 p-4 max-w-6xl mx-auto w-full">
            {/* Birth Chart Info Frame */}
            <div className="hidden md:block w-1/3 bg-gradient-to-r from-[#D15200] to-[#FFA600] text-white rounded-lg p-4 border dark:border-gray-700">
              <div className="max-w-6xl mx-auto flex justify-center">
                <Image
                  src="/astrogenietribal.png"
                  alt="AstroGenie Logo"
                  width={200}
                  height={200}
                />
              </div>
              <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl text-white/80 mt-6 font-normal">
                  Hello {userEmail ? userEmail.split('@')[0] : 'User'}
                </h1>
              </div>
              <h2 className="text-lg mt-6 font-normal mb-4 text-white/80">Quick Snapshot of you</h2>
              {birthChart ? (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="space-y-4">
                    <div>
                      <p className="text-md text-[#020817]">Sun Sign</p>
                      <p className="font-medium">{birthChart.sun_sign || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-md text-[#020817]">Moon Sign</p>
                      <p className="font-medium">{birthChart.moon_sign || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-md text-[#020817]">Ascendant</p>
                      <p className="font-medium">{birthChart.ascendant || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-md text-[#020817]">Human Design</p>
                      <p className="font-medium">{birthChart.human_design_type || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-md text-[#020817]">Life Path</p>
                      <p className="font-medium">{birthChart.life_path_number || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-md text-[#020817]">Birth Card</p>
                      <p className="font-medium">{birthChart.cardology_card || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="col-span-2">
                    <Button 
                      variant="outline" 
                      className="w-full bg-[white]/50 text-[#D15200] hover:bg-white/70 border-[#D15200]/20"
                    >
                      View Full Chart
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Complete your birth chart information to get personalized insights
                  </p>
                  <Button 
                    variant="outline" 
                    className="w-full bg-[#D15200]/10 text-[#D15200] hover:bg-[#D15200]/20 border-[#D15200]/20"
                  >
                    Set Up Birth Chart
                  </Button>
                </div>
              )}
            </div>

            {/* Chat Area */}
            <div className="min-h-[calc(100vh-14rem)] flex-1 flex flex-col bg-white/5 dark:bg-[#020817]/40 rounded-xl border dark:border-gray-700 shadow-xl ">
              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4 max-w-4xl mx-auto ">
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
              <div className="p-4 border-t dark:border-gray-700">
                <div className="flex gap-2">
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
            </div>
          </div>
        </div>
      </div>

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
