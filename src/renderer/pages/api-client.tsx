import { useEffect, useState } from 'react';
import {
  FiAlertTriangle,
  FiClipboard,
  FiFolder,
  FiTrash2,
} from 'react-icons/fi';
import { GoCheckCircle, GoCheckCircleFill } from 'react-icons/go';
import Loading from '../components/common/loading';
import { IRequest, IResponse } from '../global';
import ReactJsonView from '@microlink/react-json-view';
import ReactCodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import useApiClient from '../hooks/useApiClient';

export default function SuperApiClient() {
  const { rootDir } = useApiClient();

  const [request, setRequest] = useState<IRequest>({
    reqUrl: '',
    reqType: 'get',
    headers: [{ key: '', value: '', isActive: false }],
    params: [{ key: '', value: '', isActive: false }],
    body: '',
    bearerToken: '',
    apiKeyKey: '',
    apiKeyValue: '',
    isApiKeyActive: false,
    isBearerTokenActive: false,
    notes: '',
    passApiKeyBy: 'headers',
    authorizationType: 'bearer',
    activeRequestTab: 'headers',
    activeResponseTab: 'response',
    loading: false,
  });

  const [response, setResponse] = useState<IResponse>({
    requestUrl: null,
    responseCode: null,
    responseStatusText: null,
    responseData: null,
    responseHeaders: {},
    responseCookies: {},
  });

  async function sendReq() {
    setRequest({ ...request, loading: true });

    const {
      headers,
      params,
      apiKeyKey,
      apiKeyValue,
      isApiKeyActive,
      passApiKeyBy,
      bearerToken,
      isBearerTokenActive,
      reqType,
      reqUrl,
      body,
    } = request;

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
      setResponse(arg as IResponse);
      setRequest({ ...request, loading: false });
    });
  }

  function handleChangeHeader(
    type: 'key' | 'value',
    index: number,
    value: string,
  ) {
    const copiedHeaders = [...request.headers];
    copiedHeaders[index][type] = value;
    setRequest({ ...request, headers: copiedHeaders });
  }

  function handleHeaderActiveToggle(index: number) {
    const copiedHeaders = [...request.headers];
    copiedHeaders[index].isActive = !copiedHeaders[index].isActive;
    setRequest({ ...request, headers: copiedHeaders });
  }

  function handleDeleteHeader(index: number) {
    if (index === 0 && request.headers.length === 1) {
      const copiedHeaders = [...request.headers];
      copiedHeaders[index].key = '';
      copiedHeaders[index].value = '';
      setRequest({ ...request, headers: copiedHeaders });
      return;
    }
    setRequest((prev) => {
      return {
        ...prev,
        headers: prev.headers.filter((_, i) => i !== index),
      };
    });
  }

  function handleChangeParams(
    type: 'key' | 'value',
    index: number,
    value: string,
  ) {
    const copiedParams = [...request.params];
    copiedParams[index][type] = value;
    setRequest({ ...request, params: copiedParams });
  }

  function handleParamsActiveToggle(index: number) {
    const copiedParams = [...request.params];
    copiedParams[index].isActive = !copiedParams[index].isActive;
    setRequest({ ...request, params: copiedParams });
  }

  function handleDeleteParams(index: number) {
    if (index === 0 && request.params.length === 1) {
      const copiedParams = [...request.params];
      copiedParams[index].key = '';
      copiedParams[index].value = '';
      setRequest({ ...request, params: copiedParams });
      return;
    }
    setRequest((prev) => {
      return {
        ...prev,
        params: prev.params.filter((_, i) => i !== index),
      };
    });
  }

  const headersCount = request.headers.filter(
    (header) => header.key.trim() && header.isActive,
  ).length;
  const paramsCount = request.params.filter(
    (param) => param.key.trim() && param.isActive,
  ).length;
  const authorizationExists =
    (request.isBearerTokenActive &&
      request.bearerToken &&
      request.bearerToken.trim().length > 0) ||
    (request.isApiKeyActive &&
      request.apiKeyKey.trim() &&
      request.apiKeyValue.trim());

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
      if (parsed.response) {
        setResponse(parsed.response);
      }
      if (parsed.request) {
        setRequest(parsed.request);
      }
    }
  }, []);

  useEffect(() => {
    if (!rootDir) {
      const apiPlaygroundState = {
        request,
        response,
      };

      localStorage.setItem(
        'api_client_playground_state',
        JSON.stringify(apiPlaygroundState),
      );
    }
  }, [response, request]);

  const lastHeader = request.headers[request.headers.length - 1];
  const lastParam = request.params[request.params.length - 1];

  useEffect(() => {
    if (lastHeader.key.trim() && lastHeader.value.trim()) {
      setRequest((prev) => {
        return {
          ...prev,
          headers: [...prev.headers, { key: '', value: '', isActive: true }],
        };
      });
    }
  }, [lastHeader.key, lastHeader.value]);

  useEffect(() => {
    if (lastParam.key.trim() && lastParam.value.trim()) {
      setRequest((prev) => {
        return {
          ...prev,
          params: [...prev.params, { key: '', value: '', isActive: true }],
        };
      });
    }
  }, [lastParam.key, lastParam.value]);

  function handleSelectRootDir() {
    window.electron.ipcRenderer.sendMessage('open-root-dir-selector');
  }

  const rootDirFolder = rootDir?.split('/')[rootDir?.split('/').length - 1];

  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[50%] px-5 gap-3 mt-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {rootDir ? (
                <button
                  className="flex items-center gap-2"
                  onClick={handleSelectRootDir}
                >
                  <FiFolder size={15} />
                  <p className="font-bold">{rootDirFolder}</p>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <FiAlertTriangle size={15} color="red" />
                  <p className="font-bold">Playground</p>
                  <button onClick={handleSelectRootDir}>Open Folder</button>
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
              value={request.reqType}
              onChange={(e) =>
                //@ts-ignore
                setRequest({ ...request, reqType: e.target.value })
              }
            >
              <option value="get">GET</option>
              <option value="post">POST</option>
              <option value="patch">PATCH</option>
              <option value="delete">DELETE</option>
              <option value="put">PUT</option>
              <option value="options">OPTIONS</option>
              <option value="head">HEAD</option>
            </select>
            <input
              value={request.reqUrl}
              onChange={(e) =>
                setRequest({ ...request, reqUrl: e.target.value })
              }
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
            onClick={() =>
              setRequest({ ...request, activeRequestTab: 'headers' })
            }
            className={`${request.activeRequestTab === 'headers' ? 'font-bold' : ''}`}
          >
            Headers
            {headersCount > 0 && (
              <span className="bg-gray-100 rounded px-[5px] ml-1">
                {headersCount}
              </span>
            )}
          </button>
          <button
            onClick={() =>
              setRequest({ ...request, activeRequestTab: 'params' })
            }
            className={`${request.activeRequestTab === 'params' ? 'font-bold' : ''}`}
          >
            Params
            {paramsCount > 0 && (
              <span className="bg-gray-100 rounded px-[5px] ml-1">
                {paramsCount}
              </span>
            )}
          </button>
          <button
            onClick={() =>
              setRequest({ ...request, activeRequestTab: 'authorization' })
            }
            className={`${request.activeRequestTab === 'authorization' ? 'font-bold' : ''}`}
          >
            Authorization
            {authorizationExists && <span className="ml-1">&middot;</span>}
          </button>
          <button
            onClick={() => setRequest({ ...request, activeRequestTab: 'body' })}
            className={`${request.activeRequestTab === 'body' ? 'font-bold' : ''}`}
          >
            Body
          </button>
          <button
            onClick={() =>
              setRequest({ ...request, activeRequestTab: 'notes' })
            }
            className={`${request.activeRequestTab === 'notes' ? 'font-bold' : ''}`}
          >
            Notes
          </button>
        </div>

        <div className="mt-2 border-t max-h-[80vh] overflow-y-auto pb-5">
          {request.activeRequestTab === 'headers' && (
            <div>
              {request.headers.map((header, i) => {
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
                      disabled={i === request.headers.length - 1}
                      className="disabled:pointer-events-none disabled:opacity-50"
                    >
                      <FiTrash2
                        size={16}
                        color={
                          i === request.headers.length - 1 ? 'gray' : 'red'
                        }
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {request.activeRequestTab === 'params' && (
            <div>
              {request.params.map((param, i) => {
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
                      disabled={i === request.params.length - 1}
                      className="disabled:pointer-events-none disabled:opacity-50"
                      onClick={() => handleDeleteParams(i)}
                    >
                      <FiTrash2
                        size={16}
                        color={i === request.params.length - 1 ? 'gray' : 'red'}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {request.activeRequestTab === 'authorization' && (
            <div>
              <div className="flex items-center gap-5">
                <button
                  onClick={() =>
                    setRequest({ ...request, authorizationType: 'bearer' })
                  }
                  className={`mt-2 flex items-center gap-2 ${request.authorizationType === 'bearer' ? 'font-bold' : ''}`}
                >
                  Bearer Token
                </button>
                <button
                  onClick={() =>
                    setRequest({ ...request, authorizationType: 'api_key' })
                  }
                  className={`mt-2 flex items-center gap-2 ${request.authorizationType === 'api_key' ? 'font-bold' : ''}`}
                >
                  Api Key
                </button>
              </div>
              {request.authorizationType === 'bearer' && (
                <div className="flex items-center justify-between mt-2">
                  <input
                    value={request.bearerToken ?? ''}
                    onChange={(e) =>
                      setRequest({ ...request, bearerToken: e.target.value })
                    }
                    type="text"
                    placeholder="Bearer Token"
                    className="w-[86%] border p-2 rounded outline-none bg-gray-100"
                  />
                  <button
                    onClick={() =>
                      setRequest({
                        ...request,
                        isBearerTokenActive: !request.isBearerTokenActive,
                      })
                    }
                  >
                    {request.isBearerTokenActive ? (
                      <GoCheckCircleFill size={16} />
                    ) : (
                      <GoCheckCircle size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => setRequest({ ...request, bearerToken: '' })}
                  >
                    <FiTrash2 size={16} color="red" />
                  </button>
                </div>
              )}
              {request.authorizationType === 'api_key' && (
                <div>
                  <div className="flex items-center justify-between mt-2">
                    <input
                      value={request.apiKeyKey ?? ''}
                      onChange={(e) =>
                        setRequest({ ...request, apiKeyKey: e.target.value })
                      }
                      type="text"
                      placeholder="Key"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <input
                      value={request.apiKeyValue ?? ''}
                      onChange={(e) =>
                        setRequest({ ...request, apiKeyValue: e.target.value })
                      }
                      type="text"
                      placeholder="Value"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-100"
                    />
                    <button
                      onClick={() =>
                        setRequest({
                          ...request,
                          isApiKeyActive: !request.isApiKeyActive,
                        })
                      }
                    >
                      {request.isApiKeyActive ? (
                        <GoCheckCircleFill size={16} />
                      ) : (
                        <GoCheckCircle size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setRequest({
                          ...request,
                          apiKeyKey: '',
                          apiKeyValue: '',
                        });
                      }}
                    >
                      <FiTrash2 size={16} color="red" />
                    </button>
                  </div>

                  <div className="mt-3 flex flex-col gap-2">
                    <span className="font-bold">Pass through</span>
                    <select
                      disabled={!request.isApiKeyActive}
                      className="bg-gray-100 p-2 outline-none w-full rounded border border-gray-200"
                      value={request.passApiKeyBy}
                      onChange={(e) =>
                        setRequest({
                          ...request,
                          passApiKeyBy: e.target.value as 'headers' | 'params',
                        })
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
          {request.activeRequestTab === 'body' && (
            <div>
              <div>
                <button className="mt-2 flex items-center gap-2">JSON</button>
              </div>
              <ReactCodeMirror
                extensions={[json()]}
                value={request.body}
                onChange={(e) => setRequest({ ...request, body: e })}
                className="w-full mt-2 border"
                height="72vh"
              />
            </div>
          )}
          {request.activeRequestTab === 'notes' && (
            <textarea
              value={request.notes}
              onChange={(e) =>
                setRequest({ ...request, notes: e.target.value })
              }
              className="w-full border h-[75vh] p-3 outline-none mt-2 rounded bg-gray-100"
            />
          )}
        </div>
      </div>

      <div className="w-[50%] border-l min-h-screen">
        {request.loading && (
          <div className="h-screen w-full flex flex-col items-center justify-center">
            <Loading />
          </div>
        )}
        {(response.responseCode || response.responseStatusText) &&
          !request.loading && (
            <div className="bg-gray-100">
              <div className="flex items-center gap-5 border-b px-5 pb-2">
                <button
                  className={`mt-2 flex items-center ${request.activeResponseTab === 'response' ? 'font-bold' : ''}`}
                  onClick={() =>
                    setRequest({ ...request, activeResponseTab: 'response' })
                  }
                >
                  Response
                  <span className="rounded px-[5px] ml-1 border">
                    {response.responseCode} {response.responseStatusText}
                  </span>
                </button>
                {Object.keys(response.responseHeaders).length > 0 && (
                  <button
                    className={`mt-2 flex items-center ${request.activeResponseTab === 'headers' ? 'font-bold' : ''}`}
                    onClick={() =>
                      setRequest({ ...request, activeResponseTab: 'headers' })
                    }
                  >
                    Headers
                    <span className="rounded px-[5px] ml-1 border">
                      {responseHeadersCount}
                    </span>
                  </button>
                )}
                <button
                  className={`mt-2 flex items-center ${request.activeResponseTab === 'cookies' ? 'font-bold' : ''}`}
                  onClick={() =>
                    setRequest({ ...request, activeResponseTab: 'cookies' })
                  }
                >
                  Cookies
                  <span className="rounded px-[5px] ml-1 border">
                    {responseCookieCount}
                  </span>
                </button>
              </div>
              {request.activeResponseTab === 'response' && (
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
                        src={response.responseData as JSON}
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
              {request.activeResponseTab === 'headers' && (
                <div className="overflow-y-auto h-screen">
                  {Object.entries(response.responseHeaders).map(
                    (key, value) => {
                      return (
                        <div
                          key={value}
                          className="flex items-center justify-between border-b py-2 px-5"
                        >
                          <p className="font-bold w-[50%] break-all">
                            {key[0]}
                          </p>
                          <p className="w-[50%] break-all">{key[1]}</p>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
              {request.activeResponseTab === 'cookies' && (
                <div className="overflow-y-auto h-screen">
                  {Object.entries(response.responseCookies).map(
                    (key, value) => {
                      return (
                        <div
                          key={value}
                          className="flex items-center justify-between border-b py-2 px-5"
                        >
                          <p className="font-bold w-[50%] break-all">
                            {key[0]}
                          </p>
                          <p className="w-[50%] break-all">{key[1]}</p>
                        </div>
                      );
                    },
                  )}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
}
