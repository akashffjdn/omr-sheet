import { app, BrowserWindow, shell, session, ipcMain, dialog, protocol, net } from 'electron'
import { join } from 'path'

// Disable GPU shader disk cache, a common cause of Electron startup issues
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache')
app.commandLine.appendSwitch('ignore-certificate-errors')

// Register omr-local protocol to load local images securely
protocol.registerSchemesAsPrivileged([
    { scheme: 'omr-local', privileges: { secure: true, standard: true, supportFetchAPI: true, bypassCSP: true, corsEnabled: true } }
])

function createWindow(): void {
    const mainWindow = new BrowserWindow({
        width: 1440,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        show: false,
        icon: join(__dirname, '../../resources/icon.ico'),
        frame: false,
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#0f172a',
            symbolColor: '#94a3b8',
            height: 40
        },
        backgroundColor: '#0f172a',
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false,
            contextIsolation: true,
            nodeIntegration: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// ============================================
// IPC Handlers
// ============================================

// Select scanned sheet images — uses file dialog so users can see their images
ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        title: 'Select Scanned Sheet Images',
        filters: [
            { name: 'Image Files', extensions: ['jpg', 'jpeg', 'png', 'tif', 'tiff', 'bmp'] }
        ]
    })

    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, files: [], fullPaths: [] }
    }

    // Extract folder path from the first selected file
    const firstFile = result.filePaths[0]
    const folderPath = firstFile.substring(0, firstFile.replace(/\\/g, '/').lastIndexOf('/'))

    // Extract just the file names
    const files = result.filePaths.map((fp) => {
        const parts = fp.replace(/\\/g, '/').split('/')
        return parts[parts.length - 1]
    })

    return { canceled: false, files, fullPaths: result.filePaths, folderPath }
})

// Select file(s) with configurable filters
ipcMain.handle('select-file', async (_event, options: {
    title?: string
    filters?: { name: string; extensions: string[] }[]
    multiple?: boolean
}) => {
    const properties: ('openFile' | 'multiSelections')[] = ['openFile']
    if (options.multiple) properties.push('multiSelections')

    const result = await dialog.showOpenDialog({
        properties,
        title: options.title || 'Select File',
        filters: options.filters || [{ name: 'All Files', extensions: ['*'] }]
    })

    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, filePaths: [] }
    }

    // Extract just the file names from full paths
    const fileNames = result.filePaths.map((fp) => {
        const parts = fp.replace(/\\/g, '/').split('/')
        return parts[parts.length - 1]
    })

    return { canceled: false, filePaths: result.filePaths, fileNames }
})

app.whenReady().then(async () => {
    // Clear session cache to prevent issues where the app sometimes fails to open
    try {
        await session.defaultSession.clearCache()
    } catch (e) {
        console.error('Failed to clear session cache:', e)
    }

    app.setAppUserModelId('com.omrpro')

    protocol.handle('omr-local', (request) => {
        // With standard:true, 'omr-local://C:/path/file.jpg' is parsed as a standard URL
        // where 'C' becomes the hostname and the colon is stripped.
        // Reconstruct the full Windows file path from the parsed URL components.
        const parsed = new URL(request.url)
        let filePath: string
        if (parsed.host) {
            // Drive letter was parsed as hostname (e.g., host='c', pathname='/Users/hp/file.jpg')
            filePath = `${parsed.host.toUpperCase()}:${decodeURIComponent(parsed.pathname)}`
        } else {
            filePath = decodeURIComponent(parsed.pathname)
        }
        return net.fetch(`file:///${filePath.replace(/^\/+/, '')}`)
    })

    app.on('browser-window-created', (_, window) => {
        // Dev tools shortcut: F12 to toggle
        window.webContents.on('before-input-event', (event, input) => {
            if (input.key === 'F12') {
                window.webContents.toggleDevTools()
                event.preventDefault()
            }
        })
    })

    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
