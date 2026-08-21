import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, AlertCircle, Upload, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { showToast } from '../../components/ui/Toaster';
import { useAuth } from '../../contexts/AuthContext';
import { uploadPaymentQRCode } from '../../lib/paymentService';

const SETTINGS_CONFIG = [
  { key: 'invitation_price', label: 'Invitation Price (₹)', type: 'number', placeholder: '50', hint: 'Default ₹50 per invitation' },
  { key: 'upi_id', label: 'UPI ID', type: 'text', placeholder: 'yourname@upi', hint: 'The UPI ID customers will pay to (e.g. name@paytm, 9999999999@upi)' },
  { key: 'upi_payee_name', label: 'UPI Payee Name', type: 'text', placeholder: 'Ganpati Invitation', hint: 'Name shown on UPI payment screen' },
  { key: 'support_contact', label: 'Support Contact', type: 'text', placeholder: 'WhatsApp number or email', hint: 'Shown to users if payment has issues' },
];

export default function AdminSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [instructions, setInstructions] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [qrFile, setQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const qrInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from('app_settings').select('key, value');
    if (data) {
      const map = Object.fromEntries(data.map(d => [d.key, d.value]));
      setSettings(map);
      setInstructions(map.payment_instructions || '');
      setPaymentNote(map.payment_note || '');
      setQrPreview(map.payment_qr_url || null);
    }
    setLoading(false);
  }

  function handleQrFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('Only JPG, PNG, WebP allowed', 'error'); return;
    }
    if (file.size > 2 * 1024 * 1024) {
      showToast('File must be under 2MB', 'error'); return;
    }
    setQrFile(file);
    setQrPreview(URL.createObjectURL(file));
  }

  function removeQrCode() {
    setQrFile(null);
    setQrPreview(null);
    if (qrInputRef.current) qrInputRef.current.value = '';
    // Optional: mark for deletion on save
    updateField('payment_qr_url', '');
  }

  function updateField(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  async function save() {
    setSaving(true);
    let qrUrl = settings.payment_qr_url || '';
    
    if (qrFile) {
      const uploadedUrl = await uploadPaymentQRCode(qrFile);
      if (uploadedUrl) {
        qrUrl = uploadedUrl;
      } else {
        showToast('Failed to upload QR Code', 'error');
        setSaving(false);
        return;
      }
    } else if (qrPreview === null) {
      // User removed QR
      qrUrl = '';
    }

    const updates = [
      ...SETTINGS_CONFIG.map(c => ({ key: c.key, value: settings[c.key] || '' })),
      { key: 'payment_instructions', value: instructions },
      { key: 'payment_note', value: paymentNote },
      { key: 'payment_qr_url', value: qrUrl },
    ];

    const errors: string[] = [];
    for (const u of updates) {
      const { error } = await supabase
        .from('app_settings')
        .update({ value: u.value, updated_by: user?.id, updated_at: new Date().toISOString() })
        .eq('key', u.key);
      if (error) errors.push(u.key);
    }

    if (errors.length === 0) {
      showToast('Settings saved! ✓', 'success');
    } else {
      showToast(`Failed to save: ${errors.join(', ')}`, 'error');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-16"><div className="text-4xl animate-float">🙏</div></div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold" style={{ color: '#3d1f00' }}>⚙️ Admin Settings</h1>
          <p className="text-sm text-amber-700 mt-1">Configure payment, UPI, and app settings</p>
        </div>

        <div className="space-y-6">
          {/* Payment Settings */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="gold-card p-6">
            <h2 className="font-bold text-base mb-5" style={{ color: '#3d1f00' }}>💰 Payment Settings</h2>

            {!settings.upi_id && (
              <div className="mb-5 flex items-start gap-3 p-4 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-700">UPI ID not configured</p>
                  <p className="text-xs text-yellow-600 mt-0.5">
                    Payment QR code will not be shown to users until UPI ID is set.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {SETTINGS_CONFIG.map(cfg => (
                <div key={cfg.key}>
                  <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d1f00' }}>
                    {cfg.label}
                  </label>
                  <input
                    type={cfg.type}
                    value={settings[cfg.key] || ''}
                    onChange={e => updateField(cfg.key, e.target.value)}
                    placeholder={cfg.placeholder}
                    className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }}
                    onFocus={e => (e.target.style.borderColor = '#ff7300')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(212,160,23,0.4)')}
                  />
                  <p className="text-xs text-amber-500 mt-1">{cfg.hint}</p>
                </div>
              ))}

              {/* QR Code Upload */}
              <div className="mt-6">
                <label className="block text-sm font-semibold mb-1.5" style={{ color: '#3d1f00' }}>
                  Custom Payment QR Code <span className="text-amber-500 text-xs font-normal">(Optional)</span>
                </label>
                <p className="text-xs text-amber-600 mb-3">If uploaded, this will be shown instead of the generated UPI QR.</p>
                {qrPreview ? (
                  <div className="relative w-48 mx-auto">
                    <img src={qrPreview} alt="QR Preview" className="w-full object-contain rounded-xl border-2"
                      style={{ borderColor: 'rgba(212,160,23,0.3)' }} />
                    <button type="button" onClick={removeQrCode}
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => qrInputRef.current?.click()}
                    className="w-full py-6 rounded-xl border-2 border-dashed flex flex-col items-center gap-2 transition-all hover:bg-amber-50"
                    style={{ borderColor: 'rgba(212,160,23,0.4)', color: '#a07050' }}>
                    <Upload className="w-6 h-6" />
                    <span className="text-sm font-medium">Tap to upload QR Code</span>
                    <span className="text-xs text-amber-400">JPG, PNG, WebP • Max 2MB</span>
                  </button>
                )}
                <input ref={qrInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                  onChange={handleQrFileSelect} className="hidden" />
              </div>

              {/* Price note */}
              <div className="p-3 rounded-xl text-xs"
                style={{ background: 'rgba(255,115,0,0.06)', border: '1px solid rgba(255,115,0,0.15)' }}>
                <p className="text-amber-700">
                  <strong>Current Price:</strong> ₹{settings.invitation_price || 50} per invitation<br />
                  Changing the price affects new payment screens immediately. Existing pending payments retain their submitted amount.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Instructions */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="gold-card p-6">
            <h2 className="font-bold text-base mb-5" style={{ color: '#3d1f00' }}>📋 Payment Instructions</h2>
            <p className="text-xs text-amber-600 mb-3">Shown to users on the payment screen</p>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="Enter step-by-step payment instructions..."
              rows={6}
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all resize-none"
              style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }}
            />
          </motion.div>

          {/* Payment Note */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="gold-card p-6">
            <h2 className="font-bold text-base mb-3" style={{ color: '#3d1f00' }}>ℹ️ Payment Note</h2>
            <p className="text-xs text-amber-600 mb-3">Short note shown below payment form (e.g., expected verification time)</p>
            <input
              type="text"
              value={paymentNote}
              onChange={e => setPaymentNote(e.target.value)}
              placeholder="e.g. Payment verified within 1-2 hours"
              className="w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(212,160,23,0.4)', color: '#3d1f00' }}
            />
          </motion.div>

          {/* Save */}
          <button onClick={save} disabled={saving}
            className="btn-saffron w-full py-4 text-base flex items-center justify-center gap-2">
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
