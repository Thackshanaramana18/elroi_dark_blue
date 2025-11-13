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
        setReports(JSON.parse(savedReports))
      } catch (e) {
        console.error('Error loading saved reports:', e)
      }
    }
  }, [router])

  // Handle file upload
  const handleUploadReport = async () => {
    if (!reportName.trim()) {
      alert('Please enter a report name')
      return
    }
    if (!uploadFile) {
      alert('Please select a file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const newReport = {
        id: Date.now(),
        name: reportName,
        parameter: selectedParameter,
        fileName: uploadFile.name,
        uploadDate: new Date().toISOString(),
        fileData: e.target.result
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
    reader.readAsDataURL(uploadFile)
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
    <div className="flex min-h-screen bg-[#F2F4F8]">
      <Sidebar activeSection="reporting" />

      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[#0B1D42] h-[70px] border-b border-gray-200">
          <div className="flex items-center justify-between px-8 h-full">
            <h1 className="text-white text-xl font-bold">Reports Management</h1>
            <div className="flex items-center space-x-6">
              <button className="relative p-2 text-gray-300 hover:text-white transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-white border border-[#1E73BE] flex items-center justify-center">
                  <span className="text-[#1E73BE] text-sm font-semibold">
                    {user?.email?.substring(0, 2).toUpperCase() || 'JD'}
                  </span>
                </div>
                <button 
                  onClick={async () => {
                    await supabase.auth.signOut()
                    router.push('/login')
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
              onClick={() => setShowUploadModal(true)}
              className="bg-[#0071CE] hover:bg-[#005BA3] text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-200 flex items-center space-x-2"
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
                <p className="text-gray-500 text-sm">Upload your first {selectedParameter} report to get started</p>
              </div>
            ) : (
              reports[selectedParameter].map(report => (
                <div key={report.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-[#0B0B0B] mb-1">{report.name}</h3>
                      <p className="text-sm text-gray-500">{report.fileName}</p>
                    </div>
                    <button
                      onClick={() => deleteReport(selectedParameter, report.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(report.uploadDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      {selectedParameter} Data
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingReport(report)}
                    className="w-full bg-[#00D9C0] hover:bg-[#00B89F] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    View Report
                  </button>
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
      {viewingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setViewingReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#0071CE] to-[#00D9C0] p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-white text-2xl font-bold">{viewingReport.name}</h2>
                  <p className="text-white text-sm opacity-90">
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
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">Report data stored. Integration with detailed view coming soon.</p>
              <p className="text-sm text-gray-500">Parameter: {viewingReport.parameter}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
