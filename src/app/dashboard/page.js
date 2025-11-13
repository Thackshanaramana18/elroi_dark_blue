'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [cardAnimationClasses, setCardAnimationClasses] = useState([
    'opacity-0 translate-y-4', 'opacity-0 translate-y-4', 'opacity-0 translate-y-4',
    'opacity-0 translate-y-4', 'opacity-0 translate-y-4'
  ])
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

  // 5 Parameters - Keep existing colors, update names
  const parameters = [
    {
      id: 'temperature',
      title: 'Temperature',
      value: liveData.temperature ? liveData.temperature.current : '44.5',
      unit: '°C',
      subtext: liveData.temperature ? `Avg: ${liveData.temperature.average}°C` : 'Δ +0.8°C since last update',
      textColor: 'text-white',
      bgColor: 'bg-[#1E73BE]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: 'pressure',
      title: 'Pressure',
      value: '2.1',
      unit: ' bar',
      subtext: 'Δ −0.2 predicted',
      textColor: 'text-white',
      bgColor: 'bg-[#E87533]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'humidity',
      title: 'Humidity',
      value: '58',
      unit: '%',
      subtext: 'Trending upward',
      textColor: 'text-white',
      bgColor: 'bg-[#1E8D8D]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'vibration',
      title: 'Vibration',
      value: '2.3',
      unit: ' mm/s',
      subtext: 'RMS velocity',
      textColor: 'text-white',
      bgColor: 'bg-[#7B68EE]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    {
      id: 'add',
      title: 'Add Parameter',
      value: null,
      unit: '',
      subtext: 'Configure new sensor',
      textColor: 'text-gray-600',
      bgColor: 'bg-white',
      isDashed: true,
      icon: null
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
    <div className="flex min-h-screen bg-[#F7F9FC]">
      <Sidebar activeSection="dashboard" />

      <div className="flex-1 flex flex-col">
        {/* Main Content - ONLY 5 Cards */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Simple Text Heading */}
            <h1 className="text-4xl font-bold text-[#081440] mb-2">System Overview</h1>
            
            {/* Page Header */}
            <div className="mb-8">
              <p className="text-gray-600 text-sm">Monitor and manage critical system metrics in real-time</p>
            </div>

            {/* Perfect 3+2 Grid - 4 cards then centered Add Parameter */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {/* First 4 cards - evenly distributed */}
              {parameters.slice(0, 4).map((param, index) => (
                <div
                  key={param.id}
                  onClick={() => handleCardClick(param)}
                  className={`${param.bgColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 ${cardAnimationClasses[index]}`}
                  style={{ 
                    borderRadius: '16px', 
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    minHeight: '220px',
                    transition: 'all 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)'
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  <div className="mb-6">
                    <h3 className="text-white text-base font-semibold mb-2">{param.title}</h3>
                    <div className="w-12 h-1 bg-white opacity-30 rounded-full"></div>
                  </div>
                  <p className={`text-5xl font-bold ${param.textColor} mb-3`}>
                    {param.value}<span className="text-2xl ml-1">{param.unit}</span>
                  </p>
                  <p className="text-white text-sm opacity-90">{param.subtext}</p>
                </div>
              ))}
            </div>
            
            {/* Centered Add Parameter Button */}
            <div className="flex justify-center">
              <div className="w-full md:w-1/2 lg:w-1/4">
                {/* Add Parameter Card - centered */}
                <div
                  onClick={() => handleCardClick(parameters[4])}
                  className={`${parameters[4].bgColor} rounded-xl p-6 border-2 border-dashed border-gray-300 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:border-gray-400 ${cardAnimationClasses[4]}`}
                  style={{ 
                    borderRadius: '16px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    minHeight: '220px',
                    transition: 'all 0.3s ease-out'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.15)'
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  <div className="flex flex-col items-center justify-center h-full min-h-[170px]">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-4 transition-transform duration-300 hover:scale-110 hover:rotate-90">
                      <span className="text-4xl text-gray-500 font-light">+</span>
                    </div>
                    <h3 className="text-gray-800 text-lg font-bold mb-2">{parameters[4].title}</h3>
                    <p className="text-gray-600 text-sm">{parameters[4].subtext}</p>
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
