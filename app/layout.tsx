import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'D-CoE | Centre of Excellence in Design – IISc Bengaluru',
  description:
    'A premier initiative by IISc dedicated to equipping students and professionals with skills and knowledge to thrive in the rapidly evolving design industry.',
  keywords: ['IISc', 'Design', 'Centre of Excellence', 'D-CoE', 'Bengaluru', 'Product Design'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-white text-gray-900 antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontFamily: 'var(--font-body)', fontSize: '14px' },
            success: { iconTheme: { primary: '#2ECC40', secondary: '#000' } },
          }}
        />
      </body>
    </html>
  )
}
