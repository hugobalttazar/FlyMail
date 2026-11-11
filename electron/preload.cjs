/**
 * FlyMail - Preload Script (Electron Context Isolation)
 * Expõe APIs seguras para a janela de renderização.
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isDesktop: true,
  platform: process.platform,
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  sendNotification: (title, body) => {
    new Notification(title, { body });
  },
});
