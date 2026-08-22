import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { Invitation } from '../types';
import InvitationCard from '../components/ganpati/InvitationCard';
import FlowerOffering from '../components/ganpati/FlowerOffering';
import DiyaOffering from '../components/ganpati/DiyaOffering';
import RSVPSection from '../components/rsvp/RSVPSection';
import LocationCard from '../components/ganpati/LocationCard';
import ShareButtons from '../components/ganpati/ShareButtons';
import LoadingScreen from '../components/ui/LoadingScreen';

const DEMO_SLUG = 'demo-invitation-2026';

// ─── INTRO SEQUENCE ────────────────────────────────────────────────────
type IntroScreen = 1 | 2 | 3 | 4 | 5 | 6;

function Petal({ delay, left, duration }: { delay: number; left: string; duration: number }) {
  const emojis = ['🌸', '🌺', '🌼', '🏵️'];
  return (
    <motion.div
      className="absolute pointer-events-none text-2xl select-none"
      style={{ left, top: '-40px' }}
      animate={{ y: ['0vh', '110vh'], rotate: [0, 360], x: [0, 20, -20, 0] }}
      transition={{ duration, delay, ease: 'linear' }}
    >
      {emojis[Math.floor(Math.random() * emojis.length)]}
    </motion.div>
  );
}

