'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Sidebar({ activeSection }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    getUser()
  }, [])

  // Get user initials from email
  const getInitials = (email) => {
    if (!email) return 'U'
    const name = email.split('@')[0]
    const parts = name.split(/[._-]/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }

  // Get display name from email
  const getDisplayName = (email) => {
    if (!email) return 'User'
    const name = email.split('@')[0]
    const parts = name.split(/[._-]/)
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
  }

  const navItems = [
    { id: 'dashboard', label: 'Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'reporting', label: 'Reports', href: '/dashboard/reporting', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'alerts', label: 'Alerts', href: '/dashboard/alerts', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="w-80 min-h-screen bg-[#0B1E4A] flex flex-col justify-between py-8 px-6 shadow-2xl">
      {/* Top Section */}
      <div>
        {/* Logo Section */}
        <div className="mb-12 px-2">
          <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="ELROI"
              width={200}
              height={80}
              priority
              className="object-contain"
            />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`group flex items-center space-x-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </Link>
          ))}
          
          {/* Logout */}
          <button
            onClick={handleLogout}
            className="group w-full flex items-center space-x-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all duration-200 text-white/70 hover:bg-white/5 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </nav>
      </div>

      {/* Bottom Section - User Profile */}
      <div className="px-2">
        <div className="w-12 h-12 rounded-full bg-gray-800 border-2 border-white/20 flex items-center justify-center">
          <span className="text-white text-lg font-semibold">
            {user ? getInitials(user.email) : 'N'}
          </span>
        </div>
      </div>
    </div>
  )
}