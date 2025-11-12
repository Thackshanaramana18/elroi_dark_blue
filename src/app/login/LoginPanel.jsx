'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { GoogleRippleButton } from '@/components/ui/google-ripple-button'

export default function LoginPanel() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      // For demo purposes, we'll redirect to dashboard after signup
      // In a real app, you might want to show a confirmation message
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
    }
  }

  const toggleMode = (mode) => {
    setIsSignUp(mode === 'signup')
    setError('')
  }

  return (
    <div className="bg-white flex flex-col space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-[1.7rem] font-bold text-slate-900 leading-tight">Welcome Back</h1>
        <p className="text-[0.92rem] text-slate-600 mt-2 leading-relaxed">
          {isSignUp ? 'Sign up to get started' : 'Sign in to continue to your dashboard'}
        </p>
      </div>

      {/* Toggle bar */}
      <div className="flex bg-slate-100 rounded-md overflow-hidden rounded">
        <button 
          onClick={() => toggleMode('signup')}
          className={`w-1/2 py-1.5 text-sm font-medium cursor-pointer transition-colors duration-200 ${isSignUp ? 'text-white bg-[#1e3a8a]' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          Sign up
        </button>
        <button 
          onClick={() => toggleMode('login')}
          className={`w-1/2 py-1.5 text-sm font-medium cursor-pointer transition-colors duration-200 ${!isSignUp ? 'text-white bg-[#1e3a8a]' : 'text-slate-600 hover:bg-slate-200'}`}
        >
          Log in
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100">
          {error}
        </div>
      )}

      {/* Form fields */}
      <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="flex flex-col space-y-3">
        {/* Email */}
        <div>
          <label className="text-xs font-semibold text-slate-700 tracking-wide">
            EMAIL ADDRESS
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3.5 py-2.5 mt-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 text-[0.95rem]"
            placeholder="you@company.com"
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="text-xs font-semibold text-slate-700 tracking-wide flex justify-between">
            <span>PASSWORD</span>
            {!isSignUp && (
              <a href="#" className="text-blue-600 text-xs hover:underline font-medium">FORGOT PASSWORD?</a>
            )}
          </label>
          <div className="relative mt-1.5">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-300 rounded-md px-3.5 py-2.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-400 pr-9 text-[0.95rem]"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                  <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Checkbox */}
        {!isSignUp && (
          <div className="flex items-center gap-1.5">
            <input
              id="showPassword"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="w-3.5 h-3.5 accent-blue-600 rounded focus:ring-blue-400 border-slate-300"
            />
            <label htmlFor="showPassword" className="text-xs text-slate-600">
              Show password
            </label>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          className="w-full bg-white border-2 border-[#1e3a8a] text-[#1e3a8a] py-2.5 rounded-md font-semibold hover:bg-[#1e3a8a] hover:text-white transition duration-200 cursor-pointer text-[0.95rem]"
        >
          {isSignUp ? 'Create Account' : 'Sign In'}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center">
        <div className="flex-grow border-t border-slate-200"></div>
        <span className="mx-3 text-xs font-medium text-slate-500 uppercase tracking-wide">OR CONTINUE WITH</span>
        <div className="flex-grow border-t border-slate-200"></div>
      </div>

      {/* Google button */}
      <GoogleRippleButton onClick={handleGoogleLogin} />

      {/* Footer */}
      <div className="text-center">
        <p className="text-xs text-slate-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => toggleMode(isSignUp ? 'login' : 'signup')}
            className="text-blue-600 font-medium hover:underline relative group cursor-pointer"
          >
            {isSignUp ? 'SIGN IN' : 'SIGN UP'}
            {/* Ripple effect for the signup/login text */}
            <span className="absolute inset-0 rounded bg-blue-600/20 scale-0 opacity-0 transition-all duration-300 group-active:scale-125 group-active:opacity-100"></span>
          </button>
        </p>
      </div>
    </div>
  )
}