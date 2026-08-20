import { useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Invitation } from '../../types';
import { generateICS, downloadICS, formatDateIndian, formatTime12 } from '../../lib/utils';

interface Props { invitation: Invitation }

export default function LocationCard({ invitation }: Props) {
  const [calOpen, setCalOpen] = useState(false);

  function openMaps() {
    if (invitation.maps_url) {
      window.open(invitation.maps_url, '_blank');
    } else {
      const query = encodeURIComponent(`${invitation.address}, ${invitation.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  }

  function addToCalendar(event: 'arrival' | 'visarjan' | 'aarti' | 'prasad') {
    let title = '', date = '', time = '';
    const loc = `${invitation.address}, ${invitation.city}`;

    if (event === 'arrival') {
      title = `गणपती बाप्पांचे आगमन — ${invitation.host_name}`;
      date = invitation.arrival_date;
      time = invitation.arrival_time;
    } else if (event === 'visarjan') {
      title = `गणपती विसर्जन — ${invitation.host_name}`;
      date = invitation.visarjan_date;
      time = invitation.visarjan_time;
    } else if (event === 'aarti') {
      title = `महाआरती — ${invitation.host_name}`;
      date = invitation.arrival_date;
      time = invitation.aarti_time || '20:00';
    } else {
      title = `महाप्रसाद — ${invitation.host_name}`;
      date = invitation.arrival_date;
      time = invitation.prasad_time || '13:00';
    }

    const ics = generateICS({ title, description: invitation.message, location: loc, startDate: date, startTime: time });
    downloadICS(ics, title.replace(/\s+/g, '-'));
    setCalOpen(false);
  }

  return (
    <div className="space-y-4">
      {/* Location */}
      <div className="rounded-2xl p-5" style={{
        background: 'linear-gradient(135deg, rgba(255,115,0,0.06), rgba(212,160,23,0.04))',
        border: '1px solid rgba(212,160,23,0.2)',
      }}>
        <h3 className="font-bold font-devanagari text-base mb-4 flex items-center gap-2" style={{ color: '#3d1f00' }}>
          <MapPin className="w-5 h-5 text-saffron-500" /> बाप्पांचे स्थान
        </h3>
        <p className="text-sm font-devanagari text-amber-800 mb-1">{invitation.address}</p>
        <p className="text-sm font-semibold" style={{ color: '#3d1f00' }}>{invitation.city}</p>
        {invitation.landmark && (
          <p className="text-xs text-amber-500 mt-1">🏷️ {invitation.landmark}</p>
        )}

        <button
          onClick={openMaps}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white transition-all hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #4285f4, #2b6cb0)' }}
        >
          <Navigation className="w-4 h-4" /> 🗺️ मार्ग पहा
        </button>
      </div>

      {/* Calendar */}
      <div className="rounded-2xl p-5" style={{
        background: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(212,160,23,0.2)',
      }}>
        <button
          onClick={() => setCalOpen(!calOpen)}
          className="w-full flex items-center justify-between font-bold font-devanagari text-sm"
          style={{ color: '#3d1f00' }}
        >
          <span>📅 Calendar मध्ये जोडा</span>
          <span className="text-amber-400">{calOpen ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {calOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-4 space-y-2">
                {[
                  { key: 'arrival' as const, label: 'बाप्पांचे आगमन', date: invitation.arrival_date, time: invitation.arrival_time },
                  invitation.aarti_time ? { key: 'aarti' as const, label: 'महाआरती', date: invitation.arrival_date, time: invitation.aarti_time } : null,
                  invitation.prasad_time ? { key: 'prasad' as const, label: 'महाप्रसाद', date: invitation.arrival_date, time: invitation.prasad_time } : null,
                  { key: 'visarjan' as const, label: 'विसर्जन', date: invitation.visarjan_date, time: invitation.visarjan_time },
                ].filter(Boolean).map(ev => ev && (
                  <button
                    key={ev.key}
                    onClick={() => addToCalendar(ev.key)}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm hover:bg-amber-50 transition-colors"
                    style={{ border: '1px solid rgba(212,160,23,0.2)' }}
                  >
                    <span className="font-devanagari font-medium" style={{ color: '#3d1f00' }}>{ev.label}</span>
                    <span className="text-xs text-amber-500">{ev.date ? formatDateIndian(ev.date).split(',')[0] : ''} {ev.time ? formatTime12(ev.time) : ''}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
