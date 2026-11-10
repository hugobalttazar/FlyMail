/**
 * AeroMail - Desktop Entrypoint (Electron)
 * Este arquivo é o processo principal nativo do Electron para rodar o AeroMail
 * como uma aplicação desktop instalável no Windows (.exe), Linux ou macOS.
 */

const { app, BrowserWindow, shell, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let tray = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 840,
    minWidth: 980,
    minHeight: 640,
    title: 'AeroMail',
    backgroundColor: '#0F172A',
    frame: true, // Mantém a barra de título nativa do Windows ou pode ser customizada
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // Em desenvolvimento, carrega o servidor local Vite. Em produção, carrega dist/index.html
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production';

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Abre links externos no navegador padrão do usuário em vez de dentro do Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:') || url.startsWith('http:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicializa a aplicação
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
