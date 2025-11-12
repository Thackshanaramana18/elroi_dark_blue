'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function TemperatureSensorPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Mock data for temperature readings
  const temperatureData = {
    current: 44.5,
    target: 35.0,
    delta: 9.5,
    stability: 87,
    lastUpdate: '11:22 AM',
    confidence: 94
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F8]">
      {/* Left Sidebar */}
      <Sidebar activeSection="sensors" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#0B1D42] h-[70px] border-b border-gray-200">
          <div className="flex items-center justify-between px-8 h-full">
            <h1 className="text-white text-xl font-bold">Temperature Sensors</h1>
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
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1F36]">Temperature Monitoring</h1>
            <p className="text-gray-600 text-sm">Real-time temperature readings and predictive analytics</p>
          </div>

          <div className="border-b border-gray-200 mb-8"></div>

          {/* Temperature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Current Temperature Card */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-200 hover:bg-[#F1F4FA] hover:transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A1F36] text-lg font-bold">Current Temperature</h3>
                <div className="p-2 rounded-lg bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1E73BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#0056D6] mb-2">{temperatureData.current}°C</p>
              <p className="text-gray-500 text-sm">Updated {temperatureData.lastUpdate}</p>
            </div>

            {/* Target Temperature Card */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-200 hover:bg-[#F1F4FA] hover:transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A1F36] text-lg font-bold">Target Temperature</h3>
                <div className="p-2 rounded-lg bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1E73BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#0056D6] mb-2">{temperatureData.target}°C</p>
              <p className="text-gray-500 text-sm">Setpoint configuration</p>
            </div>

            {/* Stability Rate Card */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-200 hover:bg-[#F1F4FA] hover:transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A1F36] text-lg font-bold">Stability Rate</h3>
                <div className="p-2 rounded-lg bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1E73BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <p className="text-4xl font-bold text-[#0056D6] mb-2">{temperatureData.stability}%</p>
              <p className="text-gray-500 text-sm">System confidence level</p>
            </div>
          </div>

          {/* Temperature Chart */}
          <div className="bg-white rounded-xl p-8 shadow-sm border border-[#D3D9E3] mb-8">
            <div className="mb-6">
              <h2 className="text-[#1A1F36] text-xl font-bold mb-1">Temperature Profile — Current vs Predicted</h2>
              <p className="text-gray-500 text-sm">Data Cycle #145 | Updated {temperatureData.lastUpdate}</p>
            </div>
            
            {/* Chart Placeholder */}
            <div className="bg-white rounded-lg h-64 mb-4 flex items-center justify-center border border-[#D3D9E3]">
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

          {/* Alerts Section */}
          <div className="bg-[#F7F9FC] rounded-xl shadow-sm border border-[#D3D9E3] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D3D9E3]">
              <h2 className="text-[#1A1F36] text-xl font-bold">Temperature Alerts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#D3D9E3]">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reading</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-[#F7F9FC] divide-y divide-[#D3D9E3]">
                  <tr className="hover:bg-[#F1F4FA] cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">11:15 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">48.2°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>
                        Alert
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1E73BE]">Cooling initiated</td>
                  </tr>
                  <tr className="hover:bg-[#F1F4FA] cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:45 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">42.1°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>
                        Warning
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1E73BE]">Monitoring</td>
                  </tr>
                  <tr className="hover:bg-[#F1F4FA] cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">10:15 AM</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">36.8°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">35°C</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="inline-flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        Normal
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1E73BE]">Stable</td>
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