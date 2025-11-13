'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function TemperaturePage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [cardAnimationClasses, setCardAnimationClasses] = useState([
    'opacity-0 translate-y-4', 'opacity-0 translate-y-4', 'opacity-0 translate-y-4', 'opacity-0 translate-y-4'
  ])
  
  // Real-time data
  const [currentTemp, setCurrentTemp] = useState(44.5)
  const [timeToTarget, setTimeToTarget] = useState({ hours: 2, minutes: 45, seconds: 0 })
  const [showExcelModal, setShowExcelModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [userThreshold, setUserThreshold] = useState(31.7)
  const [series, setSeries] = useState({ times: [], current: [], predicted: [], threshold: 31.7 })
  const [playIndex, setPlayIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [fileName, setFileName] = useState('Report_20250604-3.xls')
  const [dataVersion, setDataVersion] = useState(0) // Track data updates
  const fileInputRef = useRef(null)
  const hasLoadedData = useRef(false) // Prevent infinite loop
  
  // Upload preview states
  const [showUploadPreview, setShowUploadPreview] = useState(false)
  const [previewData, setPreviewData] = useState(null)

  // Format temperature for display (e.g., 44.5 -> ["4", "4"])
  const getTempDigits = (temp) => {
    const tempStr = Math.floor(temp).toString().padStart(2, '0')
    return tempStr.split('')
  }

  // Format time for display
  const getTimeDigits = () => {
    const minutes = timeToTarget.minutes.toString().padStart(2, '0')
    const seconds = timeToTarget.seconds.toString().padStart(2, '0')
    return { minutes: minutes.split(''), seconds: seconds.split('') }
  }

  // Parse CSV text (expects headers: Timestamp,Current[,Predicted][,Threshold])
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

  // Parse XLSX ArrayBuffer using dynamic import (requires 'xlsx' dependency)
  const parseXlsx = async (buffer) => {
    try {
      const XLSX = await import('xlsx')
      const wb = XLSX.read(buffer, { type: 'array' })
      const sheetName = wb.SheetNames[0]
      const ws = wb.Sheets[sheetName]
      const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
        
      // Parse the actual file format: Date/time (Excel serial) and temp columns
      return json.map(row => {
        const keys = Object.keys(row)
        // Find column names (case-insensitive)
        const timeKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
        const tempKey = keys.find(k => k.toLowerCase() === 'temp' || k.toLowerCase() === 'temperature' || k.toLowerCase() === 'current')
        const predKey = keys.find(k => k.toLowerCase() === 'predicted')
        const threshKey = keys.find(k => k.toLowerCase() === 'threshold')
          
        // Convert Excel serial date to readable format if needed
        let timestamp = timeKey ? row[timeKey] : undefined
        if (typeof timestamp === 'number') {
          // Excel serial date: convert to hours/minutes
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

  // Handle threshold update
  const handleThresholdUpdate = () => {
    setSeries(prev => ({ ...prev, threshold: userThreshold }))
    setShowSettings(false)
  }

  // Handle file upload (CSV or XLSX/XLS) - Parse and preview first
  const handleFileUpload = async (file) => {
    if (!file) {
      console.log('No file selected')
      return
    }
    
    console.log('✅ File selected:', file.name, 'Type:', file.type, 'Size:', file.size, 'bytes')

    const fileName = file.name.toLowerCase()
    console.log('Parsing file:', fileName)
    
    if (fileName.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const rows = parseCsv(e.target.result)
        const times = rows.map(r => r.timestamp)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted ?? undefined).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7
        
        console.log('CSV parsed:', { times: times.length, current: current.length })
        
        // Show preview modal instead of applying directly
        setPreviewData({
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
        setShowUploadPreview(true)
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
      reader.readAsText(file)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const buffer = await file.arrayBuffer()
        const rows = await parseXlsx(buffer)
        const times = rows.map(r => r.timestamp).filter(t => t !== undefined)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted ?? undefined).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7
        
        console.log('Excel parsed:', { times: times.length, current: current.length })
        
        // Show preview modal instead of applying directly
        setPreviewData({
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
        setShowUploadPreview(true)
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Error processing Excel file:', error)
        alert('Error processing Excel file. Please check the file format.')
      }
    } else {
      alert('Unsupported file format. Please upload .csv, .xlsx, or .xls file')
    }
  }
  
  // Confirm and apply the uploaded data
  const confirmUploadData = () => {
    if (!previewData) return
    
    console.log('Applying uploaded data...')
    
    // Update all states with new data
    setFileName(previewData.fileName)
    setSeries({ 
      times: previewData.times, 
      current: previewData.current, 
      predicted: previewData.predicted, 
      threshold: previewData.threshold 
    })
    setCurrentTemp(previewData.current[0] || 44.5)
    setIsPlaying(true)
    setPlayIndex(0)
    setTimeToTarget({ hours: 0, minutes: 0, seconds: 0 })
    setDataVersion(prev => prev + 1) // Force re-render
    
    // Save to Reports automatically
    saveToReports(previewData.fileName, previewData.times, previewData.current, previewData.threshold)
    
    console.log('✅ Data applied! Graph and report updated.')
    
    // Close preview modal
    setShowUploadPreview(false)
    setPreviewData(null)
    
    // Show success message
    alert(`✅ Data successfully applied!

File: ${previewData.fileName}
Data Points: ${previewData.stats.dataPoints}
Range: ${previewData.stats.min.toFixed(2)}°C - ${previewData.stats.max.toFixed(2)}°C

Graph and report have been updated.`)
  }
  
  // Cancel upload preview
  const cancelUploadPreview = () => {
    setShowUploadPreview(false)
    setPreviewData(null)
  }

  // Save data to Reports page storage
  const saveToReports = (fileName, times, values, threshold) => {
    try {
      // Get existing reports from localStorage
      const savedReports = localStorage.getItem('predictive_reports')
      let reports = savedReports ? JSON.parse(savedReports) : {
        Temperature: [],
        Pressure: [],
        Humidity: [],
        Vibration: []
      }

      // Create unique key based on file content (first 3 values as fingerprint)
      const fileKey = `${fileName}_${values.slice(0, 3).join('_')}_${values.length}`

      // Check if this exact file already exists (prevent duplicates)
      const existingReport = reports.Temperature.find(r => {
        const existingKey = `${r.fileName}_${r.values.slice(0, 3).join('_')}_${r.dataPoints}`
        return existingKey === fileKey
      })

      if (existingReport) {
        console.log('Report already exists, skipping duplicate:', fileName)
        return // Don't save duplicate
      }

      const reportName = `Temperature Report - ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
      
      const newReport = {
        id: Date.now(),
        name: reportName,
        parameter: 'Temperature',
        fileName: fileName,
        uploadDate: new Date().toISOString(),
        dataPoints: values.length,
        times: times,
        values: values,
        threshold: threshold
      }

      // Add new report to Temperature array
      reports.Temperature.push(newReport)

      // Save back to localStorage
      localStorage.setItem('predictive_reports', JSON.stringify(reports))
      
      console.log('✅ New report saved:', reportName, 'with', values.length, 'data points')
    } catch (error) {
      console.error('Error saving to reports:', error)
    }
  }

  // Build simple path from values (linear segments)
  const buildPath = (values) => {
    if (!values || values.length === 0) return ''
    // Map values to SVG space (600x150 logical units)
    const width = 600, height = 150
    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = max - min || 1
    const xStep = width / Math.max(values.length - 1, 1)
    const yOf = v => height - ((v - min) / span) * height
    let d = `M 0,${yOf(values[0])}`
    for (let i = 1; i < values.length; i++) {
      d += ` L ${i * xStep},${yOf(values[i])}`
    }
    return d
  }

  // Compute threshold line Y percent relative to series range
  const computeThresholdY = (values, threshold) => {
    if (!values || values.length === 0 || typeof threshold !== 'number') return '85%'
    const min = Math.min(...values, threshold)
    const max = Math.max(...values, threshold)
    const span = max - min || 1
    const pct = 100 - ((threshold - min) / span) * 100
    return `${pct}%`
  }

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
    
    // Auto-load the backend Excel file ONLY if no previous uploads exist
    const loadBackendData = async () => {
      // Prevent loading data multiple times
      if (hasLoadedData.current) {
        console.log('Data already loaded, skipping...')
        return
      }
      
      try {
        // Check if user has already uploaded data
        const savedReports = localStorage.getItem('predictive_reports')
        if (savedReports) {
          const reports = JSON.parse(savedReports)
          if (reports.Temperature && reports.Temperature.length > 0) {
            // Load the most recent uploaded file instead of backend default
            const latestReport = reports.Temperature[reports.Temperature.length - 1]
            console.log('Loading latest uploaded file:', latestReport.fileName)
            setSeries({ 
              times: latestReport.times, 
              current: latestReport.values, 
              predicted: [], 
              threshold: latestReport.threshold 
            })
            setCurrentTemp(latestReport.values[0] || 44.5)
            setFileName(latestReport.fileName)
            setIsPlaying(true)
            hasLoadedData.current = true // Mark as loaded
            console.log('✅ Loaded latest upload:', latestReport.fileName, 'with', latestReport.values.length, 'data points')
            return // Don't load backend file
          }
        }
        
        // No uploads found - load backend default file
        console.log('No uploads found. Loading backend default file...')
        const response = await fetch('/Report_20250604-3.xls')
        if (!response.ok) throw new Error('Failed to load data file')
        const buffer = await response.arrayBuffer()
        const rows = await parseXlsx(buffer)
        
        const times = rows.map(r => r.timestamp).filter(t => t !== undefined)
        const current = rows.map(r => r.current).filter(v => typeof v === 'number')
        const predicted = rows.map(r => r.predicted).filter(v => typeof v === 'number')
        const threshold = rows.find(r => typeof r.threshold === 'number')?.threshold ?? 31.7
        
        console.log('Loaded backend data:', { times: times.length, current: current.length, predicted: predicted.length })
        console.log('Temperature range:', Math.min(...current).toFixed(2), '°C to', Math.max(...current).toFixed(2), '°C')
        setSeries({ times, current, predicted, threshold })
        setCurrentTemp(current[0] || 44.5)
        setIsPlaying(true)
        hasLoadedData.current = true // Mark as loaded
        
        // Save to Reports automatically (first time only)
        saveToReports('Report_20250604-3.xls', times, current, threshold)
      } catch (e) {
        console.error('Could not auto-load data:', e)
      }
    }
    
    loadBackendData()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.push('/login')
      } else {
        setUser(session.user)
      }
    })

    // Staggered card animations
    const timers = [100, 200, 300, 400].map((delay, index) => {
      return setTimeout(() => {
        setCardAnimationClasses(prev => {
          const newClasses = [...prev]
          newClasses[index] = 'opacity-100 translate-y-0'
          return newClasses
        })
      }, delay)
    })

    // Real-time updates - file playback if available, otherwise simulate
    const updateInterval = setInterval(() => {
      if (isPlaying && series.current.length > 0) {
        const currentIndex = Math.min(playIndex, series.current.length - 1)
        setCurrentTemp(() => series.current[currentIndex])
        setPlayIndex(i => {
          const next = i + 1
          // Loop back to start when reaching end
          return next >= series.current.length ? 0 : next
        })
      } else {
        // fallback cooling simulation
        setCurrentTemp(prev => {
          const newTemp = prev - 0.02
          return Math.max(35.0, parseFloat(newTemp.toFixed(2)))
        })
      }

      // count-up clock
      setTimeToTarget(prev => {
        let seconds = prev.seconds + 1
        let minutes = prev.minutes
        let hours = prev.hours
        if (seconds >= 60) { seconds = 0; minutes++ }
        if (minutes >= 60) { minutes = 0; hours++ }
        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => {
      subscription.unsubscribe()
      timers.forEach(timer => clearTimeout(timer))
      clearInterval(updateInterval)
    }
  }, [router, isPlaying, playIndex]) // Removed series.current from dependencies

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>
  }

  // Top 4 Metric Cards
  const metricCards = [
    {
      id: 'current',
      title: 'Current Temperature',
      value: currentTemp.toFixed(1),
      unit: '°C',
      subtext: series.current.length > 0 ? `Live data (${series.current.length} points)` : 'Δ +0.8°C since last update',
      bgColor: 'bg-[#0071CE]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      id: 'target',
      title: 'Target Temperature',
      value: series.current.length > 0 ? Math.min(...series.current).toFixed(1) : '35.0',
      unit: '°C',
      subtext: series.current.length > 0 ? 'Minimum in dataset' : 'Stabilization ETA 2h 45m',
      bgColor: 'bg-[#FF6B35]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      id: 'threshold',
      title: 'Threshold Temperature',
      value: series.threshold.toFixed(1),
      unit: '°C',
      subtext: currentTemp > series.threshold ? 'Status: Normal ✓' : 'Status: Below threshold',
      bgColor: 'bg-[#E94E4E]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    {
      id: 'time',
      title: 'Time to Target',
      value: `${timeToTarget.minutes.toString().padStart(2, '0')}:${timeToTarget.seconds.toString().padStart(2, '0')}`,
      unit: '',
      subtext: series.current.length > 0 ? `Playing ${playIndex}/${series.current.length}` : 'Confidence 94%',
      bgColor: 'bg-[#00D9C0]',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar activeSection="temperature" />

      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-[#081440] h-[70px] border-b border-gray-200">
          <div className="flex items-center justify-between px-8 h-full">
            <h1 className="text-white text-xl font-semibold">Temperature Analysis</h1>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-sm text-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>12:47 AM</span>
              </div>
              <button className="relative p-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-white border border-[#0071CE] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform duration-200">
                <span className="text-[#0071CE] text-sm font-semibold">JD</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0B0B0B] mb-1">Temperature Monitoring Dashboard</h2>
              <p className="text-[#5B6C84] text-sm">Real-time temperature analytics and predictive insights</p>
            </div>

            {/* Top 4 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {metricCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`${card.bgColor} rounded-xl p-6 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 ${cardAnimationClasses[index]}`}
                  style={{ 
                    borderRadius: '14px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    minHeight: '150px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)'
                    e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  <h3 className="text-white text-sm font-medium mb-3">{card.title}</h3>
                  <p className="text-white text-3xl font-bold mb-1">
                    {card.value}<span className="text-xl ml-1">{card.unit}</span>
                  </p>
                  <p className="text-white text-xs opacity-80">{card.subtext}</p>
                </div>
              ))}
            </div>

            {/* Main Split Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Left: Graph Panel */}
              <div className="bg-white rounded-xl p-6 border-2 border-[#0071CE] shadow-lg hover:shadow-2xl transition-shadow duration-300" style={{ boxShadow: '0 8px 24px rgba(0, 113, 206, 0.15)' }}>
                <div className="mb-4">
                  <h2 className="text-[#0B0B0B] text-lg font-bold mb-1">Temperature Profile — Actual vs Predicted</h2>
                  <p className="text-[#5B6C84] text-sm">Cycle #146 | Updated 12:47 AM</p>
                </div>

                {/* Chart Container */}
                <div className="bg-white rounded-lg h-80 border border-[#E0E3EA] p-4">
                  <div className="flex justify-end mb-2 space-x-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-0.5 bg-[#0071CE] mr-1"></div>
                      <span className="text-[#5B6C84]">Current Data</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-0.5 bg-[#00D9C0] mr-1" style={{ backgroundImage: 'repeating-linear-gradient(to right, #00D9C0 0px, #00D9C0 4px, transparent 4px, transparent 8px)' }}></div>
                      <span className="text-[#5B6C84]">Predicted Cooling</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-0.5 bg-[#FF6B35] mr-1" style={{ backgroundImage: 'repeating-linear-gradient(to right, #FF6B35 0px, #FF6B35 4px, transparent 4px, transparent 8px)' }}></div>
                      <span className="text-[#5B6C84]">Threshold</span>
                    </div>
                  </div>

                  {/* Chart with realistic cooling curve */}
                  <div className="relative w-full h-64">
                    {/* Y-axis with values */}
                    <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between w-12">
                      {series.current.length > 0 ? (
                        // Dynamic Y-axis based on loaded data
                        (() => {
                          const min = Math.min(...series.current);
                          const max = Math.max(...series.current);
                          const range = max - min;
                          const step = range / 6;
                          return [max, max - step, max - 2*step, max - 3*step, max - 4*step, max - 5*step, min].map((temp, i) => (
                            <div key={i} className="flex items-center justify-end">
                              <span className="text-xs text-[#5B6C84] font-medium">{temp.toFixed(1)}</span>
                            </div>
                          ));
                        })()
                      ) : (
                        // Default Y-axis
                        [65, 60, 55, 50, 45, 40, 35].map((temp, i) => (
                          <div key={i} className="flex items-center justify-end">
                            <span className="text-xs text-[#5B6C84] font-medium">{temp}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Grid lines */}
                    <div className="absolute left-12 right-0 top-0 bottom-8 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="border-t border-[#E0E3EA]"></div>
                      ))}
                    </div>
                    
                    {/* Threshold Line (Red Dashed at 35°C) */}
                    <svg key={`threshold-${dataVersion}`} className="absolute left-12 top-0 w-[calc(100%-3rem)] h-[calc(100%-2rem)]" preserveAspectRatio="none">
                      <line
                        x1="0"
                        y1={computeThresholdY(series.current, series.threshold)}
                        x2="100%"
                        y2={computeThresholdY(series.current, series.threshold)}
                        stroke="#FF6B35"
                        strokeWidth="2"
                        strokeDasharray="8,4"
                        opacity="0.7"
                      />
                    </svg>
                    
                    {/* Current Data Line (Blue Solid - Cooling Curve) */}
                    <svg key={`current-${dataVersion}`} className="absolute left-12 top-0 w-[calc(100%-3rem)] h-[calc(100%-2rem)]" preserveAspectRatio="none">
                      <path
                        d={series.current.length ? buildPath(series.current) : "M 0,8 Q 15,12 30,18 T 60,28 T 90,35 T 120,40 T 150,43 T 180,45 T 200,46"}
                        fill="none"
                        stroke="#0071CE"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0, 113, 206, 0.3))'
                        }}
                      />
                    </svg>
                    
                    {/* Predicted Cooling Line (Teal Dotted) */}
                    <svg key={`predicted-${dataVersion}`} className="absolute left-12 top-0 w-[calc(100%-3rem)] h-[calc(100%-2rem)]" preserveAspectRatio="none">
                      <path
                        d={series.predicted.length ? buildPath(series.predicted) : "M 200,46 Q 230,48 260,52 T 320,60 T 380,67 T 440,73 T 500,78 T 560,82 T 600,85"}
                        fill="none"
                        stroke="#00D9C0"
                        strokeWidth="3"
                        strokeDasharray="6,6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        opacity="0.85"
                      />
                    </svg>

                    {/* Y-axis label */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
                      <span className="text-xs text-[#5B6C84] font-semibold whitespace-nowrap">Temperature (°C)</span>
                    </div>
                  </div>

                  {/* X-Axis Labels with realistic times */}
                  <div className="flex justify-between text-xs text-[#5B6C84] mt-2 pl-12 pr-0">
                    {series.times.length > 0 ? (
                      // Display actual timestamps from data
                      (() => {
                        const indices = [0, Math.floor(series.times.length * 0.2), Math.floor(series.times.length * 0.4), 
                                       Math.floor(series.times.length * 0.6), Math.floor(series.times.length * 0.8), series.times.length - 1];
                        return indices.map((idx, i) => (
                          <span key={i}>{series.times[idx] || ''}</span>
                        ));
                      })()
                    ) : (
                      // Default labels
                      <>
                        <span>21:30</span>
                        <span>22:00</span>
                        <span>22:30</span>
                        <span>23:00</span>
                        <span>23:30</span>
                        <span>00:00</span>
                      </>
                    )}
                  </div>
                  
                  {/* X-axis label */}
                  <div className="text-center mt-1">
                    <span className="text-xs text-[#5B6C84] font-semibold">Time</span>
                  </div>
                </div>
              </div>

              {/* Right: Digital Display Panel */}
              <div className="bg-white rounded-xl p-6 border-2 border-[#00D9C0] shadow-lg hover:shadow-2xl transition-shadow duration-300" style={{ boxShadow: '0 8px 24px rgba(0, 217, 192, 0.15)' }}>
                <h2 className="text-[#0B0B0B] text-lg font-bold mb-6">Live Temperature Reading</h2>
                
                {/* Combined Digital Display - Time and Temperature Side by Side */}
                <div className="flex justify-center mb-8">
                  <div className="bg-white rounded-xl p-5 shadow-lg border-2 border-[#00D9C0]">
                    <div className="flex items-center justify-center space-x-6">
                      {/* LEFT SIDE: Minutes and Seconds */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-2 mb-2">
                          {/* Minutes */}
                          <div className="flex space-x-1.5">
                            <div className="bg-gray-100 rounded-md w-12 h-14 flex items-center justify-center shadow-sm border border-gray-200">
                              <span className="text-3xl font-bold text-gray-900">{getTimeDigits().minutes[0]}</span>
                            </div>
                            <div className="bg-gray-100 rounded-md w-12 h-14 flex items-center justify-center shadow-sm border border-gray-200">
                              <span className="text-3xl font-bold text-gray-900">{getTimeDigits().minutes[1]}</span>
                            </div>
                          </div>
                          
                          {/* Separator Dots */}
                          <div className="flex flex-col space-y-1.5 pb-1 bg-gray-100 rounded px-1.5 py-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0071CE]"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-[#0071CE]"></div>
                          </div>
                          
                          {/* Seconds */}
                          <div className="flex space-x-1.5">
                            <div className="bg-gray-100 rounded-md w-12 h-14 flex items-center justify-center shadow-sm border border-gray-200">
                              <span className="text-3xl font-bold text-gray-900">{getTimeDigits().seconds[0]}</span>
                            </div>
                            <div className="bg-gray-100 rounded-md w-12 h-14 flex items-center justify-center shadow-sm border border-gray-200">
                              <span className="text-3xl font-bold text-gray-900">{getTimeDigits().seconds[1]}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-around w-full space-x-8">
                          <span className="text-[10px] text-[#5B6C84] font-semibold">MINUTES</span>
                          <span className="text-[10px] text-[#5B6C84] font-semibold">SECONDS</span>
                        </div>
                      </div>

                      {/* Vertical Divider */}
                      <div className="w-px h-16 bg-[#E0E3EA]"></div>

                      {/* RIGHT SIDE: Current Temperature */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center space-x-1.5 mb-2">
                          {/* Temperature Digits */}
                          <div className="flex space-x-1.5">
                            {getTempDigits(currentTemp).map((digit, idx) => (
                              <div key={idx} className="bg-gray-100 rounded-md w-12 h-14 flex items-center justify-center shadow-sm border border-gray-200">
                                <span className="text-3xl font-bold text-[#0071CE]">{digit}</span>
                              </div>
                            ))}
                          </div>
                          {/* Decimal and Unit */}
                          <div className="flex flex-col items-start justify-center bg-gray-100 rounded-md px-2 py-1">
                            <span className="text-2xl font-bold text-[#0071CE]">.{Math.round((currentTemp % 1) * 10)}</span>
                            <span className="text-lg font-semibold text-[#5B6C84]">°C</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#5B6C84] font-semibold">CURRENT TEMP</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Three Mini Info Cards */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white border-2 border-[#0071CE] rounded-lg p-3 flex items-center space-x-3 hover:border-[#005BA3] hover:bg-blue-50 transition-all duration-200 shadow-md" style={{ boxShadow: '0 4px 12px rgba(0, 113, 206, 0.1)' }}>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[#5B6C84]">Δ Since Last Update</p>
                      <p className="text-sm font-bold text-[#0B0B0B]">+0.8 °C</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#FF6B35] rounded-lg p-3 flex items-center space-x-3 hover:border-[#E85A24] hover:bg-orange-50 transition-all duration-200 shadow-md" style={{ boxShadow: '0 4px 12px rgba(255, 107, 53, 0.1)' }}>
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF6B35]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[#5B6C84]">Stabilization ETA</p>
                      <p className="text-sm font-bold text-[#0B0B0B]">≈ 2 h 45 m</p>
                    </div>
                  </div>

                  <div className="bg-white border-2 border-[#00D9C0] rounded-lg p-3 flex items-center space-x-3 hover:border-[#00B89F] hover:bg-teal-50 transition-all duration-200 shadow-md" style={{ boxShadow: '0 4px 12px rgba(0, 217, 192, 0.1)' }}>
                    <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#00D9C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-[#5B6C84]">Model Confidence</p>
                      <p className="text-sm font-bold text-[#0B0B0B]">94 %</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-4">
                  {/* Settings Button */}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setShowSettings(true)}
                      className="cursor-pointer bg-[#7B68EE] hover:bg-[#6A5ACD] text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Temperature Settings</span>
                    </button>
                  </div>

                  {/* View Full Excel Button */}
                  <div className="flex justify-center">
                    <button 
                      onClick={() => setShowExcelModal(true)}
                      className="cursor-pointer bg-[#0071CE] hover:bg-[#005BA3] text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>View Full Excel Report</span>
                    </button>
                  </div>
                  
                  {/* Upload Data Section */}
                  <div className="flex justify-center">
                    <div className="flex flex-col items-center space-y-2">
                      <label className="text-sm font-semibold text-[#0B0B0B]">Upload Data File</label>
                      <div className="relative">
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept=".csv,.xlsx,.xls" 
                          className="hidden" 
                          id="file-upload"
                          onChange={(e) => {
                            console.log('File input changed, files:', e.target.files)
                            handleFileUpload(e.target.files?.[0])
                          }} 
                        />
                        <label 
                          htmlFor="file-upload"
                          className="cursor-pointer bg-[#00D9C0] hover:bg-[#00B89F] text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Choose File (CSV/XLS/XLSX)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section - Performance Insights */}
            <div className="bg-white rounded-xl p-6 border-2 border-[#7B68EE] shadow-lg" style={{ boxShadow: '0 8px 24px rgba(123, 104, 238, 0.15)' }}>
              <h2 className="text-[#0B0B0B] text-xl font-bold mb-6">Performance Insights</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Model Accuracy Chart */}
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-6 border-2 border-[#0071CE] shadow-md" style={{ boxShadow: '0 6px 16px rgba(0, 113, 206, 0.12)' }}>
                  <h3 className="text-[#0B0B0B] text-sm font-semibold mb-4">Model Accuracy Over Time</h3>
                  <div className="h-32 flex items-end justify-between space-x-2">
                    <div className="flex-1 bg-gradient-to-t from-[#0071CE] to-[#00D9C0] rounded-t" style={{ height: '70%' }}>
                      <p className="text-xs text-white text-center mt-1">92%</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-[#0071CE] to-[#00D9C0] rounded-t" style={{ height: '85%' }}>
                      <p className="text-xs text-white text-center mt-1">94%</p>
                    </div>
                    <div className="flex-1 bg-gradient-to-t from-[#0071CE] to-[#00D9C0] rounded-t" style={{ height: '95%' }}>
                      <p className="text-xs text-white text-center mt-1">95%</p>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-[#5B6C84]">
                    <span>Last Hour</span>
                    <span>Now</span>
                    <span>Predicted</span>
                  </div>
                </div>

                {/* Right: Text Summary */}
                <div className="bg-gradient-to-br from-teal-50 to-white rounded-lg p-6 border-2 border-[#00D9C0] shadow-md" style={{ boxShadow: '0 6px 16px rgba(0, 217, 192, 0.12)' }}>
                  <h3 className="text-[#0B0B0B] text-base font-bold mb-4">Automated Analysis</h3>
                  <div className="space-y-3 text-sm leading-relaxed">
                    <p className="text-[#1A1A1A] font-medium">
                      The cooling curve exhibits a <span className="font-bold text-[#0071CE] bg-blue-100 px-1 rounded">smooth exponential decay</span>.
                    </p>
                    <p className="text-[#1A1A1A] font-medium">
                      Model forecasts stabilization near <span className="font-bold text-[#FF6B35] bg-orange-100 px-1 rounded">35 °C</span> within 2 hours.
                    </p>
                    <p className="text-[#1A1A1A] font-medium">
                      Current deviation &lt; ±1.5 °C — system performing <span className="font-bold text-[#00D9C0] bg-teal-100 px-1 rounded">within tolerance</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Excel Data Modal */}
      {showExcelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowExcelModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0071CE] to-[#00D9C0] p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white text-2xl font-bold">Temperature Analysis Report</h2>
                  <p className="text-white text-sm mt-1 opacity-90">
                    File: <span className="font-semibold">{fileName}</span> | 
                    {series.current.length > 0 && (
                      <>
                        {' '}Total Records: <span className="font-semibold">{series.current.length}</span> | 
                        {' '}Time Range: <span className="font-semibold">{series.times[0]} - {series.times[series.times.length - 1]}</span>
                      </>
                    )}
                  </p>
                </div>
                <button 
                  onClick={() => setShowExcelModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body - Excel-like Table */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#0071CE] text-white">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">#</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Timestamp</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Temperature (°C)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Threshold (°C)</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {series.current.length > 0 ? (
                      // Display actual data from Excel file
                      series.current.map((temp, idx) => {
                        const timestamp = series.times[idx] || `Row ${idx + 1}`
                        const threshold = series.threshold
                        const status = temp >= threshold ? 'Normal' : 'Notify'
                        const statusColor = temp >= threshold ? 'bg-[#00D9C0]' : 'bg-[#E94E4E]'
                        
                        return (
                          <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="border border-gray-300 px-4 py-2 text-[#5B6C84] font-medium">{idx + 1}</td>
                            <td className="border border-gray-300 px-4 py-2 text-[#0B0B0B]">{timestamp}</td>
                            <td className="border border-gray-300 px-4 py-2 text-[#0071CE] font-semibold">{temp.toFixed(2)}</td>
                            <td className="border border-gray-300 px-4 py-2 text-[#E94E4E] font-semibold">{threshold.toFixed(1)}</td>
                            <td className="border border-gray-300 px-4 py-2">
                              <span className={`${statusColor} text-white px-3 py-1 rounded-full text-xs font-semibold`}>{status}</span>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      // No data loaded
                      <tr>
                        <td colSpan="5" className="border border-gray-300 px-4 py-8 text-center text-[#5B6C84]">
                          <div className="flex flex-col items-center space-y-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-lg font-semibold">No Data Available</p>
                            <p className="text-sm">Please upload a CSV or Excel file to view the report</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Data Summary */}
              {series.current.length > 0 && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-200">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-[#0B0B0B] font-bold mb-2">📊 Data Summary:</p>
                      <div className="space-y-1 text-xs text-[#5B6C84]">
                        <p>• Total Records: <span className="font-bold text-[#0071CE]">{series.current.length}</span></p>
                        <p>• File Name: <span className="font-bold text-[#0B0B0B]">{fileName}</span></p>
                        <p>• Time Range: <span className="font-bold">{series.times[0]} - {series.times[series.times.length - 1]}</span></p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-[#0B0B0B] font-bold mb-2">🌡️ Temperature Analysis:</p>
                      <div className="space-y-1 text-xs text-[#5B6C84]">
                        <p>• Min: <span className="font-bold text-[#00D9C0]">{Math.min(...series.current).toFixed(2)}°C</span> | Max: <span className="font-bold text-[#FF6B35]">{Math.max(...series.current).toFixed(2)}°C</span></p>
                        <p>• Average: <span className="font-bold text-[#0071CE]">{(series.current.reduce((a,b) => a+b, 0) / series.current.length).toFixed(2)}°C</span></p>
                        <p>• Threshold: <span className="font-bold text-[#E94E4E]">{series.threshold.toFixed(1)}°C</span> | Above: <span className="font-bold text-[#00D9C0]">{series.current.filter(t => t >= series.threshold).length}</span> | Below: <span className="font-bold text-[#E94E4E]">{series.current.filter(t => t < series.threshold).length}</span></p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Export Button */}
              <div className="mt-6 flex justify-end space-x-3">
                <button className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200">
                  Print Report
                </button>
                <button className="cursor-pointer bg-[#00D9C0] hover:bg-[#00B89F] text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Excel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Temperature Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#7B68EE] to-[#0071CE] p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <h2 className="text-white text-xl font-bold">Temperature Settings</h2>
                </div>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Threshold Setting */}
              <div>
                <label className="block text-sm font-bold text-[#0B0B0B] mb-2">
                  Temperature Threshold (°C)
                </label>
                <p className="text-xs text-[#5B6C84] mb-3">
                  Set the minimum acceptable temperature. Readings below this value will trigger a "Notify" status.
                </p>
                <div className="relative">
                  <input 
                    type="number" 
                    step="0.1"
                    value={userThreshold}
                    onChange={(e) => setUserThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#7B68EE] focus:outline-none text-lg font-semibold text-[#0071CE]"
                    placeholder="Enter threshold"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5B6C84] font-semibold">°C</span>
                </div>
              </div>

              {/* Current vs New Threshold */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs font-semibold text-[#0B0B0B] mb-2">Current Settings:</p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-[#5B6C84]">Current Threshold</p>
                    <p className="text-lg font-bold text-[#E94E4E]">{series.threshold.toFixed(1)}°C</p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[#5B6C84]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div>
                    <p className="text-xs text-[#5B6C84]">New Threshold</p>
                    <p className="text-lg font-bold text-[#7B68EE]">{userThreshold.toFixed(1)}°C</p>
                  </div>
                </div>
              </div>

              {/* Status Legend */}
              <div className="bg-gradient-to-r from-teal-50 to-red-50 rounded-lg p-4 border border-gray-200">
                <p className="text-xs font-semibold text-[#0B0B0B] mb-2">🚦 Status Legend:</p>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#00D9C0] text-white px-3 py-1 rounded-full text-xs font-semibold">Normal</span>
                    <span className="text-xs text-[#5B6C84]">Temperature ≥ {userThreshold.toFixed(1)}°C (Above/Equal)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-[#E94E4E] text-white px-3 py-1 rounded-full text-xs font-semibold">Notify</span>
                    <span className="text-xs text-[#5B6C84]">Temperature &lt; {userThreshold.toFixed(1)}°C (Below - Action Required!)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={() => setShowSettings(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button 
                onClick={handleThresholdUpdate}
                className="px-6 py-2 bg-[#7B68EE] hover:bg-[#6A5ACD] text-white font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Apply Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Preview Modal */}
      {showUploadPreview && previewData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0071CE] to-[#00D9C0] text-white px-6 py-5 rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Confirm File Upload</span>
              </h2>
              <p className="text-blue-100 text-sm mt-1">Review parsed data before applying to graph and report</p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* File Info */}
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl p-5 border-2 border-[#0071CE]">
                <div className="flex items-center space-x-3 mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-[#0B0B0B]">File Information</h3>
                </div>
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#5B6C84] font-semibold">Filename:</span>
                    <span className="text-sm font-bold text-[#0071CE]">{previewData.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#5B6C84] font-semibold">File Type:</span>
                    <span className="text-sm font-bold text-[#0B0B0B]">{previewData.fileName.endsWith('.csv') ? 'CSV' : 'Excel (XLS/XLSX)'}</span>
                  </div>
                </div>
              </div>

              {/* Parsed Data Statistics */}
              <div className="bg-white rounded-xl p-5 border-2 border-[#00D9C0] shadow-md">
                <div className="flex items-center space-x-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#00D9C0]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <h3 className="text-lg font-bold text-[#0B0B0B]">Parsed Data Summary</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs text-[#5B6C84] font-semibold mb-1">Data Points</p>
                    <p className="text-2xl font-bold text-[#0071CE]">{previewData.stats.dataPoints}</p>
                    <p className="text-xs text-[#5B6C84] mt-1">rows parsed</p>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs text-[#5B6C84] font-semibold mb-1">Time Range</p>
                    <p className="text-sm font-bold text-[#FF6B35]">{previewData.stats.timeRange}</p>
                  </div>
                  
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <p className="text-xs text-[#5B6C84] font-semibold mb-1">Min Temperature</p>
                    <p className="text-2xl font-bold text-[#E94E4E]">{previewData.stats.min.toFixed(2)}°C</p>
                  </div>
                  
                  <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                    <p className="text-xs text-[#5B6C84] font-semibold mb-1">Max Temperature</p>
                    <p className="text-2xl font-bold text-[#00D9C0]">{previewData.stats.max.toFixed(2)}°C</p>
                  </div>
                  
                  <div className="col-span-2 bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs text-[#5B6C84] font-semibold mb-1">Average Temperature</p>
                    <p className="text-2xl font-bold text-[#7B68EE]">{previewData.stats.avg.toFixed(2)}°C</p>
                  </div>
                </div>
              </div>

              {/* Warning Message */}
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-yellow-800 mb-1">⚠️ Important Notice</p>
                    <p className="text-sm text-yellow-700">
                      Clicking "Apply Data" will <span className="font-bold">immediately replace</span> the current graph and report with this new data. 
                      The previous data will be overwritten.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button 
                onClick={cancelUploadPreview}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Cancel</span>
              </button>
              <button 
                onClick={confirmUploadData}
                className="px-6 py-3 bg-gradient-to-r from-[#0071CE] to-[#00D9C0] hover:from-[#005BA3] hover:to-[#00B89F] text-white font-semibold rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Apply Data & Update Graph</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
