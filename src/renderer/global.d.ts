export type IRequestTypes =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'PATCH'
  | 'HEAD'
  | 'OPTIONS';

export type ITabs = 'Headers' | 'Params' | 'Body' | 'Authorization' | "Notes";

export type IResponse = {
  requestUrl: null | string;
  responseCode: null | string;
  responseStatusText: string | null;
  responseData: string | null;
  responseHeaders: Record<string, string>;
  responseCookies: Record<string, string>;
};

export type IAuthorizationTypes = 'bearer' | 'api_key';
