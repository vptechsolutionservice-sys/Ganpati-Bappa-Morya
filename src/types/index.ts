// All TypeScript types for the Ganpati Invitation Platform

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
}

// ─── PAYMENT TYPES ─────────────────────────────────────────────────────────

export type PaymentStatus = 'PENDING' | 'PAID' | 'REJECTED' | 'REFUNDED';
export type InvitationPaymentStatus = 'FREE' | 'PENDING' | 'PAID';
export type PaymentProviderType = 'UPI_MANUAL' | 'RAZORPAY' | 'CASHFREE' | 'PHONEPE';

export interface Payment {
  id: string;
  user_id?: string;
  invitation_id: string;
  amount: number;
  currency: string;
  transaction_id: string;
  payment_screenshot_url?: string;
  status: PaymentStatus;
  rejection_reason?: string;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
  // Joined fields
  user?: Pick<User, 'id' | 'name' | 'email'>;
  invitation?: Pick<Invitation, 'id' | 'slug' | 'host_name' | 'city'>;
}

export interface AppSetting {
  id: string;
  key: string;
  value: string;
  updated_by?: string;
  updated_at: string;
}

export interface AdminLog {
  id: string;
  admin_id?: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface PaymentSettings {
  invitation_price: number;
  upi_id: string;
  upi_payee_name: string;
  payment_instructions: string;
  support_contact: string;
  payment_note: string;
  payment_qr_url?: string;
}

export interface RevenueStats {
  total_revenue: number;
  today_revenue: number;
  week_revenue: number;
  month_revenue: number;
  pending_count: number;
  paid_count: number;
  rejected_count: number;
}

export type InvitationType = 'individual' | 'family' | 'friends_group' | 'society' | 'organization';
export type InvitationStatus = 'draft' | 'active' | 'visarjan' | 'archived';
export type DurationDays = 1 | 3 | 5 | 7 | 10 | 'custom';

export interface Invitation {
  id: string;
  user_id?: string;
  slug: string;
  invitation_type: InvitationType;
  host_name: string;
  family_name?: string;
  city: string;
  address: string;
  landmark?: string;
  mobile?: string;
  family_photo_url?: string;
  maps_url?: string;
  arrival_date: string;
  arrival_time: string;
  sthapana_date?: string;
  sthapana_time?: string;
  aarti_time?: string;
  prasad_time?: string;
  visarjan_date: string;
  visarjan_time: string;
  duration_days: number;
  message: string;
  template_id?: string;
  theme: string;
  ganpati_image_url?: string;
  background: string;
  show_flowers: boolean;
  show_toran: boolean;
  show_diyas: boolean;
  show_rangoli: boolean;
  show_bells: boolean;
  show_particles: boolean;
  show_mandala: boolean;
  music_enabled: boolean;
  family_story?: string;
  status: InvitationStatus;
  // Payment fields (migration 006)
  payment_status?: InvitationPaymentStatus;
  is_unlocked?: boolean;
  is_public?: boolean;
  payment_id?: string;
  // RSVP settings (migration 007)
  rsvp_enabled?: boolean;
  rsvp_allow_maybe?: boolean;
  rsvp_max_per_person?: number;
  rsvp_allow_message?: boolean;
  rsvp_show_public_count?: boolean;
  rsvp_deadline?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Guest {
  id: string;
  invitation_id: string;
  name: string;
  slug: string;
  created_at: string;
}

export type RSVPStatus = 'COMING' | 'MAYBE' | 'NOT_ATTENDING';
// Legacy alias — keep for any old references
export type RSVPResponse = RSVPStatus;

export interface RSVP {
  id: string;
  invitation_id: string;
  guest_token?: string;
  session_key?: string;
  guest_name: string;
  status: RSVPStatus;
  attendee_count: number;
  message?: string;
  created_at: string;
  updated_at: string;
}

export interface RSVPStats {
  coming_count: number;
  maybe_count: number;
  not_count: number;
  total_count: number;
  confirmed_people: number;
  possible_people: number;
}

export interface RSVPSettings {
  rsvp_enabled: boolean;
  rsvp_allow_maybe: boolean;
  rsvp_max_per_person: number;
  rsvp_allow_message: boolean;
  rsvp_show_public_count: boolean;
  rsvp_deadline: string | null;
}

export interface InvitationView {
  id: string;
  invitation_id: string;
  guest_id?: string;
  viewed_at: string;
}

export interface InvitationShare {
  id: string;
  invitation_id: string;
  platform: string;
  shared_at: string;
}

export interface FlowerOffering {
  id: string;
  invitation_id: string;
  guest_id?: string;
  created_at: string;
}

export interface DiyaOffering {
  id: string;
  invitation_id: string;
  guest_id?: string;
  created_at: string;
}

export interface Memory {
  id: string;
  invitation_id: string;
  image_url: string;
  caption?: string;
  created_at: string;
}

export type TemplateCategory =
  | 'traditional'
  | 'royal'
  | 'minimal'
  | 'floral'
  | 'temple'
  | 'peshwai'
  | 'modern'
  | 'eco'
  | 'family';

export interface Template {
  id: string;
  name: string;
  name_marathi?: string;
  category: TemplateCategory;
  preview_url?: string;
  configuration: TemplateConfig;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface TemplateConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  background: string;
  fontStyle: string;
  borderStyle: string;
  showMandala: boolean;
  showToran: boolean;
  showDiyas: boolean;
  showFlowers: boolean;
  showParticles: boolean;
}

export type GanpatiImageCategory =
  | 'traditional'
  | 'royal'
  | 'eco'
  | 'bal_ganesh'
  | 'minimal'
  | 'decorative'
  | 'maharashtrian'
  | 'artistic';

export interface GanpatiImage {
  id: string;
  title: string;
  category: GanpatiImageCategory;
  image_url: string;
  status: 'active' | 'inactive';
  created_at: string;
}

// Builder State
export interface BuilderState {
  // Step 1: Host Details
  invitation_type: InvitationType;
  host_name: string;
  family_name: string;
  city: string;
  address: string;
  landmark: string;
  mobile: string;
  family_photo_url: string;

