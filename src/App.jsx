import { useState } from 'react'
import { Navbar } from './components/Navbar/Navbar.jsx'
// import './App.css'

function App() {
  const [bgKey, setBgKey] = useState('sunrise')

  return (
    <div className={"min-h-screen"}>
      <Navbar value={bgKey} onSelect={setBgKey} />
      <main className="grid place-items-center text-white">
        <h1 className="text-4xl font-bold">Placeholder Main Content</h1>
      </main>
    </div>
  )
}

export default App