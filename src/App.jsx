import { useState } from 'react'
import { Navbar } from './components/Navbar/Navbar.jsx'
import Hero from './components/Hero/Hero.jsx'
// import './App.css'

import sunriseImg from "./images/sunrise.png"
import middayImg from "./images/midday.png"
import sunsetImg from "./images/sunset.png"
import midnightImg from "./images/midnight.png"

function App() {
  const [bgKey, setBgKey] = useState('sunrise')
  const BG_OPTIONS = [
      { key: "sunrise", label: "Sunrise", swatch: "#DCE8F9", src: sunriseImg, textColor: "#111C2F"},
      { key: "midday", label: "Day", swatch: "#A8D9D1", src: middayImg, textColor: "#0C1A0C"},
      { key: "sunset", label: "Sunset", swatch: "#9D6BC9", src: sunsetImg, textColor: "#fff"},
      { key: "midnight", label: "Night", swatch: "#383838", src: midnightImg, textColor: "#fff"}
  ]

  const active = BG_OPTIONS.find(o => o.key === bgKey) || BG_OPTIONS[0];
  const navTextColor = active.textColor;

  return (
    <div className={"min-h-screen relative"}>
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${active.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <div className="relative z-10">
        <Navbar value={bgKey} onSelect={setBgKey} />
        <Hero fillColor={navTextColor} replayKey={bgKey} />
        <main className="grid place-items-center text-white">
          <h1 className="text-4xl font-bold">Placeholder Main Content</h1>
        </main>
      </div>
    </div>
  )
}

export default App