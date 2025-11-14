'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'
import TopNav from '@/components/TopNav'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine, Area, ComposedChart } from 'recharts'

// Temperature Gauge Component
function TemperatureGauge({ value = 41.9, min = 25, max = 60, threshold = 31.7, onThresholdChange }) {
  const [showThresholdInput, setShowThresholdInput] = useState(false)
  const [tempThreshold, setTempThreshold] = useState(threshold)

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const mapTempToAngle = (t) => {
    const clamped = clamp(t, min, max)
    const ratio = (clamped - min) / (max - min)
    return 180 - (180 * ratio)
  }
  const polarToCartesian = (cx, cy, r, angleDeg) => {
    const rad = (Math.PI * angleDeg) / 180
    return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
  }
  const describeArc = (cx, cy, r, startAngle, endAngle) => {
    const start = polarToCartesian(cx, cy, r, startAngle)
    const end = polarToCartesian(cx, cy, r, endAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
  }

  const width = 360
  const height = 220
  const cx = width / 2
  const cy = height
  const radius = 160

  const safeStart = mapTempToAngle(max)
  const safeEnd = mapTempToAngle(threshold)
  const dangerStart = mapTempToAngle(threshold)
  const dangerEnd = mapTempToAngle(min)
  const needleAngle = mapTempToAngle(value)
  const needleEnd = polarToCartesian(cx, cy, radius - 16, needleAngle)
  const thEnd = polarToCartesian(cx, cy, radius - 8, mapTempToAngle(threshold))
  const exceeded = value <= threshold

  const handleApplyThreshold = () => {
    const newValue = parseFloat(tempThreshold)
    if (!isNaN(newValue)) {
      onThresholdChange?.(newValue)
      setShowThresholdInput(false)
    } else {
      alert('Please enter a valid number')
    }
  }

  useEffect(() => {
    setTempThreshold(threshold)
  }, [threshold])

  return (
    <div className={`rounded-2xl p-6 backdrop-blur-md shadow-xl border ${
      exceeded ? 'border-red-600 ring-8 ring-red-500/60 shadow-[0_0_40px_rgba(239,68,68,0.6)] bg-gradient-to-br from-red-50 via-red-100/40 to-red-50/60' : 'bg-gradient-to-br from-blue-50 via-white to-cyan-50/60 border-blue-100'
    }`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-sm">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
              <path d="M12 2C10.9 2 10 2.9 10 4v9.17c-1.17.41-2 1.52-2 2.83 0 1.66 1.34 3 3 3 .35 0 .69-.06 1-.17.31.11.65.17 1 .17 1.66 0 3-1.34 3-3 0-1.31-.83-2.42-2-2.83V4c0-1.1-.9-2-2-2z"/>
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-700">Temperature Gauge</span>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          <path d={describeArc(cx, cy, radius, 0, 180)} stroke="#E5F3FA" strokeWidth="20" fill="none" />
          <path d={describeArc(cx, cy, radius, safeStart, safeEnd)} stroke="#15803d" strokeWidth="20" fill="none" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#b91c1c" strokeWidth="26" fill="none" opacity="1.0" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#dc2626" strokeWidth="22" fill="none" opacity="1.0" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#ef4444" strokeWidth="24" fill="none" opacity="0.6" />
          <path d={describeArc(cx, cy, radius, dangerStart, dangerEnd)} stroke="#fca5a5" strokeWidth="32" fill="none" opacity="0.3" />
          <line x1={cx} y1={cy} x2={thEnd.x} y2={thEnd.y} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 4" />
          <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#0ea5e9" strokeWidth="4" strokeLinecap="round" className="transition-all duration-300 ease-out" />
          <circle cx={cx} cy={cy} r="8" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="3" />
        </svg>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl font-black text-gray-900 tracking-tight">{value.toFixed(3)}</span>
          <span className="text-lg font-bold text-gray-700">°C</span>
        </div>
        <div className="text-xs text-gray-600">
          Threshold: <span className="font-semibold text-red-600">{threshold.toFixed(1)}°C</span>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowThresholdInput(!showThresholdInput)}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"
          >
            {showThresholdInput ? 'Cancel' : 'Set Threshold'}
          </button>
          {exceeded && (
            <span className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg text-xs font-bold bg-red-600 text-white border-2 border-red-700 shadow-lg shadow-red-500/50 animate-pulse">
              🚨 DANGER: Below Threshold!
            </span>
          )}
        </div>

        {showThresholdInput && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <label className="block text-xs font-semibold text-gray-700 mb-2">Enter New Threshold (°C)</label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                step="0.1"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter threshold"
              />
              <button
                onClick={handleApplyThreshold}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all duration-200"
              >
                Apply
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Current: {threshold.toFixed(1)}°C</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TemperaturePage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('live')
  const [currentTemp, setCurrentTemp] = useState(42.5)
  const [userThreshold, setUserThreshold] = useState(31.7)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [series, setSeries] = useState({ times: [], current: [], predicted: [], threshold: 31.7 })
  const fileInputRef = useRef(null)
  const [uploadedData, setUploadedData] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [insights, setInsights] = useState([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAnalysisTransition, setShowAnalysisTransition] = useState(false)
  const [showFullReport, setShowFullReport] = useState(false)
  const [uploadForm, setUploadForm] = useState({ 
    param1: 'Time: 00:00 to 24:59 | Sensor: Temp-A1', 
    param2: 'Sample Rate: Every 5 seconds | Location: Zone-B', 
    param3: 'Source: Production Line 3 | Date: 2025-06-04' 
  })
  
  // Load threshold from settings (localStorage)
  useEffect(() => {
    const loadThreshold = () => {
      const savedSettings = localStorage.getItem('systemSettings')
      if (savedSettings) {
        const settings = JSON.parse(savedSettings)
        const newThreshold = settings.thresholdTemp || 31.7
        setUserThreshold(newThreshold)
        setSeries(prev => ({ ...prev, threshold: newThreshold }))
      }
    }
    
    // Load on mount
    loadThreshold()
    
    // Listen for storage changes (when settings are updated)
    const handleStorageChange = () => {
      loadThreshold()
    }
    
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  
  // Dynamic temperature simulation (decreasing)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemp(prev => {
        const decrease = Math.random() * 0.05 + 0.01 // Random decrease between 0.01 and 0.06
        const newTemp = prev - decrease
        return newTemp > 31.0 ? newTemp : 31.0 // Stop at minimum
      })
      setCurrentTime(new Date()) // Update time every interval
    }, 2000) // Update every 2 seconds
    
    return () => clearInterval(interval)
  }, [])

  const parseCsv = (text) => {
    const [header, ...lines] = text.trim().split(/\r?\n/)
    const cols = header.split(',').map(h => h.trim().toLowerCase())
    const idx = {
      timestamp: cols.indexOf('timestamp'),
      current: cols.indexOf('current'),
      predicted: cols.indexOf('predicted'),
      threshold: cols.indexOf('threshold')
    }
    const rows = lines.map(line => {
      const c = line.split(',')
      return {
        timestamp: idx.timestamp >= 0 ? c[idx.timestamp] : undefined,
        current: idx.current >= 0 ? parseFloat(c[idx.current]) : undefined,
        predicted: idx.predicted >= 0 ? parseFloat(c[idx.predicted]) : undefined,
        threshold: idx.threshold >= 0 ? parseFloat(c[idx.threshold]) : undefined,
      }
    })
    return rows
  }

  const parseXlsx = async (buffer) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
        
      return json.map(row => {
        const keys = Object.keys(row)
        const timeKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
        const tempKey = keys.find(k => k.toLowerCase() === 'temp' || k.toLowerCase() === 'temperature' || k.toLowerCase() === 'current')
        const predKey = keys.find(k => k.toLowerCase() === 'predicted')
        const threshKey = keys.find(k => k.toLowerCase() === 'threshold')
          
        let timestamp = timeKey ? row[timeKey] : undefined
        if (typeof timestamp === 'number') {
          const fractionalDay = timestamp - Math.floor(timestamp)
          const totalMinutes = Math.round(fractionalDay * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }
          
        return {
          timestamp,
          current: tempKey ? parseFloat(row[tempKey]) : undefined,
          predicted: predKey ? parseFloat(row[predKey]) : undefined,
          threshold: threshKey ? parseFloat(row[threshKey]) : undefined,
        }
      })
    } catch (e) {
      console.error('XLSX parsing error:', e)
      alert('Error parsing XLSX file: ' + e.message)
      return []
    }
  }

  const parseXlsxWithHeaders = async (buffer) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const rowsJson = XLSX.utils.sheet_to_json(ws, { defval: '' })
      const matrix = XLSX.utils.sheet_to_json(ws, { header: 1 })
      const headers = Array.isArray(matrix[0]) ? matrix[0].map(h => String(h)) : []

      const mapped = rowsJson.map(row => {
        const keys = Object.keys(row)
        const timeKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
        const tempKey = keys.find(k => k.toLowerCase() === 'temp' || k.toLowerCase() === 'temperature' || k.toLowerCase() === 'current')
        const predKey = keys.find(k => k.toLowerCase() === 'predicted' || k.toLowerCase().includes('forecast'))
        const threshKey = keys.find(k => k.toLowerCase().includes('threshold') || k.toLowerCase().includes('limit'))

        let timestamp = timeKey ? row[timeKey] : undefined
        if (typeof timestamp === 'number') {
          const fractionalDay = timestamp - Math.floor(timestamp)
          const totalMinutes = Math.round(fractionalDay * 24 * 60)
          const hours = Math.floor(totalMinutes / 60)
          const minutes = totalMinutes % 60
          timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
        }

        return {
          timestamp,
          current: tempKey ? parseFloat(row[tempKey]) : undefined,
          predicted: predKey ? parseFloat(row[predKey]) : undefined,
          threshold: threshKey ? parseFloat(row[threshKey]) : undefined,
        }
      })

      const sample = rowsJson[0] || {}
      const sampleKeys = Object.keys(sample)
      const timeKey = sampleKeys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
      const tempKey = sampleKeys.find(k => ['temp','temperature','current'].includes(k.toLowerCase()))
      const predKey = sampleKeys.find(k => k.toLowerCase() === 'predicted' || k.toLowerCase().includes('forecast'))
      const threshKey = sampleKeys.find(k => k.toLowerCase().includes('threshold') || k.toLowerCase().includes('limit'))

      return { rows: mapped, headers, detected: { timeKey, tempKey, predKey, threshKey } }
    } catch (e) {
      console.error('XLSX parsing error:', e)
      alert('Error parsing XLSX file: ' + e.message)
      return { rows: [], headers: [], detected: {} }
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    
    const fileName = file.name.toLowerCase()
    
    if (fileName.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const rows = parseCsv(e.target.result)
        const times = rows.map(r => r.timestamp)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted ?? undefined).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7
        
        setUploadedData({
          fileName: file.name,
          times,
          current,
          predicted,
          threshold,
          stats: {
            dataPoints: current.length,
            min: Math.min(...current),
            max: Math.max(...current),
            avg: (current.reduce((a,b) => a+b, 0) / current.length),
            timeRange: times.length > 0 ? `${times[0]} - ${times[times.length - 1]}` : 'N/A'
          }
        })
        
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsText(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const buffer = await file.arrayBuffer()
        const { rows, headers, detected } = await parseXlsxWithHeaders(buffer)
        const times = rows.map(r => r.timestamp).filter(t => t !== undefined)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted ?? undefined).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7
        
        setUploadedData({
          fileName: file.name,
          times,
          current,
          predicted,
          threshold,
          detectedHeaders: headers,
          mapping: {
            xKey: detected?.timeKey || 'timestamp',
            yKey: detected?.tempKey || 'current',
            predKey: detected?.predKey || null
          },
          stats: {
            dataPoints: current.length,
            min: Math.min(...current),
            max: Math.max(...current),
            avg: (current.reduce((a,b) => a+b, 0) / current.length),
            timeRange: times.length > 0 ? `${times[0]} - ${times[times.length - 1]}` : 'N/A'
          }
        })
        
        if (fileInputRef.current) fileInputRef.current.value = ''
      } catch (error) {
        console.error('Error parsing Excel file:', error)
      }
    }
  }

  const processDataForAnalysis = () => {
    if (!uploadedData) return
    
    setIsProcessing(true)
    setShowAnalysisTransition(true)
    
    // Use setTimeout to prevent UI blocking
    setTimeout(() => {
      const insights = [
        `Data points analyzed: ${uploadedData.stats.dataPoints}`,
        `Temperature range: ${uploadedData.stats.min.toFixed(2)}°C to ${uploadedData.stats.max.toFixed(2)}°C`,
        `Average temperature: ${uploadedData.stats.avg.toFixed(2)}°C`,
        `Time period: ${uploadedData.stats.timeRange}`
      ]
      
      if (uploadedData.current.length > 1) {
        const first = uploadedData.current[0]
        const last = uploadedData.current[uploadedData.current.length - 1]
        const trend = last > first ? 'increasing' : last < first ? 'decreasing' : 'stable'
        insights.push(`Temperature trend: ${trend}`)
      }
      
      // Smart sampling: For graph, sample data to max 200 points for performance
      // But keep ALL data for table display
      let graphTimes = uploadedData.times
      let graphCurrent = uploadedData.current
      let graphPredicted = uploadedData.predicted
      
      if (uploadedData.times.length > 200) {
        const step = Math.ceil(uploadedData.times.length / 200)
        graphTimes = uploadedData.times.filter((_, idx) => idx % step === 0)
        graphCurrent = uploadedData.current.filter((_, idx) => idx % step === 0)
        graphPredicted = uploadedData.predicted.filter((_, idx) => idx % step === 0)
      }
      
      setAnalysisData({
        ...uploadedData,
        graphTimes,    // Sampled data for graph (max 200 points)
        graphCurrent,
        graphPredicted
      })
      setInsights(insights)
      setIsProcessing(false)
      setTimeout(() => setShowAnalysisTransition(false), 600)
    }, 100)
  }

  const handleFormChange = (field, value) => {
    setUploadForm(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/20">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav user={user} />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Temperature Monitoring</h1>
                <p className="text-sm text-gray-500 mt-1">Real-time predictive maintenance dashboard</p>
              </div>
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-amber-100 rounded-lg border border-orange-200">
                <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-bold text-orange-800">Threshold: {series.threshold.toFixed(1)}°C</span>
              </div>
            </div>
            
            <div className="flex mb-6 gap-3">
              <button
                className={`py-3 px-8 font-bold text-sm rounded-xl transition-all shadow-lg ${
                  activeTab === 'live'
                    ? 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white shadow-blue-500/50 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 hover:text-blue-700 hover:shadow-xl'
                }`}
                onClick={() => setActiveTab('live')}
              >
                📊 Live Data
              </button>
              <button
                className={`py-3 px-8 font-bold text-sm rounded-xl transition-all shadow-lg ${
                  activeTab === 'analysis'
                    ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-fuchsia-700 text-white shadow-purple-500/50 scale-105'
                    : 'bg-white text-gray-600 hover:bg-gradient-to-r hover:from-purple-50 hover:to-fuchsia-50 hover:text-purple-700 hover:shadow-xl'
                }`}
                onClick={() => setActiveTab('analysis')}
              >
                🔬 Data Analysis
              </button>
            </div>
            
            {activeTab === 'live' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-gradient-to-br from-white via-blue-50/30 to-cyan-50/40 rounded-2xl p-6 shadow-2xl border-2 border-blue-100 hover:shadow-blue-200/50 transition-all duration-300">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Temperature Profile</h2>
                        <p className="text-sm text-gray-500 mt-1">Actual vs Predicted Cooling Trajectory</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center px-3 py-1.5 bg-blue-100 rounded-lg border border-blue-200">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 mr-2 shadow-lg shadow-blue-500/50"></span>
                          <span className="text-xs font-bold text-blue-700">Actual Data</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-300 to-blue-400 mr-2 shadow-md shadow-blue-300/40"></span>
                          <span className="text-xs font-bold text-blue-600">AI Prediction</span>
                        </div>
                        <div className="flex items-center px-3 py-1.5 bg-pink-100 rounded-lg border border-pink-200">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600 mr-2 shadow-lg shadow-pink-500/50"></span>
                          <span className="text-xs font-bold text-pink-700">Threshold</span>
                        </div>
                      </div>
                    </div>
                    <TemperatureGauge
                      value={currentTemp}
                      threshold={series.threshold}
                      onThresholdChange={(newThreshold) => {
                        setUserThreshold(newThreshold)
                        setSeries(prev => ({ ...prev, threshold: newThreshold }))
                      }}
                    />
                  </div>

                  <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/40 rounded-2xl p-6 shadow-2xl border-2 border-purple-100 hover:shadow-purple-200/50 transition-all duration-300">
                    <div className="mb-6">
                      <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Live Temperature Display</h2>
                      <p className="text-sm text-gray-500 mt-1">Real-time monitoring</p>
                    </div>

                    {/* Current Time Display */}
                    <div className="mb-4 p-4 bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 shadow-md">
                      <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-2 text-center">Current Time</div>
                      <div className="flex items-center justify-center space-x-1">
                        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg px-4 py-3 shadow-md border border-indigo-200">
                          <span className="text-3xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {currentTime.getHours().toString().padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-indigo-500">:</span>
                        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg px-4 py-3 shadow-md border border-indigo-200">
                          <span className="text-3xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {currentTime.getMinutes().toString().padStart(2, '0')}
                          </span>
                        </div>
                        <span className="text-2xl font-bold text-indigo-500">:</span>
                        <div className="bg-gradient-to-br from-white to-indigo-50 rounded-lg px-4 py-3 shadow-md border border-indigo-200">
                          <span className="text-3xl font-black bg-gradient-to-br from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {currentTime.getSeconds().toString().padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Temperature Reading */}
                    <div className="mb-6">
                      <div className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-3 text-center">Temperature Reading</div>
                      <div className="flex items-center justify-center space-x-1.5 bg-gradient-to-br from-blue-100 via-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 shadow-lg">
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg px-4 py-3 shadow-md border border-blue-200">
                          <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{Math.floor(currentTemp / 10)}</span>
                        </div>
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg px-4 py-3 shadow-md border border-blue-200">
                          <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{Math.floor(currentTemp % 10)}</span>
                        </div>
                        <span className="text-3xl font-bold text-blue-400 px-1">.</span>
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg px-4 py-3 shadow-md border border-blue-200">
                          <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{Math.floor((currentTemp * 10) % 10)}</span>
                        </div>
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg px-4 py-3 shadow-md border border-blue-200">
                          <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-cyan-600 bg-clip-text text-transparent">{Math.floor((currentTemp * 100) % 10)}</span>
                        </div>
                        <div className="flex items-center ml-2">
                          <span className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">°C</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-6 p-4 bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 rounded-xl border-2 border-green-200 shadow-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-600 uppercase">Status</span>
                        <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full shadow-lg shadow-green-500/40">COOLING</span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Threshold</span>
                        <span className="text-sm font-bold text-gray-900">{series.threshold.toFixed(1)}°C</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{((42.5 - currentTemp) / (42.5 - 31.7) * 100).toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <button className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-800 transition-all shadow-lg shadow-blue-500/40 hover:shadow-xl hover:scale-105">
                        Start Monitoring
                      </button>
                      <button className="w-full py-3 px-4 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 font-bold rounded-xl hover:from-gray-300 hover:to-gray-400 transition-all shadow-md hover:shadow-lg hover:scale-105">
                        Pause
                      </button>
                      <button 
                        onClick={() => setSeries(prev => ({ ...prev, threshold: userThreshold }))}
                        className="w-full py-3 px-4 bg-gradient-to-r from-pink-200 via-pink-300 to-pink-400 text-pink-800 font-bold rounded-xl hover:from-pink-300 hover:to-pink-500 transition-all shadow-md hover:shadow-lg hover:scale-105"
                      >
                        Update Threshold
                      </button>
                    </div>
                  </div>
                </div>
            )}
            
            {activeTab === 'analysis' && (
              <div>
                {!uploadedData ? (
                  <div className="space-y-6">
                    {/* Upload Section - Show First */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                      <div className="grid grid-cols-1">
                        {/* Left Side - Upload Box */}
                        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                          <div className="flex items-center mb-6">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mr-4 shadow-lg shadow-indigo-500/30">
                              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">Upload Dataset</h3>
                              <p className="text-sm text-gray-600 mt-1">Import temperature data files</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-20"></div>
                              <div className="relative p-8 bg-white rounded-xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 transition-all cursor-pointer">
                                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={(e) => handleFileUpload(e.target.files[0])}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                <div className="text-center">
                                  <svg className="w-12 h-12 text-indigo-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <p className="text-sm font-semibold text-gray-700 mb-1">Click to upload or drag and drop</p>
                                  <p className="text-xs text-gray-500">CSV, XLSX, XLS (MAX. 10MB)</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Side - Info */}
                        <div className="p-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                          <div className="mb-4">
                            <p className="text-sm text-gray-600 text-center">No additional parameters needed. Upload your file to begin analysis.</p>
                          </div>

                          <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600 text-center">
                              <span className="font-semibold">Supported formats:</span><br/>
                              CSV, XLSX, XLS files<br/>
                              <span className="text-xs text-gray-500 mt-2 block">Maximum file size: 10MB</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : !analysisData ? (
                  <div className="space-y-6">
                    {/* File Upload Success - Show file info and analysis button */}
                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mr-4 shadow-lg shadow-green-500/30">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">File Uploaded Successfully</h3>
                            <p className="text-sm text-gray-600 mt-1">{uploadedData.fileName} • {uploadedData.stats.dataPoints} data points</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setUploadedData(null)
                            if (fileInputRef.current) fileInputRef.current.value = ''
                          }}
                          className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          ← Upload Different File
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="p-6 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-xl border-2 border-blue-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <p className="text-xs font-bold text-blue-800 uppercase mb-2">Data Points</p>
                          <p className="text-4xl font-black text-blue-900">{uploadedData.stats.dataPoints}</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-purple-200 via-purple-100 to-fuchsia-100 rounded-xl border-2 border-purple-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <p className="text-xs font-bold text-purple-800 uppercase mb-2">Avg Temperature</p>
                          <p className="text-4xl font-black text-purple-900">{uploadedData.stats.avg.toFixed(2)}°C</p>
                        </div>
                        <div className="p-6 bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 rounded-xl border-2 border-orange-200 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                          <p className="text-xs font-bold text-orange-800 uppercase mb-2">Temp Range</p>
                          <p className="text-2xl font-black text-orange-900">{uploadedData.stats.min.toFixed(1)} - {uploadedData.stats.max.toFixed(1)}°C</p>
                        </div>
                      </div>



                      <button onClick={processDataForAnalysis} disabled={isProcessing}
                        className={`w-full py-4 text-white font-bold text-lg rounded-xl transition-all shadow-lg ${
                          isProcessing 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30'
                        }`}>
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </span>
                        ) : '🔬 Start Analysis →'}
                      </button>

                      {/* Detected Columns & Recommended Mapping (moved below the button) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Detected Columns</p>
                          <div className="text-sm text-gray-700">
                            {(uploadedData.detectedHeaders || []).length > 0 ? (
                              <ul className="list-disc list-inside">
                                {uploadedData.detectedHeaders.map((h, i) => (
                                  <li key={i} className="text-gray-800">{h}</li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500">Headers not available</p>
                            )}
                          </div>
                        </div>
                        <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Recommended Graph</p>
                          <p className="text-sm text-gray-700">X: {uploadedData.mapping?.xKey || 'timestamp'}</p>
                          <p className="text-sm text-gray-700">Y: {uploadedData.mapping?.yKey || 'temperature'}</p>
                          {uploadedData.mapping?.predKey && (
                            <p className="text-sm text-gray-700">Overlay: {uploadedData.mapping.predKey}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Stats Cards Row - Show ONLY in analysis results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Stat card 1 - Current Temperature */}
                      <div className="bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-2xl p-6 shadow-xl border-2 border-blue-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 flex items-center justify-center shadow-lg shadow-blue-500/60">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 bg-blue-600 text-white rounded-full shadow-md">First Entry</span>
                        </div>
                        <div className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">Starting Temperature</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-blue-900">{analysisData.current[0]?.toFixed(1)}</span>
                          <span className="text-2xl font-bold text-blue-700">°C</span>
                        </div>
                        <div className="mt-3 flex items-center text-sm text-blue-700 font-semibold">
                          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          <span>From uploaded data</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-orange-200 via-orange-100 to-red-100 rounded-2xl p-6 shadow-xl border-2 border-orange-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-orange-600 via-orange-700 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/60">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 bg-orange-600 text-white rounded-full shadow-md">Target</span>
                        </div>
                        <div className="text-xs font-bold text-orange-800 uppercase tracking-wide mb-2">Target Temperature</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-orange-900">32.4</span>
                          <span className="text-2xl font-bold text-orange-700">°C</span>
                        </div>
                        <div className="mt-3 flex items-center text-sm text-orange-700 font-semibold">
                          <span className="w-3 h-3 bg-orange-600 rounded-full mr-2 animate-pulse shadow-lg"></span>
                          <span>{(currentTemp - 32.4).toFixed(1)}°C above target</span>
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 rounded-2xl p-6 shadow-xl border-2 border-emerald-200 hover:shadow-2xl hover:scale-105 transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-700 flex items-center justify-center shadow-lg shadow-emerald-500/60">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                          </div>
                          <span className="text-xs font-bold px-3 py-1.5 bg-emerald-600 text-white rounded-full shadow-md">Safe ✓</span>
                        </div>
                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-2">Threshold Limit</div>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-5xl font-black text-emerald-900">{series.threshold.toFixed(1)}</span>
                          <span className="text-2xl font-bold text-emerald-700">°C</span>
                        </div>
                        <div className="mt-3 flex items-center text-sm text-emerald-700 font-semibold">
                          <span className="w-3 h-3 bg-emerald-600 rounded-full mr-2 shadow-lg"></span>
                          <span>Within safe range</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
                      <button onClick={() => setAnalysisData(null)} className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">← Back to Upload</button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Graph Section - LEFT SIDE */}
                      <div className="bg-gradient-to-br from-blue-50 via-white to-cyan-50 rounded-2xl p-6 shadow-xl border-2 border-blue-100">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-700 flex items-center justify-center mr-3 shadow-lg shadow-indigo-500/50">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Temperature Graph</h3>
                            <p className="text-xs text-gray-500">Trend visualization over time</p>
                          </div>
                        </div>
                        
                        {/* Enhanced Chart with Better Formatting & Optimized Data */}
                        <div className="h-96 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                              data={(analysisData.graphTimes || analysisData.times).map((time, idx) => ({
                                timestamp: time,
                                temperature: (analysisData.graphCurrent || analysisData.current)[idx],
                                predicted: (analysisData.graphPredicted || analysisData.predicted)[idx] || null
                              }))}
                              margin={{ top: 15, right: 40, left: 25, bottom: 50 }}
                            >
                              <defs>
                                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                              <XAxis 
                                dataKey="timestamp" 
                                tick={{ fontSize: 10, fill: '#374151' }}
                                stroke="#9ca3af"
                                tickLine={{ stroke: '#d1d5db' }}
                                interval={Math.floor((analysisData.graphTimes || analysisData.times).length / 8)}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                                label={{ 
                                  value: 'Time (HH:MM)', 
                                  position: 'insideBottom', 
                                  offset: -15,
                                  style: { fontSize: 11, fontWeight: 600, fill: '#4b5563' } 
                                }}
                              />
                              <YAxis 
                                tick={{ fontSize: 11, fill: '#374151' }}
                                stroke="#9ca3af"
                                tickLine={{ stroke: '#d1d5db' }}
                                domain={[(dataMin) => Math.floor(dataMin - 2), (dataMax) => Math.ceil(dataMax + 2)]}
                                tickCount={8}
                                label={{ 
                                  value: 'Temperature (°C)', 
                                  angle: -90, 
                                  position: 'insideLeft',
                                  offset: 10,
                                  style: { fontSize: 12, fontWeight: 600, fill: '#4b5563' } 
                                }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'rgba(255, 255, 255, 0.98)', 
                                  border: '2px solid #3b82f6',
                                  borderRadius: '10px',
                                  fontSize: '13px',
                                  fontWeight: 500,
                                  padding: '10px 14px',
                                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                                }}
                                labelStyle={{ color: '#1f2937', fontWeight: 700, marginBottom: '6px' }}
                                formatter={(value) => [`${value?.toFixed(3)} °C`, '']}
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: '13px', fontWeight: 500 }}
                                iconType="line"
                                align="right"
                                verticalAlign="top"
                                layout="vertical"
                              />
                              <ReferenceLine 
                                y={analysisData.stats.avg} 
                                stroke="#f59e0b" 
                                strokeDasharray="8 4" 
                                strokeWidth={2}
                                label={{ 
                                  value: `Avg: ${analysisData.stats.avg.toFixed(2)}°C`, 
                                  position: 'right',
                                  fill: '#f59e0b',
                                  fontSize: 11,
                                  fontWeight: 600
                                }}
                              />
                              {analysisData.threshold && (
                                <ReferenceLine 
                                  y={analysisData.threshold} 
                                  stroke="#ef4444" 
                                  strokeDasharray="5 5" 
                                  strokeWidth={2}
                                  label={{ 
                                    value: `Threshold: ${analysisData.threshold.toFixed(1)}°C`, 
                                    position: 'right',
                                    fill: '#ef4444',
                                    fontSize: 11,
                                    fontWeight: 700
                                  }}
                                />
                              )}
                              <Area
                                type="monotone"
                                dataKey="temperature"
                                fill="url(#tempGradient)"
                                stroke="none"
                              />
                              <Line 
                                type="monotone" 
                                dataKey="temperature" 
                                stroke="#3b82f6" 
                                strokeWidth={3}
                                dot={{ fill: '#3b82f6', r: 2, strokeWidth: 0 }}
                                activeDot={{ r: 5, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
                                name="Temperature"
                              />
                              {analysisData.predicted.some(v => v !== undefined) && (
                                <Line 
                                  type="monotone" 
                                  dataKey="predicted" 
                                  stroke="#a855f7" 
                                  strokeWidth={2.5}
                                  strokeDasharray="8 4"
                                  dot={{ fill: '#a855f7', r: 2 }}
                                  activeDot={{ r: 4, fill: '#9333ea', stroke: '#fff', strokeWidth: 2 }}
                                  name="Predicted"
                                />
                              )}
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-3">
                          <div className="p-4 bg-gradient-to-br from-blue-200 via-blue-100 to-cyan-100 rounded-xl border-2 border-blue-200 shadow-lg">
                            <p className="text-xs font-bold text-blue-800 uppercase mb-1">Graph Points</p>
                            <p className="text-2xl font-black text-blue-900">{(analysisData.graphTimes || analysisData.times).length}</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 rounded-xl border-2 border-orange-200 shadow-lg">
                            <p className="text-xs font-bold text-orange-800 uppercase mb-1">Avg Temp</p>
                            <p className="text-2xl font-black text-orange-900">{analysisData.stats.avg.toFixed(2)}°C</p>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-emerald-200 via-teal-100 to-cyan-100 rounded-xl border-2 border-emerald-200 shadow-lg">
                            <p className="text-xs font-bold text-emerald-800 uppercase mb-1">Variance</p>
                            <p className="text-2xl font-black text-emerald-900">{(analysisData.stats.max - analysisData.stats.min).toFixed(2)}°C</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Data Table Section - RIGHT SIDE - ALL ROWS */}
                      <div className="bg-gradient-to-br from-purple-50 via-white to-pink-50 rounded-2xl p-6 shadow-xl border-2 border-purple-100">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 via-fuchsia-700 to-pink-700 flex items-center justify-center mr-3 shadow-lg shadow-purple-500/50">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">Temperature Data</h3>
                            <p className="text-xs text-gray-500">All {analysisData.times.length} entries</p>
                          </div>
                        </div>
                        
                        {/* Scrollable table with LIMITED rows (50-100) */}
                        <div className="overflow-y-auto max-h-[450px] rounded-xl border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Timestamp</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Temp (°C)</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                              {analysisData.times.slice(0, 100).map((time, index) => {
                                const temp = analysisData.current[index]
                                const isAlert = temp < series.threshold  // COOLING: Alert when BELOW threshold
                                return (
                                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{time}</td>
                                    <td className="px-4 py-3 text-sm">
                                      <span className="font-bold text-blue-600">{temp?.toFixed(2)}</span>
                                    </td>
                                    <td className="px-4 py-3 text-sm">
                                      {isAlert ? (
                                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-300">🚨 ALERT</span>
                                      ) : (
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-300">✓ Normal</span>
                                      )}
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                        
                        <div className="mt-4 text-center">
                          <p className="text-xs text-gray-500 mb-3">
                            Showing first 100 of {analysisData.times.length} entries from {analysisData.fileName}
                          </p>
                          <button 
                            onClick={() => setShowFullReport(true)}
                            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                          >
                            📊 View Full Excel Report ({analysisData.times.length} entries)
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mr-3 shadow-lg shadow-orange-500/30">
                          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Insights Analysis</h3>
                          <p className="text-xs text-gray-500">Data summary and trends</p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {insights.map((insight, index) => (
                          <div key={index} className="flex items-start">
                            <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Full Report Modal/Popup */}
      {showFullReport && analysisData && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-slideUp">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">Full Excel Report</h2>
                  <p className="text-sm text-white/80 mt-1">{analysisData.fileName} • {analysisData.times.length} Total Entries</p>
                </div>
              </div>
              <button 
                onClick={() => setShowFullReport(false)}
                className="w-10 h-10 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body - Scrollable Table */}
            <div className="flex-1 overflow-auto p-6">
              <div className="rounded-xl border-2 border-gray-200 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-100 to-gray-200 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">Temperature (°C)</th>
                      {analysisData.predicted && analysisData.predicted.some(v => v !== undefined) && (
                        <th className="px-4 py-3 text-left text-xs font-black text-gray-800 uppercase tracking-wider">Predicted (°C)</th>
                      )}
                      <th className="px-4 py-3 text-center text-xs font-black text-gray-800 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {analysisData.times.map((time, index) => {
                      const temp = analysisData.current[index]
                      const predicted = analysisData.predicted?.[index]
                      const isAlert = temp < series.threshold  // COOLING: Alert when BELOW threshold
                      return (
                        <tr key={index} className={`hover:bg-blue-50 transition-colors ${
                          isAlert ? 'bg-red-50/30' : ''
                        }`}>
                          <td className="px-4 py-3 text-sm font-bold text-gray-600">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{time}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-black text-lg ${
                              isAlert ? 'text-red-600' : 'text-blue-600'
                            }`}>
                              {temp?.toFixed(3)}
                            </span>
                          </td>
                          {analysisData.predicted && analysisData.predicted.some(v => v !== undefined) && (
                            <td className="px-4 py-3 text-sm">
                              {predicted ? (
                                <span className="font-semibold text-purple-600">{predicted.toFixed(3)}</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          )}
                          <td className="px-4 py-3 text-center">
                            {isAlert ? (
                              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-black rounded-lg shadow-lg shadow-red-500/30">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                ALERT
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-black rounded-lg shadow-lg shadow-green-500/30">
                                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Normal
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-4 rounded-b-2xl border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-lg border border-blue-200">
                  <span className="text-xs font-bold text-blue-800">Total: {analysisData.times.length} entries</span>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-red-100 to-orange-100 rounded-lg border border-red-200">
                  <span className="text-xs font-bold text-red-800">Alerts: {analysisData.current.filter(t => t < series.threshold).length}</span>
                </div>
                <div className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border border-green-200">
                  <span className="text-xs font-bold text-green-800">Normal: {analysisData.current.filter(t => t >= series.threshold).length}</span>
                </div>
              </div>
              <button 
                onClick={() => setShowFullReport(false)}
                className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-bold text-sm rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
