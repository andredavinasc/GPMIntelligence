'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/authContext'

export default function LoginPage() {
  const router = useRouter()
  const { signIn, user, loading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#faf8f3]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5a3d]"></div>
          <p className="mt-4 text-[#6b6760]">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#faf8f3] py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <svg className="w-12 h-12 flex-shrink-0" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="512" height="512" rx="112" fill="#1a2e22"/>
              <circle cx="256" cy="256" r="152" stroke="rgba(250,248,243,0.88)" strokeWidth="34" strokeLinecap="round" strokeDasharray="716 239"/>
              <polygon points="0,0 -52,-30 -52,30" fill="#c4a264" transform="translate(364,149) rotate(-45)"/>
              <rect x="155" y="212" width="168" height="20" rx="10" fill="#faf8f3" opacity="0.88"/>
              <rect x="178" y="249" width="138" height="20" rx="10" fill="#faf8f3" opacity="0.62"/>
              <rect x="198" y="286" width="108" height="20" rx="10" fill="#faf8f3" opacity="0.38"/>
            </svg>
            <h1 className="gpm-logo text-[#1a1712]" style={{ fontSize: '2.25rem' }}>
              GPM <em className="text-[#8b6f3a]">Intelligence</em>
            </h1>
          </div>
          <p className="text-[#6b6760]">Análise estratégica semanal para Group Product Managers</p>
        </div>

        <form className="mt-8 space-y-6 bg-[#faf8f3] border border-[#d4cfc4] p-4 sm:p-8 rounded" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded bg-[#fdf0f0] p-4 border border-[rgba(122,36,36,0.3)]">
              <p className="text-sm text-[#7a2424]">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#3d3a33] mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#d4cfc4] rounded focus:outline-none focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent bg-[#f2efe8] text-[#1a1712]"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#3d3a33] mb-1">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[#d4cfc4] rounded focus:outline-none focus:ring-2 focus:ring-[#8b6f3a] focus:border-transparent bg-[#f2efe8] text-[#1a1712]"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 rounded text-sm font-medium text-[#c4a264] bg-[#1a2e22] hover:bg-[#243d2e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8b6f3a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center text-sm text-[#6b6760]">
          Não tem uma conta?{' '}
          <button
            onClick={() => router.push('/auth/signup')}
            className="font-medium text-[#8b6f3a] hover:text-[#c4a264]"
          >
            Criar conta
          </button>
        </p>
      </div>
    </div>
  )
}
