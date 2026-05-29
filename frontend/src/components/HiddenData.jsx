import { motion } from 'framer-motion'
import PlotlyModule from 'react-plotly.js'
const Plot = PlotlyModule.default ?? PlotlyModule

export default function HiddenData({ studios, accounting }) {

  // Split into two traces so legend color matches bar fill color
  const majorStudios = studios?.filter(s => s.type === 'Major') ?? []
  const indieStudios  = studios?.filter(s => s.type === 'Indie')  ?? []

  const studioTrace = studios?.length ? [
    {
      type: 'bar', name: 'Major Studio',
      x: majorStudios.map(s => s.studio),
      y: majorStudios.map(s => s.sga_pct_revenue),
      marker: { color: '#f4afa8', line: { color: '#ccc', width: 1 } },
      text: majorStudios.map(s => `${s.sga_pct_revenue.toFixed(1)}%`),
      textposition: 'outside', textfont: { color: '#1a1a2e', size: 12 },
    },
    {
      type: 'bar', name: 'Indie',
      x: indieStudios.map(s => s.studio),
      y: indieStudios.map(s => s.sga_pct_revenue),
      marker: { color: '#a8d8ea', line: { color: '#ccc', width: 1 } },
      text: indieStudios.map(s => `${s.sga_pct_revenue.toFixed(1)}%`),
      textposition: 'outside', textfont: { color: '#1a1a2e', size: 12 },
    },
  ] : []

  const studioLayout = {
    paper_bgcolor: '#ffffff', plot_bgcolor: '#f9f5ef',
    font: { color: '#1a1a2e', size: 12 },
    margin: { t: 20, b: 120, l: 60, r: 20 },
    xaxis: { tickangle: -30, gridcolor: '#e8e0d4' },
    yaxis: { title: 'SG&A as % of Revenue', gridcolor: '#e8e0d4' },
    showlegend: true,
    legend: { font: { size: 14 }, bgcolor: '#ffffff', bordercolor: '#ddd6cc', borderwidth: 1 },
    barmode: 'group',
  }

  // Hollywood accounting — remove text inside bars, remove legend
  const acctFilms = accounting?.filter(f => f.worldwide_gross_m > 0) ?? []

  const acctTrace = acctFilms.length ? [
    {
      type: 'bar', name: 'Worldwide Gross',
      y: acctFilms.map(f => f.title),
      x: acctFilms.map(f => f.worldwide_gross_m),
      orientation: 'h',
      marker: { color: '#b5ead7', line: { color: '#ccc', width: 1 } },
    },
    {
      type: 'bar', name: 'Production Budget',
      y: acctFilms.map(f => f.title),
      x: acctFilms.map(f => f.production_budget_m),
      orientation: 'h',
      marker: { color: '#f4afa8', opacity: 0.8, line: { color: '#ccc', width: 1 } },
    },
  ] : []

  const acctLayout = {
    paper_bgcolor: '#ffffff', plot_bgcolor: '#f9f5ef',
    font: { color: '#1a1a2e', size: 12 },
    margin: { t: 20, b: 40, l: 280, r: 40 },
    barmode: 'overlay',
    showlegend: false,
    xaxis: { title: '$M', gridcolor: '#e8e0d4' },
    yaxis: { gridcolor: '#e8e0d4', automargin: true, ticklen: 16, tickpad: 12 },
  }

  return (
    <section id="hidden" className="section">
      <h2 className="section-title" style={{ textAlign: 'center' }}>The Hidden Data</h2>
      <p className="section-sub" style={{ textAlign: 'center', maxWidth: '100%' }}>
        Our model's R² is ~20% — not because female-led films are unpredictable,
        but because the features that actually predict success are controlled and
        withheld by the studios that profit from the "women don't sell" narrative.
      </p>

      {/* Studio marketing chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 56 }}
      >
        <p style={{ color: '#666', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
          SG&A spend as % of revenue — from SEC 10-K filings (FY2023)
        </p>
        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: 20 }}>
          Note: Major studio SG&A covers all divisions (streaming, parks, TV networks).
          Per-film marketing spend is never broken out publicly — by design.
        </p>
        {studios?.length > 0 && (
          <Plot data={studioTrace} layout={studioLayout} config={{ displayModeBar: false }} style={{ width: '100%', height: 340 }} />
        )}
      </motion.div>

      {/* Hollywood accounting chart */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        style={{ marginBottom: 40 }}
      >
        <p style={{ color: '#666', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
          Hollywood accounting — films grossing hundreds of millions declared as losses
        </p>
        {acctFilms.length > 0 && (
          <Plot data={acctTrace} layout={acctLayout} config={{ displayModeBar: false }} style={{ width: '100%', height: 360 }} />
        )}
      </motion.div>

      {/* Accounting table */}
      {accounting?.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <table className="accounting-table">
            <thead>
              <tr>
                <th>Film</th><th>Budget</th><th>Worldwide Gross</th>
                <th>Actual ROI</th><th>Studio Reported</th><th>Method</th>
              </tr>
            </thead>
            <tbody>
              {accounting.map(f => (
                <tr key={f.title}>
                  <td style={{ fontWeight: 600 }}>{f.title} ({f.year})</td>
                  <td>${f.production_budget_m}M</td>
                  <td>
                    <span style={{
                      background: '#b5ead7', color: '#1a5c3a', fontWeight: 700,
                      borderRadius: 6, padding: '3px 10px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}>
                      ${f.worldwide_gross_m > 0 ? `${f.worldwide_gross_m}M` : 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      background: '#f5e6c8', color: '#7a5a10', fontWeight: 700,
                      borderRadius: 6, padding: '3px 10px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    }}>
                      {f.roi_actual > 0 ? `${f.roi_actual.toFixed(1)}x` : '—'}
                    </span>
                  </td>
                  <td><span className="loss-badge">{f.reported_loss_m < 0 ? `$${Math.abs(f.reported_loss_m)}M loss` : 'Settled'}</span></td>
                  <td style={{ color: '#555', fontSize: '0.85rem' }}>{f.accounting_note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </section>
  )
}
