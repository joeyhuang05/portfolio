import { useState } from 'react'
import { Navbar } from './components/Navbar/Navbar.jsx'
// import './App.css'

const BG_BY_KEY = {
  sunrise: 'bg-blue-900',
  midday: 'bg-sky-800',
  sunset: 'bg-rose-900',
  midnight: 'bg-slate-900',
};

function App() {
  const [bgKey, setBgKey] = useState('sunrise')

  return (
    <div className={`${BG_BY_KEY[bgKey] ?? 'bg-neutral-900'} min-h-screen`}>
      <Navbar bgKey={bgKey} onSelect={setBgKey} />
      <main className="min-h-screen grid place-items-center text-white">
        <h1 className="text-4xl font-bold">Placeholder Main Content</h1>
      </main>
    </div>
  )
}

export default App