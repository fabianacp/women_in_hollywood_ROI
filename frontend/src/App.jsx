import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

import Hero         from './components/Hero.jsx'
import ActressCards from './components/ActressCards.jsx'
import InvestmentCalc from './components/InvestmentCalc.jsx'
import ScatterPlot3D from './components/ScatterPlot3D.jsx'
import HiddenData   from './components/HiddenData.jsx'
import ModelScores  from './components/ModelScores.jsx'

export default function App() {
  const [actresses, setActresses] = useState([])
  const [films,     setFilms]     = useState([])
  const [scores,    setScores]    = useState([])
  const [studios,   setStudios]   = useState([])
  const [accounting,setAccounting]= useState([])

  useEffect(() => {
    axios.get('/api/actresses').then(r => setActresses(r.data)).catch(() => {})
    axios.get('/api/films').then(r => setFilms(r.data)).catch(() => {})
    axios.get('/api/model-scores').then(r => setScores(r.data)).catch(() => {})
    axios.get('/api/studios').then(r => setStudios(r.data)).catch(() => {})
    axios.get('/api/accounting').then(r => setAccounting(r.data)).catch(() => {})
  }, [])

  return (
    <>
      {/* Fixed nav */}
      <nav className="nav">
        <a href="#top" className="nav-logo">Women in Hollywood ROI</a>
        <a href="#actresses">Actresses</a>
        <a href="#investment">Invest $5M</a>
        <a href="#scatter">3D Chart</a>
        <a href="#hidden">Hidden Data</a>
        <a href="#model">Model</a>
      </nav>

      <div id="top">
        <Hero actresses={actresses} />
      </div>

      <hr className="divider" />
      <ActressCards actresses={actresses} />

      <hr className="divider" />
      <InvestmentCalc actresses={actresses} />

      <hr className="divider" />
      <ScatterPlot3D films={films} />

      <hr className="divider" />
      <HiddenData studios={studios} accounting={accounting} />

      <hr className="divider" />
      <ModelScores scores={scores} />

      <footer style={{ textAlign: 'center', padding: '32px', color: '#333', fontSize: '0.82rem', borderTop: '1px solid #1e1e3a' }}>
        NOD Coding Stockholm · Data: Variety, Deadline, Hollywood Reporter, SEC EDGAR · FY1990–2024
      </footer>
    </>
  )
}
