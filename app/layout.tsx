import type { Metadata } from 'next'
import './globals.css'
import DataLoader from '@/components/DataLoader'
import DatabaseCheck from '@/components/DatabaseCheck'

export const metadata: Metadata = {
  title: 'Tiffin Service Management System',
  description: 'Complete management system for tiffin service business',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <DatabaseCheck />
        <DataLoader>{children}</DataLoader>
      </body>
    </html>
  )
}

