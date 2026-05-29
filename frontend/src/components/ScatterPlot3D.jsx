import { motion } from 'framer-motion'
import PlotlyModule from 'react-plotly.js'
const Plot = PlotlyModule.default ?? PlotlyModule

const PALETTE = {
  'Meryl Streep':'#f4afa8','Nicole Kidman':'#d4aa70','Margot Robbie':'#a8d8ea',
  'Cate Blanchett':'#b5ead7','Charlize Theron':'#c7b8ea','Sydney Sweeney':'#ffd6a5',
  'Ana de Armas':'#f0e6d3','Zendaya':'#ff9aa2','Jennifer Lawrence':'#ffb7b2',
  'Scarlett Johansson':'#e2f0cb','Emma Stone':'#c9c9ff','Sandra Bullock':'#ffdac1',
  'Angelina Jolie':'#b5ead7','Anne Hathaway':'#f8c8d4','Demi Moore':'#d4c5f9',
}

export default function ScatterPlot3D({ films }) {
  if (!films?.length) return null

  // One trace per actress so legend is clean
  const actresses = [...new Set(films.map(f => f.actress))]

  const traces = actresses.map(actress => {
    const subset = films.filter(f => f.actress === actress)
    return {
      type: 'scatter3d',
      name: actress,
      x: subset.map(f => f.budget_m),
      y: subset.map(f => f.worldwide_gross_m),
      z: subset.map(f => f.roi),
      mode: 'markers',
      marker: {
        size: subset.map(f => Math.max(4, Math.min(18, f.roi * 2))),
        color: PALETTE[actress] ?? '#aaa',
        opacity: 0.85,
        line: { color: '#0d0d1a', width: 0.5 },
      },
      text: subset.map(f => `${f.title} (${f.year})<br>Budget: $${f.budget_m}M<br>Gross: $${f.worldwide_gross_m}M<br>ROI: ${f.roi.toFixed(1)}x`),
      hovertemplate: '%{text}<extra></extra>',
    }
  })

  const layout = {
    paper_bgcolor: '#f5f0e8',
    scene: {
      bgcolor: '#f9f5ef',
      xaxis: { title: '', color: '#555', gridcolor: '#ddd6cc', tickfont: { size: 11 }, ticklen: 10 },
      yaxis: { title: '', color: '#555', gridcolor: '#ddd6cc', tickfont: { size: 11 }, ticklen: 10 },
      zaxis: { title: '', color: '#555', gridcolor: '#ddd6cc', tickfont: { size: 11 }, ticklen: 10 },
    },
    font: { color: '#1a1a2e', size: 13 },
    legend: {
      font: { size: 14 },
      bgcolor: '#ffffff',
      bordercolor: '#ddd6cc',
      borderwidth: 1,
      itemsizing: 'constant',
      itemwidth: 40,
      tracegroupgap: 6,
    },
    margin: { t: 10, b: 10, l: 10, r: 160 },
  }

  return (
    <section id="scatter" className="section">
      <h2 className="section-title">Budget vs Gross vs ROI — 3D Chart</h2>
      <p className="section-sub" style={{ textAlign: 'center', maxWidth: '100%' }}>
        Drag to rotate · scroll to zoom · hover any dot for film details.
      </p>
      <p className="section-sub" style={{ textAlign: 'center', maxWidth: '100%', marginTop: '-24px' }}>
        Bubble size = ROI (the bigger the dot, the better the return).
      </p>

      {/* Axis legend */}
      <div style={{ display: 'flex', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { axis: 'X axis', label: 'Production Budget ($M)', desc: 'How much it cost to make the film' },
          { axis: 'Y axis', label: 'Worldwide Gross ($M)', desc: 'Total box office earned globally' },
          { axis: 'Z axis', label: 'ROI — Return on Investment', desc: 'Gross ÷ Budget. A 3x ROI means every $1 invested returned $3' },
        ].map(({ axis, label, desc }) => (
          <div key={axis} style={{ background: '#fff', borderRadius: 8, padding: '12px 18px', border: '1px solid #ddd6cc', flex: '1', minWidth: 200 }}>
            <div style={{ fontSize: '0.75rem', color: '#f4afa8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{axis}</div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: '0.83rem', color: '#888' }}>{desc}</div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <Plot
          data={traces}
          layout={layout}
          config={{ displayModeBar: false }}
          style={{ width: '100%', height: 600 }}
        />
      </motion.div>
    </section>
  )
}
