'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function ReportingPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  // Mock data for reports
  const reports = [
    {
      id: 1,
      sensor: 'Temperature',
      current: '48.2°C',
      threshold: '35°C',
      status: 'Alert',
      confidence: '92%',
      insight: 'Cooling delay detected'
    },
    {
      id: 2,
      sensor: 'Pressure',
      current: '2.1 bar',
      threshold: '2.5 bar',
      status: 'Normal',
      confidence: '96%',
      insight: 'Stable'
    },
    {
      id: 3,
      sensor: 'Humidity',
      current: '58%',
      threshold: '65%',
      status: 'Watch',
      confidence: '88%',
      insight: 'Slight variation'
    },
    {
      id: 4,
      sensor: 'Vibration',
      current: '0.8 mm/s',
      threshold: '1.2 mm/s',
      status: 'Normal',
      confidence: '94%',
      insight: 'Within tolerance'
    }
  ]

  return (
    <div className="flex min-h-screen bg-[#F2F4F8]">
      {/* Left Sidebar */}
      <Sidebar activeSection="reporting" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#0B1D42] h-[70px] border-b border-gray-200">
          <div className="flex items-center justify-between px-8 h-full">
            <h1 className="text-white text-xl font-bold">Reports</h1>
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
            <h1 className="text-2xl font-bold text-[#1A1F36]">Sensor Activity Reports</h1>
            <p className="text-gray-600 text-sm">Detailed analysis of sensor readings and system predictions</p>
          </div>

          <div className="border-b border-gray-200 mb-8"></div>

          {/* Reports Table */}
          <div className="bg-[#F7F9FC] rounded-xl shadow-sm border border-[#D3D9E3] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#D3D9E3]">
              <h2 className="text-[#1A1F36] text-xl font-bold">Sensor Activity Log</h2>
              <p className="text-gray-500 text-sm">Data Cycle #145 | Updated 11:22 AM</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#D3D9E3]">
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
                <tbody className="bg-[#F7F9FC] divide-y divide-[#D3D9E3]">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#F1F4FA] cursor-pointer transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#1A1F36]">{report.sensor}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.current}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.threshold}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center">
                          {report.status === 'Alert' && <span className="h-2 w-2 rounded-full bg-red-500 mr-2"></span>}
                          {report.status === 'Normal' && <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>}
                          {report.status === 'Watch' && <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2"></span>}
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.confidence}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{report.insight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Report Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {/* Report Card 1 */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-200 hover:bg-[#F1F4FA] hover:transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A1F36] text-lg font-bold">System Health</h3>
                <div className="p-2 rounded-lg bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1E73BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0056D6] mb-2">94%</p>
              <p className="text-gray-500 text-sm">Overall system confidence</p>
            </div>

            {/* Report Card 2 */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-200 hover:bg-[#F1F4FA] hover:transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A1F36] text-lg font-bold">Maintenance Due</h3>
                <div className="p-2 rounded-lg bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1E73BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0056D6] mb-2">14 days</p>
              <p className="text-gray-500 text-sm">Next scheduled maintenance</p>
            </div>

            {/* Report Card 3 */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-200 hover:bg-[#F1F4FA] hover:transform hover:translate-y-[-2px] hover:shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#1A1F36] text-lg font-bold">Anomalies</h3>
                <div className="p-2 rounded-lg bg-white bg-opacity-20">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#1E73BE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-[#0056D6] mb-2">3</p>
              <p className="text-gray-500 text-sm">Detected in last 24 hours</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}