  // Step 2: Bappa Details
  arrival_date: string;
  arrival_time: string;
  sthapana_date: string;
  sthapana_time: string;
  aarti_time: string;
  prasad_time: string;
  visarjan_date: string;
  visarjan_time: string;
  duration_days: number;
  maps_url: string;

  // Step 3: Design
  template_id: string;
  background: string;
  theme: string;
  show_flowers: boolean;
  show_toran: boolean;
  show_diyas: boolean;
  show_rangoli: boolean;
  show_bells: boolean;
  show_particles: boolean;
  show_mandala: boolean;

  // Step 4: Ganpati Image
  ganpati_image_url: string;

  // Step 5: Message
  message: string;

  // Step 6: Guest / Personalize
  guests: { name: string; slug: string }[];

  // Step 7: Music
  music_enabled: boolean;

  // Meta
  slug: string;
  family_story: string;
  currentStep: number;
  isDirty: boolean;
  savedInvitationId: string | null;
}

// Analytics
export interface InvitationAnalytics {
  invitation_id: string;
  total_views: number;
  total_shares: number;
  rsvp_yes: number;
  rsvp_maybe: number;
  rsvp_no: number;
  total_guests: number;
  flower_offerings: number;
  diya_offerings: number;
  guests: (Guest & { rsvp?: RSVP; viewed: boolean })[];
}

// Dashboard Stats
export interface DashboardStats {
  total_invitations: number;
  total_views: number;
  total_shares: number;
  total_rsvp_yes: number;
  total_guest_count: number;
  total_flower_offerings: number;
  total_diya_offerings: number;
}
