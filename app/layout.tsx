'use client'

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/lib/authContext'

// Note: metadata can't be used in 'use client' components
// This is a workaround for adding AuthProvider while maintaining metadata

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <title>GPM Intelligence</title>
        <meta name="description" content="Análise estratégica semanal para Group Product Managers" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
