# 🪔 Ganpati Invitation Platform — Setup Guide

## ✅ Build Status
- **Build**: ✓ Passing (exit code 0, 2869 modules)
- **Dev server**: http://localhost:5173/

---

## 🗄️ Step 1: Run Supabase Migration

Open your Supabase project → **SQL Editor** → paste and run:

📄 [`supabase/migrations/001_initial_schema.sql`](file:///c:/Users/prath/OneDrive/Desktop/Ganpati/supabase/migrations/001_initial_schema.sql)

This creates all tables, RLS policies, storage buckets, and auth triggers.

---

## 🔑 Step 2: Configure Supabase Credentials

File: [`src/lib/supabase.ts`](file:///c:/Users/prath/OneDrive/Desktop/Ganpati/src/lib/supabase.ts)

```ts
const SUPABASE_URL = 'https://sukhdbuokxrrsylxtdvr.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

---

## 🛡️ Step 3: Enable Google Auth (Optional)

Supabase Dashboard → **Authentication** → **Providers** → Enable **Google** → Add OAuth credentials.

---

## 🚀 Step 4: Run Dev Server

```bash
npm run dev
# → http://localhost:5173/
```

---

## 📱 App Routes

| Route | Page |
|-------|------|
| `/` | Landing Page |
| `/create` | 7-Step Invitation Builder |
| `/templates` | Template Gallery (10 templates) |
| `/invite/demo-invitation-2026` | Demo Public Invitation |
| `/invite/:slug` | Public Invitation View |
| `/invite/:slug/:guest` | Personalized Invitation |
| `/dashboard` | Host Dashboard |
| `/dashboard/invitations` | Manage Invitations |
| `/dashboard/guests` | Guest Manager |
| `/dashboard/analytics` | Charts & Analytics |
| `/dashboard/memories` | Memory Gallery |
| `/admin` | Admin Dashboard |
| `/admin/users` | User Management |
| `/admin/invitations` | All Invitations |
| `/admin/templates` | Template Management |
| `/admin/images` | Ganpati Image Gallery |

---

## 🌸 Key Features Built

### Public Invitation (`/invite/:slug`)
- ✅ 6-screen animated intro sequence
- ✅ Personalized guest greeting  
- ✅ Countdown timer (arrival → active → visarjan phases)
- ✅ Interactive flower offering with animation
- ✅ Interactive diya lighting with flame + particles
- ✅ 3-option RSVP with guest count
- ✅ Location card + Google Maps
- ✅ Calendar download (ICS)
- ✅ Share buttons (WhatsApp, Telegram, Facebook, Copy)
- ✅ Memory gallery
- ✅ Sticky mobile action bar
- ✅ Viral referral CTA

### Invitation Builder (`/create`)
- ✅ 7-step wizard with progress bar
- ✅ Auto-save to localStorage
- ✅ Supabase sync on publish
- ✅ Guest personalization + bulk links
- ✅ 10 premium templates
- ✅ Customization (colors, decorations, background)
- ✅ Message library (Marathi presets)

### Dashboard
- ✅ Real stats from Supabase
- ✅ Guest management table
- ✅ Analytics charts (Recharts)
- ✅ Memory gallery with upload

### Admin
- ✅ Platform-wide stats
- ✅ User management + admin toggle
- ✅ Invitation management + status control
- ✅ Template seed & management
- ✅ Ganpati image gallery with upload

---

## 🎨 Design System

- **Primary**: Saffron `#ff7300`, Gold `#d4a017`, Maroon `#c0392b`
- **Font**: Noto Sans Devanagari + Inter
- **Components**: `.btn-saffron`, `.gold-card`, `.dashboard-stat-card`, `.btn-whatsapp`

---

## गणपती बाप्पा मोरया! 🙏
