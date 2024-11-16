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
    const headers: Record<string, string> = {};

    resp.headers.forEach((value, key) => (headers[key] = value));

    if (
      resp.status !== 200 &&
      resp.status !== 201 &&
      resp.status !== 204 &&
      resp.status !== 202 &&
      resp.status !== 203
    ) {
      setTimeout(
        () =>
          event.reply('send-request', {
            responseData: null,
            responseHeaders: headers,
            responseCode: resp.status,
            responseStatusText: resp.statusText,
          }),
        3000,
      );
      return;
    }

    const json = await resp.json();

    setTimeout(
      () =>
        event.reply('send-request', {
          responseData: json,
          responseHeaders: headers,
          responseCode: resp.status,
          responseStatusText: resp.statusText,
        }),
      3000,
    );
  });
}
