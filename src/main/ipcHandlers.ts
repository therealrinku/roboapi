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
      {
        headers: headersObj,
        body: args.body ? JSON.stringify(args.body) : null,
        method: args.reqType,
      },
    );
    const json = await resp.json();
    const headers: Record<string, string> = {};

    resp.headers.forEach((value, key) => (headers[key] = value));
    setTimeout(
      () =>
        event.reply('send-request', { responseJson: json, headers: headers }),
      3000,
    );
    // event.reply('send-request', json);
  });
}
