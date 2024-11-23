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
    const reqObj: RequestInit = {
      headers: headersObj,
      body:
        !['get', 'head'].includes(args.reqType.toLowerCase()) && args.body
          ? args.body
          : null,
      method: args.reqType,
      credentials: 'include',
    };

    // add bearer token if provided
    if (args.bearerToken?.trim()) {
      reqObj.headers = {
        ...reqObj.headers,
        Authorization: `Bearer ${args.bearerToken}`,
      };
    }

    try {
      const resp = await fetch(reqUrl, reqObj);

      const headers: Record<string, string> = {};
      const cookies: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        headers[key] = value;
      });
      resp.headers.forEach((value, key) => {
        if (key === 'set-cookie') {
          const cookie = value.split(';')[0];
          const [cookieKey, cookieValue] = cookie.split('=');
          cookies[cookieKey] = cookieValue;
        }
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

      event.reply('send-request', eventReplyObj);
    } catch (err) {
      // throw 404 if some weird error happens, for now at least :)
      const eventReplyObj = {
        responseData: null,
        responseHeaders: {},
        responseCookies: {},
        responseCode: '404',
        responseStatusText: 'Not Found',
        requestUrl: args.reqUrl,
      };

      event.reply('send-request', eventReplyObj);
    }
  });
}
