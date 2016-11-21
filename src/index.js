const electron = require('electron');
const fs = require('fs');
const spawn = require('child_process').spawn;

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

//
// IPC listeners for file transactions.
//
//
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

electron.ipcMain.on('transpile-file', (event, arg) => {
  const transpiler = spawn('python', ['transpile/main.py', arg.filename, arg.port]);
  let errorBuffer = '';
  let outBuffer = '';

  transpiler.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    outBuffer += data;
  });

  transpiler.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    errorBuffer += data;
  });

  transpiler.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    event.sender.send('upload-complete', { code, outBuffer, errorBuffer });
  });
});


//
// IPC listeners for serial port
//
//

let serialProcess;
electron.ipcMain.on('open-serial', (event, arg) => {
  let errorBuffer = '';

  serialProcess = spawn('python', ['transpile/com_test.py', arg.port]);

  serialProcess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
    event.sender.send('serial-data', `${data}`);
  });

  serialProcess.stderr.on('data', (data) => {
    console.log(`stderr: ${data}`);
    errorBuffer += data;
  });

  serialProcess.on('close', (code) => {
    serialProcess = undefined;
    console.log(`serial process exited with code ${code}`);
    event.sender.send('serial-closed', code);
    if (code !== 0 && errorBuffer) {
      event.sender.send('serial-error', { errorBuffer });
    }
  });
});

electron.ipcMain.on('close-serial', (event) => {
  if (serialProcess) {
    serialProcess.kill();
  } else {
    event.sender.send('serial-closed', 100);
  }
});
