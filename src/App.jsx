import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
// import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen grid place-items-center bg-neutral-900">
      <h1 className="text-4xl font-bold text-sky-500 border-4 border-sky-500 p-4 rounded-lg">
        Hello Tailwind
      </h1>
    </div>
  );
}

export default App
