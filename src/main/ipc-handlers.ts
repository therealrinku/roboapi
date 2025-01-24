import { ipcMain } from 'electron';

export function registerApiClientIpcHandlers(
  _mainWindow: Electron.BrowserWindow | null,
) {
  ipcMain.on('send-api-request', async (event, args) => {
    const headersObj: Record<string, string> = {};
    const paramsObj: Record<string, string> = {};
    args.headers.map((header: { key: string; value: string }) => {
      headersObj[header.key] = header.value;
    });
    args.params.map((param: { key: string; value: string }) => {
      paramsObj[param.key] = param.value;
    });
    const reqUrl = `${args.reqUrl}${new URLSearchParams(paramsObj)}`;
    const reqObj: RequestInit = {
      headers: headersObj,
      body:
        !['get', 'head'].includes(args.reqType.toLowerCase()) && args.body
          ? args.body
          : null,
      method: args.reqType,
      credentials: 'include',
    };

    try {
      const resp = await fetch(reqUrl, reqObj);

      const headers: Record<string, string> = {};
      const cookies: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        if (key === 'set-cookie') {
          const cookie = value.split(';')[0];
          const [cookieKey, cookieValue] = cookie.split('=');
          cookies[cookieKey] = cookieValue;
        }
        headers[key] = value;
      });

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
        responseCookies: cookies,
        responseCode: resp.status,
        responseStatusText: resp.statusText,
        requestUrl: args.reqUrl,
      };

      event.reply('send-api-request', eventReplyObj);
    } catch (err:any) {
      const eventReplyObj = {
        responseData: null,
        responseHeaders: {},
        responseCookies: {},
        responseCode: null,
        responseStatusText: err.message,
        requestUrl: args.reqUrl,
      };

      event.reply('send-api-request', eventReplyObj);
    }
  });
}
