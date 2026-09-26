const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 820,
    minWidth: 980,
    minHeight: 650,
    title: 'BukuKasir UMKM - Desktop POS Kasir',
    icon: path.join(__dirname, 'icon.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.removeMenu();
  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC: Get System Printers for POS Thermal Configuration
ipcMain.handle('pos:get-printers', async () => {
  if (!mainWindow) return [];
  try {
    const printers = await mainWindow.webContents.getPrintersAsync();
    return printers.map(p => ({
      name: p.name,
      displayName: p.displayName || p.name,
      description: p.description || '',
      isDefault: p.isDefault,
      status: p.status
    }));
  } catch (err) {
    console.error('Gagal mengambil daftar printer:', err);
    return [];
  }
});

// IPC: Direct Silent Printing to Thermal Receipt Printer
ipcMain.handle('pos:print-receipt', async (event, { receiptHtml, deviceName, silent = true }) => {
  return new Promise((resolve) => {
    // Create an invisible background window tailored for 58mm / 80mm thermal paper
    const printWin = new BrowserWindow({
      show: false,
      width: 300,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true
      }
    });

    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          @page { size: auto; margin: 0mm; }
          body {
            margin: 0;
            padding: 4px;
            font-family: 'Courier New', Courier, monospace;
            font-size: 11px;
            line-height: 1.25;
            color: #000;
            width: 58mm;
          }
          .receipt-header { text-align: center; margin-bottom: 6px; border-bottom: 1px dashed #000; padding-bottom: 6px; }
          .receipt-title { font-size: 13px; font-weight: bold; text-transform: uppercase; }
          .receipt-meta { font-size: 10px; margin-top: 2px; }
          .receipt-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
          .receipt-table td { padding: 2px 0; }
          .receipt-divider { border-bottom: 1px dashed #000; margin: 4px 0; }
          .receipt-totals { width: 100%; margin-top: 4px; }
          .receipt-totals td { padding: 2px 0; }
          .receipt-footer { text-align: center; margin-top: 8px; font-size: 10px; border-top: 1px dashed #000; padding-top: 6px; }
        </style>
      </head>
      <body>
        ${receiptHtml}
      </body>
      </html>
    `;

    printWin.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(fullHtml));

    printWin.webContents.on('did-finish-load', () => {
      const options = {
        silent: silent,
        printBackground: true,
        margins: { marginType: 'none' }
      };

      if (deviceName) {
        options.deviceName = deviceName;
      }

      printWin.webContents.print(options, (success, errorType) => {
        printWin.close();
        if (!success) {
          resolve({ success: false, error: errorType });
        } else {
          resolve({ success: true });
        }
      });
    });
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
