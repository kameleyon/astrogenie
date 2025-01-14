import './globals.css'
import { Lato } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Toaster } from '@/components/ui/toaster'
import type { Metadata } from 'next'

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['100', '300', '400', '700'],
  variable: '--font-lato'
})

export const metadata: Metadata = {
  title: 'AstroGenie - Your Personal Astrological Guide',
  description: 'Discover your cosmic path with AstroGenie - Your AI-powered astrological companion for personalized insights and guidance.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://use.typekit.net/upo4sld.css"
        />
      </head>
      <body className={`${lato.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 overflow-y-auto">{children}</main>
            <Footer />
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
