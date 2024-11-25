export type IApp = 'super_api_client' | 'super_sql_client' | null;

export type ISuperApiRequestTypes =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

export type ISuperApiTabs = 'Headers' | 'Params' | 'Body' | 'Authorization';

export type ISuperApiResponse = {
  requestUrl: null | string;
  responseCode: null | string;
  responseStatusText: string | null;
  responseData: string | null;
  responseHeaders: Record<string, string>;
  responseCookies: Record<string, string>;
};
