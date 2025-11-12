'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Button, Card } from '@/components'

export default function AlertsPage() {
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
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Sample alert data
  const alerts = [
    {
      id: 1,
      sensor: 'Temperature Sensor',
      message: 'Temperature exceeded threshold of 37°C',
      value: '38.2°C',
      timestamp: '2023-05-15 14:30:22',
      severity: 'high'
    },
    {
      id: 2,
      sensor: 'Pressure Sensor',
      message: 'Pressure below minimum threshold',
      value: '0.8 bar',
      timestamp: '2023-05-15 12:15:45',
      severity: 'medium'
    },
    {
      id: 3,
      sensor: 'Vibration Sensor',
      message: 'Abnormal vibration detected',
      value: '1.8 mm/s',
      timestamp: '2023-05-14 09:22:17',
      severity: 'high'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-[#0B1630] text-xl font-semibold">ELROI</h1>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative">
                <div className="flex items-center space-x-4">
                  <span className="text-[#0B1630] text-sm font-medium">{user.email}</span>
                  <Button onClick={handleLogout} variant="primary">
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-[#0B1630] text-3xl font-bold mb-2">Alerts</h1>
          <p className="text-[#A8B3C6]">System alerts and notifications</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {alerts.map((alert) => (
            <Card 
              key={alert.id} 
              className={`p-6 border-l-4 ${
                alert.severity === 'high' 
                  ? 'border-red-500' 
                  : alert.severity === 'medium' 
                    ? 'border-yellow-500' 
                    : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[#0B1630] text-xl font-semibold mb-2">{alert.sensor}</h3>
                  <p className="text-[#A8B3C6] mb-4">{alert.message}</p>
                  <div className="flex items-center space-x-4">
                    <span className="bg-gray-100 text-[#0B1630] px-3 py-1 rounded-full text-sm font-medium">
                      Value: {alert.value}
                    </span>
                    <span className="text-[#94a3b8] text-sm">{alert.timestamp}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  alert.severity === 'high' 
                    ? 'bg-red-100 text-red-800' 
                    : alert.severity === 'medium' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                }`}>
                  {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                </span>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/dashboard">
            <Button variant="secondary">
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}