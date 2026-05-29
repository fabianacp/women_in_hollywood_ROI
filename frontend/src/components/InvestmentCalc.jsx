import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import PlotlyModule from 'react-plotly.js'
const Plot = PlotlyModule.default ?? PlotlyModule

const ACTRESSES = [
  'Meryl Streep','Nicole Kidman','Margot Robbie','Cate Blanchett',
  'Charlize Theron','Sydney Sweeney','Ana de Armas','Zendaya',
  'Jennifer Lawrence','Scarlett Johansson','Emma Stone','Sandra Bullock',
  'Angelina Jolie','Anne Hathaway','Demi Moore',
]

const GENRES  = ['Action','Animation','Biopic','Comedy','Drama','Fantasy','Horror','Musical','Mystery','Romance','Sci-Fi','Thriller']
const SOURCES = ['Original','Adaptation','IP']
const ROLES   = ['Lead','Supporting','Voice','Produced']

export default function InvestmentCalc({ actresses }) {
  const [form, setForm]     = useState({ budget_m: 100, year: 2025, actress: 'Margot Robbie', genre: 'Drama', source: 'Original', role: 'Lead' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const predict = async () => {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/predict', { ...form, budget_m: Number(form.budget_m), year: Number(form.year) })
      setResult(data)
    } catch {
      setResult({ error: 'Model not loaded — run src/train.py first.' })
    }
    setLoading(false)
  }

  // Bar chart — $5M return per actress from historical data
  const barData = actresses ? [{
    type: 'bar',
    x: actresses.map(a => a.actress),
    y: actresses.map(a => a.return_5m),
    marker: {
      color: actresses.map(a => a.return_5m > 5 ? '#b5ead7' : '#f4afa8'),
      line: { color: '#0d0d1a', width: 1 },
    },
    text: actresses.map(a => `$${a.return_5m.toFixed(1)}M`),
    textposition: 'outside',
    textfont: { color: '#f0e6d3', size: 12 },
  }] : []

  const barLayout = {
    paper_bgcolor: '#ffffff', plot_bgcolor: '#f9f5ef',
    font: { color: '#1a1a2e', size: 12 },
    margin: { t: 20, b: 120, l: 60, r: 20 },
    xaxis: { tickangle: -35, gridcolor: '#e8e0d4', tickfont: { size: 11 } },
    yaxis: { title: 'Expected Return ($M)', gridcolor: '#e8e0d4' },
    shapes: [{ type: 'line', x0: -0.5, x1: actresses?.length - 0.5, y0: 5, y1: 5, line: { color: '#c0705566', dash: 'dot', width: 2 } }],
    annotations: [{ x: 0, y: 5.3, xref: 'x', yref: 'y', text: '$5M invested', showarrow: false, font: { color: '#f4afa8', size: 11 } }],
    showlegend: false,
  }

  return (
    <section id="investment" className="section">
      <h2 className="section-title">The $5M Investment Question</h2>
      <p className="section-sub">
        If you invested $5 million in a film featuring any of these actresses,
        what would you get back? Use the predictor to test any combination,
        or see the historical average below.
      </p>

      <div className="inv-layout">
        {/* Form */}
        <div>
          <div className="form-group">
            <label>Production Budget ($M)</label>
            <input type="number" min="1" value={form.budget_m} onChange={e => set('budget_m', e.target.value)} />
          </div>
          <div className="form-group">
            <label>Actress</label>
            <select value={form.actress} onChange={e => set('actress', e.target.value)}>
              {ACTRESSES.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Genre</label>
            <select value={form.genre} onChange={e => set('genre', e.target.value)}>
              {GENRES.map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Source Material</label>
            <select value={form.source} onChange={e => set('source', e.target.value)}>
              {SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => set('role', e.target.value)}>
              {ROLES.map(r => <option key={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Year</label>
            <input type="number" min="2020" max="2030" value={form.year} onChange={e => set('year', e.target.value)} />
          </div>
          <button className="predict-btn" onClick={predict} disabled={loading}>
            {loading ? 'Predicting…' : 'Predict ROI'}
          </button>
        </div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="result"
              className="result-box"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {result.error ? (
                <p style={{ color: '#f4afa8' }}>{result.error}</p>
              ) : (
                <>
                  <motion.div
                    className="result-roi"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {result.predicted_roi.toFixed(1)}x
                  </motion.div>
                  <div className="result-label">predicted ROI</div>
                  <div className="result-grid">
                    <motion.div className="result-stat-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                      <div className="result-stat-val">${result.predicted_gross_m.toFixed(0)}M</div>
                      <div className="result-stat-lbl">predicted worldwide gross</div>
                    </motion.div>
                    <motion.div className="result-stat-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                      <div className="result-stat-val">${result.investment_return_5m.toFixed(1)}M</div>
                      <div className="result-stat-lbl">$5M investment returns</div>
                    </motion.div>
                    <motion.div className="result-stat-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                      <div className="result-stat-val" style={{ color: result.investment_profit_5m >= 0 ? '#b5ead7' : '#f4afa8' }}>
                        {result.investment_profit_5m >= 0 ? '+' : ''}${result.investment_profit_5m.toFixed(1)}M
                      </div>
                      <div className="result-stat-lbl">profit on $5M</div>
                    </motion.div>
                    <motion.div className="result-stat-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      <div className="result-stat-val" style={{ color: result.investment_profit_5m >= 0 ? '#b5ead7' : '#f4afa8' }}>
                        {result.investment_profit_5m >= 0 ? 'PROFITABLE' : 'LOSS'}
                      </div>
                      <div className="result-stat-lbl">verdict</div>
                    </motion.div>
                  </div>
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className="result-box"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 280, color: '#333' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              ← Fill in the form and hit Predict
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Historical $5M bar chart */}
      {actresses?.length > 0 && (
        <motion.div
          style={{ marginTop: 56 }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
            Historical average — $5M invested returns
          </p>
          <Plot data={barData} layout={barLayout} config={{ displayModeBar: false }} style={{ width: '100%', height: 360 }} />
        </motion.div>
      )}
    </section>
  )
}
