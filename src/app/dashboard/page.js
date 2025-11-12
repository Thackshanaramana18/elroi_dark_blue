'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router])

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // KPI Data with original colors
  const kpiData = [
    {
      title: 'Current Temperature',
      value: '44.5',
      unit: '°C',
      subtext: 'Δ +0.8°C since 10:20 AM',
      color: 'text-[#1E73BE]',
      bgColor: 'bg-[#1E73BE]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      title: 'Target Temperature',
      value: '35.0',
      unit: '°C',
      subtext: 'Stabilization ETA 2h 45m',
      color: 'text-[#E87533]',
      bgColor: 'bg-[#E87533]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Time to Target',
      value: '2:45:00',
      unit: '',
      subtext: 'Confidence 94%',
      color: 'text-[#1E8D8D]',
      bgColor: 'bg-[#1E8D8D]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex min-h-screen bg-[#F7F9FC]">
      {/* Left Sidebar */}
      <Sidebar activeSection="dashboard" />

      {/* Main Dashboard Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#0B1D42] h-[70px] border-b border-gray-200">
          <div className="flex items-center justify-between px-8 h-full">
            <h1 className="text-white text-xl font-bold">Dashboard</h1>
            <div className="flex items-center space-x-6">
              <button className="relative p-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
              <div className="flex items-center text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>11:22 AM</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#1E73BE] flex items-center justify-center">
                  <span className="text-[#1E73BE] text-sm font-semibold">JD</span>
                </div>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/login')
                    router.refresh()
                  }}
                  className="text-white text-sm font-medium hover:text-[#1E73BE] transition-colors cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* System Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1F36]">ELROI Predictive | System Overview</h1>
            <p className="text-gray-600 text-sm">Model v2.3 (TCN Active) · Confidence 94% · Last Update 11:22 AM</p>
          </div>

          <div className="border-b border-gray-200 mb-8"></div>

          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <div 
                key={index}
                className={`${kpi.bgColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer`}
                style={{ borderRadius: '14px', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-white bg-opacity-20">
                    {kpi.icon}
                  </div>
                </div>
                <h3 className="text-white text-sm mb-1">{kpi.title}</h3>
                <p className={`text-4xl font-bold ${kpi.color}`}>{kpi.value}{kpi.unit}</p>
                <p className="text-white text-xs mt-2 opacity-80">{kpi.subtext}</p>
              </div>
            ))}
          </div>

          {/* Cooling Profile Analysis Section */}
          <div className="bg-white rounded-xl p-8 mb-8 shadow-sm border border-[#DCE3F0]">
            <div className="mb-6">
              <h2 className="text-[#1A1F36] text-xl font-bold mb-1">Cooling Profile — Current vs Predicted</h2>
              <p className="text-gray-500 text-sm">Data Cycle #145 | Updated 11:22 AM</p>
            </div>
            
            {/* Chart Placeholder */}
            <div className="bg-white rounded-lg h-64 mb-4 flex items-center justify-center border border-[#DCE3F0]">
              <div className="text-center w-full px-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#1E73BE] mr-2"></div>
                    <span className="text-xs text-gray-600">Current Data</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#00A3B4] mr-2"></div>
                    <span className="text-xs text-gray-600">Predicted Cooling</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-[#FF4B4B] mr-2"></div>
                    <span className="text-xs text-gray-600">Threshold</span>
                  </div>
                </div>
                <div className="relative w-full h-40">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex-1 border-r border-[#E4E9F2] last:border-r-0"></div>
                    ))}
                  </div>
                  {/* Threshold line */}
                  <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-[#FF4B4B]"></div>
                  {/* Current data line */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full h-32 flex items-end">
                      <div className="flex-1 h-16 bg-[#1E73BE] rounded-t"></div>
                      <div className="flex-1 h-20 bg-[#1E73BE] rounded-t"></div>
                      <div className="flex-1 h-24 bg-[#1E73BE] rounded-t"></div>
                      <div className="flex-1 h-20 bg-[#1E73BE] rounded-t"></div>
                      <div className="flex-1 h-16 bg-[#1E73BE] rounded-t"></div>
                    </div>
                  </div>
                  {/* Predicted data line */}
                  <div className="absolute inset-0 flex items-end">
                    <div className="w-full h-32 flex items-end">
                      <div className="flex-1 h-12 border-t-2 border-dashed border-[#00A3B4]"></div>
                      <div className="flex-1 h-16 border-t-2 border-dashed border-[#00A3B4]"></div>
                      <div className="flex-1 h-20 border-t-2 border-dashed border-[#00A3B4]"></div>
                      <div className="flex-1 h-24 border-t-2 border-dashed border-[#00A3B4]"></div>
                      <div className="flex-1 h-20 border-t-2 border-dashed border-[#00A3B4]"></div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>10:00</span>
                  <span>10:30</span>
                  <span>11:00</span>
                  <span>11:30</span>
                  <span>12:00</span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts & Reporting Table */}
          <div className="bg-white rounded-xl shadow-sm border border-[#DCE3F0] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#DCE3F0]">
              <h2 className="text-[#1A1F36] text-xl font-bold">Recent Alerts & Sensor Logs</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DCE3F0]">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sensor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Insight</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-[#DCE3F0]">
                  <tr className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">Temperature</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">48.2°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                        Alert
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">92%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Cooling delay detected</td>
                  </tr>
                  <tr className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">Pressure</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.1 bar</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2.5 bar</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Normal
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">96%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Stable</td>
                  </tr>
                  <tr className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">Humidity</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">58%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">65%</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                        Watch
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">88%</td>
                    <td className="px-6 py-4 text-sm text-gray-500">Slight variation</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}