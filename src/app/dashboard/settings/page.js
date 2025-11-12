'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()

  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    darkMode: false,
    autoRefresh: true,
    thresholdTemp: 35,
    thresholdPressure: 2.5,
    thresholdHumidity: 65,
    thresholdVibration: 1.2
  })

  const handleSave = () => {
    // In a real app, this would save to a database
    alert('Settings saved successfully!')
  }

  return (
    <div className="flex min-h-screen bg-[#F2F4F8]">
      {/* Left Sidebar */}
      <Sidebar activeSection="settings" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#0B1D42] h-[70px] border-b border-gray-200">
          <div className="flex items-center justify-between px-8 h-full">
            <h1 className="text-white text-xl font-bold">Settings</h1>
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
            <h1 className="text-2xl font-bold text-[#1A1F36]">System Configuration</h1>
            <p className="text-gray-600 text-sm">Manage your preferences and system thresholds</p>
          </div>

          <div className="border-b border-gray-200 mb-8"></div>

          {/* Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preferences Card */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6">
              <h2 className="text-[#1A1F36] text-xl font-bold mb-6">Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#1A1F36] font-medium">Notifications</h3>
                    <p className="text-gray-500 text-sm">Receive system alerts</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.notifications}
                      onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E73BE]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#1A1F36] font-medium">Email Alerts</h3>
                    <p className="text-gray-500 text-sm">Send alerts to your email</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.emailAlerts}
                      onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E73BE]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[#1A1F36] font-medium">Auto Refresh</h3>
                    <p className="text-gray-500 text-sm">Automatically refresh data</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={settings.autoRefresh}
                      onChange={(e) => setSettings({...settings, autoRefresh: e.target.checked})}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1E73BE]"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Thresholds Card */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6">
              <h2 className="text-[#1A1F36] text-xl font-bold mb-6">Sensor Thresholds</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Temperature (°C)</label>
                  <input 
                    type="number" 
                    value={settings.thresholdTemp}
                    onChange={(e) => setSettings({...settings, thresholdTemp: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Pressure (bar)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.thresholdPressure}
                    onChange={(e) => setSettings({...settings, thresholdPressure: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Humidity (%)</label>
                  <input 
                    type="number" 
                    value={settings.thresholdHumidity}
                    onChange={(e) => setSettings({...settings, thresholdHumidity: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Vibration (mm/s)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.thresholdVibration}
                    onChange={(e) => setSettings({...settings, thresholdVibration: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-[#1E73BE] text-white font-medium rounded-lg hover:bg-[#1a68ad] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E73BE]"
            >
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}