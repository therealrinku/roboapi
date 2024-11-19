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
    const reqUrl = `${args.reqUrl}${new URLSearchParams(paramsObj)}`;
    const reqObj = {
      headers: headersObj,
      body:
        !['get', 'head'].includes(args.reqType.toLowerCase()) && args.body
          ? args.body
          : null,
      method: args.reqType,
    };

    try {
      const resp = await fetch(reqUrl, reqObj);

      const headers: Record<string, string> = {};
      resp.headers.forEach((value, key) => (headers[key] = value));

      let responseData = null;
      const contentType = resp.headers.get('Content-Type');

      if (contentType?.includes('application/json')) {
        responseData = await resp.json();
      } else if (contentType?.includes('text/html')) {
        responseData = await resp.text();
      }

      const eventReplyObj = {
        responseData: responseData,
        responseHeaders: headers,
        responseCode: resp.status,
        responseStatusText: resp.statusText,
        requestUrl: args.reqUrl,
      };

      event.reply('send-request', eventReplyObj);
    } catch (err) {
      // throw 404 if some weird error happens, for now at least :)
      const eventReplyObj = {
        responseData: null,
        responseHeaders: {},
        responseCode: '404',
        responseStatusText: 'Not Found',
        requestUrl: args.reqUrl,
      };

      event.reply('send-request', eventReplyObj);
    }
  });
}
