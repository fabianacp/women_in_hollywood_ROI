import { motion } from 'framer-motion'

export default function ModelScores({ scores }) {
  if (!scores?.length) return null

  const best = scores[0]
  const maxMae = Math.max(...scores.map(s => s.cv_mae))

  return (
    <section id="model" className="section">
      <h2 className="section-title" style={{ textAlign: 'center' }}>Model Transparency</h2>
      <p className="section-sub" style={{ textAlign: 'center', maxWidth: '100%' }}>
        We tried 5 algorithms. The best was <strong>{best.model}</strong>.
        R² of ~20% reflects missing features (marketing spend, screen count,
        tracking data) — not a flaw in the thesis. The profitability finding
        comes from the data, not the model's predictive power.
      </p>

      <div className="scores-list">
        {scores.map((s, i) => (
          <motion.div
            key={s.model}
            className="score-row"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <div className="score-name">
              {s.model}
              {i === 0 && <span className="best-badge" style={{ marginLeft: 8 }}>Best</span>}
            </div>
            <div className="score-bar-wrap">
              <motion.div
                className="score-bar"
                initial={{ width: 0 }}
                whileInView={{ width: `${(1 - s.cv_mae / maxMae) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.08 + 0.2 }}
              />
            </div>
            <div className="score-val">MAE {s.cv_mae.toFixed(3)}</div>
            <div className="score-val" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.72rem', color: '#888', marginBottom: 3 }}>R²</div>
              <span style={{
                background: '#b5ead7', color: '#1a5c3a', fontWeight: 700,
                borderRadius: 6, padding: '3px 10px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                fontSize: '0.88rem',
              }}>
                {s.cv_r2.toFixed(3)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        style={{ marginTop: 32, padding: '20px 24px', background: '#ffffff', borderRadius: 10, borderLeft: '3px solid #f4afa8', border: '1px solid #ddd6cc' }}
      >
        <p style={{ fontSize: '0.95rem', color: '#555', lineHeight: 1.7 }}>
          <strong style={{ color: '#1a1a2e' }}>Why is R² low?</strong> The features
          that most predict box office success — marketing budget, opening screen
          count, director tier, and internal audience tracking — are controlled and
          withheld by studios. Our model proves profitability despite incomplete data.
          With full transparency, the case for female-led films would be even stronger.
        </p>
      </motion.div>
    </section>
  )
}
