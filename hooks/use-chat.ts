import { useState } from "react"
import { supabase } from "@/lib/supabase/client"

export interface Message {
  text: string
  isUser: boolean
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = async (message: string) => {
    try {
      setLoading(true)
      setError(null)

      // Add user message immediately
      setMessages(prev => [...prev, { text: message, isUser: true }])

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("Please sign in to continue")
      }

      // Send message to Edge Function
      const { data, error: chatError } = await supabase.functions.invoke("chat", {
        body: {
          message,
          userId: user.id,
          context: messages.map(msg => ({
            text: msg.text,
            isUser: msg.isUser
          }))
        }
      })

      if (chatError) {
        throw chatError
      }

      // Add AI response
      setMessages(prev => [
        ...prev,
        { text: data.choices[0].message.content, isUser: false }
      ])

      return data

    } catch (err: any) {
      setError(err.message || "Failed to send message")
      // Remove user message if there was an error
      setMessages(prev => prev.slice(0, -1))
      throw err
    } finally {
      setLoading(false)
    }
  }

  const clearMessages = () => {
    setMessages([])
    setError(null)
  }

  return {
    messages,
    loading,
    error,
    sendMessage,
    clearMessages
  }
}
