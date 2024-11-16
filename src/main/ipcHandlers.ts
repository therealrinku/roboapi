import { ipcMain } from 'electron';

export function registerIpcHandlers(mainWindow: Electron.BrowserWindow | null) {
  ipcMain.on('send-request', async (event, args) => {
    const headersObj: Record<string, string> = {};
    const paramsObj: Record<string, string> = {};

    args.headers.map((header: { key: string; value: string }) => {
      headersObj[header.key] = header.value;
    });
    args.params.map((param: { key: string; value: string }) => {
      paramsObj[param.key] = param.value;
    });

    const resp = await fetch(
      `${args.reqUrl}?` + new URLSearchParams(paramsObj),
      { headers: headersObj },
    );
    const json = await resp.json();
    setTimeout(() => event.reply('send-request', json), 3000);
    // event.reply('send-request', json);
  });
}
