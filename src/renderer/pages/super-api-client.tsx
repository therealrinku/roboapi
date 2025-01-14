import { useEffect, useState } from 'react';
import {
  FiAlertTriangle,
  FiClipboard,
  FiFolder,
  FiTrash2,
} from 'react-icons/fi';
import { GoCheckCircle, GoCheckCircleFill } from 'react-icons/go';
import Loading from '../components/common/loading';
import useSuperApp from '../hooks/use-super-app';
import {
  ISuperApiAuthorizationTypes,
  ISuperApiRequestTypes,
  ISuperApiResponse,
  ISuperApiTabs,
} from '../global';
import ReactJsonView from '@microlink/react-json-view';
import ReactCodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';

export default function SuperApiClient() {
  const { quitApp } = useSuperApp();

  const [reqUrl, setReqUrl] = useState('');
  const [reqType, setReqType] = useState<ISuperApiRequestTypes>('GET');
  const [response, setResponse] = useState<ISuperApiResponse>({
    requestUrl: null,
    responseCode: null,
    responseStatusText: null,
    responseData: null,
    responseHeaders: {},
    responseCookies: {},
  });

  /////////
  const [rootFolder, setRootFolder] = useState(
    localStorage.getItem('api_client_root_folder'),
  );
  ////

  const [activeTab, setActiveTab] = useState<ISuperApiTabs>('Headers');
  const [loading, setLoading] = useState<boolean>(false);
  const [authorizationType, setAuthorizationType] =
    useState<ISuperApiAuthorizationTypes>('bearer');
  const [bearerToken, setBearerToken] = useState<string | null>('');
  const [isBearerTokenActive, setIsBearerTokenActive] = useState(true);
  const [apiKeyKey, setApiKeyKey] = useState<string>('');
  const [apiKeyValue, setApiKeyValue] = useState<string>('');
  const [isApiKeyActive, setIsApiKeyActive] = useState(true);
  const [passApiKeyBy, setPassApiKeyBy] = useState<'headers' | 'params'>(
    'headers',
  );

  const [activeResponseTab, setActiveResponseTab] = useState<
    'Response' | 'Headers' | 'Cookies'
  >('Response');

  const [headers, setHeaders] = useState([
    { key: '', value: '', isActive: true },
  ]);
  const [params, setParams] = useState([
    { key: '', value: '', isActive: true },
  ]);
  const [body, setBody] = useState<any>('');

  async function sendReq() {
    setLoading(true);

    const activeHeaders = headers.filter(
      (header) => header.key.trim() && header.isActive,
    );
    const activeParams = params.filter(
      (param) => param.key.trim() && param.isActive,
    );

    const isApiKeyPresentAndActive =
      isApiKeyActive && apiKeyKey.trim() && apiKeyValue.trim();
    if (isApiKeyPresentAndActive) {
      if (passApiKeyBy === 'headers') {
        activeHeaders.push({
          key: apiKeyKey,
          value: apiKeyValue,
          isActive: isApiKeyActive,
        });
      } else {
        activeParams.push({
          key: apiKeyKey,
          value: apiKeyValue,
          isActive: isApiKeyActive,
        });
      }
    }

    const isBearerTokenActiveAndPresent =
      isBearerTokenActive && bearerToken && bearerToken.trim();
    if (isBearerTokenActiveAndPresent) {
      activeHeaders.push({
        key: 'Authorization',
        value: `Bearer ${bearerToken}`,
        isActive: isApiKeyActive,
      });
    }

    window.electron.ipcRenderer.sendMessage('send-api-request', {
      reqType: reqType,
      reqUrl: reqUrl,
      headers: activeHeaders,
      params: activeParams,
      body: body,
    });

    window.electron.ipcRenderer.once('send-api-request', (arg) => {
      setResponse(arg as ISuperApiResponse);
      setLoading(false);
    });
  }

  function handleChangeHeader(
    type: 'key' | 'value',
    index: number,
    value: string,
  ) {
    const copiedHeaders = [...headers];
    copiedHeaders[index][type] = value;
    setHeaders(copiedHeaders);
  }

  function handleHeaderActiveToggle(index: number) {
    const copiedHeaders = [...headers];
    copiedHeaders[index].isActive = !copiedHeaders[index].isActive;
    setHeaders(copiedHeaders);
  }

  function handleDeleteHeader(index: number) {
    if (index === 0 && headers.length === 1) {
      const copiedHeaders = [...headers];
      copiedHeaders[index].key = '';
      copiedHeaders[index].value = '';
      setHeaders(copiedHeaders);
      return;
    }
    setHeaders((prev) => prev.filter((_, i) => i !== index));
  }

  function handleChangeParams(
    type: 'key' | 'value',
    index: number,
    value: string,
  ) {
    const copiedParams = [...params];
    copiedParams[index][type] = value;
    setParams(copiedParams);
  }

  function handleParamsActiveToggle(index: number) {
    const copiedParams = [...params];
    copiedParams[index].isActive = !copiedParams[index].isActive;
    setParams(copiedParams);
  }

  function handleDeleteParams(index: number) {
    if (index === 0 && params.length === 1) {
      const copiedParams = [...params];
      copiedParams[index].key = '';
      copiedParams[index].value = '';
      setParams(copiedParams);
      return;
    }
    setParams((prev) => prev.filter((_, i) => i !== index));
  }

  const headersCount = headers.filter(
    (header) => header.key.trim() && header.isActive,
  ).length;
  const paramsCount = params.filter(
    (param) => param.key.trim() && param.isActive,
  ).length;
  const authorizationExists =
    (isBearerTokenActive && bearerToken && bearerToken.trim().length > 0) ||
    (isApiKeyActive && apiKeyKey.trim() && apiKeyValue.trim());

  const responseHeadersCount = Object.keys(response.responseHeaders).length;
  const responseCookieCount = Object.keys(response.responseCookies).length;

  const isHTMLResponse =
    response.responseHeaders['content-type']?.includes('text/html');
  const isJSONResponse =
    response.responseHeaders['content-type']?.includes('application/json');

  useEffect(() => {
    const apiPlaygroundSavedState = localStorage.getItem(
      'api_client_playground_state',
    );
    if (apiPlaygroundSavedState) {
      const parsed = JSON.parse(apiPlaygroundSavedState);
      setActiveResponseTab(parsed.activeResponseTab);
      if (parsed.response) {
        setResponse(parsed.response);
      }
      setReqUrl(parsed.reqUrl);
      setReqType(parsed.reqType ?? 'GET');
      setActiveTab(parsed.activeTab);
      setBearerToken(parsed.bearerToken);
      setAuthorizationType(parsed.authorizationType);
      setParams(parsed.params);
      setHeaders(parsed.headers);
      setIsBearerTokenActive(parsed.isBearerTokenActive);
      setIsApiKeyActive(parsed.isApiKeyActive);
      setBody(parsed.body);
      setPassApiKeyBy(parsed.passApiKeyBy);
    }
  }, []);

  useEffect(() => {
    if (!rootFolder) {
      const apiPlaygroundState = {
        reqUrl,
        activeResponseTab,
        response,
        reqType,
        activeTab,
        bearerToken,
        authorizationType,
        params,
        headers,
        isBearerTokenActive,
        isApiKeyActive,
        body,
        passApiKeyBy,
      };

      localStorage.setItem(
        'api_client_playground_state',
        JSON.stringify(apiPlaygroundState),
      );
    }
  }, [
    response,
    reqUrl,
    reqType,
    activeTab,
    bearerToken,
    authorizationType,
    activeResponseTab,
    params,
    headers,
    bearerToken,
    isBearerTokenActive,
    isApiKeyActive,
    body,
    passApiKeyBy,
  ]);

  const lastHeader = headers[headers.length - 1];
  const lastParam = params[params.length - 1];

  useEffect(() => {
    if (lastHeader.key.trim() && lastHeader.value.trim()) {
      setHeaders((prev) => [...prev, { key: '', value: '', isActive: true }]);
    }
  }, [lastHeader.key, lastHeader.value]);

  useEffect(() => {
    if (lastParam.key.trim() && lastParam.value.trim()) {
      setParams((prev) => [...prev, { key: '', value: '', isActive: true }]);
    }
  }, [lastParam.key, lastParam.value]);

  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[50%] px-5 gap-3 mt-5">
        <div className="absolute bottom-0 left-0 h-8 border-t w-[50%] flex items-center">
          <button className="font-bold h-full px-5" onClick={quitApp}>
            Exit
          </button>

          {rootFolder ? (
            <button
              className="flex items-center gap-2 font-bold bg-gray-200 h-full px-4"
              onClick={quitApp}
            >
              <FiFolder size={15} />
              {rootFolder}
            </button>
          ) : (
            <button className="flex items-center gap-2 font-bold bg-gray-200 h-full px-4 border-l border-gray-100 hidden">
              <FiFolder size={15} />
              Open Folder
            </button>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <div className="font-bold flex items-center gap-2">
              {rootFolder ? (
                <p>{rootFolder}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <FiAlertTriangle size={15} color="red" />
                  <p>Playground</p>
                </div>
              )}
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendReq();
            }}
            className="flex items-center mt-2 bg-gray-100 rounded h-9"
          >
            <select
              className="h-full p-2 pr-7 outline-none pl-4"
              value={reqType}
              onChange={(e) =>
                setReqType(e.target.value as ISuperApiRequestTypes)
              }
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
              <option value="PUT">PUT</option>
              <option value="OPTIONS">OPTIONS</option>
              <option value="HEAD">HEAD</option>
            </select>
            <input
              value={reqUrl}
              onChange={(e) => setReqUrl(e.target.value)}
              placeholder="Request Url"
              className="w-full bg-inherit outline-none px-2 border-l border-gray-200 h-full"
            />
            <button
              onClick={() => sendReq()}
              className="font-bold bg-gray-200 px-5 rounded-tr rounded-br h-full"
            >
              Send
            </button>
          </form>
        </div>

        <div className="flex items-center gap-5 mt-2">
          <button
            onClick={() => setActiveTab('Headers')}
            className={`${activeTab === 'Headers' ? 'font-bold' : ''}`}
          >
            Headers
            {headersCount > 0 && (
              <span className="bg-gray-100 rounded px-[5px] ml-1">
                {headersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('Params')}
            className={`${activeTab === 'Params' ? 'font-bold' : ''}`}
          >
            Params
            {paramsCount > 0 && (
              <span className="bg-gray-100 rounded px-[5px] ml-1">
                {paramsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('Authorization')}
            className={`${activeTab === 'Authorization' ? 'font-bold' : ''}`}
          >
            Authorization
            {authorizationExists && <span className="ml-1">&middot;</span>}
          </button>
          <button
            onClick={() => setActiveTab('Body')}
            className={`${activeTab === 'Body' ? 'font-bold' : ''}`}
          >
            Body
          </button>
        </div>

        <div className="mt-2 border-t max-h-[80vh] overflow-y-auto pb-5">
          {activeTab === 'Headers' && (
            <div>
              {headers.map((header, i) => {
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between mt-2"
                  >
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) =>
                        handleChangeHeader('key', i, e.target.value)
                      }
                      placeholder="Key"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) =>
                        handleChangeHeader('value', i, e.target.value)
                      }
                      placeholder="Value"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <button onClick={() => handleHeaderActiveToggle(i)}>
                      {header.isActive ? (
                        <GoCheckCircleFill size={16} />
                      ) : (
                        <GoCheckCircle size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteHeader(i)}
                      disabled={i === headers.length - 1}
                      className="disabled:pointer-events-none disabled:opacity-50"
                    >
                      <FiTrash2
                        size={16}
                        color={i === headers.length - 1 ? 'gray' : 'red'}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'Params' && (
            <div>
              {params.map((param, i) => {
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between mt-2"
                  >
                    <input
                      value={param.key}
                      onChange={(e) =>
                        handleChangeParams('key', i, e.target.value)
                      }
                      type="text"
                      placeholder="Key"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) =>
                        handleChangeParams('value', i, e.target.value)
                      }
                      placeholder="Value"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <button onClick={() => handleParamsActiveToggle(i)}>
                      {param.isActive ? (
                        <GoCheckCircleFill size={16} />
                      ) : (
                        <GoCheckCircle size={16} />
                      )}
                    </button>
                    <button
                      disabled={i === params.length - 1}
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => handleDeleteParams(i)}
                    >
                      <FiTrash2
                        size={16}
                        color={i === params.length - 1 ? 'gray' : 'red'}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'Authorization' && (
            <div>
              <div className="flex items-center gap-5">
                <button
                  onClick={() => setAuthorizationType('bearer')}
                  className={`mt-2 flex items-center gap-2 ${authorizationType === 'bearer' ? 'font-bold' : ''}`}
                >
                  Bearer Token
                </button>
                <button
                  onClick={() => setAuthorizationType('api_key')}
                  className={`mt-2 flex items-center gap-2 ${authorizationType === 'api_key' ? 'font-bold' : ''}`}
                >
                  Api Key
                </button>
              </div>
              {authorizationType === 'bearer' && (
                <div className="flex items-center justify-between mt-2">
                  <input
                    value={bearerToken ?? ''}
                    onChange={(e) => setBearerToken(e.target.value)}
                    type="text"
                    placeholder="Bearer Token"
                    className="w-[86%] border p-2 rounded outline-none bg-gray-100"
                  />
                  <button
                    onClick={() => setIsBearerTokenActive((prev) => !prev)}
                  >
                    {isBearerTokenActive ? (
                      <GoCheckCircleFill size={16} />
                    ) : (
                      <GoCheckCircle size={16} />
                    )}
                  </button>
                  <button onClick={() => setBearerToken(null)}>
                    <FiTrash2 size={16} color="red" />
                  </button>
                </div>
              )}
              {authorizationType === 'api_key' && (
                <div>
                  <div className="flex items-center justify-between mt-2">
                    <input
                      value={apiKeyKey ?? ''}
                      onChange={(e) => setApiKeyKey(e.target.value)}
                      type="text"
                      placeholder="Key"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <input
                      value={apiKeyValue ?? ''}
                      onChange={(e) => setApiKeyValue(e.target.value)}
                      type="text"
                      placeholder="Value"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <button onClick={() => setIsApiKeyActive((prev) => !prev)}>
                      {isApiKeyActive ? (
                        <GoCheckCircleFill size={16} />
                      ) : (
                        <GoCheckCircle size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setApiKeyKey('');
                        setApiKeyValue('');
                      }}
                    >
                      <FiTrash2 size={16} color="red" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <span className="font-bold">Pass through</span>
                    <select
                      disabled={!isApiKeyActive}
                      className="bg-gray-100 p-2 outline-none w-full rounded border border-gray-200"
                      value={passApiKeyBy}
                      onChange={(e) =>
                        setPassApiKeyBy(e.target.value as 'headers' | 'params')
                      }
                    >
                      <option value="headers">Headers</option>
                      <option value="params">Params</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'Body' && (
            <div>
              <div>
                <button className="mt-2 flex items-center gap-2">JSON</button>
              </div>
              <ReactCodeMirror
                extensions={[json()]}
                value={body}
                onChange={(e) => setBody(e)}
                className="w-full mt-2 border"
                height="70vh"
              />
            </div>
          )}
        </div>
      </div>

      <div className="w-[50%] border-l min-h-screen">
        {loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}
        {(response.responseCode || response.responseStatusText) && !loading && (
          <div className="bg-gray-100">
            <div className="flex items-center gap-5 border-b px-5 pb-2">
              <button
                className={`mt-2 flex items-center ${activeResponseTab === 'Response' ? 'font-bold' : ''}`}
                onClick={() => setActiveResponseTab('Response')}
              >
                Response
                <span className="rounded px-[5px] ml-1 border">
                  {response.responseCode} {response.responseStatusText}
                </span>
              </button>
              {Object.keys(response.responseHeaders).length > 0 && (
                <button
                  className={`mt-2 flex items-center ${activeResponseTab === 'Headers' ? 'font-bold' : ''}`}
                  onClick={() => setActiveResponseTab('Headers')}
                >
                  Headers
                  {responseHeadersCount > 0 && (
                    <span className="rounded px-[5px] ml-1 border">
                      {responseHeadersCount}
                    </span>
                  )}
                </button>
              )}
              {Object.keys(response.responseCookies).length > 0 && (
                <button
                  className={`mt-2 flex items-center ${activeResponseTab === 'Cookies' ? 'font-bold' : ''}`}
                  onClick={() => setActiveResponseTab('Cookies')}
                >
                  Cookies
                  {responseCookieCount > 0 && (
                    <span className="rounded px-[5px] ml-1 border">
                      {responseCookieCount}
                    </span>
                  )}
                </button>
              )}
            </div>
            {activeResponseTab === 'Response' && (
              <div>
                {response.responseData && !isHTMLResponse && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(response.responseData),
                      )
                    }
                    className="py-2 px-5 flex items-center gap-2 ml-auto absolute bg-gray-100 right-0 z-50"
                  >
                    <FiClipboard size={15} />
                    Copy
                  </button>
                )}
                <div className="h-screen overflow-y-auto w-full break-all">
                  {isHTMLResponse ? (
                    <webview
                      id="w"
                      src={response.requestUrl as string}
                      className="w-full h-full"
                    ></webview>
                  ) : isJSONResponse ? (
                    <ReactJsonView
                      //@ts-expect-error
                      src={response.responseData as string}
                      enableClipboard={false}
                      style={{
                        fontFamily: 'Geist',
                        padding: '10px 15px 50px 15px',
                      }}
                      displayObjectSize={false}
                      displayDataTypes={false}
                      displayArrayKey={false}
                      iconStyle="circle"
                    />
                  ) : null}
                </div>
              </div>
            )}
            {activeResponseTab === 'Headers' && (
              <div className="overflow-y-auto h-screen">
                {Object.entries(response.responseHeaders).map((key, value) => {
                  return (
                    <div
                      key={value}
                      className="flex items-center justify-between border-b py-2 px-5"
                    >
                      <p className="font-bold w-[50%] break-all">{key[0]}</p>
                      <p className="w-[50%] break-all">{key[1]}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {activeResponseTab === 'Cookies' && (
              <div className="overflow-y-auto h-screen">
                {Object.entries(response.responseCookies).map((key, value) => {
                  return (
                    <div
                      key={value}
                      className="flex items-center justify-between border-b py-2 px-5"
                    >
                      <p className="font-bold w-[50%] break-all">{key[0]}</p>
                      <p className="w-[50%] break-all">{key[1]}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
