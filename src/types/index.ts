// All TypeScript types for the Ganpati Invitation Platform

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  is_admin: boolean;
  created_at: string;
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

export type RSVPResponse = 'yes' | 'maybe' | 'no';

export interface RSVP {
  id: string;
  invitation_id: string;
  guest_id?: string;
  guest_name?: string;
  response: RSVPResponse;
  guest_count: number;
  created_at: string;
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
