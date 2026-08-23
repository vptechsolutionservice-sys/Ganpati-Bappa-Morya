import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Save, Eye } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { defaultBuilderState, saveDraftToStorage, loadDraftFromStorage, generateSlugFromState } from '../store/builderStore';
import type { BuilderState } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { showToast } from '../components/ui/Toaster';

// Steps
import Step1HostDetails from '../components/builder/Step1HostDetails';
import Step2BappaDetails from '../components/builder/Step2BappaDetails';
import Step3Design from '../components/builder/Step3Design';
import Step4Message from '../components/builder/Step4Message';
import Step5Personalize from '../components/builder/Step5Personalize';
import Step6Preview from '../components/builder/Step6Preview';
import Step7Share from '../components/builder/Step7Share';

const STEPS = [
  { label: 'Details', labelMr: 'माहिती', icon: '📝' },
  { label: 'Bappa', labelMr: 'बाप्पा', icon: '🙏' },
  { label: 'Design', labelMr: 'डिझाईन', icon: '🎨' },
  { label: 'Message', labelMr: 'संदेश', icon: '💬' },
  { label: 'Guests', labelMr: 'पाहुणे', icon: '👥' },
  { label: 'Preview', labelMr: 'पूर्वावलोकन', icon: '👁️' },
  { label: 'Share', labelMr: 'शेअर', icon: '📱' },
];

