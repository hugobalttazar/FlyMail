/**
 * FlyMail - Desktop Entrypoint (Electron)
 * Este arquivo é o processo principal nativo do Electron para rodar o FlyMail
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
    title: 'FlyMail',
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

  const indexPath = path.join(__dirname, '../dist/index.html');

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    mainWindow.loadFile(indexPath).catch((err) => {
      console.error('[FlyMail] Falha ao carregar index.html:', err);
    });
  }

  // Monitora erros de carregamento para facilitar diagnósticos
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error(`[FlyMail Error] Falha ao carregar recurso: ${validatedURL} (Código: ${errorCode}, ${errorDescription})`);
  });

  // Atalhos úteis: F12 ou Ctrl+Shift+I abre o Console/DevTools para depuração, F5 recarrega
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
    if (input.key === 'F5' || (input.control && input.key.toLowerCase() === 'r')) {
      mainWindow.reload();
      event.preventDefault();
    }
  });

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

// Handlers IPC para controle de janela (minimização, maximização, fechamento)
ipcMain.on('window-minimize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.close();
});

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
