import { contextBridge, ipcRenderer } from 'electron'

// Electron API — replaces @electron-toolkit/preload which breaks in Electron 35
const electronAPI = {
    ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
        on: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) => {
            ipcRenderer.on(channel, listener)
            return () => { ipcRenderer.removeListener(channel, listener) }
        },
        once: (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: unknown[]) => void) =>
            ipcRenderer.once(channel, listener),
        invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
        removeListener: (channel: string, listener: (...args: unknown[]) => void) =>
            ipcRenderer.removeListener(channel, listener),
        removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
    },
    process: {
        versions: process.versions,
        platform: process.platform
    }
}

const api = {
    selectFolder: (): Promise<{
        canceled: boolean
        files: string[]
        fullPaths: string[]
        folderPath?: string
    }> => ipcRenderer.invoke('select-folder'),

    selectFile: (options: {
        title?: string
        filters?: { name: string; extensions: string[] }[]
        multiple?: boolean
    }): Promise<{
        canceled: boolean
        filePaths: string[]
        fileNames?: string[]
    }> => ipcRenderer.invoke('select-file', options)
}

if (process.contextIsolated) {
    try {
        contextBridge.exposeInMainWorld('electron', electronAPI)
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    // @ts-ignore
    window.electron = electronAPI
    // @ts-ignore
    window.api = api
}

