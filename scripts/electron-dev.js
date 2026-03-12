// Unset ELECTRON_RUN_AS_NODE before launching electron-vite
// This env var is injected by VS Code/Cursor (Electron-based IDEs) and
// causes Electron to run as plain Node.js, breaking require('electron')
delete process.env.ELECTRON_RUN_AS_NODE

const { execSync } = require('child_process')
const command = process.argv[2] || 'dev'

try {
    execSync(`npx electron-vite ${command}`, {
        stdio: 'inherit',
        env: process.env
    })
} catch {
    process.exit(1)
}
