import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = { title: 'Care4U Pakistan', description: 'Trusted healthcare and wellness products.' }

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>
}
