import { motion } from 'framer-motion'

export default function Hero({ actresses }) {
  const totalFilms   = actresses?.reduce((s, a) => s + a.film_count, 0) ?? 0
  const allProfitable = actresses?.every(a => a.mean_roi > 1) ?? false

  return (
    <div className="hero">
      <div className="hero-inner">
        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Women in Hollywood<br />
          <motion.span
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 3.0, duration: 0.9, ease: 'easeOut' }}
            style={{ display: 'inline-block' }}
          >
            are profitable.
          </motion.span>
        </motion.h1>

        <motion.p
          className="hero-sub"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          Hollywood producers claim female leads are bad investments.
          We analysed {totalFilms} films across 15 actresses using real box office
          data and machine learning to prove them wrong.
        </motion.p>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <div>
            <div className="hero-stat-val">{totalFilms}</div>
            <div className="hero-stat-lbl">films analysed</div>
          </div>
          <div>
            <div className="hero-stat-val">15</div>
            <div className="hero-stat-lbl">actresses</div>
          </div>
          <div>
            <div className="hero-stat-val" style={{ color: '#b5ead7' }}>
              {allProfitable ? '15 / 15' : '—'}
            </div>
            <div className="hero-stat-lbl">profitable on average</div>
          </div>
          <div>
            <div className="hero-stat-val">$5M</div>
            <div className="hero-stat-lbl">investment tested</div>
          </div>
        </motion.div>

        <motion.div
          className="scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          ↓
        </motion.div>
      </div>
    </div>
  )
}
