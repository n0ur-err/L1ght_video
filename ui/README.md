# Light Video Downloader - Modern UI

A stunning, modern desktop application for downloading YouTube videos built with the latest 2025 technologies.

## 🚀 Tech Stack

- **Tauri 1.5** - Lightweight, secure desktop framework (Rust-based)
- **React 18** - Latest React with TypeScript
- **Vite 5** - Lightning-fast build tool
- **Framer Motion** - Smooth, professional animations
- **Tailwind CSS 3** - Modern utility-first styling
- **Lucide React** - Beautiful, consistent icons

## ✨ Features

- 🎨 **Glassmorphism UI** - Apple-inspired translucent design
- 🌊 **Smooth Animations** - Powered by Framer Motion
- 🎯 **Modern UX** - Intuitive, clean interface
- ⚡ **Lightning Fast** - Built with Vite and Tauri
- 🔒 **Secure** - Tauri's security-first approach
- 📦 **Small Bundle** - Much lighter than Electron

## 🛠️ Installation

### Prerequisites

1. **Node.js** (v18 or higher)
2. **Rust** (latest stable)
3. **Python 3.7+** (for the backend)

### Install Rust (if not installed)

```bash
# Windows
winget install Rustlang.Rust.GNU

# Or visit: https://rustup.rs/
```

### Setup

1. Navigate to the UI directory:
```bash
cd ui
```

2. Install dependencies:
```bash
npm install
```

## 🚀 Development

Run in development mode:

```bash
npm run tauri:dev
```

This will start the Vite dev server and launch the Tauri app with hot-reload.

## 📦 Build

Build for production:

```bash
npm run tauri:build
```

The installer will be created in `src-tauri/target/release/bundle/`

## 🎨 Design Features

- **Animated Gradient Background** - Dynamic, eye-catching colors
- **Floating Orbs** - Subtle parallax effect
- **Glass Morphism Cards** - Translucent, blurred panels
- **Smooth Transitions** - Every interaction feels premium
- **Responsive Progress** - Real-time download feedback
- **Quality Selection** - Visual, icon-based options
- **Modern Icons** - Lucide icon set
- **Custom Scrollbars** - Matches the glass aesthetic

## 🔧 Architecture

```
ui/
├── src/
│   ├── App.tsx           # Main React component
│   ├── main.tsx          # React entry point
│   └── index.css         # Global styles + utilities
├── src-tauri/
│   ├── src/
│   │   └── main.rs       # Rust backend (bridges to Python)
│   ├── Cargo.toml        # Rust dependencies
│   └── tauri.conf.json   # Tauri configuration
├── package.json          # Node dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind customization
└── tsconfig.json         # TypeScript configuration
```

## 📝 Notes

- The UI communicates with the Python backend via Tauri's IPC
- Downloads are handled by the existing `main.py` script
- All animations respect system preferences (reduced motion)
- The app is fully offline-capable once built

## 🎯 Why This Stack?

- **Tauri over Electron**: 10x smaller, more secure, faster
- **Vite over Webpack**: Instant HMR, faster builds
- **React 18**: Latest features, concurrent rendering
- **Framer Motion**: Industry-standard animations
- **Tailwind CSS**: Rapid, modern styling

Enjoy your modern 2025 desktop app! 🚀
