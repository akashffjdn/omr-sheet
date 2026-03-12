interface ElectronAPI {
    ipcRenderer: {
        send: (channel: string, ...args: unknown[]) => void
        on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => () => void
        once: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
        invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
        removeListener: (channel: string, listener: (...args: unknown[]) => void) => void
        removeAllListeners: (channel: string) => void
    }
    process: {
        versions: NodeJS.ProcessVersions
        platform: string
    }
}

interface Window {
    electron: ElectronAPI
    api: {
        selectFolder: () => Promise<{
            canceled: boolean
            files: string[]
            fullPaths: string[]
            folderPath?: string
        }>
        selectFile: (options: {
            title?: string
            filters?: { name: string; extensions: string[] }[]
            multiple?: boolean
        }) => Promise<{
            canceled: boolean
            filePaths: string[]
            fileNames?: string[]
        }>
    }
}
