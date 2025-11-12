export default function SplitBackground() {
  return (
    <div className="fixed inset-0 flex w-full h-screen">
      {/* Left 50%: dark blue gradient */}
      <div 
        className="w-1/2"
        style={{
          background: 'linear-gradient(135deg, #050A24 0%, #0b1138 100%)'
        }}
      ></div>
      
      {/* Right 50%: pure white */}
      <div className="w-1/2 bg-white"></div>
    </div>
  )
}