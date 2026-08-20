import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ChevronDown, Star, MapPin, Users, Heart, Share2, Bell } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

// Floating petal component
function Petal({ delay, left, duration }: { delay: number; left: string; duration: number }) {
  const petals = ['🌸', '🌺', '🌼', '🏵️', '🌷'];
  const petal = petals[Math.floor(Math.random() * petals.length)];
  return (
    <motion.div
      className="absolute pointer-events-none text-lg select-none"
      style={{ left, top: '-40px' }}
      animate={{ y: ['0vh', '110vh'], rotate: [0, 360], x: [0, 30, -30, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
    >
      {petal}
    </motion.div>
  );
}

// Gold particle
function Particle({ delay, left, size }: { delay: number; left: string; size: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none rounded-full"
      style={{
        left, bottom: '10%', width: size, height: size,
        background: 'radial-gradient(circle, #ffd700, transparent)',
      }}
      animate={{ y: [0, -120, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }}
      transition={{ duration: 3, delay, repeat: Infinity, ease: 'easeOut' }}
    />
  );
}

// How it Works card
function HowCard({ num, title, desc, icon, delay }: { num: string; title: string; desc: string; icon: string; delay: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className="relative group cursor-pointer"
    >
      <div className="gold-card p-8 h-full transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-gold-lg">
        <div className="text-5xl mb-4">{icon}</div>
        <div className="festive-badge mb-3">{num}</div>
        <h3 className="text-xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>{title}</h3>
        <p className="text-sm text-amber-700 leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

// Testimonial
const TESTIMONIALS = [
  {
    name: 'प्रशांत नलावडे',
    city: 'पुणे',
    text: 'आमच्या नातेवाईकांना invitation पाठवायला खूप सोपे झाले. सगळ्यांना personalized invitation खूप आवडले. बाप्पांची opening animation तर अप्रतिम होती!',
    rating: 5,
  },
  {
    name: 'सुनीता पाटील',
    city: 'मुंबई',
    text: 'WhatsApp वर personalized link पाठवला तेव्हा सर्वांनी विचारले "हे कुठून बनवलात?" खरंच खूप premium feel आहे. गणपती बाप्पा मोरया!',
    rating: 5,
  },
  {
    name: 'राजेश देशमुख',
    city: 'नागपूर',
    text: 'RSVP feature खूप उपयुक्त आहे. आता कोण येणार आहे ते advance मध्ये कळते. Flower offering आणि diya feature मुळे guests ला वेगळाच आनंद मिळाला.',
    rating: 5,
  },
];

// FAQ
const FAQS = [
  {
    q: 'हे आमंत्रण मोफत आहे का?',
    a: 'होय! Basic invitation संपूर्णपणे मोफत आहे. तुम्ही account न बनवताही आमंत्रण तयार करू शकता.',
  },
  {
    q: 'WhatsApp वर कसे पाठवायचे?',
    a: 'Invitation तयार केल्यावर "WhatsApp वर पाठवा" बटण दाबा. App आपोआप personalized message सह link तयार करेल.',
  },
  {
    q: 'Guest चे नाव personalize करता येते का?',
    a: 'हो! प्रत्येक guest साठी वेगळी personalized link तयार करता येते. Guest आपले नाव पाहून invitation उघडतो.',
  },
  {
    q: 'RSVP पाहता येतो का?',
    a: 'हो! Dashboard मध्ये तुम्हाला RSVP, guest count, views, shares सर्व real-time मध्ये दिसतात.',
  },
  {
    q: 'Invitation किती दिवस उपलब्ध राहते?',
    a: 'तुमचे invitation account असेपर्यंत उपलब्ध राहते. Visarjan नंतर ते archive होते, पण accessible राहते.',
  },
  {
    q: 'Invitation PDF मध्ये download करता येते का?',
    a: 'हो! Invitation PNG, JPG आणि PDF formats मध्ये download करता येते.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Generate random petal configs
  const petals = Array.from({ length: 12 }, (_, i) => ({
    delay: i * 1.5,
    left: `${(i * 8) % 100}%`,
    duration: 8 + (i % 4) * 2,
  }));

  const particles = Array.from({ length: 15 }, (_, i) => ({
    delay: i * 0.7,
    left: `${(i * 7) % 100}%`,
    size: 4 + (i % 4) * 2,
  }));

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 60%, #fce8c6 100%)' }}>
      <Navbar />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated petals */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {petals.map((p, i) => <Petal key={i} {...p} />)}
          {particles.map((p, i) => <Particle key={i} {...p} />)}
        </div>

        {/* Decorative mandala bg */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border-[40px]"
            style={{ borderColor: '#d4a017' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border-[30px]"
            style={{ borderColor: '#ff7300' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Text */}
          <div>
            {/* Festive badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
              style={{ background: 'rgba(255,115,0,0.1)', color: '#c05000', border: '1px solid rgba(255,115,0,0.2)' }}
            >
              <Bell className="w-4 h-4 animate-bell-swing" />
              <span className="font-devanagari">गणेशोत्सव २०२६</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold font-devanagari leading-tight mb-4"
              style={{ color: '#3d1f00' }}
            >
              या गणेशोत्सवाला{' '}
              <span className="text-gold-gradient">आपल्या घरी</span>{' '}
              गणपती बाप्पांना आमंत्रित करा 🙏
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-base sm:text-lg text-amber-800 mb-8 leading-relaxed"
            >
              Create a beautiful personalized digital invitation and share the blessings of Bappa with your loved ones.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-8"
            >
              <Link to="/create" className="btn-saffron text-base px-8 py-4 justify-center">
                🙏 माझे आमंत्रण तयार करा
              </Link>
              <Link to="/invite/demo-invitation-2026" className="btn-outline-saffron text-base px-8 py-4 justify-center">
                ✨ Demo Invitation पहा
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-lg font-devanagari font-medium"
              style={{ color: '#ff7300' }}
            >
              गणपती बाप्पा मोरया! मंगलमूर्ती मोरया! 🙏
            </motion.p>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex gap-8 mt-8"
            >
              {[
                { label: 'Invitations', value: '10,000+' },
                { label: 'Guests Invited', value: '2 Lakh+' },
                { label: 'RSVPs', value: '50,000+' },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-xl font-bold text-saffron-gradient">{s.value}</p>
                  <p className="text-xs text-amber-600">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Ganpati artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(255,165,0,0.5) 0%, transparent 70%)' }} />

            {/* Circular frame */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
              className="absolute w-80 h-80 rounded-full border-2 opacity-20"
              style={{ borderColor: '#d4a017', borderStyle: 'dashed' }}
            />

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10"
            >
              <img
                src="/images/ganpati-hero.jpg"
                alt="Ganpati Bappa"
                className="w-72 h-72 sm:w-96 sm:h-96 object-cover rounded-full shadow-2xl"
                style={{ boxShadow: '0 0 60px rgba(255,165,0,0.4), 0 20px 60px rgba(61,31,0,0.2)' }}
              />

              {/* Diya decorations */}
              <motion.div
                className="absolute -bottom-4 -left-4 text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🪔
              </motion.div>
              <motion.div
                className="absolute -bottom-4 -right-4 text-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
              >
                🪔
              </motion.div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-amber-400" />
        </motion.div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="festive-badge mx-auto mb-4">🎯 Simple Process</div>
            <h2 className="text-3xl sm:text-4xl font-bold font-devanagari mb-3" style={{ color: '#3d1f00' }}>
              कसे काम करते?
            </h2>
            <p className="text-amber-700">तीन सोप्या पायऱ्यांमध्ये सुंदर आमंत्रण तयार करा</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <HowCard num="01" icon="📝" title="तुमच्या बाप्पांची माहिती भरा"
              desc="Host details, Bappa arrival, aarti, prasad, visarjan dates — सर्व माहिती सोपेपणाने भरा."
              delay={0} />
            <HowCard num="02" icon="🎨" title="तुमच्या आवडीची सुंदर रचना निवडा"
              desc="10+ premium templates मधून निवडा. Bappa image, colors, decorations customize करा."
              delay={0.15} />
            <HowCard num="03" icon="📱" title="WhatsApp वर प्रियजनांना आमंत्रित करा"
              desc="Personalized links तयार करा. प्रत्येक guest ला त्यांच्या नावाने invitation पाठवा."
              delay={0.3} />
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="py-16 px-4 sm:px-6" style={{ background: 'rgba(255,243,224,0.5)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
              ✨ खास features
            </h2>
            <p className="text-amber-700">फक्त आमंत्रण नाही — एक संपूर्ण Bappa experience</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '🌸', title: 'फूल अर्पण', desc: 'Guests digitally offer flowers to Bappa' },
              { icon: '🪔', title: 'दिवा लावा', desc: 'Interactive diya lighting experience' },
              { icon: '🙏', title: 'RSVP', desc: 'Real-time guest response tracking' },
              { icon: '📍', title: 'Location', desc: 'Google Maps integration with directions' },
              { icon: '⏱️', title: 'Countdown', desc: 'Live countdown to Bappa arrival' },
              { icon: '❤️', title: 'Family Story', desc: 'Share your Bappa journey' },
              { icon: '📷', title: 'Memory Gallery', desc: 'Beautiful masonry photo gallery' },
              { icon: '📅', title: 'Calendar', desc: 'Add all events to your calendar' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gold-card p-5 hover:-translate-y-1 transition-transform duration-200"
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h3 className="font-bold text-sm font-devanagari mb-1" style={{ color: '#3d1f00' }}>{f.title}</h3>
                <p className="text-xs text-amber-700">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INVITATION PREVIEW ============ */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
              आमचे सुंदर Templates
            </h2>
            <p className="text-amber-700">10+ premium designs — प्रत्येकासाठी काहीतरी खास</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
            {[
              { name: 'Traditional', emoji: '🪔', bg: 'from-amber-100 to-orange-100' },
              { name: 'Royal Gold', emoji: '👑', bg: 'from-yellow-100 to-amber-100' },
              { name: 'Red & Gold', emoji: '❤️', bg: 'from-red-100 to-orange-100' },
              { name: 'Floral', emoji: '🌸', bg: 'from-pink-100 to-rose-100' },
              { name: 'Temple', emoji: '🛕', bg: 'from-amber-50 to-yellow-100' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`bg-gradient-to-br ${t.bg} rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer border-2 border-transparent hover:border-saffron-400 transition-all duration-200 hover:-translate-y-1`}
              >
                <span className="text-4xl">{t.emoji}</span>
                <span className="text-xs font-semibold text-amber-800 text-center">{t.name}</span>
              </motion.div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/templates" className="btn-outline-saffron px-8 py-3">
              सर्व Templates पहा →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-16 px-4 sm:px-6" style={{ background: 'rgba(255,243,224,0.5)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
              ❤️ लोक काय म्हणतात
            </h2>
            <p className="text-xs text-amber-500 mt-1">* Sample testimonials — will be replaced with real reviews</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="gold-card p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-amber-800 leading-relaxed mb-4 font-devanagari">"{t.text}"</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-saffron-100 flex items-center justify-center text-sm font-bold text-saffron-600">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900 font-devanagari">{t.name}</p>
                    <p className="text-xs text-amber-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {t.city}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold font-devanagari mb-2" style={{ color: '#3d1f00' }}>
              🤔 वारंवार विचारले जाणारे प्रश्न
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="gold-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold font-devanagari text-sm" style={{ color: '#3d1f00' }}>{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-amber-500 ml-4 flex-shrink-0"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-amber-700 leading-relaxed border-t border-amber-100">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
            style={{ background: 'radial-gradient(circle, #ff7300, transparent)' }} />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="/images/ganpati-hero.jpg"
              alt="Ganpati Bappa"
              className="w-40 h-40 rounded-full mx-auto mb-8 shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(255,165,0,0.4)' }}
            />

            <h2 className="text-3xl sm:text-4xl font-bold font-devanagari mb-4" style={{ color: '#3d1f00' }}>
              यंदाच्या बाप्पांच्या आगमनाचा आनंद आपल्या प्रियजनांसोबत शेअर करा ❤️
            </h2>

            <Link to="/create" className="btn-saffron text-lg px-10 py-4 inline-flex mx-auto mb-8">
              🙏 माझे गणपती आमंत्रण तयार करा
            </Link>

            <p className="text-xl font-devanagari font-bold" style={{ color: '#ff7300' }}>
              गणपती बाप्पा मोरया!<br />मंगलमूर्ती मोरया! 🙏
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center border-t" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
        <p className="font-devanagari text-amber-700 mb-2">बाप्पांचे आमंत्रण, आता डिजिटल आणि खास ❤️🙏</p>
        <p className="text-xs text-amber-500">© 2026 Ganpati Invitation. Crafted with ❤️ for Bappa.</p>
      </footer>
    </div>
  );
}
