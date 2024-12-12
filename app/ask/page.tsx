import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Ask AstroGenie',
  description: 'Get personalized astrological insights and answers to your questions.',
}

export default function AskPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Ask AstroGenie</h1>
      <div className="max-w-2xl mx-auto">
        <p className="text-lg text-center mb-8">
          Get personalized astrological insights and answers to your questions.
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Coming soon! This feature is currently under development.
          </p>
        </div>
      </div>
    </main>
  )
}
