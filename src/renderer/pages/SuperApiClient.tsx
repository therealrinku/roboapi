import { useRef, useState } from 'react';
import {
  FiBookmark,
  FiClipboard,
  FiPower,
  FiSend,
  FiTrash2,
} from 'react-icons/fi';
import { GoCheckCircle, GoCheckCircleFill } from 'react-icons/go';
import Loading from '../components/Loading';
import useSuperApp from '../hooks/useSuperApp';
import {
  ISuperApiRequestTypes,
  ISuperApiResponse,
  ISuperApiTabs,
} from '../global';

export default function SuperApiClient() {
  const reqUrl = useRef<HTMLInputElement>(null);
  const { quitApp } = useSuperApp();

  const [reqType, setReqType] = useState<ISuperApiRequestTypes>('GET');
  const [response, setResponse] = useState<ISuperApiResponse>({
    requestUrl: null,
    responseCode: null,
    responseStatusText: null,
    responseData: null,
    responseHeaders: {},
    responseCookies: {},
  });

  const [activeTab, setActiveTab] = useState<ISuperApiTabs>('Headers');
  const [loading, setLoading] = useState<boolean>(false);
  const [bearerToken, setBearerToken] = useState<string | null>('');
  const [isBearerTokenActive, setIsBearerTokenActive] = useState(true);
  const [authorizationType, setAuthorizationType] =
    useState<'bearer'>('bearer');

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

    window.electron.ipcRenderer.sendMessage('send-api-request', {
      reqType: reqType,
      reqUrl: reqUrl.current?.value,
      headers: activeHeaders,
      params: activeParams,
      body: body,
      bearerToken: isBearerTokenActive ? bearerToken : null,
    });

    window.electron.ipcRenderer.once('send-api-request', (arg) => {
      setResponse(arg as ISuperApiResponse);
      setLoading(false);
    });
  }

  function handleAddHeader() {
    setHeaders((prev) => [...prev, { key: '', value: '', isActive: true }]);
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

  function handleAddParams() {
    setParams((prev) => [...prev, { key: '', value: '', isActive: true }]);
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
    if (index === 0 && headers.length === 1) {
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
    isBearerTokenActive && bearerToken && bearerToken.trim().length > 0;

  const responseHeadersCount = Object.keys(response.responseHeaders).length;
  const responseCookieCount = Object.keys(response.responseCookies).length;

  const isHTMLResponse =
    response.responseHeaders['content-type']?.includes('text/html');
  const isJSONResponse =
    response.responseHeaders['content-type']?.includes('application/json');
  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[50%] px-5 gap-3 mt-5">
        <div className="absolute bottom-0 left-0 pl-5 py-2 border-t w-[50%]">
          <button
            className="flex items-center gap-2 font-bold"
            onClick={quitApp}
          >
            <FiPower size={15} /> Quit
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold flex items-center gap-2">
              <FiBookmark size={15} /> Unsaved
            </p>
          </div>
          <div className="flex items-center mt-2 pr-3 bg-gray-100 rounded">
            <select
              className="bg-inherit px-1 outline-none w-24 font-bold"
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
              ref={reqUrl}
              placeholder="Request Url"
              className="w-full bg-inherit outline-none p-2 rounded"
            />
            <button onClick={sendReq}>
              <FiSend />
            </button>
          </div>
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
              <button
                onClick={handleAddHeader}
                className="mt-2 flex items-center gap-2"
              >
                Add New
              </button>
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
                    <button onClick={() => handleDeleteHeader(i)}>
                      <FiTrash2 size={16} color="red" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'Params' && (
            <div>
              <button
                onClick={handleAddParams}
                className="mt-2 flex items-center gap-2"
              >
                Add New
              </button>
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
                    <button onClick={() => handleDeleteParams(i)}>
                      <FiTrash2 size={16} color="red" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'Authorization' && (
            <div>
              <button
                onClick={() => setAuthorizationType('bearer')}
                className={`mt-2 flex items-center gap-2 ${authorizationType === 'bearer' ? 'font-bold' : ''}`}
              >
                Bearer Token
              </button>
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
            </div>
          )}
          {activeTab === 'Body' && (
            <div>
              <div>
                <button
                  // onClick={handleAddParams}
                  className="mt-2 flex items-center gap-2"
                >
                  JSON
                </button>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="border rounded mt-2 w-full h-[73vh] outline-none p-2 bg-gray-100"
              ></textarea>
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
        {response.responseCode && !loading && (
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
            </div>
            {activeResponseTab === 'Response' && (
              <div>
                {response.responseData && (
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        JSON.stringify(response.responseData),
                      )
                    }
                    className="py-2 px-5 flex items-center gap-2 ml-auto absolute bg-gray-100 right-0"
                  >
                    <FiClipboard size={15} />
                    Copy
                  </button>
                )}
                <pre className="h-screen overflow-y-auto px-5 pt-2 pb-16 w-full break-all">
                  {isHTMLResponse
                    ? response.responseData
                    : isJSONResponse
                      ? JSON.stringify(response.responseData, null, 2)
                      : '<NO RESPONSE>'}
                </pre>
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
