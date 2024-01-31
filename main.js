const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const fs = require('fs');
const iconv = require('iconv-lite');

let mainWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: __dirname + '/preload.js',
    },
  });

  // index.html の代わりに外部のウェブページを読み込む
  mainWindow.loadURL('https://sakura-swift.com/csv'); // ここに表示させたいウェブページのURLを指定

  ipcMain.handle('convert-csv', async (event, filePath) => {
    try {
      // ダウンロードされたCSVを読み取り、ANSIからUTF-8に変換
      const content = fs.readFileSync(filePath);
      const utf8String = iconv.decode(content, 'Shift_JIS');
      const utf8Buffer = Buffer.from(utf8String, 'utf8');

      // 変換したCSVを保存ダイアログを開いて保存
      const savePath = dialog.showSaveDialogSync(mainWindow, {
        defaultPath: 'converted.csv',
        filters: [
          { name: 'CSV Files', extensions: ['csv'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (savePath) {
        fs.writeFileSync(savePath, utf8Buffer);
        return savePath;
      } else {
        throw new Error('No save path selected.');
      }
    } catch (error) {
      throw new Error(error.message);
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
