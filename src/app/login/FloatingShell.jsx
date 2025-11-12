export default function FloatingShell({ children }) {
  return (
    <div 
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1100px] max-w-[90vw] h-auto z-20 bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      {children}
    </div>
  )
}