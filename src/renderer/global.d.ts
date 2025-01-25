export type IRequest = {
  rootFolder: string | null;
  reqUrl: string;
  reqType: 'get' | 'post' | 'put' | 'patch' | 'head' | 'options';
  headers: Array<{ key: string; value: string; isActive: boolean }>;
  params: Array<{ key: string; value: string; isActive: boolean }>;
  body: string;
  bearerToken: string;
  apiKeyKey: string;
  apiKeyValue: string;
  isApiKeyActive: boolean;
  isBearerTokenActive: boolean;
  notes: string;
  passApiKeyBy: 'headers' | 'params';
  authorizationType: 'bearer' | 'api_key';
  activeRequestTab: 'headers' | 'params' | 'authorization' | 'body' | 'notes';
  activeResponseTab: 'headers' | 'response' | 'cookies';
  loading: boolean;
};

export type IResponse = {
  requestUrl: null | string;
  responseCode: null | string;
  responseStatusText: string | null;
  responseData: string | null;
  responseHeaders: Record<string, string>;
  responseCookies: Record<string, string>;
};

export type IAuthorizationTypes = 'bearer' | 'api_key';