function IntroSequence({ guestName, onComplete }: { guestName?: string; onComplete: () => void }) {
  const [screen, setScreen] = useState<IntroScreen>(1);

  useEffect(() => {
    const timings: Record<IntroScreen, number> = { 1: 1800, 2: 1500, 3: 1600, 4: 1800, 5: 1600, 6: 0 };
    if (screen === 6) { onComplete(); return; }
    const t = setTimeout(() => setScreen(s => (s + 1) as IntroScreen), timings[screen]);
    return () => clearTimeout(t);
  }, [screen]);

  const screenBg = {
    1: 'radial-gradient(ellipse at center, #2d1a00 0%, #0a0500 100%)',
    2: 'radial-gradient(ellipse at center, #1a0d00 0%, #050200 100%)',
    3: 'radial-gradient(ellipse at center, #1a0d00 0%, #050200 100%)',
    4: 'radial-gradient(ellipse at center, #fdf0dc 0%, #fff8f0 100%)',
    5: 'radial-gradient(ellipse at center, #fff8f0 0%, #fdf0dc 100%)',
    6: '',
  };

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: screenBg[screen] }}
    >
      {/* Skip button */}
      <button
        onClick={onComplete}
        className="absolute top-4 right-4 px-4 py-2 text-sm rounded-xl text-white/60 hover:text-white/90 transition-colors"
        style={{ border: '1px solid rgba(255,255,255,0.15)' }}
      >
        Skip Intro →
      </button>

      <AnimatePresence mode="wait">
        {screen === 1 && (
          <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center px-8">
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
              <p className="text-4xl sm:text-5xl font-bold font-devanagari mb-4" style={{ color: '#d4a017' }}>
                ॥ श्री गणेशाय नमः ॥
              </p>
            </motion.div>
            {guestName && (
              <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                className="text-xl font-devanagari mt-4" style={{ color: '#ff9a3c' }}>
                प्रिय {guestName}, तुमच्यासाठी खास आमंत्रण ❤️
              </motion.p>
            )}
            <button onClick={() => {
              const ctx = new AudioContext();
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.connect(gain); gain.connect(ctx.destination);
              osc.frequency.value = 880; gain.gain.setValueAtTime(0.3, ctx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
              osc.start(); osc.stop(ctx.currentTime + 1.5);
            }} className="mt-6 px-4 py-2 rounded-full text-sm text-white/50 hover:text-white/80 transition-colors">
              🔔 Bell
            </button>
          </motion.div>
        )}

        {screen === 2 && (
          <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1, filter: 'drop-shadow(0 0 40px rgba(255,165,0,0.9))' }}
              transition={{ duration: 0.8 }}
            >
              <div className="w-24 h-24 mx-auto relative">
                <div className="w-24 h-16 rounded-b-full mx-auto" style={{ background: 'linear-gradient(135deg, #cd7f32, #8b5e3c)', border: '2px solid #a0522d' }} />
                <motion.div
                  animate={{ scaleY: [1, 1.2, 1], scaleX: [1, 0.8, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="absolute -top-16 left-1/2 -translate-x-1/2 w-8 h-16 rounded-full"
                  style={{ background: 'linear-gradient(to top, #ff6b00, #ffcc00, #fff9)' }}
                />
              </div>
            </motion.div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-8 text-xl font-devanagari" style={{ color: '#d4a017' }}>
              🪔 बाप्पांच्या चरणी दिवा...
            </motion.p>
          </motion.div>
        )}

        {screen === 3 && (
          <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center relative overflow-hidden w-full h-full flex items-center justify-center">
            {Array.from({ length: 12 }).map((_, i) => (
              <Petal key={i} delay={i * 0.3} left={`${(i * 8) % 100}%`} duration={4} />
            ))}
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              className="text-5xl font-devanagari z-10" style={{ color: '#ff9a3c' }}>
              🌸 फुलांचे स्वागत 🌺
            </motion.p>
          </motion.div>
        )}

        {screen === 4 && (
          <motion.div key="s4" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }} className="text-center px-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full overflow-hidden mx-auto shadow-2xl border-4"
                style={{ borderColor: '#d4a017', boxShadow: '0 0 60px rgba(255,165,0,0.6)' }}>
                <img src="/images/ganpati-hero.jpg" alt="Ganpati Bappa" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </motion.div>
        )}

        {screen === 5 && (
          <motion.div key="s5" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center px-8">
            <motion.p
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl sm:text-5xl font-bold font-devanagari"
              style={{ color: '#ff7300' }}
            >
              गणपती बाप्पा मोरया! 🙏
            </motion.p>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
              className="mt-4 text-xl font-devanagari" style={{ color: '#d4a017' }}>
              मंगलमूर्ती मोरया!
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────
export default function InvitationView() {
  const { slug, guest: guestSlug } = useParams<{ slug: string; guest?: string }>();
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guestName, setGuestName] = useState<string | undefined>();
  const [guestId, setGuestId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [flowerCount, setFlowerCount] = useState(0);
  const [diyaCount, setDiyaCount] = useState(0);
  const [memories, setMemories] = useState<{ id: string; image_url: string; caption?: string }[]>([]);

  useEffect(() => {
    if (slug) loadInvitation();
  }, [slug, guestSlug]);

  async function loadInvitation() {
    setLoading(true);

    // Load invitation
    const { data: inv, error } = await supabase
      .from('invitations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !inv) {
      // Try demo
      if (slug === 'demo-invitation-2026') {
        setInvitation(DEMO_INVITATION);
        setFlowerCount(127);
        setDiyaCount(84);
        setLoading(false);
        return;
      }
      setNotFound(true);
      setLoading(false);
      return;
    }

    setInvitation(inv);

    // Load guest
    if (guestSlug) {
      const { data: g } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_id', inv.id)
        .eq('slug', guestSlug)
        .single();
      if (g) { setGuestName(g.name); setGuestId(g.id); }
    }

    // Track view
    await supabase.from('invitation_views').insert({ invitation_id: inv.id, guest_id: guestId || null });

    // Load counts
    const [{ count: fc }, { count: dc }] = await Promise.all([
      supabase.from('flower_offerings').select('*', { count: 'exact', head: true }).eq('invitation_id', inv.id),
      supabase.from('diya_offerings').select('*', { count: 'exact', head: true }).eq('invitation_id', inv.id),
    ]);
    setFlowerCount(fc || 0);
    setDiyaCount(dc || 0);

    // Load memories
    const { data: mems } = await supabase.from('memories').select('*').eq('invitation_id', inv.id);
    setMemories(mems || []);

    setLoading(false);
  }

  if (loading) return <LoadingScreen />;
  if (notFound) return <NotFoundPage />;
  if (!invitation) return null;

  // Payment gate — only show full view if unlocked (or demo)
  const isDemo = slug === DEMO_SLUG;
  const isUnlocked = isDemo || invitation.is_unlocked === true || invitation.is_unlocked === undefined;

  if (!isUnlocked) {
    return <LockedInvitationScreen invitation={invitation} />;
  }

  return (
    <>
      {/* Intro */}
      <AnimatePresence>
        {showIntro && (
          <IntroSequence guestName={guestName} onComplete={() => setShowIntro(false)} />
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="min-h-screen pb-24"
            style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}
          >
            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
              {/* Personalized greeting banner */}
              {guestName && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="text-center py-4 px-6 rounded-2xl"
                  style={{ background: 'linear-gradient(135deg, rgba(255,115,0,0.1), rgba(192,57,43,0.05))', border: '1px solid rgba(255,115,0,0.2)' }}
                >
                  <p className="font-devanagari text-lg font-bold" style={{ color: '#c0392b' }}>
                    {guestName}साठी खास आमंत्रण ❤️
                  </p>
                </motion.div>
              )}

              {/* Invitation Card */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
                <InvitationCard
                  invitation={invitation}
                  guestName={guestName}
                  flowerCount={flowerCount}
                  diyaCount={diyaCount}
                />
              </motion.div>

              {/* Flower Offering */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                <FlowerOffering invitationId={invitation.id} initialCount={flowerCount} />
              </motion.div>

              {/* Diya */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                <DiyaOffering invitationId={invitation.id} initialCount={diyaCount} />
              </motion.div>

              {/* RSVP */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }}>
                <RSVPSection invitation={invitation} guestToken={guestId} guestName={guestName} />
              </motion.div>

              {/* Location */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                <LocationCard invitation={invitation} />
              </motion.div>

              {/* Family Story */}
              {invitation.family_story && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
                  className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
                  <h3 className="font-bold font-devanagari text-base mb-3" style={{ color: '#3d1f00' }}>
                    ❤️ आमच्या बाप्पांचा प्रवास
                  </h3>
                  <p className="text-sm font-devanagari leading-relaxed text-amber-800">{invitation.family_story}</p>
                </motion.div>
              )}

              {/* Memory Gallery */}
              {memories.length > 0 && (
                <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
                    <h3 className="font-bold font-devanagari text-base mb-4" style={{ color: '#3d1f00' }}>
                      📸 बाप्पांच्या आठवणी ❤️
                    </h3>
                    <div className="masonry-grid">
                      {memories.map(m => (
                        <div key={m.id} className="masonry-item">
                          <img src={m.image_url} alt={m.caption || 'Memory'} className="w-full object-cover" />
                          {m.caption && <p className="text-xs text-amber-600 p-2">{m.caption}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Share */}
              <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
                <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
                  <h3 className="font-bold font-devanagari text-base mb-4" style={{ color: '#3d1f00' }}>
                    📱 आमंत्रण शेअर करा
                  </h3>
                  <ShareButtons
                    invitationId={invitation.id}
                    slug={invitation.slug}
                    hostName={invitation.host_name}
                    guestName={guestName}
                    arrivalDate={invitation.arrival_date}
                    city={invitation.city}
                    isUnlocked={invitation.is_unlocked !== false}
                    paymentInvitationId={invitation.id}
                  />
                </div>
              </motion.div>

              {/* Viral CTA (subtle) */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                className="text-center py-4">
                <p className="text-xs text-amber-600 mb-2 font-devanagari">
                  तुमच्याही बाप्पांसाठी असे आमंत्रण तयार करा ✨
                </p>
                <Link to="/create"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white"
                  style={{ background: 'linear-gradient(135deg, #ff8c00, #ff6b00)' }}>
                  🙏 माझे मोफत आमंत्रण तयार करा
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Action Bar */}
      {!showIntro && (
        <div className="sticky-action-bar safe-area-bottom md:hidden">
          <a href="#rsvp" className="flex flex-col items-center gap-1 text-xs font-medium" style={{ color: '#c0392b' }}>
            <span className="text-xl">❤️</span> RSVP
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent('🙏 ' + window.location.href)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-xs font-medium text-white px-4 py-2 rounded-xl"
            style={{ background: '#25d366' }}>
            <span className="text-xl">📱</span> Share
          </a>
          <button
            onClick={() => {
              const q = encodeURIComponent(`${invitation.address}, ${invitation.city}`);
              window.open(`https://maps.google.com/maps/search/?api=1&query=${q}`, '_blank');
            }}
            className="flex flex-col items-center gap-1 text-xs font-medium" style={{ color: '#4285f4' }}>
            <span className="text-xl">🗺️</span> Directions
          </button>
        </div>
      )}
    </>
  );
}

// ─── LOCKED INVITATION SCREEN ──────────────────────────────────
function LockedInvitationScreen({ invitation }: { invitation: Invitation }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring' }}>
        <div className="text-6xl mb-4">🙏</div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold"
          style={{ background: 'rgba(255,115,0,0.1)', color: '#c05000', border: '1px solid rgba(255,115,0,0.2)' }}>
          🔒 Invitation Processing
        </div>
        <h1 className="text-2xl font-bold font-devanagari mb-3" style={{ color: '#3d1f00' }}>
          {invitation.host_name} यांचे गणपती आमंत्रण
        </h1>
        <p className="text-amber-700 text-sm mb-2">{invitation.city}</p>
        <div className="w-24 h-0.5 mx-auto mb-6" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)' }} />
        <p className="text-amber-800 text-sm leading-relaxed max-w-xs mx-auto mb-8">
          हे आमंत्रण payment verification च्या प्रतीक्षेत आहे.<br />
          Verification झाल्यावर हे invitation unlock होईल.
        </p>
        <div className="p-5 rounded-2xl mb-6 max-w-xs mx-auto"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(212,160,23,0.2)' }}>
          <p className="text-xs text-amber-600 mb-3 font-semibold">⏳ Verification Timeline</p>
          <div className="space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              Invitation created
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-700">
              <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              Payment submitted
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#ff7300' }}>
              <motion.span animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#ff7300' }} />
              Admin verification in progress...
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-gray-200 flex-shrink-0" />
              Invitation unlock
            </div>
          </div>
        </div>
        <Link to="/" className="btn-saffron px-8 py-3">🏠 मुख्य पानावर जा</Link>
      </motion.div>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <div className="text-6xl mb-6">🙏</div>
      <h1 className="text-2xl font-bold font-devanagari mb-3" style={{ color: '#3d1f00' }}>
        आमंत्रण सापडले नाही
      </h1>
      <p className="text-amber-700 text-sm mb-8">हे invitation link कदाचित expired झाले असेल किंवा link चुकीची असेल.</p>
      <Link to="/" className="btn-saffron px-8 py-3">🏠 मुख्य पानावर जा</Link>
    </div>
  );
}

const DEMO_INVITATION: Invitation = {
  id: 'demo',
  slug: 'demo-invitation-2026',
  invitation_type: 'family',
  host_name: 'प्रशांत नलावडे',
  family_name: 'नलावडे परिवार',
  city: 'पुणे',
  address: '101, शांती अपार्टमेंट, कोथरूड',
  landmark: 'कोथरूड बस स्टॉप जवळ',
  arrival_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  arrival_time: '10:00',
  sthapana_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
  sthapana_time: '10:00',
  aarti_time: '20:00',
  prasad_time: '13:00',
  visarjan_date: new Date(Date.now() + 12 * 86400000).toISOString().split('T')[0],
  visarjan_time: '18:00',
  duration_days: 7,
  message: `श्री गणेशाय नमः 🙏

गणपती बाप्पांच्या आगमनाने आमच्या घरी आनंदाचे आणि भक्तीचे वातावरण निर्माण झाले आहे.

या मंगलमय प्रसंगी आपण सहकुटुंब उपस्थित राहून बाप्पांचे दर्शन घ्यावे व आमचा आनंद द्विगुणित करावा, ही नम्र विनंती.

गणपती बाप्पा मोरया! 🙏`,
  template_id: 'traditional',
  theme: 'saffron',
  background: 'festive-gradient',
  show_flowers: true,
  show_toran: true,
  show_diyas: true,
  show_rangoli: true,
  show_bells: true,
  show_particles: true,
  show_mandala: true,
  music_enabled: true,
  music_url: '/songs/_Marathi_Ganpati_Ringtone_(by Fringster.com).mp3',
  family_story: 'आमच्या घरी गेल्या 15 वर्षांपासून गणपती बाप्पांची स्थापना केली जाते. दरवर्षी संपूर्ण परिवार एकत्र येतो आणि बाप्पांचा उत्सव साजरा करतो.',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};
