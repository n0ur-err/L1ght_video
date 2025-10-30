# Light Video Downloader - Modern UI (2025)

> A beautiful, ultra-modern desktop app for downloading YouTube videos, powered by the latest web and native tech.

---

## 🚀 Tech Stack

- **Tauri 1.5+** (Rust) — Secure, ultra-lightweight desktop shell
- **React 18 + TypeScript** — Modern UI with hooks and type safety
- **Vite 5** — Lightning-fast dev/build tool
- **Framer Motion** — Professional-grade animations
- **Tailwind CSS 3** — Utility-first, glassmorphism styling
- **Lucide React** — Consistent, beautiful icons

## ✨ Key Features

- 🎨 **Glassmorphism UI** — Apple-inspired, translucent, animated
- 🌊 **Smooth Animations** — Framer Motion for premium feel
- ⚡ **Lightning Fast** — Vite + Tauri = instant startup
- 🔒 **Secure** — Tauri’s security-first model
- 📦 **Tiny Bundle** — 10x smaller than Electron
- 🎯 **Modern UX** — Intuitive, responsive, accessible
- �️ **Animated Backgrounds** — Dynamic gradients, floating particles
- 🗂️ **Download History & Library** — Track and manage downloads
- 🎵 **Audio/Video Quality Selection** — 4K, HD, SD, MP3
- 📂 **Custom Save Location** — Choose your download folder
- 🏁 **Live Stats** — Speed, ETA, and more

## 🛠️ Getting Started

### Prerequisites

- **Node.js** (v18+)
- **Rust** (latest stable)
- **Python 3.7+** (for backend)

### Setup

1. **Install Rust** (if not already):
	```bash
	winget install Rustlang.Rust.GNU
	# or visit https://rustup.rs/
	```
2. **Install Node dependencies:**
	```bash
	cd ui
	npm install
	```

### Development

Start the app in dev mode (hot reload):

```bash
npm run tauri:dev
```

### Production Build

Build the installer:

```bash
npm run tauri:build
```
Installer will be in `src-tauri/target/release/bundle/`

---

## 🖥️ UI/UX Highlights

- **Animated Gradient Backgrounds**
- **Floating Orbs & Parallax**
- **Glassmorphism Cards & Panels**
- **Custom Scrollbars**
- **Live Progress (Circle & Bar)**
- **Download History & Library Views**
- **Quality Selection Carousel**
- **Compact & Full Layouts (Responsive)**

## 🔧 Architecture Overview

```
ui/
├── src/
│   ├── App.tsx         # Main React UI
│   ├── main.tsx        # React entry
│   └── index.css       # Tailwind/global styles
├── src-tauri/
│   ├── src/main.rs     # Rust backend (calls Python)
│   ├── Cargo.toml      # Rust deps
│   └── tauri.conf.json # Tauri config
├── package.json        # Node deps/scripts
├── vite.config.ts      # Vite config
├── tailwind.config.js  # Tailwind config
└── tsconfig.json       # TypeScript config
```

## 📝 How It Works

- **Frontend:** React + Tailwind UI, Framer Motion animations, communicates with backend via Tauri invoke
- **Backend:** Rust (Tauri) bridges to Python (`main.py`) for actual download logic
- **Download:** Python script uses `yt-dlp` and `ffmpeg` to fetch and merge best quality video/audio
- **History:** All downloads are tracked locally (browser storage)
- **Cross-platform:** Windows, macOS, Linux (Tauri)

## 🧩 Notable Code/Design

- **App.tsx:** All main UI logic, state, and view switching
- **main.rs:** Rust Tauri backend, invokes Python, handles file/folder opening
- **Quality selection:** 4K, HD, SD, MP3 (audio only)
- **Animated progress:** Circular and linear, with live stats
- **Download history:** Saved in localStorage, shown in sidebar/history/library

## 📝 Notes

- The UI talks to the Python backend via Tauri’s IPC
- Downloads handled by `main.py` (Python, not bundled in UI folder)
- All animations respect system “reduced motion”
- App is fully offline-capable after build

## 🎯 Why This Stack?

- **Tauri > Electron:** 10x smaller, more secure, native speed
- **Vite > Webpack:** Instant HMR, fast builds
- **React 18:** Modern, concurrent rendering
- **Framer Motion:** Best-in-class animation
- **Tailwind CSS:** Rapid, modern styling

---

Enjoy your next-gen desktop YouTube downloader! 🚀
