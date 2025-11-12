export default function Layer2Right({ children }) {
  return (
    <div className="w-1/2 bg-white flex items-center justify-center">
      <div className="w-[70%] max-w-[400px] bg-white py-4 px-5 rounded-xl border border-[rgba(40,90,255,0.15)] shadow-[0_12px_40px_rgba(0,0,0,0.15)] flex flex-col space-y-4">
        {children}
      </div>
    </div>
  )
}