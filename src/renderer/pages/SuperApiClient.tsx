import { useRef, useState } from 'react';
import { FiFile, FiSend, FiTrash2 } from 'react-icons/fi';
import { GoCheckCircle, GoCheckCircleFill } from 'react-icons/go';
import Loading from '../components/Loading';

export default function SuperApiClient() {
  const reqUrl = useRef(null);

  const [reqType, setReqType] = useState<'GET' | 'POST'>('GET');
  const [response, setResponse] = useState(null);
  const [responseHeaders, setResponseHeaders] = useState({});
  const [activeTab, setActiveTab] = useState<'Headers' | 'Params' | 'Body'>(
    'Headers',
  );
  const [loading, setLoading] = useState(false);

  const [activeResponseTab, setActiveResponseTab] = useState<
    'Response' | 'Headers'
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

    window.electron.ipcRenderer.sendMessage('send-request', {
      reqType: reqType,
      reqUrl: reqUrl.current.value,
      headers: activeHeaders,
      params: activeParams,
      body: body,
    });

    window.electron.ipcRenderer.once('send-request', (arg) => {
      setResponse(arg.responseJson);
      setResponseHeaders(arg.headers);
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
  const responseHeadersCount = Object.keys(responseHeaders).length;

  return (
    <div className="flex items-start text-xs max-h-screen overflow-hidden">
      <div className="w-[50%] px-5 gap-3 mt-5">
        <div>
          <p className="font-bold flex items-center gap-2">
            <FiFile /> Unsaved Request
          </p>
          <div className="flex items-center mt-2 pr-3 bg-gray-200 rounded">
            <select
              className="bg-inherit px-1 outline-none"
              value={reqType}
              onChange={(e) => setReqType(e.target.value)}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="POST">PATCH</option>
              <option value="POST">DELETE</option>
              <option value="POST">PUT</option>
              <option value="POST">OPTIONS</option>
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
              <span className="bg-gray-200 rounded px-[5px] ml-1">
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
              <span className="bg-gray-200 rounded px-[5px] ml-1">
                {paramsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('Body')}
            className={`${activeTab === 'Body' ? 'font-bold' : ''}`}
          >
            Body
          </button>
        </div>

        <div className="mt-2 border-t max-h-[80vh] overflow-y-auto">
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
                      className="w-[43%] border p-2 rounded outline-none bg-gray-200"
                    />
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) =>
                        handleChangeHeader('value', i, e.target.value)
                      }
                      placeholder="Value"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-200"
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
                      className="w-[43%] border p-2 rounded outline-none bg-gray-200"
                    />
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) =>
                        handleChangeParams('value', i, e.target.value)
                      }
                      placeholder="Value"
                      className="w-[43%] border p-2 rounded outline-none bg-gray-200"
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
                className="border rounded mt-2 w-full h-[50vh] outline-none p-2"
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
        {response && !loading && (
          <div>
            <div className="flex items-center gap-5 border-b px-5 pb-2">
              <button
                className={`mt-2 flex items-center gap-2 ${activeResponseTab === 'Response' ? 'font-bold' : ''}`}
                onClick={() => setActiveResponseTab('Response')}
              >
                Response
              </button>
              <button
                className={`mt-2 flex items-center gap-2 ${activeResponseTab === 'Headers' ? 'font-bold' : ''}`}
                onClick={() => setActiveResponseTab('Headers')}
              >
                Headers
                {responseHeadersCount > 0 && (
                  <span className="bg-gray-200 rounded px-[5px] ml-1">
                    {responseHeadersCount}
                  </span>
                )}
              </button>
            </div>
            {activeResponseTab === 'Response' && (
              <pre className="font-geist overflow-y-auto h-screen pb-12 px-5 pt-2">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
            {activeResponseTab === 'Headers' && (
              <div className="pt-2 overflow-y-auto h-screen">
                {Object.entries(responseHeaders).map((key, value) => {
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
