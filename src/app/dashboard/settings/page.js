'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function SettingsPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [animationClass, setAnimationClass] = useState('opacity-0 translate-y-4')

  useEffect(() => {
    // Trigger entrance animation
    setTimeout(() => {
      setAnimationClass('opacity-100 translate-y-0')
    }, 100)
  }, [])

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

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('systemSettings')
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('systemSettings', JSON.stringify(settings))
    
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event('storage'))
    
    alert('Settings saved successfully! All thresholds updated.')
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      {/* Left Sidebar */}
      <Sidebar activeSection="settings" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className={`flex-1 p-8 transition-all duration-700 ease-in-out ${animationClass}`}>
          {/* Page Title */}
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl font-bold text-[#1A1F36]">System Configuration</h1>
            <p className="text-gray-600 text-sm">Manage your preferences and system thresholds</p>
          </div>

          <div className="border-b border-gray-200 mb-8"></div>

          {/* Settings Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Preferences Card */}
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-500 hover:shadow-md animate-fade-in-up delay-100">
              <h2 className="text-[#1A1F36] text-xl font-bold mb-6">Preferences</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
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
                
                <div className="flex items-center justify-between transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
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
                
                <div className="flex items-center justify-between transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
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
            <div className="bg-[#F7F9FC] rounded-xl border border-[#D3D9E3] shadow-sm p-6 transition-all duration-500 hover:shadow-md animate-fade-in-up delay-200">
              <h2 className="text-[#1A1F36] text-xl font-bold mb-6">Sensor Thresholds</h2>
              
              <div className="space-y-6">
                <div className="transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Temperature (°C)</label>
                  <input 
                    type="number" 
                    value={settings.thresholdTemp}
                    onChange={(e) => setSettings({...settings, thresholdTemp: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white text-gray-900 font-semibold transition-all duration-200 hover:shadow-md"
                  />
                </div>
                
                <div className="transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Pressure (bar)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.thresholdPressure}
                    onChange={(e) => setSettings({...settings, thresholdPressure: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white text-gray-900 font-semibold transition-all duration-200 hover:shadow-md"
                  />
                </div>
                
                <div className="transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Humidity (%)</label>
                  <input 
                    type="number" 
                    value={settings.thresholdHumidity}
                    onChange={(e) => setSettings({...settings, thresholdHumidity: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white text-gray-900 font-semibold transition-all duration-200 hover:shadow-md"
                  />
                </div>
                
                <div className="transition-all duration-200 hover:bg-[#F1F4FA] p-3 rounded-lg">
                  <label className="block text-[#1A1F36] text-sm font-medium mb-2">Vibration (mm/s)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={settings.thresholdVibration}
                    onChange={(e) => setSettings({...settings, thresholdVibration: parseFloat(e.target.value)})}
                    className="w-full px-4 py-2 border border-[#D3D9E3] rounded-lg focus:ring-2 focus:ring-[#1E73BE] focus:border-[#1E73BE] bg-white text-gray-900 font-semibold transition-all duration-200 hover:shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end animate-fade-in-up delay-300">
            <button 
              onClick={handleSave}
              className="px-6 py-3 bg-[#1E73BE] text-white font-medium rounded-lg hover:bg-[#1a68ad] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1E73BE] transform hover:scale-105 hover:shadow-lg"
            >
              Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}