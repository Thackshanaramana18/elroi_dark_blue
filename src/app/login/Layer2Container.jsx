export default function Layer2Container({ children }) {
  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-3xl shadow-2xl overflow-hidden">
      <div className="flex w-full h-full">
        {children}
      </div>
    </div>
  )
}