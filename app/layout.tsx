import './globals.css'
import Header from './components/Header'
import { Montserrat } from 'next/font/google'
import { Fredoka } from 'next/font/google'
import { Metadata } from 'next'
import { Toaster } from 'sonner';
import { ClerkProvider } from '@clerk/nextjs';
import HeaderWrapper from './components/HeaderWrapper';
import Providers from './providers';

const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700']
})

const fredoka = Fredoka({ 
  subsets: ['latin'],
  variable: '--font-fredoka'
})

export const metadata: Metadata = {
  title: "Sea Art",
  description: 'Create beautiful AI art in seconds',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${montserrat.variable} ${fredoka.variable}`}>
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0"
          />
        </head>
        <body className={montserrat.className}>
        
          <main>
          <HeaderWrapper />
            <Providers>
              {children}
            </Providers>
          </main>
          <Toaster richColors position="top-center" />
        </body>
      </html>
    </ClerkProvider>
  )
}
