const electron = require('electron');
const fs = require('fs');

let mainWindow = null;

electron.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electron.app.quit();
  }
});

electron.app.on('ready', () => {
  mainWindow = new electron.BrowserWindow({
    width: 1280,
    height: 800,
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

// IPC listeners for file transactions.
electron.ipcMain.on('save-file', (event, arg) => {
  fs.writeFile(arg.filename, arg.data, (err) => {
    event.returnValue = { err };
  });
});

electron.ipcMain.on('load-file', (event, arg) => {
  fs.readFile(arg.filename, (err, data) => {
    event.returnValue = { err, data };
  });
});
