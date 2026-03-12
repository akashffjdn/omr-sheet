const sharp = require('sharp')
const { default: pngToIco } = require('png-to-ico')
const fs = require('fs')
const path = require('path')

async function generateIcon() {
    const size = 512
    const padding = 60
    const innerSize = size - padding * 2

    // Create the OMR Pro icon as SVG
    // Design: Rounded square with gradient background, OMR bubble grid + checkmark
    const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <!-- Background gradient -->
            <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#6366f1"/>
                <stop offset="50%" style="stop-color:#4f46e5"/>
                <stop offset="100%" style="stop-color:#3730a3"/>
            </linearGradient>
            <!-- Accent gradient -->
            <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#22d3ee"/>
                <stop offset="100%" style="stop-color:#06b6d4"/>
            </linearGradient>
            <!-- Shadow -->
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="#000" flood-opacity="0.3"/>
            </filter>
        </defs>

        <!-- Background rounded square -->
        <rect x="24" y="24" width="464" height="464" rx="96" ry="96" fill="url(#bg)" filter="url(#shadow)"/>

        <!-- Subtle inner glow -->
        <rect x="24" y="24" width="464" height="464" rx="96" ry="96" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="2"/>

        <!-- OMR Bubble Grid (4x4) - representing answer sheet bubbles -->
        <!-- Row 1 -->
        <circle cx="150" cy="160" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="220" cy="160" r="22" fill="rgba(255,255,255,0.9)"/>
        <circle cx="290" cy="160" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="360" cy="160" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>

        <!-- Row 2 -->
        <circle cx="150" cy="230" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="220" cy="230" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="290" cy="230" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="360" cy="230" r="22" fill="rgba(255,255,255,0.9)"/>

        <!-- Row 3 -->
        <circle cx="150" cy="300" r="22" fill="rgba(255,255,255,0.9)"/>
        <circle cx="220" cy="300" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="290" cy="300" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
        <circle cx="360" cy="300" r="22" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>

        <!-- Row labels (Q numbers) -->
        <text x="105" y="167" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle">1</text>
        <text x="105" y="237" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle">2</text>
        <text x="105" y="307" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="rgba(255,255,255,0.6)" text-anchor="middle">3</text>

        <!-- Column labels (A B C D) -->
        <text x="150" y="122" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="rgba(255,255,255,0.5)" text-anchor="middle">A</text>
        <text x="220" y="122" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="rgba(255,255,255,0.5)" text-anchor="middle">B</text>
        <text x="290" y="122" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="rgba(255,255,255,0.5)" text-anchor="middle">C</text>
        <text x="360" y="122" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="rgba(255,255,255,0.5)" text-anchor="middle">D</text>

        <!-- Checkmark badge (bottom-right) -->
        <circle cx="390" cy="380" r="52" fill="url(#accent)"/>
        <circle cx="390" cy="380" r="52" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
        <polyline points="365,380 382,397 415,360" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`

    // Generate PNGs at multiple sizes
    const allSizes = [16, 24, 32, 48, 64, 128, 256, 512]
    const icoSizes = [16, 24, 32, 48, 64, 128, 256] // NSIS max 256px
    const pngBuffers = {}

    for (const s of allSizes) {
        pngBuffers[s] = await sharp(Buffer.from(svg))
            .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toBuffer()
    }

    // Save 512px PNG (for Linux/macOS)
    fs.writeFileSync(path.join(__dirname, '..', 'resources', 'icon.png'), pngBuffers[512])
    console.log('Created resources/icon.png (512x512)')

    // Save individual PNGs for ico generation (up to 256px only)
    const tempDir = path.join(__dirname, '..', 'resources', 'temp-icons')
    fs.mkdirSync(tempDir, { recursive: true })
    const tempPaths = []
    for (const s of icoSizes) {
        const p = path.join(tempDir, `icon-${s}.png`)
        fs.writeFileSync(p, pngBuffers[s])
        tempPaths.push(p)
    }

    // Generate .ico with multiple sizes (max 256px for NSIS compatibility)
    const icoBuffer = await pngToIco(tempPaths)

    // Clean up temp files
    for (const p of tempPaths) fs.unlinkSync(p)
    fs.rmdirSync(tempDir)
    fs.writeFileSync(path.join(__dirname, '..', 'resources', 'icon.ico'), icoBuffer)
    console.log('Created resources/icon.ico (multi-size: 16-512)')

    console.log('Icon generation complete!')
}

generateIcon().catch(console.error)
