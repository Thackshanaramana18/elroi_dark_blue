import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  id, 
  error, 
  className = '', 
  type = 'text', 
  ...props 
}, ref) => {
  const baseClasses = 'w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563eb]'
  const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-[#94a3b8] focus:border-[#2563eb]'
  const classes = `${baseClasses} ${errorClasses} ${className}`

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-[#0B1630] text-sm font-medium mb-2">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        ref={ref}
        className={classes}
        {...props}
      />
      {error && (
        <p className="mt-1 text-red-600 text-sm">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input