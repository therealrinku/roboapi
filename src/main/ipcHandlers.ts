import { ipcMain } from 'electron';

export function registerIpcHandlers(mainWindow: Electron.BrowserWindow | null) {
  ipcMain.on('send-request', async (event, args) => {
    const resp = await fetch(args);
    const json = await resp.json();
    event.reply('send-request', json);
  });
}
