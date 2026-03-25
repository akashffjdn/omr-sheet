# OMR Sheet Scanner - Desktop Application

A professional desktop application for scanning, processing, and grading OMR (Optical Mark Recognition) answer sheets. Built with Electron, React, and TypeScript.

![Electron](https://img.shields.io/badge/Electron-41-47848F?logo=electron&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Release](https://img.shields.io/badge/Release-v1.0.0-brightgreen)

## Download

[Download v1.0.0](https://github.com/akashffjdnh/omr-sheet/releases/tag/v1.0.0) - Available for Windows, macOS, and Linux

## Features

- OMR answer sheet scanning and processing
- Automated grading and mark detection
- Results dashboard with analytics charts
- Cross-platform support (Windows, macOS, Linux)
- Modern UI with Radix UI components
- Smooth animations with Framer Motion
- Image processing with Sharp

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Electron 41 |
| Frontend | React 18, TypeScript |
| Build | electron-vite, electron-builder |
| UI | Radix UI, Tailwind CSS |
| State | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Image Processing | Sharp, png-to-ico |
| Routing | React Router 7 |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/akashffjdnh/omr-sheet.git
cd omr-sheet

# Install dependencies
npm install

# Start development mode
npm run dev
```

### Build

```bash
# Build for Windows
npm run build:win

# Build for macOS
npm run build:mac

# Build for Linux
npm run build:linux
```

## Screenshots

_Application screenshots coming soon_

## CI/CD

Automated builds configured via GitHub Actions (`.github/workflows/`).

## License

MIT
