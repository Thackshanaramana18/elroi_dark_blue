export default function Card({ 
  children, 
  className = '',
  shadow = true,
  rounded = 'xl',
  ...props 
}) {
  const baseClasses = 'bg-white'
  const shadowClasses = shadow ? 'shadow-md' : ''
  const roundedClasses = `rounded-${rounded}`
  
  const classes = `${baseClasses} ${shadowClasses} ${roundedClasses} ${className}`

  return (
    <div className={classes} {...props}>
      {children}
    </div>
  )
}