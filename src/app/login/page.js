import SplitBackground from './SplitBackground'
import Layer2Container from './Layer2Container'
import Layer2Left from './Layer2Left'
import Layer2Right from './Layer2Right'
import LoginPanel from './LoginPanel'

export default function LoginPage() {
  return (
    <div className="w-full h-screen relative">
      <SplitBackground />
      <Layer2Container>
        <Layer2Left />
        <Layer2Right>
          <LoginPanel />
        </Layer2Right>
      </Layer2Container>
    </div>
  )
}