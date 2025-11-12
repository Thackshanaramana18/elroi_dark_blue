'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function Sidebar({ activeSection }) {
  const pathname = usePathname()
  const [isSensorsOpen, setIsSensorsOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', label: 'System Overview', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { id: 'reporting', label: 'Reports', href: '/dashboard/reporting', icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { id: 'sensors', label: 'Sensors', href: '#', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
    { id: 'settings', label: 'Settings', href: '/dashboard/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' }
  ]

  const sensorItems = [
    { id: 'temperature', label: 'Temperature', href: '/sensors/temperature' },
    { id: 'humidity', label: 'Humidity', href: '/sensors/humidity' },
    { id: 'pressure', label: 'Pressure', href: '/sensors/pressure' },
    { id: 'vibration', label: 'Vibration', href: '/sensors/vibration' }
  ]

  return (
    <div className="w-64 bg-[#0B1D42] flex flex-col justify-between py-6 px-4">
      {/* Top Section */}
      <div>
        {/* Branding */}
        <div className="px-3 pb-6 mb-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#1E73BE] flex items-center justify-center">
              <span className="text-white font-bold">E</span>
            </div>
            <div>
              <h1 className="text-white text-sm font-bold">ELROI</h1>
              <p className="text-gray-300 text-xs">Predictive Maintenance Console</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.id === 'sensors' ? (
                <>
                  <button
                    onClick={() => setIsSensorsOpen(!isSensorsOpen)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 cursor-pointer ${
                      activeSection === item.id 
                        ? 'bg-[#E6EEFF] text-[#1E73BE]' 
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    <span>{item.label}</span>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className={`h-4 w-4 ml-auto transition-transform duration-200 ${isSensorsOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Submenu for Sensors */}
                  {isSensorsOpen && (
                    <div className="ml-8 mt-1 space-y-1">
                      {sensorItems.map((sensor) => (
                        <Link
                          key={sensor.id}
                          href={sensor.href}
                          className={`block px-4 py-2 text-sm rounded-lg transition-colors ${
                            pathname === sensor.href
                              ? 'bg-[#E6EEFF] text-[#1E73BE]'
                              : 'text-gray-300 hover:bg-white/10'
                          }`}
                        >
                          {sensor.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 ${
                    activeSection === item.id
                      ? 'bg-[#E6EEFF] text-[#1E73BE]'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section - User Profile */}
      <div className="px-3 pt-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white border border-[#1E73BE] flex items-center justify-center">
            <span className="text-[#1E73BE] text-sm font-semibold">JD</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">John Doe</p>
            <p className="text-gray-400 text-xs">Engineer</p>
          </div>
        </div>
      </div>
    </div>
  )
}