export default function CreateInvitation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<BuilderState>(() => {
    const draft = loadDraftFromStorage();
    return draft || { ...defaultBuilderState };
  });
  const [saving, setSaving] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStep = state.currentStep;

  // Auto-save to localStorage
  useEffect(() => {
    if (state.isDirty) {
      const timer = setTimeout(() => {
        saveDraftToStorage(state);
        setSavedIndicator(true);
        setTimeout(() => setSavedIndicator(false), 2000);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const update = useCallback((partial: Partial<BuilderState>) => {
    setState(prev => ({ ...prev, ...partial, isDirty: true }));
  }, []);

  function canAdvance(): boolean {
    switch (currentStep) {
      case 1:
        return !!(state.host_name && state.city && state.address);
      case 2:
        return !!(state.arrival_date && state.arrival_time && state.visarjan_date);
      case 3:
        return !!state.template_id;
      case 4:
        return !!state.message.trim();
      case 5:
        return true;
      case 6:
        return true;
      default:
        return true;
    }
  }

  function next() {
    if (!canAdvance()) {
      showToast('कृपया सर्व आवश्यक माहिती भरा.', 'error');
      return;
    }
    if (currentStep < 7) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function back() {
    if (currentStep > 1) {
      setState(prev => ({ ...prev, currentStep: prev.currentStep - 1 }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function saveToDatabase() {
    setSaving(true);
    try {
      const slug = state.slug || generateSlugFromState(state);

      const today = new Date().toISOString().split('T')[0];

      const invitationData = {
        user_id: user?.id || null,
        slug,
        invitation_type: state.invitation_type || 'family',
        host_name: state.host_name || 'Host',
        family_name: state.family_name || null,
        city: state.city || 'City',
        address: state.address || 'Address',
        landmark: state.landmark || null,
        mobile: state.mobile || null,
        maps_url: state.maps_url || null,
        arrival_date: state.arrival_date || today,
        arrival_time: state.arrival_time || '10:00',
        sthapana_date: state.sthapana_date || null,
        sthapana_time: state.sthapana_time || null,
        aarti_time: state.aarti_time || null,
        prasad_time: state.prasad_time || null,
        visarjan_date: state.visarjan_date || today,
        visarjan_time: state.visarjan_time || '18:00',
        duration_days: state.duration_days || 1,
        message: state.message || '',
        template_id: state.template_id || 'traditional',
        theme: state.theme || 'saffron',
        ganpati_image_url: state.ganpati_image_url || null,
        background: state.background || 'festive-gradient',
        show_flowers: state.show_flowers ?? true,
        show_toran: state.show_toran ?? true,
        show_diyas: state.show_diyas ?? true,
        show_rangoli: state.show_rangoli ?? true,
        show_bells: state.show_bells ?? true,
        show_particles: state.show_particles ?? true,
        show_mandala: state.show_mandala ?? true,
        music_enabled: state.music_enabled ?? false,
        family_story: state.family_story || null,
        status: 'active',
      };

      let invitationId = state.savedInvitationId;

      if (invitationId) {
        const { error } = await supabase
          .from('invitations')
          .update({ ...invitationData, updated_at: new Date().toISOString() })
          .eq('id', invitationId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('invitations')
          .insert(invitationData)
          .select('id, slug')
          .single();
        if (error) throw error;
        invitationId = data.id;
        setState(prev => ({ ...prev, slug: data.slug, savedInvitationId: data.id }));
      }

      // Save guests
      if (state.guests.length > 0 && invitationId) {
        for (const guest of state.guests) {
          await supabase.from('guests').upsert({
            invitation_id: invitationId,
            name: guest.name,
            slug: guest.slug,
          }, { onConflict: 'invitation_id,slug' });
        }
      }

      showToast('आमंत्रण जतन झाले! ✓', 'success');
      return { slug, invitationId: invitationId as string };
    } catch (err) {
      console.error(err);
      const fallbackSlug = state.slug || generateSlugFromState(state);
      setState(prev => ({ ...prev, slug: fallbackSlug, isDirty: false }));
      saveDraftToStorage({ ...state, slug: fallbackSlug });
      showToast('ड्राफ्ट स्थानिकरित्या जतन केला (Offline/Draft mode)', 'info');
      return { slug: fallbackSlug, invitationId: state.savedInvitationId || 'demo-invitation-2026' };
    } finally {
      setSaving(false);
    }
  }

  async function handleFinalize() {
    setIsSubmitting(true);
    const result = await saveToDatabase();
    if (result) {
      next();
    }
    setIsSubmitting(false);
  }

  const stepComponents = [
    <Step1HostDetails state={state} update={update} />,
    <Step2BappaDetails state={state} update={update} />,
    <Step3Design state={state} update={update} />,
    <Step4Message state={state} update={update} />,
    <Step5Personalize state={state} update={update} />,
    <Step6Preview state={state} saveInvitation={saveToDatabase} />,
    <Step7Share state={state} saveInvitation={saveToDatabase} />,
  ];

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(ellipse at top, #fff8f0 0%, #fdf0dc 100%)' }}>
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8 relative">
          <div className="text-3xl mb-2">🙏</div>
          <h1 className="text-2xl font-bold font-devanagari" style={{ color: '#3d1f00' }}>
            गणपती आमंत्रण तयार करा
          </h1>
          <p className="text-sm text-amber-700 mt-1">Create your beautiful Ganpati invitation</p>

          <button
            onClick={() => {
              if (window.confirm('नवीन आमंत्रण सुरू करायचे का? (याने जुना ड्राफ्ट हटवला जाईल)')) {
                localStorage.removeItem('ganpati_builder_draft');
                window.location.reload();
              }
            }}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors"
          >
            🔄 नवीन आमंत्रण (Reset Form)
          </button>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex items-center justify-center gap-1 min-w-max mx-auto px-4">
            {STEPS.map((step, i) => {
              const stepNum = i + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              return (
                <div key={stepNum} className="flex items-center">
                  <motion.div
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isActive ? 'step-active' : isCompleted ? 'step-completed' : 'step-inactive'
                    }`}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <span className={`text-[10px] font-medium hidden sm:block ${
                      isActive ? 'text-saffron-600' : isCompleted ? 'text-amber-600' : 'text-gray-400'
                    }`}>
                      {step.labelMr}
                    </span>
                  </motion.div>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-12 h-0.5 mx-1 transition-all duration-300 ${
                      currentStep > stepNum ? 'bg-amber-400' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Auto-save indicator */}
        <AnimatePresence>
          {savedIndicator && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-center mb-4 text-xs text-green-600 font-medium"
            >
              ✓ Draft saved
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {stepComponents[currentStep - 1]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        {currentStep < 7 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'rgba(212,160,23,0.2)' }}>
            <button
              onClick={back}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border font-medium text-sm transition-all hover:bg-amber-50 disabled:opacity-40"
              style={{ borderColor: 'rgba(212,160,23,0.3)', color: '#7a4c2a' }}
            >
              <ArrowLeft className="w-4 h-4" />
              मागे
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={saveToDatabase}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border font-medium text-sm transition-all hover:bg-amber-50 text-amber-700"
                style={{ borderColor: 'rgba(212,160,23,0.3)' }}
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Draft Save'}
              </button>

              {currentStep === 6 ? (
                <button
                  onClick={handleFinalize}
                  disabled={isSubmitting}
                  className="btn-saffron px-6 py-2.5 text-sm"
                >
                  {isSubmitting ? '⌛ Saving...' : '✅ Finalize & Share →'}
                </button>
              ) : (
                <button
                  onClick={next}
                  className="btn-saffron flex items-center gap-2 px-6 py-2.5 text-sm"
                >
                  पुढे
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
