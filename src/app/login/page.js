'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import ShaderBackground from '@/components/ui/shader-background'
import Image from 'next/image'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [alternateEmail, setAlternateEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loginIdentifier, setLoginIdentifier] = useState('') // For email or phone
  const [showPassword, setShowPassword] = useState(false)
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [otp, setOtp] = useState('')
  const [verifyPhone, setVerifyPhone] = useState('')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const router = useRouter()

  const handleAuth = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        // Check if loginIdentifier is email or phone
        const isEmail = loginIdentifier.includes('@')
        
        if (isEmail) {
          // Login with email
          const { data, error } = await supabase.auth.signInWithPassword({
            email: loginIdentifier,
            password,
          })
          if (error) throw error
        } else {
          // Login with phone number
          const formattedPhone = loginIdentifier.startsWith('+91') 
            ? loginIdentifier 
            : `+91${loginIdentifier}`
          
          const { data, error } = await supabase.auth.signInWithPassword({
            phone: formattedPhone,
            password,
          })
          if (error) throw error
        }
        
        // Start fade-out transition
        setIsTransitioning(true)
        await new Promise(resolve => setTimeout(resolve, 700))
        router.push('/dashboard')
      } else {
        // Sign up - register with both email and phone
        const formattedPhone = phoneNumber.startsWith('+91') 
          ? phoneNumber 
          : `+91${phoneNumber}`
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          phone: formattedPhone,
          options: {
            data: {
              full_name: name,
              alternate_email: alternateEmail,
            }
          }
        })
        if (error) throw error
        
        // Show OTP verification for phone sign-up
        setShowOtp(true)
        setVerifyPhone(formattedPhone)
        setError('Enter the 6-digit OTP sent to your phone to verify')
      }
    } catch (error) {
      setError(error.message)
      setIsTransitioning(false)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: verifyPhone,
        token: otp,
        type: 'sms',
      })
      if (error) throw error
      
      // OTP verified successfully, start transition and redirect to dashboard
      setIsTransitioning(true)
      await new Promise(resolve => setTimeout(resolve, 700))
      router.push('/dashboard')
    } catch (error) {
      setError(error.message)
      setIsTransitioning(false)
    } finally {
      setLoading(false)
    }
  }

  const resendOtp = async () => {
    try {
      const { error } = await supabase.auth.resend({ 
        type: 'sms', 
        phone: verifyPhone 
      })
      if (error) throw error
      setError('OTP resent to your phone')
    } catch (error) {
      setError(error.message)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (error) throw error
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className={`w-full h-screen relative overflow-hidden transition-opacity duration-700 ease-in-out ${
      isTransitioning ? 'opacity-0' : 'opacity-100'
    }`}>
      {/* Animated Shader Background */}
      <ShaderBackground />
      
      {/* Centered Login Container */}
      <div className="flex items-center justify-center min-h-screen p-4 relative z-10">
        {/* Ultra Compact Login Card */}
        <div className="w-full max-w-[380px]">
          <div className="bg-white/98 backdrop-blur-xl rounded-2xl overflow-hidden" 
               style={{ 
                 boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 0 30px rgba(0, 113, 206, 0.12)',
                 border: '1px solid rgba(255,255,255,0.9)',
                 maxHeight: '90vh',
                 overflowY: 'auto'
               }}>
            
            {/* Mini Header */}
            <div className="bg-gradient-to-r from-[#0071CE]/8 via-[#00B4D8]/8 to-[#0071CE]/8 px-6 text-center border-b border-gray-100" 
                 style={{ paddingTop: isLogin ? '20px' : '12px', paddingBottom: isLogin ? '20px' : '12px' }}>
              <div className="inline-flex items-center justify-center" style={{ marginBottom: isLogin ? '8px' : '6px' }}>
                <Image 
                  src="/logo.png" 
                  alt="ELROI Logo" 
                  width={isLogin ? 80 : 60} 
                  height={isLogin ? 80 : 60}
                  className="object-contain transition-all duration-300"
                />
              </div>
              {isLogin && (
                <>
                  <h1 className="text-xl font-bold text-[#060F30] mb-1">
                    Welcome Back
                  </h1>
                  <p className="text-[10px] text-[#060F30] font-semibold">Sign in to your dashboard</p>
                </>
              )}
            </div>

            {/* Compact Form Content */}
            <div className="px-6 py-4">
              
              {/* Mini Tab Toggle */}
              <div className="flex gap-1.5 mb-4">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all duration-300 cursor-pointer ${
                    isLogin 
                      ? 'bg-[#071135] text-white shadow-md shadow-[#071135]/25 scale-[0.98]' 
                      : 'bg-gray-100 text-[#060F30] hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  Log In
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold text-xs transition-all duration-300 cursor-pointer ${
                    !isLogin 
                      ? 'bg-[#071135] text-white shadow-md shadow-[#071135]/25 scale-[0.98]' 
                      : 'bg-gray-100 text-[#060F30] hover:bg-gray-200 active:scale-95'
                  }`}
                >
                  Sign Up
                </button>
              </div>

              {/* Mini Form */}
              <form onSubmit={handleAuth} className={isLogin ? "space-y-4" : "space-y-3"}>
                
                {/* Name - Only for Sign Up */}
                {!isLogin && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300">
                    <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-sm text-[#060F30] placeholder:text-[#9CA3AF]"
                      required
                    />
                  </div>
                )}

                {/* Email or Phone - Login Mode */}
                {isLogin ? (
                  <div>
                    <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide mb-1.5">
                      Email or Phone Number
                    </label>
                    <input
                      type="text"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder="email@company.com or 9876543210"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-sm text-[#060F30] placeholder:text-[#9CA3AF]"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide mb-1.5">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@company.com"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-sm text-[#060F30] placeholder:text-[#9CA3AF]"
                      required
                    />
                  </div>
                )}

                {/* Alternate Email - Only for Sign Up */}
                {!isLogin && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 delay-75">
                    <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide mb-1.5">
                      Alternate Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={alternateEmail}
                      onChange={(e) => setAlternateEmail(e.target.value)}
                      placeholder="alternate@company.com"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-sm text-[#060F30] placeholder:text-[#9CA3AF]"
                    />
                  </div>
                )}

                {/* Phone Number - Only for Sign Up */}
                {!isLogin && (
                  <div className="animate-in slide-in-from-top-2 fade-in duration-300 delay-150">
                    <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide mb-1.5">
                      Phone Number (India)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#060F30] font-medium">+91</span>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 10)
                          setPhoneNumber(value)
                        }}
                        placeholder="9876543210"
                        className="w-full pl-12 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-sm text-[#060F30] placeholder:text-[#9CA3AF]"
                        required
                        maxLength="10"
                        pattern="[0-9]{10}"
                      />
                    </div>
                    <p className="text-[10px] text-[#5B6C84] mt-1">10-digit Indian mobile number</p>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide">
                      Password
                    </label>
                    {isLogin && (
                      <button
                        type="button"
                        className="text-xs text-[#0071CE] hover:text-[#00B4D8] font-bold transition-colors cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full px-3 py-2.5 pr-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-sm text-[#060F30] placeholder:text-[#9CA3AF]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#0071CE] transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show-password"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#0071CE] border-gray-300 rounded focus:ring-[#0071CE]"
                  />
                  <label htmlFor="show-password" className="ml-2 text-xs text-[#060F30] cursor-pointer">
                    Show password
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-2 flex items-start space-x-2">
                    <svg className="h-3.5 w-3.5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[10px] text-red-700 font-medium">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#071135] hover:bg-[#0A1850] text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 text-sm shadow-lg shadow-[#071135]/25 hover:shadow-xl hover:shadow-[#071135]/35 transform hover:-translate-y-0.5 active:scale-95 active:translate-y-0 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-xs">Processing...</span>
                    </span>
                  ) : (
                    <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                  )}
                </button>
              </form>

              {/* OTP Verification - Only shown after phone sign-up */}
              {showOtp && (
                <div className="mt-4 p-4 bg-blue-50 border-2 border-[#0071CE] rounded-lg space-y-3 animate-in slide-in-from-top-2 fade-in duration-300">
                  <div className="flex items-center space-x-2 mb-2">
                    <svg className="h-5 w-5 text-[#0071CE]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h3 className="text-sm font-bold text-[#060F30]">Verify Your Phone Number</h3>
                  </div>
                  
                  <p className="text-xs text-[#5B6C84]">Enter the 6-digit OTP sent to <span className="font-bold text-[#060F30]">{verifyPhone}</span></p>
                  
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#060F30] uppercase tracking-wide mb-1.5">
                        OTP Code
                      </label>
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="123456"
                        maxLength={6}
                        pattern="[0-9]{6}"
                        className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0071CE] focus:bg-white focus:ring-2 focus:ring-[#0071CE]/20 transition-all text-lg text-center tracking-widest font-bold text-[#060F30] placeholder:text-[#9CA3AF]"
                        required
                      />
                      <p className="text-[10px] text-[#5B6C84] mt-1">Enter the 6-digit code</p>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="flex-1 bg-[#071135] hover:bg-[#0A1850] text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm shadow-lg shadow-[#071135]/25 hover:shadow-xl hover:shadow-[#071135]/35 transform hover:-translate-y-0.5 active:scale-95 cursor-pointer"
                      >
                        {loading ? 'Verifying...' : 'Verify OTP'}
                      </button>
                      <button
                        type="button"
                        onClick={resendOtp}
                        disabled={loading}
                        className="bg-white hover:bg-gray-50 border-2 border-[#0071CE] text-[#0071CE] hover:text-[#00B4D8] font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-xs shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50"
                      >
                        Resend OTP
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Divider */}
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-2 bg-white text-[#9CA3AF] font-medium text-[10px] uppercase tracking-wider">Or</span>
                </div>
              </div>

              {/* Google Button */}
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 hover:border-[#0071CE] text-[#060F30] font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 text-xs shadow-sm hover:shadow-md cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Footer Link */}
              <div className="mt-3 text-center">
                <p className="text-xs text-[#060F30]">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-1 text-[#0071CE] hover:text-[#00B4D8] font-bold transition-colors cursor-pointer"
                  >
                    {isLogin ? 'Sign Up' : 'Log In'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}