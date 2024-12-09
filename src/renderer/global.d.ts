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

export type ISuperApiAuthorizationTypes = 'bearer' | 'api_key';

// ---------------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------------
type ISuperSqlConnectionSuccessResponse = {
  success: boolean;
  message: string;
};

type ISuperSqlConnectionErrorResponse = {
  error: boolean;
  message: string;
};

type ISuperSqlConnectionResponse =
  | ISuperSqlConnectionSuccessResponse
  | ISuperSqlConnectionErrorResponse;

type ISuperSqlDbTables = Array<{ table_name: string }>;

type ISuperSqlDbQueryResponse = {
  rows: Record<string, string>[];
  rowCount: number;
  command: string;
  fields: Array<{
    name: string;
    tableID: number;
    columnID: number;
    dataTypeID: number;
    dataTypeSize: number;
    dataTypeModifier: number;
    format: string;
  }>;
  oid?: number;
};

export type ISuperSqlSendQueryResponse = {
  error?: boolean;
  success?: boolean;
  message?: string;
  response?: string;
  // response?: ISuperSqlDbQueryResponse;
};

export type ISuperSqlGetTablesQueryResponse = {
  error?: boolean;
  success?: boolean;
  message?: string;
  // response?: {
  //   rows: { table_name: string }[];
  // };
  response?: string;
};
