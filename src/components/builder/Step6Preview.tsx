import type { BuilderState } from '../../types';
import InvitationCard from '../ganpati/InvitationCard';

interface Props { state: BuilderState; }

export default function Step6Preview({ state }: Props) {
  const invitation = {
    id: 'preview',
    user_id: undefined,
    slug: state.slug || 'preview',
    invitation_type: state.invitation_type,
    host_name: state.host_name || 'प्रशांत नलावडे',
    family_name: state.family_name || 'नलावडे परिवार',
    city: state.city || 'पुणे',
    address: state.address || 'कोथरूड, पुणे',
    landmark: state.landmark,
    mobile: state.mobile,
    family_photo_url: state.family_photo_url,
    maps_url: state.maps_url,
    arrival_date: state.arrival_date || new Date().toISOString().split('T')[0],
    arrival_time: state.arrival_time || '10:00',
    sthapana_date: state.sthapana_date,
    sthapana_time: state.sthapana_time,
    aarti_time: state.aarti_time,
    prasad_time: state.prasad_time,
    visarjan_date: state.visarjan_date || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    visarjan_time: state.visarjan_time || '18:00',
    duration_days: state.duration_days,
    message: state.message,
    template_id: state.template_id,
    theme: state.theme,
    ganpati_image_url: state.ganpati_image_url,
    background: state.background,
    show_flowers: state.show_flowers,
    show_toran: state.show_toran,
    show_diyas: state.show_diyas,
    show_rangoli: state.show_rangoli,
    show_bells: state.show_bells,
    show_particles: state.show_particles,
    show_mandala: state.show_mandala,
    music_enabled: state.music_enabled,
    family_story: state.family_story,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold font-devanagari mb-1" style={{ color: '#3d1f00' }}>
          👁️ Step 6 — पूर्वावलोकन
        </h2>
        <p className="text-sm text-amber-700">Preview your invitation before sharing</p>
      </div>

      <div className="max-w-lg mx-auto">
        <InvitationCard
          invitation={invitation}
          guestName={state.guests[0]?.name}
          previewMode
        />
      </div>
    </div>
  );
}
