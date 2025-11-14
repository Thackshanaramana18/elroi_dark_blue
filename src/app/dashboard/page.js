'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [cardAnimationClasses, setCardAnimationClasses] = useState([
    'opacity-0 translate-y-4', 'opacity-0 translate-y-4', 'opacity-0 translate-y-4',
    'opacity-0 translate-y-4', 'opacity-0 translate-y-4'
  ])
  const [pageLoaded, setPageLoaded] = useState(false)
  const [liveData, setLiveData] = useState({
    temperature: null,
    pressure: null,
    humidity: null,
    vibration: null
  })

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
        // Trigger page load animation
        setTimeout(() => setPageLoaded(true), 100)
      }
    }

    checkUser()
    
    // Load latest data from reports
    const loadLatestData = () => {
      try {
        const savedReports = localStorage.getItem('predictive_reports')
        if (savedReports) {
          const reports = JSON.parse(savedReports)
          
          // Get latest temperature data
          if (reports.Temperature && reports.Temperature.length > 0) {
            const latestTemp = reports.Temperature[reports.Temperature.length - 1]
            if (latestTemp.values && latestTemp.values.length > 0) {
              const currentTemp = latestTemp.values[latestTemp.values.length - 1]
              const avgTemp = (latestTemp.values.reduce((a,b) => a+b, 0) / latestTemp.values.length).toFixed(1)
              setLiveData(prev => ({
                ...prev,
                temperature: { current: currentTemp.toFixed(1), average: avgTemp }
              }))
              console.log('✅ Dashboard loaded Temperature:', currentTemp.toFixed(1), '°C')
            }
          }
          
          // Load other parameters if available
          // Pressure, Humidity, Vibration can be added when data is uploaded
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    }
    
    loadLatestData()
    // Refresh data every 5 seconds
    const dataInterval = setInterval(loadLatestData, 5000)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    // Staggered card animations
    const timers = [100, 200, 300, 400, 500].map((delay, index) => {
      return setTimeout(() => {
        setCardAnimationClasses(prev => {
          const newClasses = [...prev]
          newClasses[index] = 'opacity-100 translate-y-0'
          return newClasses
        })
      }, delay)
    })

    return () => {
      subscription.unsubscribe()
      timers.forEach(timer => clearTimeout(timer))
      clearInterval(dataInterval)
    }
  }, [router])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F7F9FC]">Loading...</div>
  }

  // 5 Parameters - Updated with intense colors and relevant icons
  const parameters = [
    {
      id: 'temperature',
      title: 'Temperature',
      value: liveData.temperature ? liveData.temperature.current : '31.4',
      unit: '°C',
      subtext: liveData.temperature ? `Avg: ${liveData.temperature.average}°C` : 'Avg: 33.9°C',
      bgGradient: 'from-blue-200 via-blue-100 to-cyan-100',
      iconBg: 'from-blue-600 via-blue-700 to-cyan-700',
      shadowColor: 'shadow-blue-300/60',
      iconColor: 'text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C10.8954 2 10 2.89543 10 4V13.1707C8.83481 13.5825 8 14.6938 8 16C8 17.6569 9.34315 19 11 19C11.3506 19 11.6872 18.9398 12 18.8293C12.3128 18.9398 12.6494 19 13 19C14.6569 19 16 17.6569 16 16C16 14.6938 15.1652 13.5825 14 13.1707V4C14 2.89543 13.1046 2 12 2ZM12 4V13C12 13.5523 12.4477 14 13 14C14.1046 14 15 14.8954 15 16C15 17.1046 14.1046 18 13 18C12.4477 18 12 17.5523 12 17V4ZM11 4V13C11 13.5523 10.5523 14 10 14C8.89543 14 8 14.8954 8 16C8 17.1046 8.89543 18 10 18C10.5523 18 11 17.5523 11 17V4Z" />
          <rect x="10" y="14" width="4" height="4" rx="2" fill="white"/>
        </svg>
      )
    },
    {
      id: 'pressure',
      title: 'Pressure',
      value: '2.1',
      unit: ' bar',
      subtext: 'Δ −0.2 predicted',
      bgGradient: 'from-orange-200 via-orange-100 to-red-100',
      iconBg: 'from-orange-600 via-orange-700 to-red-600',
      shadowColor: 'shadow-orange-300/60',
      iconColor: 'text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="2.5"/>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4" />
        </svg>
      )
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: '58',
      unit: '%',
      subtext: 'Trending upward',
      bgGradient: 'from-emerald-200 via-teal-100 to-cyan-100',
      iconBg: 'from-emerald-600 via-teal-700 to-cyan-700',
      shadowColor: 'shadow-teal-300/60',
      iconColor: 'text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: 'vibration',
      title: 'Vibration',
      value: '2.3',
      unit: ' mm/s',
      subtext: 'RMS velocity',
      bgGradient: 'from-purple-200 via-purple-100 to-fuchsia-100',
      iconBg: 'from-purple-600 via-purple-700 to-fuchsia-700',
      shadowColor: 'shadow-purple-300/60',
      iconColor: 'text-white',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'add',
      title: 'Add Parameter',
      value: null,
      unit: '',
      subtext: 'Configure new sensor',
      bgGradient: 'from-slate-200 via-gray-100 to-zinc-100',
      iconBg: 'from-slate-500 via-gray-600 to-zinc-600',
      shadowColor: 'shadow-gray-300/60',
      iconColor: 'text-white',
      isDashed: true,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
        </svg>
      )
    }
  ]

  const handleCardClick = (param) => {
    if (param.isDashed) {
      console.log('Open modal to add parameter')
    } else {
      // Navigate to parameter detail page
      router.push(`/dashboard/${param.id}`)
    }
  }

  return (
    <div className={`flex min-h-screen transition-opacity duration-700 ease-in-out ${
      pageLoaded ? 'opacity-100' : 'opacity-0'
    }`} style={{ background: 'linear-gradient(135deg, #C5EAF3 0%, #DDF4F8 50%, #F7FCFE 100%)' }}>
      <div className={`transition-all duration-700 ease-in-out ${
        pageLoaded ? 'translate-x-0 opacity-100' : '-translate-x-8 opacity-0'
      }`}>
        <Sidebar activeSection="dashboard" />
      </div>

      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <div className={`transition-all duration-700 ease-in-out delay-100 ${
          pageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-8 opacity-0'
        }`}>
          <TopNav title="Dashboard" />
        </div>

        {/* Main Content - ONLY 5 Cards */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* System Overview Section - 5 Colorful Parameter Cards */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">System Overview</h2>
                  <p className="text-sm text-gray-500 mt-1">Monitor and manage critical system metrics in real-time</p>
                </div>
                <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md">
                  <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">Refresh Data</span>
                </button>
              </div>
            </div>

            {/* 4 Parameter Cards with Modern Colorful Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* First 4 cards - Intense colorful design with relevant icons */}
              {parameters.slice(0, 4).map((param, index) => (
                <div
                  key={param.id}
                  onClick={() => handleCardClick(param)}
                  className={`bg-gradient-to-br ${param.bgGradient} rounded-2xl p-6 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-2xl ${cardAnimationClasses[index]} ${param.shadowColor} relative overflow-hidden group border border-white/50`}
                  style={{ 
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15), 0 4px 12px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                    minHeight: '200px',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  {/* Multiple decorative background elements for depth */}
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
                  <div className="absolute -left-4 -bottom-4 w-28 h-28 bg-white/30 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
                  <div className="absolute right-1/3 bottom-1/4 w-20 h-20 bg-gradient-to-br from-white/15 to-transparent rounded-full blur-lg" />
                  
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="flex items-center justify-between mb-5">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${param.iconBg} flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ring-2 ring-white/60`}
                           style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), inset 0 -2px 10px rgba(0, 0, 0, 0.25)' }}>
                        {param.icon}
                      </div>
                    </div>
                    
                    {/* Value with enhanced text shadow */}
                    <div className="mb-3">
                      <p className="text-4xl font-bold text-gray-900" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 0.08)' }}>
                        {param.value}<span className="text-xl ml-1 text-gray-800">{param.unit}</span>
                      </p>
                    </div>
                    
                    {/* Title and subtext */}
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 mb-1">{param.title}</h3>
                      <p className="text-xs text-gray-700 font-semibold bg-white/50 px-2.5 py-1.5 rounded-lg inline-block shadow-sm">{param.subtext}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Centered Add Parameter Card with intense design and icon */}
            <div className="flex justify-center">
              <div className="w-full md:w-1/2 lg:w-1/4">
                <div
                  onClick={() => handleCardClick(parameters[4])}
                  className={`bg-gradient-to-br ${parameters[4].bgGradient} rounded-2xl p-6 border-2 border-dashed border-gray-500 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:border-gray-600 hover:shadow-2xl ${cardAnimationClasses[4]} ${parameters[4].shadowColor} group relative overflow-hidden`}
                  style={{ 
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.95)',
                    minHeight: '200px',
                    backdropFilter: 'blur(12px)'
                  }}
                >
                  {/* Decorative background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/20 opacity-60" />
                  
                  <div className="flex flex-col items-center justify-center h-full min-h-[150px] relative z-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${parameters[4].iconBg} flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 shadow-2xl ring-2 ring-white/60`}
                         style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2), inset 0 -2px 10px rgba(0, 0, 0, 0.15)' }}>
                      {parameters[4].icon}
                    </div>
                    <h3 className="text-gray-900 text-lg font-bold mb-2" style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>{parameters[4].title}</h3>
                    <p className="text-gray-800 text-sm text-center font-semibold bg-white/50 px-3 py-1.5 rounded-lg shadow-sm">{parameters[4].subtext}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
