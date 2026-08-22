import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar, Music, Volume2, VolumeX } from 'lucide-react';
import type { Invitation } from '../../types';
import { formatDateIndian, formatTime12 } from '../../lib/utils';
import CountdownTimer from './CountdownTimer';
import { cn } from '../../lib/utils';

interface Props {
  invitation: Invitation;
  guestName?: string;
  previewMode?: boolean;
  flowerCount?: number;
  diyaCount?: number;
}

export default function InvitationCard({
  invitation,
  guestName,
  previewMode = false,
  flowerCount = 0,
  diyaCount = 0,
}: Props) {
  const [musicPlaying, setMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const bgImage = invitation.ganpati_image_url || '/images/ganpati-hero.jpg';

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  function toggleMusic() {
    if (musicPlaying) {
      audioRef.current?.pause();
      setMusicPlaying(false);
    } else {
      if (!audioRef.current) {
        const songUrl = invitation.music_url || '/songs/_Marathi_Ganpati_Ringtone_(by Fringster.com).mp3';
        const audio = new Audio(songUrl);
        audio.loop = true;
        audioRef.current = audio;
      }
      audioRef.current.play().catch(() => {
        // Autoplay may be blocked if no user interaction
      });
      setMusicPlaying(true);
    }
  }

  return (
    <div className="invitation-card rounded-3xl overflow-hidden relative" style={{
      fontFamily: "'Noto Sans Devanagari', 'Noto Serif Devanagari', serif",
    }}>
      {/* Top decorative border */}
      <div className="h-2 w-full" style={{
        background: 'linear-gradient(90deg, #ff7300, #d4a017, #c0392b, #d4a017, #ff7300)'
      }} />

      {/* Header */}
      <div className="text-center py-6 px-6 relative">
        {/* Rangoli corners */}
        {invitation.show_rangoli && (
          <>
            <div className="absolute top-2 left-2 text-2xl opacity-30 select-none">🌸</div>
            <div className="absolute top-2 right-2 text-2xl opacity-30 select-none">🌸</div>
          </>
        )}

        {/* Bell decorations */}
        {invitation.show_bells && (
          <div className="flex justify-center gap-4 mb-2">
            <span className="text-lg animate-bell-swing">🔔</span>
            <span className="text-lg animate-bell-swing" style={{ animationDelay: '0.3s' }}>🔔</span>
          </div>
        )}

        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm font-semibold tracking-widest mb-1"
          style={{ color: '#d4a017' }}
        >
          ॥ श्री गणेशाय नमः ॥
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-2xl sm:text-3xl font-bold"
          style={{ color: '#ff7300' }}
        >
          गणपती बाप्पा मोरया! 🙏
        </motion.h1>

        {/* Music toggle */}
        {invitation.music_enabled && !previewMode && (
          <button
            onClick={toggleMusic}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-amber-50"
          >
            {musicPlaying ? <Volume2 className="w-5 h-5 text-saffron-500" /> : <VolumeX className="w-5 h-5 text-amber-400" />}
          </button>
        )}
      </div>

      {/* Toran */}
      {invitation.show_toran && (
        <div className="w-full overflow-hidden h-10 flex items-center justify-center" style={{
          background: 'linear-gradient(90deg, #ff9a3c22, #d4a01722, #ff9a3c22)'
        }}>
          <img src="/images/toran.jpg" alt="toran" className="h-10 object-cover w-full opacity-40" />
        </div>
      )}

      {/* Ganpati Image */}
      <div className="flex justify-center py-6 px-6 relative">
        {invitation.show_particles && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${15 + i * 13}%`,
                  bottom: '20%',
                  background: '#ffd700',
                }}
                animate={{ y: [0, -60, 0], opacity: [0, 0.8, 0] }}
                transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
              />
            ))}
          </div>
        )}

        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative"
        >
          <div className="w-52 h-52 rounded-full overflow-hidden border-4 shadow-2xl"
            style={{ borderColor: '#d4a017', boxShadow: '0 0 30px rgba(212,160,23,0.4)' }}>
            <img
              src={bgImage}
              alt="Ganpati Bappa"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Diya decorations */}
          {invitation.show_diyas && (
            <>
              <motion.div
                className="absolute -bottom-2 -left-4 text-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >🪔</motion.div>
              <motion.div
                className="absolute -bottom-2 -right-4 text-2xl"
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
              >🪔</motion.div>
            </>
          )}
        </motion.div>
      </div>

      {/* Greeting */}
      <div className="text-center px-6 mb-2">
        <p className="text-xs text-amber-600 uppercase tracking-wider mb-2">सस्नेह निमंत्रण</p>
        {guestName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-bold mb-1"
            style={{ color: '#c0392b' }}
          >
            प्रिय {guestName}, ❤️
          </motion.p>
        )}
        <p className="text-base font-bold" style={{ color: '#3d1f00' }}>
          {invitation.family_name || invitation.host_name}
        </p>
        <p className="text-xs text-amber-600">{invitation.city}</p>
      </div>

      {/* Message */}
      <div className="mx-6 my-4 p-4 rounded-xl border-l-4 font-devanagari text-sm leading-relaxed whitespace-pre-wrap"
        style={{ background: 'rgba(255,243,224,0.6)', borderColor: '#ff7300', color: '#3d1f00' }}>
        {invitation.message}
      </div>

      {/* Gold divider */}
      <div className="flex items-center gap-3 mx-6 my-4">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)' }} />
        <span className="text-amber-400">🌸</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)' }} />
      </div>

      {/* Event Details */}
      <div className="px-6 pb-4 space-y-3">
        <EventRow icon="🚗" labelMr="बाप्पांचे आगमन" label="Bappa Arrival"
          date={invitation.arrival_date} time={invitation.arrival_time} />

        {invitation.aarti_time && (
          <EventRow icon="🪔" labelMr="महाआरती" label="Maha Aarti"
            time={invitation.aarti_time} />
        )}

        {invitation.prasad_time && (
          <EventRow icon="🍛" labelMr="महाप्रसाद" label="Maha Prasad"
            time={invitation.prasad_time} />
        )}

        <EventRow icon="🌊" labelMr="विसर्जन" label="Visarjan"
          date={invitation.visarjan_date} time={invitation.visarjan_time} />
      </div>

      {/* Gold divider */}
      <div className="flex items-center gap-3 mx-6 my-4">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)' }} />
        <span className="text-amber-400">🪔</span>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,160,23,0.5), transparent)' }} />
      </div>

      {/* Host + Location */}
      <div className="px-6 pb-6 text-center">
        <p className="text-xs text-amber-600 mb-1">आपले स्नेहांकित</p>
        <p className="font-bold font-devanagari text-base" style={{ color: '#3d1f00' }}>
          {invitation.host_name}
          {invitation.family_name && invitation.family_name !== invitation.host_name
            ? ` व ${invitation.family_name}` : ''}
        </p>

        {(invitation.address || invitation.city) && (
          <div className="flex items-start justify-center gap-1 mt-2 text-xs text-amber-700">
            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <span>{invitation.address}{invitation.city ? `, ${invitation.city}` : ''}</span>
          </div>
        )}

        {invitation.landmark && (
          <p className="text-xs text-amber-500 mt-1">🏷️ {invitation.landmark}</p>
        )}
      </div>

      {/* Countdown - only if not in preview and dates set */}
      {!previewMode && invitation.arrival_date && (
        <div className="px-6 pb-6">
          <CountdownTimer
            arrivalDate={invitation.arrival_date}
            arrivalTime={invitation.arrival_time}
            visarjanDate={invitation.visarjan_date}
            visarjanTime={invitation.visarjan_time}
          />
        </div>
      )}

      {/* Offerings count */}
      {!previewMode && (flowerCount > 0 || diyaCount > 0) && (
        <div className="flex justify-center gap-6 px-6 pb-4 text-xs text-amber-600">
          {flowerCount > 0 && <span>🌸 {flowerCount} भक्तांनी फुले अर्पण केली</span>}
          {diyaCount > 0 && <span>🪔 {diyaCount} दिवे लावले गेले</span>}
        </div>
      )}

      {/* Bottom motto */}
      <div className="text-center py-4 px-6">
        <p className="font-bold text-lg font-devanagari" style={{ color: '#ff7300' }}>
          गणपती बाप्पा मोरया! 🙏
        </p>
        <p className="text-sm font-devanagari" style={{ color: '#d4a017' }}>
          मंगलमूर्ती मोरया!
        </p>
      </div>

      {/* Bottom decorative border */}
      <div className="h-2 w-full" style={{
        background: 'linear-gradient(90deg, #c0392b, #d4a017, #ff7300, #d4a017, #c0392b)'
      }} />
    </div>
  );
}

function EventRow({ icon, labelMr, label, date, time }: {
  icon: string; labelMr: string; label: string;
  date?: string; time?: string;
}) {
  if (!date && !time) return null;
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border"
      style={{ background: 'rgba(255,255,255,0.7)', borderColor: 'rgba(212,160,23,0.2)' }}>
      <span className="text-xl">{icon}</span>
      <div className="flex-1">
        <p className="font-semibold text-xs font-devanagari" style={{ color: '#3d1f00' }}>{labelMr}</p>
        <p className="text-[10px] text-amber-500">{label}</p>
      </div>
      <div className="text-right">
        {date && (
          <p className="text-xs font-medium" style={{ color: '#3d1f00' }}>
            📅 {formatDateIndian(date).split(',').slice(0, 2).join(',')}
          </p>
        )}
        {time && (
          <p className="text-xs text-amber-600">⏰ {formatTime12(time)}</p>
        )}
      </div>
    </div>
  );
}
