const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posBridge', {
  isElectron: true,
  getPrinters: () => ipcRenderer.invoke('pos:get-printers'),
  printReceipt: ({ receiptHtml, deviceName, silent, paperWidth }) => 
    ipcRenderer.invoke('pos:print-receipt', { receiptHtml, deviceName, silent, paperWidth })
});
