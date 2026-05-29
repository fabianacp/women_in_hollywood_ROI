import { motion } from 'framer-motion'

const PALETTE = {
  'Meryl Streep':    '#f4afa8',
  'Nicole Kidman':   '#d4aa70',
  'Margot Robbie':   '#a8d8ea',
  'Cate Blanchett':  '#b5ead7',
  'Charlize Theron': '#c7b8ea',
  'Sydney Sweeney':  '#ffd6a5',
  'Ana de Armas':    '#f0e6d3',
  'Zendaya':         '#ff9aa2',
  'Jennifer Lawrence':'#ffb7b2',
  'Scarlett Johansson':'#e2f0cb',
  'Emma Stone':      '#c9c9ff',
  'Sandra Bullock':  '#ffdac1',
  'Angelina Jolie':  '#b5ead7',
  'Anne Hathaway':   '#f8c8d4',
  'Demi Moore':      '#d4c5f9',
}

export default function ActressCards({ actresses }) {
  if (!actresses?.length) return null

  return (
    <section id="actresses" className="section">
      <h2 className="section-title">ROI by Actress</h2>
      <p className="section-sub">
        Every actress below has a mean ROI above 1x — meaning every dollar invested
        in their films returned more than a dollar. The "women don't sell" argument
        is not supported by the data.
      </p>

      <div className="cards-grid">
        {actresses.map((a, i) => (
          <motion.div
            key={a.actress}
            className="card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.06 }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="card-name">{a.actress}</div>
            <div className="card-roi" style={{ color: PALETTE[a.actress] ?? '#f4afa8' }}>
              {a.mean_roi.toFixed(1)}x
            </div>
            <div className="card-label">mean ROI</div>
            <div className="card-stats">
              <div className="stat"><span>{a.film_count}</span> films</div>
              <div className="stat">med <span>{a.median_roi.toFixed(1)}x</span></div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
