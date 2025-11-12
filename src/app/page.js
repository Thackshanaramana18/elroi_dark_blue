'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page
    router.push('/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#0B1630]">Redirecting...</h1>
        <p className="text-[#A8B3C6] mt-2">If you are not redirected automatically, <a href="/login" className="text-[#2563eb]">click here</a>.</p>
      </div>
    </div>
  )
}