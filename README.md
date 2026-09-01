<div align="center">

  <img src="https://avatarfiles.alphacoders.com/174/174875.png" alt="Cenot Avatar" width="100" height="100" style="border-radius: 50%; box-shadow: 0 0 25px rgba(139, 92, 246, 0.4);" />

  # ⚡ NOTNOT STORE • LINK BIO & WEB

  <p align="center">
    <strong>Aesthetic, Ultra-Fast Dual-Column Bio & Web Hub with Dynamic Admin Dashboard & Supabase Integration.</strong>
  </p>

  <p align="center">
    <a href="https://notnot.store" target="_blank">
      <img src="https://img.shields.io/badge/Live_Demo-notnot.store-8b5cf6?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" />
    </a>
    <img src="https://img.shields.io/badge/React-19.x-61dafb?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-8.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  </p>

  <p align="center">
    <i>"aut vincere aut mori"</i>
  </p>

</div>

---

## ✨ Features

- 🌌 **Dual-Column Architecture**: Side-by-side grid on desktop showcasing **Bio Links** on the left and **Web Links** on the right with sleek gradient indicator accents.
- 📱 **Adaptive Mobile Experience**: Responsive segmented tabs switcher with active pill micro-animations for smartphones and tablets.
- 🛠️ **Built-in Admin Dashboard (`/admin`)**:
  - Live link management for both **Bio Link** and **Web** tabs.
  - **1-Click Tab Transfer**: Move links between Bio and Web effortlessly.
  - **Drag & Drop Sorting**: Reorder cards in real time.
  - **Icon Picker & SVG Support**: Built-in icons (Discord, Coffee, Manga, Cart, TikTok, etc.) or custom SVG/URL.
  - **Live Profile Customization**: Modify avatar, name, bio description, and footer slogans.
- ☁️ **Cloud Database Sync**: Powered by **Supabase JSONB** with real-time sync and local storage persistence.
- 🎡 **Interactive Miniapps**:
  - **🎡 Gacha Wheel (`/spin`)**: Full-featured physics-based lucky spin wheel with sound effects and confetti celebrations.
  - **🌐 Join Network (`/join`)**: Dynamic ZeroTier QR code scanner and instant Network ID copy clipboard.
- 💎 **Dark Glassmorphism Design**: Ambient radial glow movements, backdrop blur, and fluid hover micro-interactions.

---

## 🛠️ Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **Styling** | Vanilla CSS3 (Custom Design System, CSS Variables, Glassmorphism) |
| **Typography** | [Outfit](https://fonts.google.com/specimen/Outfit) & Inter Font Families |
| **Database** | [Supabase](https://supabase.com/) (PostgreSQL & JSONB) |
| **Interactive Libraries**| QR Code Generator, HTML5 Canvas Physics Engine |
| **Deployment** | Vercel / Netlify / Cloudflare Pages |

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/ccenot/linktree.git
cd linktree
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Setup Database Schema (Supabase)
Run the SQL script inside [supabase-setup.sql](./supabase-setup.sql) in your Supabase SQL Editor to initialize the `profile_config` table.

### 5. Run Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Admin Panel Access

Access the admin dashboard at:
```
http://localhost:5173/admin
```
- **Default ID**: `cenot`
- **Default Password**: `(password kamu)` *(Secured with SHA-256 validation)*

---

## 📦 Build for Production

```bash
npm run build
```
The output files will be in the `dist/` directory, optimized and ready for deployment.

---

## 👤 Author

**CENOT**
- Website: [notnot.store](https://notnot.store)
- GitHub: [@ccenot](https://github.com/ccenot)
- TikTok: [@ccenot](https://www.tiktok.com/@ccenot)
- Discord: [SANS Server](https://tr.ee/sans)

---

<div align="center">
  <sub>Built with ❤️ & passion by CENOT • © 2026</sub>
</div>

