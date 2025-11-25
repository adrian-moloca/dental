import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('dentalos', {
  sync: {
    trigger: () => ipcRenderer.invoke('sync:trigger'),
    getStatus: () => ipcRenderer.invoke('sync:getStatus'),
    onStatusChanged: (callback: (status: any) => void) => {
      ipcRenderer.on('sync:statusChanged', (_event, status) => callback(status));
    }
  },
  device: {
    getInfo: () => ipcRenderer.invoke('device:getInfo'),
    isRegistered: () => ipcRenderer.invoke('device:isRegistered'),
    register: (credentials: any) => ipcRenderer.invoke('device:register', credentials),
    clear: () => ipcRenderer.invoke('device:clear')
  },
  theme: {
    toggle: (theme: 'light' | 'dark') => ipcRenderer.invoke('theme:toggle', theme),
    onChanged: (callback: (theme: 'light' | 'dark') => void) => {
      ipcRenderer.on('theme:changed', (_event, theme) => callback(theme));
    }
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    checkCustom: (channel: 'stable' | 'beta' | 'alpha') => ipcRenderer.invoke('update:checkCustom', channel),
    downloadAndApply: (updateInfo: any) => ipcRenderer.invoke('update:downloadAndApply', updateInfo),
    getStatus: () => ipcRenderer.invoke('update:getStatus'),
    rollback: () => ipcRenderer.invoke('update:rollback'),
    onStatus: (callback: (status: any) => void) => {
      ipcRenderer.on('update:status', (_event, status) => callback(status));
    }
  }
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    on: (channel: string, callback: (...args: any[]) => void) => {
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    },
    removeAllListeners: (channel: string) => {
      ipcRenderer.removeAllListeners(channel);
    }
  }
});

declare global {
  interface Window {
    dentalos: {
      sync: {
        trigger: () => Promise<any>;
        getStatus: () => Promise<any>;
        onStatusChanged: (callback: (status: any) => void) => void;
      };
      device: {
        getInfo: () => Promise<any>;
        isRegistered: () => Promise<boolean>;
        register: (credentials: any) => Promise<any>;
        clear: () => Promise<void>;
      };
      theme: {
        toggle: (theme: 'light' | 'dark') => Promise<{ success: boolean }>;
        onChanged: (callback: (theme: 'light' | 'dark') => void) => void;
      };
      update: {
        check: () => Promise<any>;
        download: () => Promise<{ success: boolean }>;
        install: () => Promise<void>;
        checkCustom: (channel: 'stable' | 'beta' | 'alpha') => Promise<any>;
        downloadAndApply: (updateInfo: any) => Promise<{ success: boolean }>;
        getStatus: () => Promise<any>;
        rollback: () => Promise<{ success: boolean }>;
        onStatus: (callback: (status: any) => void) => void;
      };
    };
    electron?: {
      ipcRenderer: {
        on: (channel: string, callback: (...args: any[]) => void) => void;
        removeAllListeners: (channel: string) => void;
      };
    };
  }
}
