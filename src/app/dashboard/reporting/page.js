'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Sidebar from '@/components/Sidebar'

export default function ReportingPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const [selectedParameter, setSelectedParameter] = useState('Temperature')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [reportName, setReportName] = useState('')
  const [uploadFile, setUploadFile] = useState(null)
  const [reports, setReports] = useState({
    Temperature: [],
    Pressure: [],
    Humidity: [],
    Vibration: []
  })
  const [viewingReport, setViewingReport] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [expandedCard, setExpandedCard] = useState(null)

  const parameters = ['Temperature', 'Pressure', 'Humidity', 'Vibration']

  // Load saved reports from localStorage on mount
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

    const savedReports = localStorage.getItem('predictive_reports')
    if (savedReports) {
      try {
        const parsed = JSON.parse(savedReports)
        // Remove duplicates - keep only unique files per parameter using file content fingerprint
        const cleaned = {}
        Object.keys(parsed).forEach(param => {
          const uniqueFiles = new Map()
          parsed[param].forEach(report => {
            // Use file content fingerprint (first 3 values + length) as unique key
            const key = report.values && report.values.length > 0 
              ? `${report.fileName}_${report.values.slice(0, 3).join('_')}_${report.dataPoints}`
              : `${report.fileName}_${report.dataPoints}`
            if (!uniqueFiles.has(key)) {
              uniqueFiles.set(key, report)
            }
          })
          cleaned[param] = Array.from(uniqueFiles.values())
        })
        setReports(cleaned)
        // Save cleaned data back
        localStorage.setItem('predictive_reports', JSON.stringify(cleaned))
        console.log('✅ Removed duplicates. Reports:', cleaned)
      } catch (e) {
        console.error('Error loading saved reports:', e)
      }
    }
  }, [router])

  // Handle file upload
  const handleUploadReport = async () => {
    console.log('handleUploadReport called', { reportName, uploadFile })
    
    if (!reportName.trim()) {
      alert('Please enter a report name')
      return
    }
    if (!uploadFile) {
      alert('Please select a file')
      return
    }

    const fileName = uploadFile.name.toLowerCase()
    console.log('Processing file:', fileName)
    
    // Parse Excel file
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      try {
        const buffer = await uploadFile.arrayBuffer()
        const XLSX = await import('xlsx')
        const wb = XLSX.read(buffer, { type: 'array' })
        const sheetName = wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(ws, { defval: '' })
        
        // Extract data
        const times = []
        const values = []
        
        json.forEach(row => {
          const keys = Object.keys(row)
          const timeKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase().includes('time'))
          const valueKey = keys.find(k => k.toLowerCase().includes('temp') || k.toLowerCase().includes('value') || k.toLowerCase().includes('current'))
          
          if (timeKey && valueKey) {
            let timestamp = row[timeKey]
            if (typeof timestamp === 'number') {
              const fractionalDay = timestamp - Math.floor(timestamp)
              const totalMinutes = Math.round(fractionalDay * 24 * 60)
              const hours = Math.floor(totalMinutes / 60)
              const minutes = totalMinutes % 60
              timestamp = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
            }
            times.push(timestamp)
            values.push(parseFloat(row[valueKey]))
          }
        })
        
        const newReport = {
          id: Date.now(),
          name: reportName,
          parameter: selectedParameter,
          fileName: uploadFile.name,
          uploadDate: new Date().toISOString(),
          dataPoints: values.length,
          times: times,
          values: values,
          threshold: 31.7 // Default threshold
        }

        const updatedReports = {
          ...reports,
          [selectedParameter]: [...reports[selectedParameter], newReport]
        }
        
        setReports(updatedReports)
        localStorage.setItem('predictive_reports', JSON.stringify(updatedReports))
        
        setShowUploadModal(false)
        setReportName('')
        setUploadFile(null)
      } catch (error) {
        console.error('Error parsing Excel:', error)
        alert('Error parsing Excel file. Please check the file format.')
      }
    } else if (fileName.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target.result
        const lines = text.split('\n').filter(l => l.trim())
        const headers = lines[0].split(',').map(h => h.trim())
        
        const times = []
        const values = []
        
        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim())
          if (cols.length >= 2) {
            times.push(cols[0])
            values.push(parseFloat(cols[1]))
          }
        }
        
        const newReport = {
          id: Date.now(),
          name: reportName,
          parameter: selectedParameter,
          fileName: uploadFile.name,
          uploadDate: new Date().toISOString(),
          dataPoints: values.length,
          times: times,
          values: values,
          threshold: 31.7
        }

        const updatedReports = {
          ...reports,
          [selectedParameter]: [...reports[selectedParameter], newReport]
        }
        
        setReports(updatedReports)
        localStorage.setItem('predictive_reports', JSON.stringify(updatedReports))
        
        setShowUploadModal(false)
        setReportName('')
        setUploadFile(null)
      }
      reader.readAsText(uploadFile)
    }
  }

  // Delete report
  const deleteReport = (parameter, reportId) => {
    const updatedReports = {
      ...reports,
      [parameter]: reports[parameter].filter(r => r.id !== reportId)
    }
    setReports(updatedReports)
    localStorage.setItem('predictive_reports', JSON.stringify(updatedReports))
  }

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Loading...</div>
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50">
      <Sidebar activeSection="reporting" />

      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1A1F36]">Parameter Reports</h1>
            <p className="text-gray-600 text-sm">Upload and manage multiple reports for each parameter</p>
          </div>

          {/* Parameter Tabs */}
          <div className="flex space-x-2 mb-6 border-b border-gray-200">
            {parameters.map(param => (
              <button
                key={param}
                onClick={() => setSelectedParameter(param)}
                className={`px-6 py-3 font-semibold transition-all duration-200 border-b-2 ${
                  selectedParameter === param
                    ? 'border-[#0071CE] text-[#0071CE] bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-[#0071CE] hover:bg-gray-50'
                }`}
              >
                {param}
                {reports[param].length > 0 && (
                  <span className="ml-2 bg-[#00D9C0] text-white text-xs px-2 py-1 rounded-full">
                    {reports[param].length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Upload Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                console.log('Upload button clicked!')
                setShowUploadModal(true)
              }}
              className="cursor-pointer bg-[#0071CE] hover:bg-[#005BA3] text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Upload New {selectedParameter} Report</span>
            </button>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports[selectedParameter].length === 0 ? (
              <div className="col-span-full text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600 font-semibold text-lg mb-2">No Reports Yet</p>
                <p className="text-gray-500 text-sm">Upload a file in {selectedParameter} page to auto-generate report</p>
              </div>
            ) : (
              reports[selectedParameter].map(report => (
                <div 
                  key={report.id} 
                  className="bg-white rounded-xl border-2 border-gray-200 shadow-md hover:shadow-xl hover:border-[#0071CE] transition-all duration-200 p-6 relative group"
                >
                  {/* Delete Button - Top Right */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm(`Delete "${report.name}"?`)) {
                        deleteReport(selectedParameter, report.id)
                      }
                    }}
                    className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Clickable Card Content */}
                  <div 
                    onClick={() => setExpandedCard(report)}
                    className="cursor-pointer"
                  >
                    {/* Small Card View */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1 pr-8">
                        <h3 className="font-bold text-lg text-[#0B0B0B] mb-1">{report.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{report.fileName}</p>
                      </div>
                    </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(report.uploadDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      {report.values.length} data points
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-[#0071CE] font-semibold flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Click to view full details
                    </p>
                  </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0071CE] to-[#00D9C0] p-6 rounded-t-2xl">
              <h2 className="text-white text-xl font-bold">Upload {selectedParameter} Report</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#0B0B0B] mb-2">Report Name</label>
                <input
                  type="text"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="e.g., Daily Temperature Log - Nov 13"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0071CE] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#0B0B0B] mb-2">Excel File</label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setUploadFile(e.target.files[0])}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-[#0071CE] focus:outline-none"
                />
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadReport}
                className="px-6 py-2 bg-[#0071CE] hover:bg-[#005BA3] text-white font-semibold rounded-lg transition-colors duration-200"
              >
                Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Report Modal */}
      {viewingReport && viewingReport.values && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewingReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0071CE] to-[#00D9C0] p-6 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white text-2xl font-bold">{viewingReport.name}</h2>
                  <p className="text-white text-sm opacity-90 mt-1">
                    File: {viewingReport.fileName} | Uploaded: {new Date(viewingReport.uploadDate).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => setViewingReport(null)}
                  className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Key Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border-2 border-[#0071CE]">
                  <p className="text-sm text-gray-600 mb-1">Total Data Points</p>
                  <p className="text-3xl font-bold text-[#0071CE]">{viewingReport.values.length}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-white rounded-lg p-4 border-2 border-[#00D9C0]">
                  <p className="text-sm text-gray-600 mb-1">Minimum Value</p>
                  <p className="text-3xl font-bold text-[#00D9C0]">{Math.min(...viewingReport.values).toFixed(2)}°</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-4 border-2 border-[#FF6B35]">
                  <p className="text-sm text-gray-600 mb-1">Maximum Value</p>
                  <p className="text-3xl font-bold text-[#FF6B35]">{Math.max(...viewingReport.values).toFixed(2)}°</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border-2 border-[#7B68EE]">
                  <p className="text-sm text-gray-600 mb-1">Average Value</p>
                  <p className="text-3xl font-bold text-[#7B68EE]">{(viewingReport.values.reduce((a,b) => a+b, 0) / viewingReport.values.length).toFixed(2)}°</p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-[#0B0B0B] mb-4">📊 Status Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#00D9C0] text-white px-3 py-1 rounded-full text-sm font-semibold">Normal</span>
                        <span className="text-sm text-gray-600">(≥ {viewingReport.threshold}°C)</span>
                      </div>
                      <span className="text-2xl font-bold text-[#00D9C0]">{viewingReport.values.filter(v => v >= viewingReport.threshold).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#E94E4E] text-white px-3 py-1 rounded-full text-sm font-semibold">Notify</span>
                        <span className="text-sm text-gray-600">(&lt; {viewingReport.threshold}°C)</span>
                      </div>
                      <span className="text-2xl font-bold text-[#E94E4E]">{viewingReport.values.filter(v => v < viewingReport.threshold).length}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Threshold: <span className="font-bold text-[#0B0B0B]">{viewingReport.threshold}°C</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-[#0B0B0B] mb-4">🕒 Time Coverage</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="text-xl font-bold text-[#0071CE]">{viewingReport.times[0]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Time</p>
                      <p className="text-xl font-bold text-[#0071CE]">{viewingReport.times[viewingReport.times.length - 1]}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Parameter: <span className="font-bold text-[#0B0B0B]">{viewingReport.parameter}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border-2 border-[#0071CE] mb-6">
                <h3 className="text-lg font-bold text-[#0B0B0B] mb-4">💡 Key Insights</h3>
                <div className="space-y-3 text-sm">
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Data Range:</span> {viewingReport.parameter} readings range from <span className="font-bold text-[#00D9C0]">{Math.min(...viewingReport.values).toFixed(2)}°C</span> to <span className="font-bold text-[#FF6B35]">{Math.max(...viewingReport.values).toFixed(2)}°C</span>, with a variation of <span className="font-bold">{(Math.max(...viewingReport.values) - Math.min(...viewingReport.values)).toFixed(2)}°C</span>.
                  </p>
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Average Performance:</span> The average {viewingReport.parameter.toLowerCase()} is <span className="font-bold text-[#7B68EE]">{(viewingReport.values.reduce((a,b) => a+b, 0) / viewingReport.values.length).toFixed(2)}°C</span>, which is <span className="font-bold">{(viewingReport.values.reduce((a,b) => a+b, 0) / viewingReport.values.length) >= viewingReport.threshold ? 'above' : 'below'}</span> the threshold of {viewingReport.threshold}°C.
                  </p>
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Status Overview:</span> Out of {viewingReport.values.length} total readings, <span className="font-bold text-[#00D9C0]">{viewingReport.values.filter(v => v >= viewingReport.threshold).length} readings ({((viewingReport.values.filter(v => v >= viewingReport.threshold).length / viewingReport.values.length) * 100).toFixed(1)}%)</span> are within normal range, and <span className="font-bold text-[#E94E4E]">{viewingReport.values.filter(v => v < viewingReport.threshold).length} readings ({((viewingReport.values.filter(v => v < viewingReport.threshold).length / viewingReport.values.length) * 100).toFixed(1)}%)</span> require notification.
                  </p>
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Trend Analysis:</span> The {viewingReport.parameter.toLowerCase()} data shows {(() => {
                      const firstHalf = viewingReport.values.slice(0, Math.floor(viewingReport.values.length / 2))
                      const secondHalf = viewingReport.values.slice(Math.floor(viewingReport.values.length / 2))
                      const avgFirst = firstHalf.reduce((a,b) => a+b, 0) / firstHalf.length
                      const avgSecond = secondHalf.reduce((a,b) => a+b, 0) / secondHalf.length
                      const diff = (avgSecond - avgFirst).toFixed(2)
                      return avgSecond > avgFirst ? `an increasing trend (+${diff}°C)` : avgSecond < avgFirst ? `a decreasing trend (${diff}°C)` : 'a stable trend'
                    })()}, indicating {(() => {
                      const firstHalf = viewingReport.values.slice(0, Math.floor(viewingReport.values.length / 2))
                      const secondHalf = viewingReport.values.slice(Math.floor(viewingReport.values.length / 2))
                      const avgFirst = firstHalf.reduce((a,b) => a+b, 0) / firstHalf.length
                      const avgSecond = secondHalf.reduce((a,b) => a+b, 0) / secondHalf.length
                      return avgSecond > avgFirst ? 'potential warming over time' : avgSecond < avgFirst ? 'gradual cooling over time' : 'consistent performance'
                    })()}.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setViewingReport(null)}
                  className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-[#00D9C0] hover:bg-[#00B89F] text-white font-semibold rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Expanded Card Modal */}
      {expandedCard && expandedCard.values && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setExpandedCard(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#0071CE] to-[#00D9C0] p-6 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white text-2xl font-bold">{expandedCard.name}</h2>
                  <p className="text-white text-sm mt-1 opacity-90">
                    File: {expandedCard.fileName} | Uploaded: {new Date(expandedCard.uploadDate).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteReport(selectedParameter, expandedCard.id)
                      setExpandedCard(null)
                    }}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setExpandedCard(null)}
                    className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Key Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg p-4 border-2 border-[#0071CE]">
                  <p className="text-sm text-gray-600 mb-1">Total Data Points</p>
                  <p className="text-3xl font-bold text-[#0071CE]">{expandedCard.values.length}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-50 to-white rounded-lg p-4 border-2 border-[#00D9C0]">
                  <p className="text-sm text-gray-600 mb-1">Minimum Value</p>
                  <p className="text-3xl font-bold text-[#00D9C0]">{Math.min(...expandedCard.values).toFixed(2)}°</p>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-white rounded-lg p-4 border-2 border-[#FF6B35]">
                  <p className="text-sm text-gray-600 mb-1">Maximum Value</p>
                  <p className="text-3xl font-bold text-[#FF6B35]">{Math.max(...expandedCard.values).toFixed(2)}°</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-4 border-2 border-[#7B68EE]">
                  <p className="text-sm text-gray-600 mb-1">Average Value</p>
                  <p className="text-3xl font-bold text-[#7B68EE]">{(expandedCard.values.reduce((a,b) => a+b, 0) / expandedCard.values.length).toFixed(2)}°</p>
                </div>
              </div>

              {/* Status Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-[#0B0B0B] mb-4">📊 Status Breakdown</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#00D9C0] text-white px-3 py-1 rounded-full text-sm font-semibold">Normal</span>
                        <span className="text-sm text-gray-600">(≥ {expandedCard.threshold}°C)</span>
                      </div>
                      <span className="text-2xl font-bold text-[#00D9C0]">{expandedCard.values.filter(v => v >= expandedCard.threshold).length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="bg-[#E94E4E] text-white px-3 py-1 rounded-full text-sm font-semibold">Notify</span>
                        <span className="text-sm text-gray-600">(&lt; {expandedCard.threshold}°C)</span>
                      </div>
                      <span className="text-2xl font-bold text-[#E94E4E]">{expandedCard.values.filter(v => v < expandedCard.threshold).length}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Threshold: <span className="font-bold text-[#0B0B0B]">{expandedCard.threshold}°C</span></p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-[#0B0B0B] mb-4">🕒 Time Coverage</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Start Time</p>
                      <p className="text-xl font-bold text-[#0071CE]">{expandedCard.times[0]}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">End Time</p>
                      <p className="text-xl font-bold text-[#0071CE]">{expandedCard.times[expandedCard.times.length - 1]}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm text-gray-600">Parameter: <span className="font-bold text-[#0B0B0B]">{expandedCard.parameter}</span></p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Insights */}
              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-6 border-2 border-[#0071CE]">
                <h3 className="text-lg font-bold text-[#0B0B0B] mb-4">💡 Key Insights</h3>
                <div className="space-y-3 text-sm leading-relaxed">
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Data Range:</span> {expandedCard.parameter} readings range from <span className="font-bold text-[#00D9C0]">{Math.min(...expandedCard.values).toFixed(2)}°C</span> to <span className="font-bold text-[#FF6B35]">{Math.max(...expandedCard.values).toFixed(2)}°C</span>, with a variation of <span className="font-bold">{(Math.max(...expandedCard.values) - Math.min(...expandedCard.values)).toFixed(2)}°C</span>.
                  </p>
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Average Performance:</span> The average {expandedCard.parameter.toLowerCase()} is <span className="font-bold text-[#7B68EE]">{(expandedCard.values.reduce((a,b) => a+b, 0) / expandedCard.values.length).toFixed(2)}°C</span>, which is <span className="font-bold">{(expandedCard.values.reduce((a,b) => a+b, 0) / expandedCard.values.length) >= expandedCard.threshold ? 'above' : 'below'}</span> the threshold of {expandedCard.threshold}°C.
                  </p>
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Status Overview:</span> Out of {expandedCard.values.length} total readings, <span className="font-bold text-[#00D9C0]">{expandedCard.values.filter(v => v >= expandedCard.threshold).length} readings ({((expandedCard.values.filter(v => v >= expandedCard.threshold).length / expandedCard.values.length) * 100).toFixed(1)}%)</span> are within normal range, and <span className="font-bold text-[#E94E4E]">{expandedCard.values.filter(v => v < expandedCard.threshold).length} readings ({((expandedCard.values.filter(v => v < expandedCard.threshold).length / expandedCard.values.length) * 100).toFixed(1)}%)</span> require notification.
                  </p>
                  <p className="text-[#0B0B0B]">
                    • <span className="font-semibold">Trend Analysis:</span> The {expandedCard.parameter.toLowerCase()} data shows {(() => {
                      const firstHalf = expandedCard.values.slice(0, Math.floor(expandedCard.values.length / 2))
                      const secondHalf = expandedCard.values.slice(Math.floor(expandedCard.values.length / 2))
                      const avgFirst = firstHalf.reduce((a,b) => a+b, 0) / firstHalf.length
                      const avgSecond = secondHalf.reduce((a,b) => a+b, 0) / secondHalf.length
                      const diff = (avgSecond - avgFirst).toFixed(2)
                      return avgSecond > avgFirst ? `an increasing trend (+${diff}°C)` : avgSecond < avgFirst ? `a decreasing trend (${diff}°C)` : 'a stable trend'
                    })()}, indicating {(() => {
                      const firstHalf = expandedCard.values.slice(0, Math.floor(expandedCard.values.length / 2))
                      const secondHalf = expandedCard.values.slice(Math.floor(expandedCard.values.length / 2))
                      const avgFirst = firstHalf.reduce((a,b) => a+b, 0) / firstHalf.length
                      const avgSecond = secondHalf.reduce((a,b) => a+b, 0) / secondHalf.length
                      return avgSecond > avgFirst ? 'potential warming over time' : avgSecond < avgFirst ? 'gradual cooling over time' : 'consistent performance'
                    })()}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
