import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';
import { TEMPLATES, TEMPLATE_EMOJIS } from '../data/templates';

const TEMPLATE_PREVIEW_BG: Record<string, string> = {
  'traditional': 'from-amber-100 to-orange-100',
  'royal-gold': 'from-yellow-100 to-amber-100',
  'red-gold': 'from-red-100 to-orange-100',
  'minimal': 'from-gray-50 to-amber-50',
  'floral': 'from-pink-100 to-rose-100',
  'temple': 'from-stone-100 to-amber-100',
  'peshwai': 'from-red-900 to-red-800',
  'modern-luxury': 'from-slate-800 to-slate-900',
  'eco-friendly': 'from-green-100 to-emerald-100',
  'family-celebration': 'from-orange-100 to-amber-100',
};

const TEMPLATE_TEXT_DARK: Record<string, boolean> = {
  'peshwai': false, 'modern-luxury': false,
};

export default function Templates() {
  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-12">
          <div className="text-4xl mb-4">🎨</div>
          <h1 className="text-3xl sm:text-4xl font-bold font-devanagari mb-3" style={{ color: '#3d1f00' }}>
            Premium Templates
          </h1>
          <p className="text-amber-700">10+ सुंदर designs — तुमच्या बाप्पांसाठी खास</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATES.map((template, i) => {
            const isDark = TEMPLATE_TEXT_DARK[template.id] === false;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-3xl overflow-hidden shadow-festive hover:-translate-y-2 transition-all duration-300 group"
              >
                {/* Template preview */}
                <div className={`bg-gradient-to-br ${TEMPLATE_PREVIEW_BG[template.id] || 'from-amber-100 to-orange-100'} p-8 flex flex-col items-center justify-center min-h-[200px] relative`}>
                  {/* Decorative corners */}
                  <div className="absolute top-3 left-3 text-xl opacity-50">🌸</div>
                  <div className="absolute top-3 right-3 text-xl opacity-50">🌸</div>

                  <div className="text-6xl mb-3">{TEMPLATE_EMOJIS[template.id]}</div>

                  <p className="text-xs font-semibold text-center mb-1 font-devanagari px-4"
                    style={{ color: isDark ? 'rgba(255,255,255,0.9)' : '#3d1f00' }}>
                    {template.name_marathi}
                  </p>

                  {/* Mini invitation preview */}
                  <div className="mt-3 w-full max-w-xs rounded-xl p-3 text-center"
                    style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
                    <p className="text-xs font-devanagari" style={{ color: isDark ? '#d4a017' : '#ff7300' }}>॥ श्री गणेशाय नमः ॥</p>
                    <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,255,255,0.7)' : '#7a4c2a' }}>— सस्नेह निमंत्रण —</p>
                  </div>
                </div>

                {/* Card footer */}
                <div className="p-5" style={{ background: '#fffdf5', borderTop: '1px solid rgba(212,160,23,0.2)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm" style={{ color: '#3d1f00' }}>{template.name}</h3>
                      <p className="text-xs text-amber-500 capitalize">{template.category}</p>
                    </div>
                    <div className="festive-badge">
                      {template.configuration.showMandala ? '🌀 Mandala' : template.configuration.showToran ? '🌺 Toran' : '✨ Clean'}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={`/invite/demo-invitation-2026`}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center border-2 hover:bg-amber-50 transition-colors"
                      style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}>
                      👁️ Preview
                    </Link>
                    <Link to={`/create`}
                      className="flex-1 py-2.5 rounded-xl text-xs font-medium text-center text-white transition-all"
                      style={{ background: 'linear-gradient(135deg, #ff8c00, #ff6b00)' }}>
                      🙏 Use Template
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <Link to="/create" className="btn-saffron text-base px-10 py-4 inline-flex">
            🙏 माझे आमंत्रण तयार करा
          </Link>
        </div>
      </div>
    </div>
  );
}
